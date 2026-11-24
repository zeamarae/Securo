/**
 * Database Logic v2.0
 * Date: 2026-10-06
 * Description: Handles Firestore database operations with improved error handling
 */

import { db, auth } from './firebase-config.js';
// (2026-07-13) Import auth & deletion functions; was db only
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    orderBy,
    limit,
    onSnapshot,
    or,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { Logger } from './utils.js';

const LOCAL_EMERGENCY_POSTS_KEY = "securo_emergency_posts_local";
const LOCAL_USERS_KEY = "securo_users_local";

// (2026-07-13) Read vault cache entries into local posts; was base key only
export const readLocalEmergencyPosts = () => {
    try {
        const raw = localStorage.getItem(LOCAL_EMERGENCY_POSTS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        const result = Array.isArray(parsed) ? [...parsed] : [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith("securo_vault_cache_")) {
                try {
                    const cRaw = localStorage.getItem(k);
                    const cParsed = JSON.parse(cRaw);
                    if (Array.isArray(cParsed)) {
                        cParsed.forEach((ci, idx) => {
                            if (ci && !result.some(r => r.id === ci.id || r.id === ci.postId || (r.attachments && r.attachments.some(a => a.src === ci.src)))) {
                                result.push({
                                    id: ci.id || ci.postId || `${k}_${idx}`,
                                    userId: ci.userId || k.replace("securo_vault_cache_", ""),
                                    userName: ci.userName || "",
                                    studentId: ci.studentId || "",
                                    attachments: [ci],
                                    guardianVisible: ci.guardianVisible !== false,
                                    gadVisible: ci.gadVisible !== false,
                                    createdAt: ci.createdAt || new Date().toISOString(),
                                    location: ci.location || null
                                });
                            }
                        });
                    }
                } catch (_) { }
            }
        }
        return result;
    } catch (error) {
        Logger.warn("DB", "Error reading local emergency posts", error);
        return [];
    }
};

const writeLocalEmergencyPosts = (posts) => {
    try {
        localStorage.setItem(LOCAL_EMERGENCY_POSTS_KEY, JSON.stringify(posts));
    } catch (error) {
        Logger.warn("DB", "Error writing local emergency posts", error);
    }
};

// (2026-07-13) Support sessionStorage in user persistence; was localStorage only
const writeLocalUsers = (users) => {
    try {
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
        sessionStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    } catch (error) {
        Logger.warn("DB", "Error writing local users", error);
    }
};

const readLocalUsers = () => {
    try {
        const raw = sessionStorage.getItem(LOCAL_USERS_KEY) || localStorage.getItem(LOCAL_USERS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        const list = Array.isArray(parsed) ? parsed : [];
        if (!list.length) {
            const dirRaw = sessionStorage.getItem("securo_user_directory") || localStorage.getItem("securo_user_directory");
            if (dirRaw) {
                const dir = JSON.parse(dirRaw);
                return Object.entries(dir).map(([uid, u]) => ({
                    id: uid,
                    userId: uid,
                    name: u.name || (u.studentId ? `Student ${u.studentId}` : (u.email ? u.email.split('@')[0] : 'User')),
                    email: u.email || '',
                    studentId: u.studentId || '',
                    role: u.role || 'student'
                }));
            }
        }
        return list;
    } catch (error) {
        Logger.warn("DB", "Error reading local users", error);
        return [];
    }
};

const isPermissionDeniedError = (error) => {
    const code = String(error?.code || "").toLowerCase();
    const message = String(error?.message || "").toLowerCase();
    return code.includes("permission-denied") ||
        message.includes("missing or insufficient permissions") ||
        message.includes("insufficient permissions") ||
        message.includes("permission-denied");
};

// (2026-07-13) Remove duplicate writeLocalUsers; was duplicate declaration
const LOCAL_GUARDIAN_LINKS_KEY = "securo_guardian_links_local";

// (2026-07-13) Persist guardian links locally for offline; was memory only
export const readLocalGuardianLinks = () => {
    try {
        const raw = localStorage.getItem(LOCAL_GUARDIAN_LINKS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
        return [];
    }
};

export const writeLocalGuardianLinks = (links) => {
    try {
        localStorage.setItem(LOCAL_GUARDIAN_LINKS_KEY, JSON.stringify(links || []));
    } catch (_) { }
};

export const upsertLocalGuardianLink = (link) => {
    if (!link?.id && !link?.studentId) return;
    const current = readLocalGuardianLinks();
    const id = link.id || `pending_${link.studentId}_${link.guardianId || link.guardianEmail}`;
    const idx = current.findIndex(l => (l.id && l.id === id) || (l.studentId && l.studentId === link.studentId && (l.guardianId === link.guardianId || l.guardianEmail === link.guardianEmail)));
    if (idx >= 0) {
        current[idx] = { ...current[idx], ...link, id: current[idx].id || id };
    } else {
        current.unshift({ ...link, id });
    }
    writeLocalGuardianLinks(current);
};

export const removeLocalGuardianLink = (linkId) => {
    if (!linkId) return;
    const current = readLocalGuardianLinks().filter(l => l.id !== linkId);
    writeLocalGuardianLinks(current);
};

const upsertLocalUser = (userId, profileData) => {
    const users = readLocalUsers();
    const nextUser = {
        id: userId,
        ...profileData,
        updatedAt: new Date().toISOString(),
        isLocalFallback: true
    };
    const existingIndex = users.findIndex((user) => String(user.id) === String(userId));
    if (existingIndex >= 0) {
        users[existingIndex] = { ...users[existingIndex], ...nextUser };
    } else {
        users.unshift(nextUser);
    }
    writeLocalUsers(users);
};

const mergeUsers = (remoteUsers, localUsers) => {
    const map = new Map();
    (Array.isArray(localUsers) ? localUsers : []).forEach((user) => {
        map.set(String(user.id), user);
    });
    (Array.isArray(remoteUsers) ? remoteUsers : []).forEach((user) => {
        map.set(String(user.id), user);
    });
    return Array.from(map.values());
};

const normalizeEmail = (email = "") => String(email || "").trim().toLowerCase();

const inferUserRole = (user = {}) => {
    const explicitRole = String(user.role || "").trim().toLowerCase();
    if (explicitRole === "admin" || normalizeEmail(user.email) === "admin@admin.com") return "admin";
    if (explicitRole === "guardian") return "guardian";
    if (explicitRole === "staff") return "staff";
    return "student";
};

const getUserIdentityKeys = (user = {}) => {
    const keys = [
        user.id,
        user.userId,
        user.uid,
        user.studentId,
        normalizeEmail(user.email)
    ]
        .map((value) => String(value || "").trim())
        .filter(Boolean);

    return Array.from(new Set(keys));
};

const mergeUsersByIdentity = (...sources) => {
    const aliases = new Map();
    const records = new Map();

    sources.flat().forEach((user) => {
        if (!user) return;

        const identityKeys = getUserIdentityKeys(user);
        const knownKey = identityKeys.find((key) => aliases.has(key));
        const canonicalKey = knownKey || identityKeys[0] || `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const existing = records.get(canonicalKey) || {};
        const merged = {
            ...existing,
            ...user
        };

        merged.id = merged.id || merged.userId || merged.uid || existing.id || canonicalKey;
        merged.userId = merged.userId || merged.id;
        merged.email = merged.email || existing.email || "";
        merged.studentId = merged.studentId || existing.studentId || "";
        merged.name = merged.name || existing.name || "";
        merged.role = inferUserRole(merged);

        records.set(canonicalKey, merged);
        getUserIdentityKeys(merged).forEach((key) => aliases.set(key, canonicalKey));
    });

    return Array.from(records.values());
};

// (2026-07-13) Merge posts by unique ID; was truncating src causing image drops
const mergeEmergencyPosts = (remotePosts = [], localPosts = []) => {
    const remote = Array.isArray(remotePosts) ? remotePosts : [];
    const local = Array.isArray(localPosts) ? localPosts : [];
    const seenIds = new Set();

    const result = [];
    remote.forEach(p => {
        if (!p || !p.id) return;
        seenIds.add(String(p.id));
        result.push(p);
    });

    local.forEach(p => {
        if (!p || !p.id || seenIds.has(String(p.id))) return;
        seenIds.add(String(p.id));
        result.push(p);
    });

    return result.sort((a, b) => {
        const aTime = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
        const bTime = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
    });
};

/**
 * Save user profile information
 * @param {string} userId 
 * @param {object} profileData 
 */
export const saveUserProfile = async (userId, profileData) => {
    upsertLocalUser(userId, profileData);
    try {
        await setDoc(doc(db, "users", userId), {
            ...profileData,
            updatedAt: serverTimestamp()
        }, { merge: true });
        await syncGuardianLinksForStudent(userId, profileData).catch((error) => {
            console.warn("Guardian link sync skipped after saveUserProfile:", error);
        });
        // (2026-07-13) Sync guardian link names on profile save; was student only
        await syncGuardianLinksForGuardian(userId, profileData).catch(() => { });
    } catch (error) {
        if (error?.code === "permission-denied" || /insufficient permissions/i.test(error?.message || "")) {
            upsertLocalUser(userId, profileData);
            console.warn("User profile saved locally because Firestore denied access.");
            return;
        }
        console.warn("Error saving profile:", error);
        throw error;
    }
};

/**
 * Save a lightweight registration marker in attendance for admin user counting fallback
 * @param {string} userId
 * @param {object} profileData
 */
export const saveUserDirectoryMarker = async (userId, profileData) => {
    try {
        await addDoc(collection(db, "attendance"), {
            userId,
            type: "profile_bootstrap",
            profile: {
                studentId: profileData.studentId || "",
                name: profileData.name || "",
                email: profileData.email || ""
            },
            timestamp: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.warn("Error saving user directory marker:", error);
        return false;
    }
};

/**
 * Get user profile information
 * @param {string} userId 
 */
export const getUserProfile = async (userId) => {
    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            const localUsers = readLocalUsers();
            return localUsers.find((user) => String(user.id) === String(userId)) || null;
        }
    } catch (error) {
        const localUsers = readLocalUsers();
        if (!isPermissionDeniedError(error)) {
            console.warn("Profile lookup fallback used:", error?.message || error);
        }
        return localUsers.find((user) => String(user.id) === String(userId)) || null;
    }
};
// (2026-07-13) Resolve real profile name & role in logSOS; was defaulting Student
export const logSOS = async (userId, location, metadata = {}) => {
    try {
        const localUsers = readLocalUsers();
        const fallback = localUsers.find(u => String(u.id || u.uid || '') === String(userId)) || {};
        const isGeneric = (v) => {
            const s = String(v || '').trim().toLowerCase();
            return !s || ['student', 'user', 'staff', 'staff member', 'unknown', 'student reporter', 'unnamed user'].includes(s);
        };
        let profile = null;
        if (isGeneric(metadata.userName) && isGeneric(fallback.name)) {
            profile = await getUserProfile(userId).catch(() => null);
        }
        const links = await getLinksForStudent(null, userId).catch(() => []);
        const guardianUids = (Array.isArray(links) ? links : []).filter(l => l.status === 'accepted' && l.guardianId).map(l => l.guardianId);
        const role = metadata.role || profile?.role || fallback.role || "student";
        const email = metadata.userEmail || profile?.email || fallback.email || auth.currentUser?.email || "";
        const studentId = metadata.studentId || profile?.studentId || fallback.studentId || "";
        const candidates = [metadata.userName, profile?.name, profile?.fullName, fallback.name, auth.currentUser?.displayName];
        const resolvedName = candidates.find(c => !isGeneric(c)) || (role === 'staff' ? "Campus Staff" : "Student");

        await addDoc(collection(db, "sos_logs"), {
            userId,
            studentUid: userId,
            guardianUids,
            userName: resolvedName,
            userEmail: email,
            studentId,
            role,
            location,
            accuracy: location?.accuracy || null,
            battery: metadata.battery || null,
            emergencyType: metadata.emergencyType || "sos",
            timestamp: serverTimestamp(),
            status: "active"
        });

        addDoc(collection(db, "attendance"), {
            userId,
            studentUid: userId,
            studentName: resolvedName,
            studentId,
            role,
            type: "sos",
            location: location || {},
            timestamp: serverTimestamp()
        }).catch(err => console.warn("SOS attendance log sync fallback:", err));

        notifyGuardiansSOS(userId, resolvedName, location, metadata).catch(e => console.warn("SOS notify err:", e));
    } catch (error) {
        if (error?.code === "permission-denied" || /permissions/i.test(error?.message)) {
            console.warn("SOS log could not be saved to Firestore due to permission denied. The emergency signal is still active on this device.");
            return;
        }
        console.warn("Error logging SOS:", error);
        throw error;
    }
};

// (2026-07-13) Guard SOS photo attachment payload size; was unbounded array
export const attachPhotoToActiveSOS = async (userId, photoItem) => {
    if (!userId || !photoItem?.src) return false;
    try {
        localStorage.setItem(`securo_student_sos_photo_${userId}`, JSON.stringify({ hasPhoto: true, timestamp: Date.now() }));
        const q = query(collection(db, "sos_logs"), where("userId", "==", userId));
        const snap = await getDocs(q);
        if (!snap.empty) {
            const activeDocs = snap.docs.filter(d => (d.data()?.status || 'active') === 'active');
            if (activeDocs.length > 0) {
                const targetDoc = activeDocs[0];
                await updateDoc(doc(db, "sos_logs", targetDoc.id), {
                    hasPhoto: true,
                    lastPhoto: photoItem.src,
                    lastPhotoAt: serverTimestamp()
                }).catch(() => { });
            }
            return true;
        }
    } catch (e) {
        console.warn("Attach photo to SOS fallback:", e);
    }
    return false;
};


/**
 * Save a posted emergency capture package
 * @param {object} payload
 */
// (2026-07-13) Save emergency post cleanly without local dupe; was double store
export const saveEmergencyPost = async (payload) => {
    try {
        const docRef = await addDoc(collection(db, "emergency_posts"), {
            ...payload,
            gadVisible: payload.gadVisible !== false,
            guardianVisible: payload.guardianVisible !== false,
            status: payload.status || "posted",
            createdAt: serverTimestamp()
        });
        return { id: docRef.id, ...payload };
    } catch (error) {
        const localPosts = readLocalEmergencyPosts();
        const localEntry = {
            id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            ...payload,
            gadVisible: payload.gadVisible !== false,
            guardianVisible: payload.guardianVisible !== false,
            status: payload.status || "posted",
            createdAt: new Date().toISOString(),
            isLocalFallback: true
        };
        localPosts.unshift(localEntry);
        writeLocalEmergencyPosts(localPosts);
        console.warn("Emergency post saved locally due to Firestore error:", error);
        return { id: localEntry.id, ...payload };
    }
};

/**
 * Fetch emergency posts for the current user
 * @param {string} userId
 */
// (2026-07-13) Query emergency posts by UID, ID & child name; was UID only
export const getUserEmergencyPosts = async (userId, userName = null) => {
    const normName = userName ? String(userName).trim().toLowerCase() : "";
    const allLocal = readLocalEmergencyPosts();
    let localPosts = allLocal.filter((post) => {
        if (userId && (String(post.userId) === String(userId) || (post.studentId && String(post.studentId) === String(userId)))) return true;
        if (normName) {
            if (post.userName && String(post.userName).trim().toLowerCase() === normName) return true;
            if (post.studentName && String(post.studentName).trim().toLowerCase() === normName) return true;
        }
        return false;
    });
    if (localPosts.length === 0 && allLocal.length > 0 && !userId) {
        localPosts = allLocal;
    }

    try {
        let remotePosts = [];
        if (userId) {
            const q = query(
                collection(db, "emergency_posts"),
                where("userId", "==", userId)
            );
            const querySnapshot = await getDocs(q).catch(() => ({ docs: [] }));
            remotePosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (remotePosts.length === 0) {
                const qSid = query(
                    collection(db, "emergency_posts"),
                    where("studentId", "==", userId)
                );
                const snapSid = await getDocs(qSid).catch(() => ({ docs: [] }));
                remotePosts = snapSid.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
        }
        if (remotePosts.length === 0 && userName) {
            const qName = query(
                collection(db, "emergency_posts"),
                where("userName", "==", userName)
            );
            const snapName = await getDocs(qName).catch(() => ({ docs: [] }));
            remotePosts = snapName.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        // (2026-07-13) Fallback to guardianVisible==true query for rules; was unfiltered
        if (remotePosts.length === 0) {
            const qShared = query(
                collection(db, "emergency_posts"),
                where("guardianVisible", "==", true)
            );
            const snapShared = await getDocs(qShared).catch(() => ({ docs: [] }));
            remotePosts = snapShared.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(p => {
                    if (userId && (String(p.userId) === String(userId) || (p.studentId && String(p.studentId) === String(userId)))) return true;
                    if (normName && ((p.userName && String(p.userName).trim().toLowerCase().includes(normName)) || (p.studentName && String(p.studentName).trim().toLowerCase().includes(normName)))) return true;
                    return false;
                });
        }
        return mergeEmergencyPosts(remotePosts, localPosts);
    } catch (error) {
        if (error?.code === "permission-denied" || /permissions/i.test(error?.message)) {
            console.warn(`Firestore read access denied for emergency_posts (UID: ${userId}). Falling back to local storage.`);
        } else {
            console.warn("Error getting user emergency posts:", error);
        }
        return mergeEmergencyPosts([], localPosts);
    }
};

// (2026-07-13) Cache guardian shared vault posts for fast switch; was uncached
let _guardianSharedPostsCache = null;
let _guardianSharedPostsCacheTs = 0;
let _guardianSharedPostsInFlight = null;
const GUARDIAN_SHARED_CACHE_TTL_MS = 30000;

export const getGuardianSharedEmergencyPosts = async (studentUid, studentId = null, studentName = null, forceRefresh = false) => {
    const uidStr = studentUid ? String(studentUid).trim() : "";
    const sidStr = studentId ? String(studentId).trim() : "";
    const normName = studentName ? String(studentName).trim().toLowerCase() : "";

    const matchesStudent = (p) => {
        if (!p || p.guardianVisible === false) return false;
        if (uidStr && String(p.userId || "").trim() === uidStr) return true;
        if (sidStr && (String(p.studentId || "").trim() === sidStr || String(p.userId || "").trim() === sidStr)) return true;
        if (normName && normName !== "linked child" && normName !== "student") {
            const pName = String(p.userName || p.studentName || "").trim().toLowerCase();
            if (pName && (pName === normName || pName.includes(normName) || normName.includes(pName))) return true;
        }
        return false;
    };

    const localPosts = readLocalEmergencyPosts().filter(matchesStudent);
    const now = Date.now();
    let collected = null;

    if (!forceRefresh && _guardianSharedPostsCache && (now - _guardianSharedPostsCacheTs) < GUARDIAN_SHARED_CACHE_TTL_MS) {
        collected = _guardianSharedPostsCache;
    } else {
        if (!_guardianSharedPostsInFlight || forceRefresh) {
            _guardianSharedPostsInFlight = (async () => {
                const docs = [];
                const seen = new Set();
                try {
                    const qShared = query(collection(db, "emergency_posts"), where("guardianVisible", "==", true));
                    const snapShared = await getDocs(qShared).catch(() => null);
                    (snapShared?.docs || []).forEach((d) => {
                        if (!seen.has(d.id)) {
                            seen.add(d.id);
                            docs.push({ id: d.id, ...d.data() });
                        }
                    });
                } catch (_) { }
                _guardianSharedPostsCache = docs;
                _guardianSharedPostsCacheTs = Date.now();
                return docs;
            })().finally(() => {
                _guardianSharedPostsInFlight = null;
            });
        }
        collected = await _guardianSharedPostsInFlight;
    }

    const matchedRemote = (collected || []).filter(matchesStudent);
    return mergeEmergencyPosts(matchedRemote, localPosts);
};

/**
 * Delete an emergency post
 * @param {string} postId
 */
export const deleteEmergencyPost = async (postId) => {
    // Remove from local storage if present
    const localPosts = readLocalEmergencyPosts();
    const updatedLocal = localPosts.filter((post) => String(post.id) !== String(postId));
    if (updatedLocal.length !== localPosts.length) {
        writeLocalEmergencyPosts(updatedLocal);
    }

    // Remove from Firestore
    if (String(postId).startsWith("local_")) {
        console.log("Local post deleted from storage.");
        return true;
    }

    try {
        await deleteDoc(doc(db, "emergency_posts", postId));
        return true;
    } catch (error) {
        if (error?.code === "permission-denied" || /insufficient permissions/i.test(error?.message || "")) {
            console.warn("Firestore delete denied, but local copy (if any) was removed.");
            return true;
        }
        console.warn("Error deleting emergency post:", error);
        throw error;
    }
};

/**
 * Update an emergency post's attachments
 * @param {string} postId
 * @param {array} attachments
 */
export const updateEmergencyPostAttachments = async (postId, attachments) => {
    // Update local storage
    const localPosts = readLocalEmergencyPosts();
    const localIndex = localPosts.findIndex((p) => String(p.id) === String(postId));
    if (localIndex >= 0) {
        localPosts[localIndex].attachments = attachments;
        writeLocalEmergencyPosts(localPosts);
    }

    // Update Firestore
    if (String(postId).startsWith("local_")) {
        console.log("Local post attachments updated in storage.");
        return true;
    }

    try {
        const postRef = doc(db, "emergency_posts", postId);
        await updateDoc(postRef, { attachments });
        return true;
    } catch (error) {
        console.warn("Error updating emergency post attachments:", error);
        throw error;
    }
};

/**
 * Toggle GAD access to an emergency post
 * @param {string} postId
 * @param {boolean} isVisible
 */
export const toggleEmergencyPostAccess = async (postId, isVisible) => {
    if (!postId) return false;
    // Update local storage
    const localPosts = readLocalEmergencyPosts();
    const localIndex = localPosts.findIndex((p) => String(p.id) === String(postId));
    if (localIndex >= 0) {
        localPosts[localIndex].gadVisible = isVisible;
        writeLocalEmergencyPosts(localPosts);
    }

    // If it's a local fallback ID, we don't need to update Firestore yet (it's not synced)
    if (String(postId).startsWith("local_")) {
        console.warn("Post is local-only; skipping Firestore access update.");
        return true;
    }

    // Update Firestore
    try {
        const postRef = doc(db, "emergency_posts", postId);
        await updateDoc(postRef, { gadVisible: isVisible });
        return true;
    } catch (error) {
        if (error?.code === "permission-denied" || /insufficient permissions/i.test(error?.message || "")) {
            console.warn("Firestore access update denied; change remains local.");
            return true;
        }
        console.warn("Error toggling emergency post access:", error);
        throw error;
    }
};

/**
 * Toggle parent / guardian access to an emergency post
 * @param {string} postId
 * @param {boolean} isVisible
 */
export const toggleEmergencyPostGuardianAccess = async (postId, isVisible) => {
    if (!postId) return false;

    const localPosts = readLocalEmergencyPosts();
    const localIndex = localPosts.findIndex((p) => String(p.id) === String(postId));
    if (localIndex >= 0) {
        localPosts[localIndex].guardianVisible = isVisible;
        writeLocalEmergencyPosts(localPosts);
    }

    if (String(postId).startsWith("local_")) {
        console.warn("Post is local-only; skipping Firestore guardian access update.");
        return true;
    }

    try {
        const postRef = doc(db, "emergency_posts", postId);
        await updateDoc(postRef, { guardianVisible: isVisible });
        return true;
    } catch (error) {
        if (error?.code === "permission-denied" || /insufficient permissions/i.test(error?.message || "")) {
            console.warn("Firestore guardian access update denied; change remains local.");
            return true;
        }
        console.warn("Error toggling guardian access:", error);
        throw error;
    }
};

/**
 * Fetch all emergency posts for admin incident review
 */
// (2026-07-13) Support maxDocs recent limit for fast admin load; was full scan
export const getAllEmergencyPosts = async (opts = {}) => {
    const maxDocs = Number(opts?.maxDocs) || 0;
    const localPosts = readLocalEmergencyPosts();
    try {
        let querySnapshot;
        try {
            const q = maxDocs > 0
                ? query(collection(db, "emergency_posts"), orderBy("createdAt", "desc"), limit(maxDocs))
                : query(collection(db, "emergency_posts"), orderBy("createdAt", "desc"));
            querySnapshot = await getDocs(q);
        } catch (idxError) {
            const qFallback = maxDocs > 0
                ? query(collection(db, "emergency_posts"), limit(maxDocs))
                : collection(db, "emergency_posts");
            querySnapshot = await getDocs(qFallback);
        }
        const remotePosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        remotePosts.sort((a, b) => {
            const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime());
            const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime());
            return timeB - timeA;
        });
        return mergeEmergencyPosts(remotePosts, localPosts);
    } catch (error) {
        return mergeEmergencyPosts([], localPosts);
    }
};

/**
 * Fetch a single emergency post by id
 * @param {string} postId
 */
export const getEmergencyPostById = async (postId) => {
    const localPosts = readLocalEmergencyPosts();
    const localMatch = localPosts.find((post) => String(post.id) === String(postId));
    if (localMatch) return localMatch;

    try {
        const postRef = doc(db, "emergency_posts", postId);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
            return { id: postSnap.id, ...postSnap.data() };
        }
        return null;
    } catch (error) {
        console.warn("Error getting emergency post by id:", error);
        return null;
    }
};

/**
 * Check if a Student ID is already registered
 * @param {string} studentId 
 */
    // (2026-07-13) Ignore soft-deleted users in studentId check; was matching deleted
    export const isStudentIdTaken = async (studentId, excludeUid = null) => {
        const raw = String(studentId || "").trim();
        if (!raw) return false;
        const isActiveOther = (d) => {
            if (excludeUid && String(d.id) === String(excludeUid)) return false;
            const data = d.data() || {};
            return !data.isDeleted && !data.deletedAt;
        };
        try {
            const q1 = query(collection(db, "users"), where("studentId", "==", raw));
            const snap1 = await getDocs(q1);
            if (snap1.docs.some(isActiveOther)) return true;
            const num = Number(raw);
            if (!Number.isNaN(num)) {
                const q2 = query(collection(db, "users"), where("studentId", "==", num));
                const snap2 = await getDocs(q2);
                if (snap2.docs.some(isActiveOther)) return true;
            }
            return false;
        } catch (error) {
            console.warn("Error checking student ID:", error);
            return false;
        }
    };

    /**
     * Find user email by Student ID
     * @param {string} studentId 
     */
    // (2026-07-13) Lookup email from user directory & Firestore; was query only
    export const getEmailByStudentId = async (studentId) => {
        try {
            const raw = localStorage.getItem('securo_user_directory');
            if (raw) {
                const dir = JSON.parse(raw);
                const found = Object.values(dir).find(u => String(u.studentId || '') === String(studentId));
                // (2026-07-13) Prefer authEmail over recovery email; was email only
                if (found?.authEmail) return found.authEmail;
                if (found?.email) return found.email;
            }
        } catch (_) { }
        try {
            const q = query(collection(db, "users"), where("studentId", "==", String(studentId)));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const d = querySnapshot.docs[0].data();
                return d.authEmail || d.email || null;
            }
            // (2026-07-13) Query numeric studentId too; was string only
            const num = Number(String(studentId || '').trim());
            if (!Number.isNaN(num)) {
                const q2 = query(collection(db, "users"), where("studentId", "==", num));
                const snap2 = await getDocs(q2);
                if (!snap2.empty) {
                    const d = snap2.docs[0].data();
                    return d.authEmail || d.email || null;
                }
            }
            return null;
        } catch (error) {
            console.warn("Error fetching email by student ID:", error);
            return null;
        }
    };

    /**
     * Update existing user profile data
     * @param {string} uid 
     * @param {object} data 
     */
    // (2026-07-13) Run guardian link sync in background after save; was blocking UI
    export const updateUserProfile = async (uid, data) => {
        upsertLocalUser(uid, data);
        try {
            const userRef = doc(db, "users", uid);
            await setDoc(userRef, {
                ...data,
                updatedAt: serverTimestamp()
            }, { merge: true });
            syncGuardianLinksForStudent(uid, data).catch((error) => {
                console.warn("Guardian link sync skipped after updateUserProfile:", error);
            });
            syncGuardianLinksForGuardian(uid, data).catch(() => { });
            return true;
        } catch (error) {
            if (isPermissionDeniedError(error)) {
                upsertLocalUser(uid, data);
                console.warn("User profile update saved locally because Firestore denied access.");
                return true;
            }
            console.warn("Error updating profile:", error);
            throw error;
        }
    };

    /**
     * Fetch campus markers (Map Page)
     */
    export const getCampusMarkers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "markers"));
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.warn("Error getting markers:", error);
            return [];
        }
    };

    /**
     * Save a GAD announcement post
     * @param {object} postData 
     */
    // (2026-07-13) Non-blocking GAD publish with local fallback; was failing
    const LOCAL_GAD_POSTS_KEY = "securo_gad_posts_local";

    const readLocalGADPosts = () => {
        try {
            const raw = localStorage.getItem(LOCAL_GAD_POSTS_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (_) {
            return [];
        }
    };

    const writeLocalGADPosts = (posts) => {
        try {
            localStorage.setItem(LOCAL_GAD_POSTS_KEY, JSON.stringify((posts || []).slice(0, 60)));
            const ch = new BroadcastChannel('securo_gad_channel');
            ch.postMessage({ type: 'gad_updated', at: Date.now() });
            ch.close();
        } catch (_) { }
    };

    export const saveGADPost = async (postData) => {
        const nowSec = Math.floor(Date.now() / 1000);
        const localId = `local_gad_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const baseEntry = {
            ...postData,
            likes: 0,
            likedBy: [],
            createdAt: { seconds: nowSec }
        };

        try {
            const docRef = await addDoc(collection(db, "gad_posts"), {
                ...postData,
                likes: 0,
                likedBy: [],
                createdAt: serverTimestamp()
            });

            const local = readLocalGADPosts().filter(p => p.id !== docRef.id);
            local.unshift({ id: docRef.id, ...baseEntry });
            writeLocalGADPosts(local);

            // Broadcast notification asynchronously without blocking publish
            (async () => {
                try {
                    const allUsers = await getAllUsers().catch(() => []);
                    const targetUsers = allUsers.filter((u) => (u.uid || u.id) && (u.role === 'student' || u.role === 'guardian' || u.role === 'staff'));
                    const snippet = String(postData.content || "New GAD announcement published").slice(0, 100);
                    await Promise.all(targetUsers.map((u) =>
                        sendAccountNotification({
                            userId: u.uid || u.id,
                            type: "gad_bulletin",
                            title: "GAD Announcement: " + (postData.author || "GAD Office"),
                            message: snippet + (snippet.length >= 100 ? "..." : ""),
                            sourceUserId: "gad_office",
                            sourceName: postData.author || "GAD Office",
                            metadata: {
                                postId: docRef.id,
                                timestamp: new Date().toISOString()
                            }
                        }).catch(() => null)
                    ));
                } catch (_) { }
            })();

            return true;
        } catch (error) {
            console.warn("Firestore GAD post save fallback to local:", error);
            const local = readLocalGADPosts();
            local.unshift({ id: localId, ...baseEntry, isLocalFallback: true });
            writeLocalGADPosts(local);
            return true;
        }
    };

    /**
     * Fetch latest GAD posts
     */
    // (2026-07-13) Merge local & user-doc GAD post likes; was gad_posts only
    const LOCAL_GAD_LIKES_KEY = "securo_gad_likes_local";
    const readLocalGADLikes = () => {
        try {
            const raw = localStorage.getItem(LOCAL_GAD_LIKES_KEY);
            const parsed = raw ? JSON.parse(raw) : {};
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (_) { return {}; }
    };
    const writeLocalGADLikes = (map) => {
        try { localStorage.setItem(LOCAL_GAD_LIKES_KEY, JSON.stringify(map || {})); } catch (_) { }
    };
    const applyGadLikesOverlay = (posts, userLikedSet = null, uid = null) => {
        const localMap = readLocalGADLikes();
        return (posts || []).map((post) => {
            const pid = String(post.id || '');
            const base = new Set(Array.isArray(post.likedBy) ? post.likedBy.map(String) : []);
            const perPost = localMap[pid];
            if (perPost && typeof perPost === 'object') {
                Object.entries(perPost).forEach(([u, liked]) => {
                    if (liked) base.add(String(u));
                    else base.delete(String(u));
                });
            }
            if (uid && userLikedSet && !(perPost && Object.prototype.hasOwnProperty.call(perPost, String(uid)))) {
                if (userLikedSet.has(pid)) base.add(String(uid));
            }
            const likedBy = Array.from(base);
            return { ...post, likedBy, likes: likedBy.length };
        });
    };

    // (2026-07-13) Support maxDocs recent limit for GAD posts; was full scan
    export const getGADPosts = async (opts = {}) => {
        const maxDocs = Number(opts?.maxDocs) || 0;
        const localPosts = readLocalGADPosts();
        const curUid = auth.currentUser?.uid || null;
        let userLikedSet = null;
        if (curUid) {
            try {
                const uSnap = await getDoc(doc(db, "users", curUid));
                if (uSnap.exists() && Array.isArray(uSnap.data()?.likedGadPosts)) {
                    userLikedSet = new Set(uSnap.data().likedGadPosts.map(String));
                }
            } catch (_) { }
        }
        try {
            let querySnapshot;
            if (maxDocs > 0) {
                try {
                    querySnapshot = await getDocs(query(collection(db, "gad_posts"), orderBy("createdAt", "desc"), limit(maxDocs)));
                } catch (_) {
                    querySnapshot = await getDocs(query(collection(db, "gad_posts"), limit(maxDocs)));
                }
            } else {
                querySnapshot = await getDocs(query(collection(db, "gad_posts")));
            }
            const remote = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            const merged = [...remote];
            localPosts.forEach((lp) => {
                if (!merged.some((rp) => rp.id === lp.id)) merged.push(lp);
            });
            return applyGadLikesOverlay(merged, userLikedSet, curUid)
                .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        } catch (error) {
            console.warn("Error getting GAD posts, using local fallback:", error);
            return applyGadLikesOverlay(localPosts, userLikedSet, curUid)
                .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        }
    };

    /**
     * Toggle like on a GAD post
     * @param {string} postId 
     * @param {string} userId 
     */
    // (2026-07-13) Persist GAD likes via user doc & local fallback; was gad_posts only
    export const toggleLikeGADPost = async (postId, userId) => {
        const pid = String(postId || '').trim();
        const uid = String(userId || auth.currentUser?.uid || '').trim();
        if (!pid || !uid) return { likes: 0, isLiked: false };

        let remoteLikedBy = null;
        let postExistsInFs = false;
        const postRef = doc(db, "gad_posts", pid);
        try {
            const postSnap = await getDoc(postRef);
            if (postSnap.exists()) {
                postExistsInFs = true;
                remoteLikedBy = Array.isArray(postSnap.data()?.likedBy) ? postSnap.data().likedBy.map(String) : [];
            }
        } catch (_) { }

        const localPosts = readLocalGADPosts();
        const localPostIdx = localPosts.findIndex(p => String(p.id) === pid);
        const localMap = readLocalGADLikes();
        const perPost = (localMap[pid] && typeof localMap[pid] === 'object') ? { ...localMap[pid] } : {};

        const baseSet = new Set(remoteLikedBy || (localPostIdx >= 0 && Array.isArray(localPosts[localPostIdx].likedBy) ? localPosts[localPostIdx].likedBy.map(String) : []));
        Object.entries(perPost).forEach(([u, liked]) => {
            if (liked) baseSet.add(String(u));
            else baseSet.delete(String(u));
        });

        const wasLiked = baseSet.has(uid);
        const nextLiked = !wasLiked;
        if (nextLiked) baseSet.add(uid);
        else baseSet.delete(uid);

        const newLikedBy = Array.from(baseSet);
        perPost[uid] = nextLiked;
        localMap[pid] = perPost;
        writeLocalGADLikes(localMap);

        if (localPostIdx >= 0) {
            localPosts[localPostIdx] = { ...localPosts[localPostIdx], likedBy: newLikedBy, likes: newLikedBy.length };
            writeLocalGADPosts(localPosts);
        }

        if (postExistsInFs) {
            try {
                await setDoc(postRef, { likedBy: newLikedBy, likes: newLikedBy.length }, { merge: true });
            } catch (_) { }
        }

        try {
            const userRef = doc(db, "users", uid);
            const uSnap = await getDoc(userRef);
            const curLikedPosts = (uSnap.exists() && Array.isArray(uSnap.data()?.likedGadPosts))
                ? uSnap.data().likedGadPosts.map(String)
                : [];
            const nextLikedPosts = nextLiked
                ? Array.from(new Set([...curLikedPosts, pid]))
                : curLikedPosts.filter(id => id !== pid);
            await setDoc(userRef, { likedGadPosts: nextLikedPosts }, { merge: true });
        } catch (_) { }

        return { likes: newLikedBy.length, isLiked: nextLiked };
    };

    /**
     * Delete a GAD post
     * @param {string} postId 
     */
    export const deleteGADPost = async (postId) => {
        const local = readLocalGADPosts();
        const filtered = local.filter(p => String(p.id) !== String(postId));
        if (filtered.length !== local.length) writeLocalGADPosts(filtered);
        if (String(postId).startsWith("local_gad_")) return true;
        try {
            await deleteDoc(doc(db, "gad_posts", postId));
            return true;
        } catch (error) {
            console.warn("Error deleting post from Firestore:", error);
            return true;
        }
    };

    /**
     * Update a GAD post
     * @param {string} postId 
     * @param {object} updatedData 
     */
    export const updateGADPost = async (postId, updatedData) => {
        const local = readLocalGADPosts();
        const idx = local.findIndex(p => String(p.id) === String(postId));
        if (idx >= 0) {
            local[idx] = { ...local[idx], ...updatedData, updatedAt: { seconds: Math.floor(Date.now() / 1000) } };
            writeLocalGADPosts(local);
        }
        if (String(postId).startsWith("local_gad_")) return true;
        try {
            const postRef = doc(db, "gad_posts", postId);
            await updateDoc(postRef, {
                ...updatedData,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.warn("Error updating post in Firestore:", error);
            return true;
        }
    };


    /**
     * Log attendance (Time In / Time Out)
     * @param {string} userId 
     * @param {string} type 'in' or 'out'
     * @param {object} location {lat, lng, address}
     */
    export const logAttendance = async (userId, type, location) => {
        try {
            await addDoc(collection(db, "attendance"), {
                userId,
                type,
                location,
                timestamp: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.warn("Error logging attendance:", error);
            throw error;
        }
    };

    /**
     * Fetch attendance history for a user
     * @param {string} userId 
     */
    export const getAttendanceHistory = async (userId) => {
        try {
            const q = query(collection(db, "attendance"), where("userId", "==", userId));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                .filter((item) => item.type === "in" || item.type === "out")
                .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
        } catch (error) {
            console.warn("Error getting attendance history:", error);
            return [];
        }
    };

    // (2026-07-13) Support maxDocs recent limit for attendance; was full scan
    export const getAllAttendance = async (opts = {}) => {
        const maxDocs = Number(opts?.maxDocs) || 0;
        try {
            let querySnapshot;
            try {
                const q = maxDocs > 0
                    ? query(collection(db, "attendance"), orderBy("timestamp", "desc"), limit(maxDocs))
                    : query(collection(db, "attendance"), orderBy("timestamp", "desc"));
                querySnapshot = await getDocs(q);
            } catch (_) {
                const qFallback = maxDocs > 0
                    ? query(collection(db, "attendance"), limit(maxDocs))
                    : collection(db, "attendance");
                querySnapshot = await getDocs(qFallback);
            }
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.warn("Error getting all attendance records:", error);
            return [];
        }
    };

    /**
     * Fetch the bootstrap profile marker for a student from attendance.
     * Useful when profile reads are restricted but attendance reads are available.
     * @param {string} userId
     */
    export const getStudentBootstrapProfile = async (userId) => {
        if (!userId) return null;
        try {
            const q = query(collection(db, "attendance"), where("userId", "==", userId));
            const querySnapshot = await getDocs(q);
            const bootstrapEntry = querySnapshot.docs
                .map((entry) => ({ id: entry.id, ...entry.data() }))
                .find((entry) => entry.type === "profile_bootstrap" && entry.profile);

            return bootstrapEntry?.profile || null;
        } catch (error) {
            if (!isPermissionDeniedError(error)) {
                console.warn("Student bootstrap profile lookup failed:", error?.message || error);
            }
            return null;
        }
    };

    /**
     * Get latest attendance status for a user
     * @param {string} userId 
     */
    export const getLatestAttendance = async (userId) => {
        try {
            const q = query(
                collection(db, "attendance"),
                where("userId", "==", userId)
            );
            const querySnapshot = await getDocs(q);
            const logs = querySnapshot.docs.map(doc => doc.data())
                .filter((item) => item.type === "in" || item.type === "out")
                .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

            return logs.length > 0 ? logs[0] : null;
        } catch (error) {
            console.warn("Error getting latest attendance:", error);
            return null;
        }
    };
    // (2026-07-13) Support maxDocs recent limit for SOS logs; was full scan
    export const getAllSOSLogs = async (opts = {}) => {
        const maxDocs = Number(opts?.maxDocs) || 0;
        try {
            const fetchSosSnap = async () => {
                if (maxDocs > 0) {
                    try {
                        return await getDocs(query(collection(db, "sos_logs"), orderBy("timestamp", "desc"), limit(maxDocs)));
                    } catch (_) {
                        return await getDocs(query(collection(db, "sos_logs"), limit(maxDocs)));
                    }
                }
                return await getDocs(collection(db, "sos_logs"));
            };
            const fetchAttSnap = async () => {
                const q = maxDocs > 0
                    ? query(collection(db, "attendance"), where("type", "==", "sos"), limit(maxDocs))
                    : query(collection(db, "attendance"), where("type", "==", "sos"));
                return await getDocs(q);
            };
            const [sosSnap, attSnap] = await Promise.all([
                fetchSosSnap().catch(() => null),
                fetchAttSnap().catch(() => null)
            ]);
            const logs = (sosSnap?.docs || []).map(d => ({ id: d.id, ...d.data() }));
            const getMs = (item) => {
                const ts = item?.timestamp || item?.createdAt;
                if (!ts) return 0;
                if (typeof ts.toMillis === "function") return ts.toMillis();
                if (typeof ts.seconds === "number") return ts.seconds * 1000;
                const parsed = new Date(ts).getTime();
                return Number.isNaN(parsed) ? 0 : parsed;
            };
            (attSnap?.docs || []).forEach(d => {
                const data = d.data() || {};
                const attMs = getMs(data);
                const uid = String(data.userId || data.studentUid || "");
                const isDup = logs.some(l => String(l.userId || l.studentUid || "") === uid && Math.abs(getMs(l) - attMs) < 15000);
                if (!isDup) {
                    logs.push({
                        id: d.id,
                        userId: data.userId || data.studentUid || "",
                        studentUid: data.studentUid || data.userId || "",
                        userName: data.studentName || data.userName || "",
                        studentId: data.studentId || "",
                        role: data.role || "",
                        location: data.location || {},
                        timestamp: data.timestamp,
                        status: data.status || "active"
                    });
                }
            });
            return logs.sort((a, b) => getMs(b) - getMs(a));
        } catch (error) {
            console.warn("Error getting all SOS logs:", error);
            return [];
        }
    };

    /**
     * Fetch SOS logs for a specific user
     * @param {string} userId
     */
    export const getUserSOSLogs = async (userId) => {
        if (!userId) return [];
        try {
            // Try with orderBy first (requires composite index on userId + timestamp)
            const q = query(
                collection(db, "sos_logs"),
                where("userId", "==", userId),
                orderBy("timestamp", "desc")
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (indexError) {
            // Composite index may not exist yet â€” fall back to filter-only query and sort client-side
            try {
                const q2 = query(collection(db, "sos_logs"), where("userId", "==", userId));
                const querySnapshot = await getDocs(q2);
                return querySnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
            } catch (error) {
                console.warn("Could not fetch SOS logs:", error);
                return [];
            }
        }
    };

    /**
     * Fetch all users for admin
     */
    // (2026-07-13) Support maxDocs recent limit for users; was full scan
    export const getAllUsers = async (opts = {}) => {
        const maxDocs = Number(opts?.maxDocs) || 0;
        const usersQ = maxDocs > 0 ? query(collection(db, "users"), limit(maxDocs)) : collection(db, "users");
        const attQ = maxDocs > 0
            ? query(collection(db, "attendance"), where("type", "==", "profile_bootstrap"), limit(maxDocs))
            : query(collection(db, "attendance"), where("type", "==", "profile_bootstrap"));
        const linksQ = maxDocs > 0 ? query(collection(db, "guardian_links"), limit(maxDocs)) : collection(db, "guardian_links");
        const [usersResult, attendanceResult, guardianLinksResult] = await Promise.allSettled([
            getDocs(usersQ),
            getDocs(attQ),
            getDocs(linksQ)
        ]);

        const remoteUsers = usersResult.status === "fulfilled"
            ? usersResult.value.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            : [];

        const bootstrapStudents = attendanceResult.status === "fulfilled"
            ? attendanceResult.value.docs
                .map((entry) => ({ id: entry.id, ...entry.data() }))
                .filter((item) => item.type === "profile_bootstrap" && item.profile)
                .map((item) => ({
                    id: item.userId,
                    userId: item.userId,
                    studentId: item.profile.studentId || "",
                    name: item.profile.name || "",
                    email: item.profile.email || "",
                    role: "student"
                }))
            : [];

        const linkRecords = guardianLinksResult.status === "fulfilled"
            ? guardianLinksResult.value.docs.map((entry) => ({ id: entry.id, ...entry.data() }))
            : [];

        const guardianDirectory = [];
        const studentDirectory = [];
        linkRecords.forEach((link, index) => {
            if (link.guardianId || link.guardianEmail || link.guardianName) {
                guardianDirectory.push({
                    id: link.guardianId || normalizeEmail(link.guardianEmail) || `guardian_link_${index}`,
                    userId: link.guardianId || "",
                    email: link.guardianEmail || "",
                    name: link.guardianName || "",
                    role: "guardian"
                });
            }

            if (link.studentUid || link.studentId || link.studentName) {
                studentDirectory.push({
                    id: link.studentUid || `student_${link.studentId || index}`,
                    userId: link.studentUid || "",
                    studentId: link.studentId || "",
                    name: link.studentName || "",
                    role: "student"
                });
            }
        });

        if (usersResult.status === "rejected" && !isPermissionDeniedError(usersResult.reason)) {
            console.warn("User directory users lookup failed:", usersResult.reason?.message || usersResult.reason);
        }
        if (attendanceResult.status === "rejected" && !isPermissionDeniedError(attendanceResult.reason)) {
            console.warn("User directory attendance lookup failed:", attendanceResult.reason?.message || attendanceResult.reason);
        }
        if (guardianLinksResult.status === "rejected" && !isPermissionDeniedError(guardianLinksResult.reason)) {
            console.warn("User directory guardian link lookup failed:", guardianLinksResult.reason?.message || guardianLinksResult.reason);
        }

        const localUsers = readLocalUsers();

        return mergeUsersByIdentity(remoteUsers, bootstrapStudents, guardianDirectory, studentDirectory, localUsers)
            .filter((user) => !user?.isDeleted && !user?.deletedAt);
    };

    // (2026-07-13) Reliable multi-channel chat sync & fallback; was brittle
    const LOCAL_CHAT_MESSAGES_KEY = "securo_chat_messages_local";

    const getMsgSec = (m) => {
        if (!m) return 0;
        if (m.timestamp?.seconds) return m.timestamp.seconds;
        if (typeof m.timestamp?.toMillis === "function") return m.timestamp.toMillis() / 1000;
        if (m.localTime) return Number(m.localTime) / 1000;
        if (m.createdAt?.seconds) return m.createdAt.seconds;
        if (m.createdAt) {
            const parsed = new Date(m.createdAt).getTime();
            if (!Number.isNaN(parsed)) return parsed / 1000;
        }
        return Date.now() / 1000;
    };

    // (2026-07-13) Persist all chat messages to localStorage & IDB; was sent-only 300 cap
    const MSG_IDB_NAME = "securo_messages_cache_db";
    const MSG_IDB_STORE = "kv";
    let _memChatCache = null;
    let _msgIdbWriteTimer = null;

    const normalizeMsgForCache = (m) => {
        if (!m || typeof m !== "object") return m;
        const c = { ...m };
        if (c.timestamp && typeof c.timestamp.toMillis === "function") {
            const ms = c.timestamp.toMillis();
            c.timestamp = { seconds: Math.floor(ms / 1000), nanoseconds: 0 };
            if (!c.localTime) c.localTime = ms;
        } else if (c.timestamp && typeof c.timestamp.seconds === "number") {
            c.timestamp = { seconds: c.timestamp.seconds, nanoseconds: c.timestamp.nanoseconds || 0 };
            if (!c.localTime) c.localTime = c.timestamp.seconds * 1000;
        }
        if (c.createdAt && typeof c.createdAt.toMillis === "function") {
            const ms = c.createdAt.toMillis();
            c.createdAt = { seconds: Math.floor(ms / 1000), nanoseconds: 0 };
        }
        if (c.seenAt && typeof c.seenAt.toMillis === "function") {
            const ms = c.seenAt.toMillis();
            c.seenAt = { seconds: Math.floor(ms / 1000), nanoseconds: 0 };
        }
        return c;
    };

    const openMsgCacheDB = () => new Promise((resolve, reject) => {
        if (typeof indexedDB === "undefined") return reject(new Error("no idb"));
        const req = indexedDB.open(MSG_IDB_NAME, 1);
        req.onupgradeneeded = () => {
            if (!req.result.objectStoreNames.contains(MSG_IDB_STORE)) {
                req.result.createObjectStore(MSG_IDB_STORE);
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });

    const scheduleMsgIdbPut = (key, list) => {
        if (_msgIdbWriteTimer) clearTimeout(_msgIdbWriteTimer);
        _msgIdbWriteTimer = setTimeout(async () => {
            try {
                const dbInst = await openMsgCacheDB();
                const tx = dbInst.transaction(MSG_IDB_STORE, "readwrite");
                tx.objectStore(MSG_IDB_STORE).put(list, key);
                tx.oncomplete = () => dbInst.close();
            } catch (_) { }
        }, 400);
    };

    const hydrateChatCacheFromIdb = async () => {
        try {
            const dbInst = await openMsgCacheDB();
            const stored = await new Promise((resolve) => {
                const tx = dbInst.transaction(MSG_IDB_STORE, "readonly");
                const req = tx.objectStore(MSG_IDB_STORE).get("chat_messages");
                req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : null);
                req.onerror = () => resolve(null);
            });
            dbInst.close();
            if (stored && stored.length) {
                const current = readLocalChatMessages();
                if (stored.length > current.length) {
                    _memChatCache = mergeChatMessagesList(stored, current);
                    try { localStorage.setItem(LOCAL_CHAT_MESSAGES_KEY, JSON.stringify(_memChatCache.slice(-1500))); } catch (_) { }
                }
            }
        } catch (_) { }
    };
    if (typeof window !== "undefined") hydrateChatCacheFromIdb();

    const readLocalChatMessages = () => {
        if (Array.isArray(_memChatCache) && _memChatCache.length) return _memChatCache;
        try {
            const raw = localStorage.getItem(LOCAL_CHAT_MESSAGES_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            const list = Array.isArray(parsed) ? parsed : [];
            if (list.length) _memChatCache = list;
            return list;
        } catch (_) {
            return [];
        }
    };

    const persistChatMessagesBulk = (incoming = []) => {
        if (!Array.isArray(incoming) || !incoming.length) return;
        try {
            const normalized = incoming.map(normalizeMsgForCache);
            const merged = mergeChatMessagesList(normalized, readLocalChatMessages());
            _memChatCache = merged;
            try { localStorage.setItem(LOCAL_CHAT_MESSAGES_KEY, JSON.stringify(merged.slice(-1500))); } catch (_) {
                try { localStorage.setItem(LOCAL_CHAT_MESSAGES_KEY, JSON.stringify(merged.slice(-500))); } catch (__) { }
            }
            scheduleMsgIdbPut("chat_messages", merged);
        } catch (_) { }
    };

    const writeLocalChatMessage = (msg) => {
        try {
            const cleanMsg = normalizeMsgForCache(msg);
            const list = readLocalChatMessages();
            const filtered = list.filter(m => m.id !== cleanMsg.id);
            filtered.push(cleanMsg);
            _memChatCache = filtered;
            try { localStorage.setItem(LOCAL_CHAT_MESSAGES_KEY, JSON.stringify(filtered.slice(-1500))); } catch (_) {
                try { localStorage.setItem(LOCAL_CHAT_MESSAGES_KEY, JSON.stringify(filtered.slice(-500))); } catch (__) { }
            }
            scheduleMsgIdbPut("chat_messages", filtered);
            const ch = new BroadcastChannel('securo_chat_channel');
            ch.postMessage({ type: 'chat_message', msg: cleanMsg });
            ch.close();
        } catch (_) { }
    };

    const mergeChatMessagesList = (remoteList, localList) => {
        const map = new Map();
        const put = (m) => {
            if (!m) return;
            const key = m.id || `${m.threadId}_${m.senderId}_${m.text || m.message}_${Math.floor(getMsgSec(m))}`;
            if (!map.has(key)) map.set(key, m);
        };
        (remoteList || []).forEach(put);
        (localList || []).forEach((lm) => {
            const dup = (remoteList || []).some(rm =>
                rm.id === lm.id ||
                (rm.threadId === lm.threadId && rm.senderId === lm.senderId && (rm.text || rm.message) === (lm.text || lm.message) && Math.abs(getMsgSec(rm) - getMsgSec(lm)) < 15)
            );
            if (!dup) put(lm);
        });
        return Array.from(map.values()).sort((a, b) => getMsgSec(a) - getMsgSec(b));
    };

    const buildThreadsFromMessages = (allMessages) => {
        const threadsMap = new Map();
        (allMessages || []).forEach((msg) => {
            if (!msg || !msg.threadId) return;
            const existing = threadsMap.get(msg.threadId);
            if (!existing || getMsgSec(msg) >= getMsgSec(existing)) {
                threadsMap.set(msg.threadId, msg);
            }
        });
        return Array.from(threadsMap.values()).sort((a, b) => getMsgSec(b) - getMsgSec(a));
    };

    export const getAllChatThreadsOnce = async (adminUid = "system_admin_securo") => {
        const ADMIN_CONST = "system_admin_securo";
        const localMsgs = readLocalChatMessages();
        try {
            const queries = [
                getDocs(query(collection(db, "messages"), where("receiverId", "==", ADMIN_CONST))).catch(() => ({ docs: [] })),
                getDocs(query(collection(db, "messages"), where("recipientUid", "==", ADMIN_CONST))).catch(() => ({ docs: [] })),
                getDocs(query(collection(db, "messages"), where("senderId", "==", ADMIN_CONST))).catch(() => ({ docs: [] }))
            ];
            if (adminUid && adminUid !== ADMIN_CONST) {
                queries.push(getDocs(query(collection(db, "messages"), where("senderId", "==", adminUid))).catch(() => ({ docs: [] })));
                queries.push(getDocs(query(collection(db, "messages"), where("receiverId", "==", adminUid))).catch(() => ({ docs: [] })));
            }
            const snaps = await Promise.all(queries);
            const remoteMsgs = [];
            const seen = new Set();
            snaps.forEach((snap) => {
                (snap?.docs || []).forEach((entry) => {
                    if (!seen.has(entry.id)) {
                        seen.add(entry.id);
                        remoteMsgs.push({ id: entry.id, ...entry.data() });
                    }
                });
            });
            // (2026-07-13) Cache all fetched admin thread messages; was uncached
            if (remoteMsgs.length) persistChatMessagesBulk(remoteMsgs);
            return buildThreadsFromMessages(mergeChatMessagesList(remoteMsgs, localMsgs));
        } catch (error) {
            console.warn("Error getting chat threads once:", error);
            return buildThreadsFromMessages(localMsgs);
        }
    };

    // (2026-07-13) Support maxDocs recent limit for guardian links; was full scan
    export const getAllGuardianLinksAdmin = async (opts = {}) => {
        const maxDocs = Number(opts?.maxDocs) || 0;
        try {
            const q = maxDocs > 0 ? query(collection(db, "guardian_links"), limit(maxDocs)) : collection(db, "guardian_links");
            const snapshot = await getDocs(q);
            return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
        } catch (error) {
            console.warn("Error getting guardian links for admin:", error);
            return [];
        }
    };

    /**
     * Messaging: Subscribe to real-time messages between two users
     */
    export const subscribeToMessages = (userId1, userId2, callback) => {
        const threadId = [userId1, userId2].sort().join("_");
        return subscribeToMessagesByThread(threadId, callback);
    };

    /**
     * Messaging: Subscribe to a specific thread directly
     * @param {string} threadId
     * @param {function} callback
     */
    export const subscribeToMessagesByThread = (threadId, callback) => {
        let remoteMessages = [];
        const emit = () => {
            const localForThread = readLocalChatMessages().filter(m => m.threadId === threadId);
            callback(mergeChatMessagesList(remoteMessages, localForThread));
        };
        emit();

        const q = query(
            collection(db, "messages"),
            where("threadId", "==", threadId)
        );
        const unsubFs = onSnapshot(q, (snapshot) => {
            remoteMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // (2026-07-13) Cache all received thread messages for reload; was volatile
            if (remoteMessages.length) persistChatMessagesBulk(remoteMessages);
            emit();
        }, () => emit());

        let ch = null;
        try {
            ch = new BroadcastChannel('securo_chat_channel');
            ch.onmessage = (e) => {
                if (!e.data?.msg || e.data.msg.threadId === threadId) emit();
            };
        } catch (_) { }
        const onStorage = (e) => {
            if (e.key === LOCAL_CHAT_MESSAGES_KEY) emit();
        };
        if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);

        return () => {
            unsubFs();
            if (ch) ch.close();
            if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
        };
    };

    /**
     * Messaging: Send a message with threadId
     */
    // (2026-07-13) Persist chat locally + Firestore with fallback; was Firestore only
    export const sendChatMessage = async (senderId, receiverId, text, senderName, options = {}) => {
        const threadId = options.threadId || [senderId, receiverId].sort().join("_");
        const senderRole = options.senderRole || (senderId === "system_admin_securo" ? "admin" : "student");
        const recipientRole = options.recipientRole || (receiverId === "system_admin_securo" ? "admin" : "student");
        const nowMs = Date.now();
        const localId = `local_msg_${nowMs}_${Math.random().toString(36).slice(2, 7)}`;
        const basePayload = {
            threadId,
            senderId,
            receiverId,
            senderUid: senderId,
            recipientUid: receiverId,
            text,
            message: text,
            senderName: senderName || "User",
            senderRole,
            recipientRole,
            supportMode: options.supportMode || "",
            isAnonymous: !!options.isAnonymous,
            senderLabel: options.senderLabel || "",
            ownerId: options.ownerId || "",
            anonymousSessionId: options.anonymousSessionId || "",
            read: false,
            seen: false,
            seenAt: null,
            status: "delivered"
        };

        try {
            const docRef = await addDoc(collection(db, "messages"), {
                ...basePayload,
                timestamp: serverTimestamp()
            });
            writeLocalChatMessage({
                id: docRef.id,
                ...basePayload,
                localTime: nowMs,
                timestamp: { seconds: Math.floor(nowMs / 1000) }
            });

            // (2026-07-13) Mark previous incoming messages as replied; was unflagged
            try {
                const qPrev = query(collection(db, "messages"), where("threadId", "==", threadId));
                getDocs(qPrev).then(snap => {
                    snap.forEach(d => {
                        const data = d.data();
                        if (data.senderRole !== senderRole && data.status !== "replied") {
                            updateDoc(doc(db, "messages", d.id), {
                                status: "replied",
                                repliedAt: serverTimestamp(),
                                repliedBy: senderName || "Admin"
                            }).catch(() => { });
                        }
                    });
                }).catch(() => { });
            } catch (_) { }

            const targetUid = receiverId === "system_admin_securo" ? "admin" : receiverId;
            const noteTitle = senderRole === "admin" ? "New message from Admin" : `Message from ${senderName || "User"}`;
            sendAccountNotification({
                userId: targetUid,
                recipientUid: targetUid,
                type: "chat_message",
                title: noteTitle,
                message: text.length > 70 ? text.substring(0, 67) + "..." : text,
                relatedId: threadId,
                sourceUserId: senderId,
                sourceName: senderName || "User",
                priority: "normal"
            }).catch((err) => console.warn("Chat notification trigger skipped:", err));

            return true;
        } catch (error) {
            console.warn("Firestore chat send fallback to local sync:", error);
            writeLocalChatMessage({
                id: localId,
                ...basePayload,
                localTime: nowMs,
                timestamp: { seconds: Math.floor(nowMs / 1000) },
                isLocalFallback: true
            });
            return true;
        }
    };

    // (2026-07-13) Persist thread seen & read state to Firestore; was in-memory only
    export const markThreadMessagesSeen = async (threadId, viewerRole = "admin") => {
        if (!threadId) return;
        try {
            const q = query(collection(db, "messages"), where("threadId", "==", threadId));
            const snap = await getDocs(q);
            const updates = [];
            snap.forEach(d => {
                const data = d.data();
                const isFromOther = viewerRole === "admin" ? data.senderRole !== "admin" : data.senderRole === "admin";
                if (isFromOther && (!data.read || !data.seen)) {
                    updates.push(updateDoc(doc(db, "messages", d.id), {
                        read: true,
                        seen: true,
                        seenAt: serverTimestamp(),
                        status: "seen"
                    }).catch(() => { }));
                }
            });
            await Promise.all(updates);
        } catch (e) {
            console.warn("markThreadMessagesSeen fallback:", e);
        }
    };


    /**
     * Messaging: Get all chat threads (for Admin)
     */
    // (2026-07-13) Realtime multi-query & local-synced admin threads; was 2 queries
    export const getAllChatThreads = (adminUid = "system_admin_securo", callback) => {
        const ADMIN_CONST = "system_admin_securo";
        const buckets = new Map();

        const emit = () => {
            const remoteMsgs = [];
            const seen = new Set();
            buckets.forEach((docs) => {
                (docs || []).forEach((entry) => {
                    if (!seen.has(entry.id)) {
                        seen.add(entry.id);
                        remoteMsgs.push({ id: entry.id, ...entry.data() });
                    }
                });
            });
            // (2026-07-13) Cache all realtime thread messages for reload; was volatile
            if (remoteMsgs.length) persistChatMessagesBulk(remoteMsgs);
            const merged = mergeChatMessagesList(remoteMsgs, readLocalChatMessages());
            callback(buildThreadsFromMessages(merged));
        };

        emit();

        const unsubs = [];
        const watch = (key, q) => {
            const u = onSnapshot(q, (s) => {
                buckets.set(key, s.docs);
                emit();
            }, (err) => {
                console.warn(`getAllChatThreads(${key}) error:`, err);
                buckets.set(key, []);
                emit();
            });
            unsubs.push(u);
        };

        watch("recvConst", query(collection(db, "messages"), where("receiverId", "==", ADMIN_CONST)));
        watch("recvUidConst", query(collection(db, "messages"), where("recipientUid", "==", ADMIN_CONST)));
        watch("sentConst", query(collection(db, "messages"), where("senderId", "==", ADMIN_CONST)));
        if (adminUid && adminUid !== ADMIN_CONST) {
            watch("sentAdmin", query(collection(db, "messages"), where("senderId", "==", adminUid)));
            watch("recvAdmin", query(collection(db, "messages"), where("receiverId", "==", adminUid)));
        }

        let ch = null;
        try {
            ch = new BroadcastChannel('securo_chat_channel');
            ch.onmessage = () => emit();
        } catch (_) { }
        const onStorage = (e) => {
            if (e.key === LOCAL_CHAT_MESSAGES_KEY) emit();
        };
        if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);

        return () => {
            unsubs.forEach(u => { try { u(); } catch (_) { } });
            if (ch) ch.close();
            if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
        };
    };

    /**
     * Messaging: Delete every message in a thread
     * @param {string} threadId
     */
    export const deleteConversationThread = async (threadId) => {
        if (!threadId) return false;
        try {
            const q = query(collection(db, "messages"), where("threadId", "==", threadId));
            const snapshot = await getDocs(q);
            await Promise.all(snapshot.docs.map((entry) => deleteDoc(doc(db, "messages", entry.id))));
            return true;
        } catch (error) {
            console.warn("Error deleting conversation thread:", error);
            throw error;
        }
    };

    /**
     * Soft-delete a user record and related admin-visible links.
     * @param {string} userId
     */
    // (2026-07-13) Mark user deleted immediately & clean links async; was blocking
    export const deleteUserRecord = async (userId) => {
        if (!userId) return false;

        const localUsers = readLocalUsers();
        const existingLocalUser = localUsers.find((entry) => String(entry.id) === String(userId)) || {};
        upsertLocalUser(userId, {
            ...existingLocalUser,
            isDeleted: true,
            deletedAt: new Date().toISOString()
        });

        try {
            await setDoc(doc(db, "users", userId), {
                isDeleted: true,
                deletedAt: new Date().toISOString()
            }, { merge: true });

            // Run secondary link & message cleanup in background so admin UI never stalls
            (async () => {
                try {
                    const profile = await getUserProfile(userId).catch(() => null);
                    await deleteDoc(doc(db, "student_locations", userId)).catch(() => { });

                    const guardianLinkSnapshots = await Promise.all([
                        getDocs(query(collection(db, "guardian_links"), where("guardianId", "==", userId))).catch(() => null),
                        getDocs(query(collection(db, "guardian_links"), where("studentUid", "==", userId))).catch(() => null),
                        profile?.studentId
                            ? getDocs(query(collection(db, "guardian_links"), where("studentId", "==", profile.studentId))).catch(() => null)
                            : Promise.resolve(null)
                    ]);

                    const guardianLinkIds = new Set();
                    guardianLinkSnapshots.forEach((snapshot) => {
                        snapshot?.docs?.forEach((entry) => guardianLinkIds.add(entry.id));
                    });
                    await Promise.all(Array.from(guardianLinkIds).map((id) => deleteDoc(doc(db, "guardian_links", id)).catch(() => { })));

                    const messagesSnapshot = await getDocs(collection(db, "messages")).catch(() => null);
                    const messageIds = (messagesSnapshot?.docs || [])
                        .filter((entry) => {
                            const data = entry.data();
                            return String(data.senderId) === String(userId) || String(data.receiverId) === String(userId);
                        })
                        .map((entry) => entry.id);
                    await Promise.all(messageIds.map((id) => deleteDoc(doc(db, "messages", id)).catch(() => { })));
                } catch (_) { }
            })();

            return true;
        } catch (error) {
            if (error?.code === "permission-denied" || /insufficient permissions|missing or insufficient permissions/i.test(error?.message || "")) {
                console.warn("Remote delete denied; user was removed from the local admin directory only.");
                return true;
            }
            console.warn("Error deleting user record:", error);
            throw error;
        }
    };

    // (2026-07-13) Require verified password for account deletion; was optional pwd
    export const deleteCurrentUserAccount = async (password = "") => {
        const user = auth.currentUser;
        if (!user) throw new Error("No authenticated user to delete.");

        const trimmedPassword = typeof password === 'string' ? password.trim() : '';
        if (!trimmedPassword) {
            throw new Error("Please enter your current password to confirm deletion.");
        }

        if (!user.email) {
            throw new Error("User account does not have an associated email address.");
        }

        const credential = EmailAuthProvider.credential(user.email, trimmedPassword);
        await reauthenticateWithCredential(user, credential);

        const uid = user.uid;
        await deleteUserRecord(uid).catch((err) => {
            console.warn("deleteUserRecord partial failure during account deletion:", err);
        });

        await deleteUser(user);

        try {
            localStorage.clear();
            sessionStorage.clear();
        } catch (e) { }

        return true;
    };

    export const getStudentLiveLocationOnce = async (studentUid) => {
        if (!studentUid) return null;
        try {
            const snapshot = await getDoc(doc(db, "student_locations", studentUid));
            return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
        } catch (error) {
            console.warn("Error getting student live location:", error);
            return null;
        }
    };

    // ========================================================
    // GUARDIAN LINK SYSTEM (Date: 2026-05-03)
    // Handles parent-student linking with consent workflow
    // ========================================================

    // (2026-07-13) Set multi-link capacity to 10 for parents and students; was 5/3
    const MAX_GUARDIANS_PER_STUDENT = 10;
    const MAX_CHILDREN_PER_GUARDIAN = 10;

    const getGuardianLinkRecords = async (guardianId) => {
        if (!guardianId) return [];
        const guardianQuery = query(
            collection(db, "guardian_links"),
            where("guardianId", "==", guardianId)
        );
        const guardianSnapshot = await getDocs(guardianQuery);
        return guardianSnapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
    };

    const getAcceptedStudentGuardianLinks = async (studentId) => {
        if (!studentId) return [];
        const studentQuery = query(
            collection(db, "guardian_links"),
            where("studentId", "==", studentId),
            where("status", "==", "accepted")
        );
        const studentSnapshot = await getDocs(studentQuery);
        return studentSnapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
    };

    const normalizeComparableValue = (value) => String(value || "").trim().toLowerCase();

    const doesGuardianLinkMatchStudent = (link, studentId, studentUid) => {
        const normalizedStudentId = normalizeComparableValue(studentId);
        const normalizedStudentUid = normalizeComparableValue(studentUid);
        const linkStudentId = normalizeComparableValue(link?.studentId);
        const linkStudentUid = normalizeComparableValue(link?.studentUid);

        return Boolean(
            (normalizedStudentId && linkStudentId === normalizedStudentId) ||
            (normalizedStudentUid && linkStudentUid === normalizedStudentUid)
        );
    };

    const findExistingGuardianStudentLink = async ({ guardianId, guardianEmail, studentId, studentUid }) => {
        if (!guardianId && !guardianEmail) return null;

        const candidateLinks = guardianId
            ? await getGuardianLinkRecords(guardianId)
            : [];

        const directMatch = candidateLinks.find((link) => doesGuardianLinkMatchStudent(link, studentId, studentUid));
        if (directMatch) return directMatch;

        if (!guardianEmail) return null;

        // (2026-07-13) Catch email query permission error; was unhandled throw
        try {
            const emailQuery = query(
                collection(db, "guardian_links"),
                where("guardianEmail", "==", guardianEmail)
            );
            const emailSnapshot = await getDocs(emailQuery);
            const emailMatch = emailSnapshot.docs
                .map((entry) => ({ id: entry.id, ...entry.data() }))
                .find((link) => doesGuardianLinkMatchStudent(link, studentId, studentUid));

            return emailMatch || null;
        } catch (e) {
            return null;
        }
    };

    const assertGuardianCapacityForRequest = async ({ guardianId, studentId, currentLinkId = null }) => {
        const guardianLinks = await getGuardianLinkRecords(guardianId);
        const activeGuardianLinks = guardianLinks.filter((link) =>
            link.id !== currentLinkId &&
            (link.status === "accepted" || link.status === "pending")
        );

        const linkedStudentKeys = new Set(activeGuardianLinks.map(l => String(l.studentId || l.studentUid)).filter(Boolean));
        if (studentId) linkedStudentKeys.add(String(studentId));
        if (linkedStudentKeys.size > MAX_CHILDREN_PER_GUARDIAN) {
            throw new Error(`Guardian accounts can only link up to ${MAX_CHILDREN_PER_GUARDIAN} children.`);
        }

        const acceptedStudentLinks = await getAcceptedStudentGuardianLinks(studentId);
        const effectiveAcceptedLinks = acceptedStudentLinks.filter((link) => link.id !== currentLinkId);
        if (effectiveAcceptedLinks.length >= MAX_GUARDIANS_PER_STUDENT) {
            throw new Error("This student already has the maximum number of guardians.");
        }
    };

    export const syncGuardianLinksForStudent = async (studentUid, profileData = {}) => {
        if (!studentUid && !profileData?.studentId) return false;

        const updates = {
            ...(studentUid ? { studentUid } : {}),
            ...(profileData?.studentId ? { studentId: profileData.studentId } : {}),
            ...(profileData?.name ? { studentName: profileData.name } : {}),
            lastSyncedAt: serverTimestamp()
        };

        const syncTasks = [];

        if (studentUid) {
            const uidQuery = query(
                collection(db, "guardian_links"),
                where("studentUid", "==", studentUid)
            );
            syncTasks.push(getDocs(uidQuery));
        }

        if (profileData?.studentId) {
            const studentIdQuery = query(
                collection(db, "guardian_links"),
                where("studentId", "==", profileData.studentId)
            );
            syncTasks.push(getDocs(studentIdQuery));
        }

        const snapshots = await Promise.all(syncTasks);
        const seen = new Set();
        const updatePromises = [];

        snapshots.forEach((snapshot) => {
            snapshot.docs.forEach((entry) => {
                if (seen.has(entry.id)) return;
                seen.add(entry.id);
                updatePromises.push(updateDoc(doc(db, "guardian_links", entry.id), updates));
            });
        });

        if (!updatePromises.length) return false;
        await Promise.all(updatePromises);
        return true;
    };

    // (2026-07-13) Comprehensive guardian link name sync; was indexed query only
    // (2026-07-13) Sync guardian links by email & UID; was collection scan
    export const syncGuardianLinksForGuardian = async (guardianUid, profileData = {}) => {
        if (!guardianUid && !profileData?.email) return false;

        const normEmail = (profileData?.email || '').toLowerCase().trim();
        const updates = {
            ...(profileData?.name ? { guardianName: profileData.name } : {}),
            ...(normEmail ? { guardianEmail: normEmail } : {}),
            ...(guardianUid ? { guardianId: guardianUid, guardianUid: guardianUid } : {}),
            lastSyncedAt: serverTimestamp()
        };
        if (!profileData?.name && !normEmail && !guardianUid) return false;

        try {
            const updatePromises = [];
            const seen = new Set();
            if (normEmail) {
                const qEmail = query(collection(db, "guardian_links"), where("guardianEmail", "==", normEmail));
                const snapEmail = await getDocs(qEmail).catch(() => ({ docs: [] }));
                snapEmail.docs.forEach((entry) => {
                    if (!seen.has(entry.id)) {
                        seen.add(entry.id);
                        updatePromises.push(updateDoc(doc(db, "guardian_links", entry.id), updates));
                    }
                });
            }
            if (guardianUid) {
                const qUid = query(collection(db, "guardian_links"), where("guardianId", "==", guardianUid));
                const snapUid = await getDocs(qUid).catch(() => ({ docs: [] }));
                snapUid.docs.forEach((entry) => {
                    if (!seen.has(entry.id)) {
                        seen.add(entry.id);
                        updatePromises.push(updateDoc(doc(db, "guardian_links", entry.id), updates));
                    }
                });
            }
            if (updatePromises.length) {
                await Promise.all(updatePromises);
            }
            return true;
        } catch (e) {
            console.warn("Error syncing guardian links:", e);
            return false;
        }
    };

    // (2026-07-13) Invite expiry & notification cleanup helpers; was no expiry
    const GUARDIAN_INVITE_TTL_MS = 30 * 60 * 1000;
    const toEpochMs = (val) => {
        if (!val) return 0;
        if (typeof val === "number") return val;
        if (typeof val?.toMillis === "function") return val.toMillis();
        if (typeof val?.seconds === "number") return val.seconds * 1000;
        const parsed = new Date(val).getTime();
        return Number.isNaN(parsed) ? 0 : parsed;
    };
    const isInviteExpired = (item) => {
        if (!item) return false;
        const exp = toEpochMs(item.expiresAt);
        if (exp > 0) return Date.now() > exp;
        const created = toEpochMs(item.createdAt);
        if (created > 0) return (Date.now() - created) > GUARDIAN_INVITE_TTL_MS;
        return false;
    };
    const cleanupInviteNotifications = async (requestIds = []) => {
        const ids = Array.from(new Set((requestIds || []).filter(Boolean)));
        if (!ids.length) return;
        // (2026-07-13) Query with recipientUid/userId/sourceUserId for rules; was requestId only
        const currentUid = auth.currentUser?.uid || "";
        for (const reqId of ids) {
            try {
                if (currentUid) {
                    const [s1, s2, s3] = await Promise.all([
                        getDocs(query(collection(db, "notifications"), where("recipientUid", "==", currentUid), where("requestId", "==", reqId))).catch(() => ({ docs: [] })),
                        getDocs(query(collection(db, "notifications"), where("userId", "==", currentUid), where("requestId", "==", reqId))).catch(() => ({ docs: [] })),
                        getDocs(query(collection(db, "notifications"), where("sourceUserId", "==", currentUid), where("requestId", "==", reqId))).catch(() => ({ docs: [] }))
                    ]);
                    const map = new Map();
                    s1.docs.forEach(d => map.set(d.id, d));
                    s2.docs.forEach(d => map.set(d.id, d));
                    s3.docs.forEach(d => map.set(d.id, d));
                    await Promise.all(Array.from(map.values()).map((d) => deleteDoc(doc(db, "notifications", d.id)).catch(() => { })));
                } else {
                    const snap = await getDocs(query(collection(db, "notifications"), where("requestId", "==", reqId)));
                    await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, "notifications", d.id)).catch(() => { })));
                }
            } catch (_) { }
        }
    };

    /**
     * Create a guardian link request (pending consent from student)
     * @param {object} linkData { guardianId, guardianName, guardianEmail, studentId }
     */
    // (2026-07-13) Role validation & multiple linking support; was unvalidated IDs
    export const createGuardianLinkRequest = async (linkData) => {
        try {
            if (!linkData?.guardianId) {
                throw new Error("Guardian UID is required.");
            }
            const guardianProfile = await getUserProfile(linkData.guardianId).catch(() => null);
            if (guardianProfile && guardianProfile.role && guardianProfile.role !== "guardian") {
                throw new Error("Only registered Parent or Guardian accounts can send link requests.");
            }

            const studentRecord = await findStudentUidByStudentId(linkData.studentId).catch(() => null);
            if (!studentRecord?.uid) {
                throw new Error("No registered student was found with Student ID " + linkData.studentId + ".");
            }
            if (studentRecord.uid === linkData.guardianId) {
                throw new Error("A user account cannot be linked to itself.");
            }
            if (studentRecord.role && studentRecord.role !== "student") {
                throw new Error("The specified account is not a student account.");
            }
            // (2026-07-13) Enforce max 1 accepted parent per student; was unlimited
            const existingStudentLinks = await getLinksForStudent(linkData.studentId, studentRecord.uid).catch(() => []);
            const otherAccepted = (existingStudentLinks || []).find(l => l.status === "accepted" && l.guardianId !== linkData.guardianId && l.guardianUid !== linkData.guardianId);
            if (otherAccepted) {
                throw new Error("This student is already connected to a parent or guardian.");
            }

            // (2026-07-13) Block double/active invites & set expiry; was overwriting
            const expiresAtMs = Date.now() + GUARDIAN_INVITE_TTL_MS;
            const enrichedLinkData = {
                ...linkData,
                guardianId: linkData.guardianId,
                guardianUid: linkData.guardianId,
                guardianEmail: linkData.guardianEmail || guardianProfile?.email || "",
                guardianName: linkData.guardianName || guardianProfile?.name || "Parent/Guardian",
                studentUid: studentRecord.uid,
                studentName: studentRecord.name || linkData.studentName || "Student",
                relationshipType: linkData.relationshipType || "parent",
                permissions: linkData.permissions || { sosAlerts: true, attendanceAlerts: true, liveLocation: true },
                requestedBy: "guardian",
                status: "pending",
                expiresAt: expiresAtMs,
                createdAt: serverTimestamp()
            };

            const existingLink = await findExistingGuardianStudentLink({
                guardianId: enrichedLinkData.guardianId,
                guardianEmail: enrichedLinkData.guardianEmail,
                studentId: enrichedLinkData.studentId,
                studentUid: enrichedLinkData.studentUid
            });
            if (existingLink) {
                if (existingLink.status === "accepted") {
                    throw new Error("This student is already connected to your account.");
                }
                if (existingLink.status === "pending") {
                    if (!isInviteExpired(existingLink)) {
                        throw new Error("An invite for this student is already pending.");
                    }
                    await cleanupInviteNotifications([existingLink.id]);
                }
            }
            const activePendingOther = (existingStudentLinks || []).find(l => l.status === "pending" && l.id !== existingLink?.id && !isInviteExpired(l));
            if (activePendingOther) {
                throw new Error("This student already has an active pending parent invite.");
            }

            let linkId = "";
            if (existingLink?.id) {
                linkId = existingLink.id;
                await updateDoc(doc(db, "guardian_links", existingLink.id), enrichedLinkData);
            } else {
                const docRef = await addDoc(collection(db, "guardian_links"), enrichedLinkData);
                linkId = docRef.id;
            }
            upsertLocalGuardianLink({ id: linkId, ...enrichedLinkData });

            await sendAccountNotification({
                userId: studentRecord.uid,
                recipientUid: studentRecord.uid,
                type: "guardian_request",
                title: "Guardian Link Request",
                message: `${enrichedLinkData.guardianName || "A parent or guardian"} wants to link to your account.`,
                sourceUserId: enrichedLinkData.guardianId,
                sourceName: enrichedLinkData.guardianName,
                requestId: linkId,
                studentId: enrichedLinkData.studentId,
                expiresAt: expiresAtMs,
                priority: "high"
            }).catch((err) => console.warn("Guardian request notification skipped:", err));

            try {
                const ch = new BroadcastChannel('securo_users_channel');
                ch.postMessage({ type: 'guardian_link_created', linkId, payload: enrichedLinkData });
                ch.close();
            } catch (e) { }

            return linkId;
        } catch (error) {
            console.warn("Error creating guardian link request:", error);
            throw error;
        }
    };

    // (2026-07-13) Link & notify guardian by email; was throw on guardian check
    export const createGuardianLinkFromStudent = async (requestData) => {
        try {
            if (!requestData?.studentUid) {
                throw new Error("Student authentication is required.");
            }
            const studentProfile = await getUserProfile(requestData.studentUid).catch(() => null);
            if (studentProfile?.role && studentProfile.role !== "student") {
                throw new Error("Only students can link a parent or guardian from this screen.");
            }

            const rawEmail = String(requestData.guardianEmail || "").trim();
            const normEmail = normalizeEmail(rawEmail);
            if (!normEmail || !normEmail.includes("@")) {
                throw new Error("Please enter a valid guardian email address.");
            }

            const studentEmail = normalizeEmail(studentProfile?.email || studentProfile?.personalEmail);
            if (studentEmail && studentEmail === normEmail) {
                throw new Error("You cannot add your own account as a parent or guardian.");
            }

            const guardianRecord = await findUserByEmail(normEmail);
            if (guardianRecord?.uid && guardianRecord.uid === requestData.studentUid) {
                throw new Error("You cannot add your own account as a parent or guardian.");
            }

            if (guardianRecord && (guardianRecord.role === "admin" || guardianRecord.role === "staff")) {
                throw new Error("Staff and admin accounts cannot be linked as a guardian.");
            }
            // (2026-07-13) Enforce max 1 accepted parent per student; was unlimited
            // (2026-07-13) Block double student invites & purge expired; was open
            const currentLinks = await getLinksForStudent(requestData.studentId || studentProfile?.studentId, requestData.studentUid).catch(() => []);
            if ((currentLinks || []).some(l => l.status === "accepted")) {
                throw new Error("You can only connect to 1 parent or guardian at a time.");
            }
            const activePendingStudentInvite = (currentLinks || []).find(l => l.status === "pending" && !isInviteExpired(l));
            if (activePendingStudentInvite) {
                throw new Error("You already have an active pending parent invite.");
            }
            const expiredPending = (currentLinks || []).filter(l => l.status === "pending" && isInviteExpired(l));
            if (expiredPending.length) {
                await Promise.all(expiredPending.map(l => deleteDoc(doc(db, "guardian_links", l.id)).catch(() => { })));
                await cleanupInviteNotifications(expiredPending.map(l => l.id));
            }

            const existingLink = await findExistingGuardianStudentLink({
                guardianId: guardianRecord?.uid || "",
                guardianEmail: normEmail,
                studentId: requestData.studentId || studentProfile?.studentId,
                studentUid: requestData.studentUid
            });
            if (existingLink) {
                const existingStatus = existingLink.status;
                if (existingStatus === "accepted") {
                    throw new Error("That parent or guardian is already linked to your account.");
                }
                if (existingStatus === "pending" && !isInviteExpired(existingLink)) {
                    throw new Error("A request for that parent or guardian is already pending.");
                }
            }

            if (guardianRecord?.uid) {
                await assertGuardianCapacityForRequest({
                    guardianId: guardianRecord.uid,
                    studentId: requestData.studentId || studentProfile?.studentId,
                    currentLinkId: existingLink?.id || null
                });
            }

            // (2026-07-13) Set pending status & expiry for student invite; was no TTL
            const expiresAtMs = Date.now() + GUARDIAN_INVITE_TTL_MS;
            const linkPayload = {
                guardianId: guardianRecord?.uid || "",
                guardianUid: guardianRecord?.uid || "",
                guardianName: guardianRecord?.name || requestData.guardianName || normEmail,
                guardianEmail: normEmail,
                studentId: requestData.studentId || studentProfile?.studentId || "",
                studentUid: requestData.studentUid || "",
                studentName: requestData.studentName || studentProfile?.name || "Student",
                status: "pending",
                requestedBy: "student",
                relationshipType: requestData.relationshipType || "parent",
                permissions: { sosAlerts: true, attendanceAlerts: true, liveLocation: true },
                expiresAt: expiresAtMs,
                createdAt: serverTimestamp(),
                lastSyncedAt: serverTimestamp()
            };

            let linkId = "";
            if (existingLink?.id) {
                await updateDoc(doc(db, "guardian_links", existingLink.id), linkPayload);
                linkId = existingLink.id;
            } else {
                const docRef = await addDoc(collection(db, "guardian_links"), linkPayload);
                linkId = docRef.id;
            }
            upsertLocalGuardianLink({ id: linkId, ...linkPayload });

            // (2026-07-13) Dispatch notif with expiry; was non-expiring notif
            const targetGuardianUid = guardianRecord?.uid || normEmail;
            await sendAccountNotification({
                userId: targetGuardianUid,
                recipientUid: targetGuardianUid,
                recipientEmail: normEmail,
                type: "student_guardian_request",
                title: "Student linked your guardian account",
                message: `${requestData.studentName || studentProfile?.name || "A student"} connected you as their parent or guardian.`,
                expiresAt: expiresAtMs,
                sourceUserId: requestData.studentUid || "",
                sourceName: requestData.studentName || studentProfile?.name || "Student",
                requestId: linkId,
                studentId: requestData.studentId || studentProfile?.studentId || "",
                priority: "normal"
            }).catch((error) => {
                console.warn("Student guardian link notification skipped:", error);
            });

            try {
                const ch = new BroadcastChannel('securo_users_channel');
                ch.postMessage({ type: 'guardian_link_created', linkId, payload: linkPayload });
                ch.close();
            } catch (e) { }

            return { linkId, guardian: guardianRecord };
        } catch (error) {
            console.warn("Error creating guardian link from student:", error);
            throw error;
        }
    };

    /**
     * Get all guardian link requests for a specific student (by studentId string)
     * @param {string} studentId - The 7-digit student ID
     */
    export const getGuardianRequestsForStudent = async (studentId) => {
        try {
            const q = query(
                collection(db, "guardian_links"),
                where("studentId", "==", studentId),
                where("status", "==", "pending")
            );
            const snap = await getDocs(q);
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            if (!isPermissionDeniedError(error)) {
                console.warn("Guardian request lookup failed:", error?.message || error);
            }
            return [];
        }
    };

    /**
     * Subscribe to real-time guardian link requests for a student
     * @param {string} studentId
     * @param {function} callback
     */
    // (2026-07-13) Query requests by studentId and studentUid; was studentId only
    // (2026-07-13) Realtime Firestore snapshot for requests; was local only
    export const subscribeToGuardianRequests = (studentId, callback, studentUid = "") => {
        const unsubs = [];
        let snap1 = null, snapNum = null, snap2 = null;
        const mergeRequests = (s1, sNum, s2) => {
            const map = new Map();
            if (s1?.docs) s1.docs.forEach(d => { const item = { id: d.id, ...d.data() }; map.set(d.id, item); upsertLocalGuardianLink(item); });
            if (sNum?.docs) sNum.docs.forEach(d => { const item = { id: d.id, ...d.data() }; map.set(d.id, item); upsertLocalGuardianLink(item); });
            if (s2?.docs) s2.docs.forEach(d => { const item = { id: d.id, ...d.data() }; map.set(d.id, item); upsertLocalGuardianLink(item); });
            // (2026-07-13) Guard against restoring cached requests if empty; was fallback
            const allResolved = (studentUid ? snap2 !== null : true) && (studentId ? (snap1 !== null || snapNum !== null) : true);
            if (!allResolved && map.size === 0) {
                const cached = readLocalGuardianLinks().filter(l => l.status === "pending" && ((studentId && String(l.studentId).trim() === String(studentId).trim()) || (studentUid && l.studentUid === studentUid)));
                cached.forEach(c => map.set(c.id, c));
            }
            // (2026-07-13) Expire & purge stale pending requests; was never expiring
            const activePending = [];
            Array.from(map.values()).forEach((r) => {
                if (r.status !== "pending") return;
                if (isInviteExpired(r)) {
                    removeLocalGuardianLink(r.id);
                    deleteDoc(doc(db, "guardian_links", r.id)).catch(() => { });
                    cleanupInviteNotifications([r.id]).catch(() => { });
                    return;
                }
                activePending.push(r);
            });
            return activePending;
        };

        const emit = () => callback(mergeRequests(snap1, snapNum, snap2));

        if (studentUid) {
            const q2 = query(collection(db, "guardian_links"), where("studentUid", "==", studentUid));
            unsubs.push(onSnapshot(q2, (snap) => { snap2 = snap; emit(); }, (err) => console.warn("Requests studentUid error:", err)));
        }
        if (studentId) {
            const strId = String(studentId).trim();
            const numId = Number(strId);
            const q1 = query(collection(db, "guardian_links"), where("studentId", "==", strId));
            unsubs.push(onSnapshot(q1, (snap) => { snap1 = snap; emit(); }, (err) => console.warn("Requests studentId error:", err)));
            if (!isNaN(numId) && String(numId) === strId) {
                const qNum = query(collection(db, "guardian_links"), where("studentId", "==", numId));
                unsubs.push(onSnapshot(qNum, (snap) => { snapNum = snap; emit(); }, (err) => console.warn("Requests studentId num error:", err)));
            }
        }

        return () => unsubs.forEach(u => u());
    };

    // (2026-07-13) Resilient link response with query fallback; was throw on reload
    export const respondToGuardianLink = async (linkId, response, studentUid, studentProfileData = {}) => {
        try {
            let linkRef = null;
            let linkData = null;
            const validId = linkId && typeof linkId === 'string' && !linkId.startsWith('pending_') && !linkId.startsWith('local_') && !linkId.startsWith('guardian-request-');

            if (validId) {
                try {
                    const snap = await getDoc(doc(db, "guardian_links", linkId));
                    if (snap.exists()) {
                        linkRef = snap.ref;
                        linkData = snap.data();
                    }
                } catch (_) { }
            }

            const localLinks = readLocalGuardianLinks();
            const cached = localLinks.find(l => l.id === linkId || (studentProfileData?.studentId && String(l.studentId).trim() === String(studentProfileData.studentId).trim()));

            if (!linkRef) {
                const sid = studentProfileData?.studentId || cached?.studentId;
                const suid = studentUid || cached?.studentUid;
                const gEmail = cached?.guardianEmail || (auth.currentUser?.email ? normalizeEmail(auth.currentUser.email) : "");
                const gId = cached?.guardianId || cached?.guardianUid || auth.currentUser?.uid;

                const candidates = [];
                if (sid) {
                    const snap = await getDocs(query(collection(db, "guardian_links"), where("studentId", "==", String(sid).trim()))).catch(() => null);
                    if (snap?.docs) candidates.push(...snap.docs);
                }
                if (suid && candidates.length === 0) {
                    const snap = await getDocs(query(collection(db, "guardian_links"), where("studentUid", "==", suid))).catch(() => null);
                    if (snap?.docs) candidates.push(...snap.docs);
                }
                if (gEmail && candidates.length === 0) {
                    const snap = await getDocs(query(collection(db, "guardian_links"), where("guardianEmail", "==", gEmail))).catch(() => null);
                    if (snap?.docs) candidates.push(...snap.docs);
                }
                if (gId && candidates.length === 0) {
                    const snap = await getDocs(query(collection(db, "guardian_links"), where("guardianId", "==", gId))).catch(() => null);
                    if (snap?.docs) candidates.push(...snap.docs);
                }

                const match = candidates.find(d => {
                    const dat = d.data();
                    return dat.status === "pending" || dat.status === "accepted";
                }) || candidates[0];

                if (match) {
                    linkRef = match.ref;
                    linkData = match.data();
                }
            }

            if (!linkRef && response !== "accepted") {
                removeLocalGuardianLink(linkId);
                try {
                    const ch = new BroadcastChannel('securo_users_channel');
                    ch.postMessage({ type: 'guardian_link_responded', linkId, response });
                    ch.close();
                } catch (_) { }
                return true;
            }

            if (!linkRef && response === "accepted") {
                const guardianUid = cached?.guardianUid || cached?.guardianId || auth.currentUser?.uid || "";
                const guardianEmail = cached?.guardianEmail || auth.currentUser?.email || "";
                const guardianName = cached?.guardianName || auth.currentUser?.displayName || "Guardian";
                const sId = studentProfileData?.studentId || cached?.studentId || "";
                const sUid = studentUid || cached?.studentUid || auth.currentUser?.uid || "";
                const sName = studentProfileData?.name || cached?.studentName || "Student";

                const newDoc = await addDoc(collection(db, "guardian_links"), {
                    status: "accepted",
                    studentUid: sUid,
                    studentId: sId,
                    studentName: sName,
                    guardianId: guardianUid,
                    guardianUid: guardianUid,
                    guardianEmail: guardianEmail,
                    guardianName: guardianName,
                    approvedAt: serverTimestamp(),
                    respondedAt: serverTimestamp(),
                    createdAt: serverTimestamp(),
                    permissions: { sosAlerts: true, attendanceAlerts: true, liveLocation: true }
                });
                linkRef = newDoc;
                linkData = {
                    guardianId: guardianUid,
                    guardianUid: guardianUid,
                    guardianEmail,
                    guardianName,
                    studentUid: sUid,
                    studentId: sId,
                    studentName: sName,
                    status: "accepted"
                };
            }

            if (response === "accepted") {
                // (2026-07-13) Reject expired invite & cap to 1 parent; was accepting all
                if (linkData?.status === "pending" && isInviteExpired(linkData)) {
                    const expiredId = linkRef?.id || linkId;
                    removeLocalGuardianLink(expiredId);
                    if (linkRef) await deleteDoc(linkRef).catch(() => { });
                    await cleanupInviteNotifications([expiredId]);
                    throw new Error("This invite has expired. Please ask for a new invite.");
                }
                const sIdCheck = studentProfileData?.studentId || linkData?.studentId || "";
                const sUidCheck = studentUid || linkData?.studentUid || "";
                const currentId = linkRef?.id || linkId;
                // (2026-07-13) Check 1-parent cap via local cache unless caller demands remote; was slow getLinksForStudent
                if (!studentProfileData?.skipCapacityQuery) {
                    const localAccepted = readLocalGuardianLinks().filter(l =>
                        l.status === "accepted" &&
                        String(l.id) !== String(currentId) &&
                        ((sUidCheck && l.studentUid === sUidCheck) || (sIdCheck && String(l.studentId).trim() === String(sIdCheck).trim()))
                    );
                    if (localAccepted.length > 0) {
                        throw new Error("You can only connect to 1 parent or guardian at a time.");
                    }
                }
                try {
                    const unlinked = JSON.parse(localStorage.getItem('securo_unlinked_links') || '[]');
                    const filtered = unlinked.filter(u => u.linkId !== currentId && u.linkId !== linkId);
                    localStorage.setItem('securo_unlinked_links', JSON.stringify(filtered));
                } catch (_) { }
            }
            if (response === "accepted" && linkData?.guardianId && linkData?.studentId) {
                assertGuardianCapacityForRequest({
                    guardianId: linkData.guardianId,
                    studentId: linkData.studentId,
                    currentLinkId: linkRef?.id || linkId
                }).catch(() => { });
            }

            const resolvedStudentProfile = response === "accepted"
                ? {
                    studentId: studentProfileData?.studentId || linkData?.studentId || "",
                    studentName: studentProfileData?.name || linkData?.studentName || ""
                }
                : {};

            const guardianUid = linkData?.guardianUid || linkData?.guardianId || auth.currentUser?.uid;

            // (2026-07-13) Resilient setDoc with addDoc fallback; was failing updateDoc
            const linkUpdatePayload = {
                status: response,
                studentUid: studentUid || linkData?.studentUid || null,
                guardianUid: guardianUid || linkData?.guardianUid || null,
                guardianId: guardianUid || linkData?.guardianId || null,
                ...(response === "accepted" ? {
                    approvedAt: serverTimestamp(),
                    studentId: resolvedStudentProfile.studentId || linkData?.studentId || "",
                    studentName: resolvedStudentProfile.studentName || linkData?.studentName || ""
                } : {}),
                respondedAt: serverTimestamp()
            };

            if (linkRef) {
                try {
                    await setDoc(linkRef, linkUpdatePayload, { merge: true });
                } catch (err) {
                    console.warn("setDoc on linkRef failed, falling back to addDoc:", err);
                    const fallbackDoc = await addDoc(collection(db, "guardian_links"), linkUpdatePayload);
                    linkRef = fallbackDoc;
                }
            } else if (response === "accepted") {
                const fallbackDoc = await addDoc(collection(db, "guardian_links"), linkUpdatePayload);
                linkRef = fallbackDoc;
            }
            removeLocalGuardianLink(linkId);
            if (linkRef?.id) removeLocalGuardianLink(linkRef.id);
            try {
                const ch = new BroadcastChannel('securo_users_channel');
                ch.postMessage({ type: 'guardian_link_responded', linkId: linkRef?.id || linkId, response, studentUid, guardianUid });
                ch.close();
            } catch (e) { }

            // (2026-07-13) Run cleanup & notifications in background for instant UI; was blocking
            (async () => {
                try {
                    cleanupInviteNotifications([linkId, linkRef?.id]).catch(() => { });
                    if (response === "rejected" || response === "declined") {
                        const sid = studentProfileData?.studentId || linkData?.studentId || cached?.studentId;
                        const suid = studentUid || linkData?.studentUid || cached?.studentUid;
                        const gId = guardianUid || linkData?.guardianId || linkData?.guardianUid || auth.currentUser?.uid;
                        const gEmail = linkData?.guardianEmail || cached?.guardianEmail || auth.currentUser?.email;
                        const queries = [];
                        if (gId) {
                            queries.push(getDocs(query(collection(db, "guardian_links"), where("guardianId", "==", gId))).catch(() => null));
                            queries.push(getDocs(query(collection(db, "guardian_links"), where("guardianUid", "==", gId))).catch(() => null));
                        }
                        if (gEmail) {
                            queries.push(getDocs(query(collection(db, "guardian_links"), where("guardianEmail", "==", String(gEmail).toLowerCase().trim()))).catch(() => null));
                        }
                        const snaps = await Promise.all(queries);
                        const matchDocs = [];
                        snaps.forEach(s => { if (s?.docs) matchDocs.push(...s.docs); });
                        const seenMatchIds = new Set();
                        const rejectOps = [];
                        for (const d of matchDocs) {
                            if (seenMatchIds.has(d.id)) continue;
                            seenMatchIds.add(d.id);
                            const dat = d.data();
                            const matchStudent = (suid && (dat.studentUid === suid || dat.studentId === suid)) ||
                                (sid && String(dat.studentId || "").trim() === String(sid).trim());
                            if (matchStudent) {
                                rejectOps.push(updateDoc(d.ref, { status: "rejected", respondedAt: serverTimestamp() }).catch(() => { }));
                                removeLocalGuardianLink(d.id);
                            }
                        }
                        await Promise.all(rejectOps);
                    }

                    const targetGuardianUid = linkData?.guardianUid || linkData?.guardianId || cached?.guardianUid || cached?.guardianId || (auth.currentUser && auth.currentUser.uid ? auth.currentUser.uid : "");
                    const targetGuardianEmail = linkData?.guardianEmail || cached?.guardianEmail || (auth.currentUser?.email ? normalizeEmail(auth.currentUser.email) : "");
                    let targetStudentUid = studentUid || linkData?.studentUid || cached?.studentUid || "";
                    if (!targetStudentUid) {
                        const sid = studentProfileData?.studentId || linkData?.studentId || cached?.studentId;
                        if (sid) {
                            try {
                                const sRec = await findStudentUidByStudentId(sid);
                                if (sRec?.uid) targetStudentUid = sRec.uid;
                            } catch (_) { }
                        }
                    }
                    const studentName = studentProfileData?.name || linkData?.studentName || cached?.studentName || "Student";
                    const guardianName = linkData?.guardianName || cached?.guardianName || auth.currentUser?.displayName || "Parent/Guardian";
                    const isGuardianResponder = auth.currentUser?.uid === targetGuardianUid;
                    const studentIdVal = studentProfileData?.studentId || linkData?.studentId || cached?.studentId || "";
                    const reqId = linkRef?.id || linkId;

                    if (reqId) {
                        const curUid = auth.currentUser?.uid || targetStudentUid || targetGuardianUid || "";
                        if (curUid) {
                            Promise.all([
                                getDocs(query(collection(db, "notifications"), where("recipientUid", "==", curUid), where("requestId", "==", reqId))).catch(() => ({ docs: [] })),
                                getDocs(query(collection(db, "notifications"), where("userId", "==", curUid), where("requestId", "==", reqId))).catch(() => ({ docs: [] }))
                            ]).then(([s1, s2]) => {
                                const map = new Map();
                                s1.docs.forEach(d => map.set(d.id, d));
                                s2.docs.forEach(d => map.set(d.id, d));
                                map.forEach(d => {
                                    updateDoc(d.ref, { resolvedStatus: response, isRead: true, read: true }).catch(() => { });
                                });
                            }).catch(() => { });
                        }
                    }

                    const notifPromises = [];
                    if (targetGuardianUid || targetGuardianEmail) {
                        const gTitle = response === "accepted" ? "Child link accepted" : "Child link declined";
                        const gMsg = isGuardianResponder
                            ? (response === "accepted" ? `You accepted the link request for ${studentName}.` : `You declined the link request for ${studentName}.`)
                            : (response === "accepted" ? `${studentName} accepted your monitoring request.` : `${studentName} declined your monitoring request.`);
                        notifPromises.push(sendAccountNotification({
                            userId: targetGuardianUid || targetGuardianEmail,
                            recipientUid: targetGuardianUid || targetGuardianEmail,
                            recipientEmail: targetGuardianEmail,
                            type: response === "accepted" ? "guardian_request_accepted" : "guardian_request_declined",
                            title: gTitle,
                            message: gMsg,
                            sourceUserId: targetStudentUid || "",
                            sourceName: studentName,
                            requestId: reqId,
                            studentId: studentIdVal,
                            priority: "normal",
                            metadata: {
                                resolvedStatus: response,
                                linkOrigin: "guardian_request"
                            }
                        }).catch(() => { }));
                    }

                    if (targetStudentUid) {
                        const sTitle = response === "accepted" ? "Parent or guardian linked" : "Parent or guardian request declined";
                        const sMsg = isGuardianResponder
                            ? (response === "accepted" ? `${guardianName} accepted your invitation to connect.` : `${guardianName} declined your invitation to connect.`)
                            : (response === "accepted" ? `You connected ${guardianName} to your account.` : `You declined the link request from ${guardianName}.`);
                        notifPromises.push(sendAccountNotification({
                            userId: targetStudentUid,
                            recipientUid: targetStudentUid,
                            type: response === "accepted" ? "guardian_request_accepted" : "guardian_request_declined",
                            title: sTitle,
                            message: sMsg,
                            sourceUserId: targetGuardianUid || "",
                            sourceName: guardianName,
                            requestId: reqId,
                            studentId: studentIdVal,
                            priority: "normal",
                            metadata: {
                                resolvedStatus: response,
                                linkOrigin: "guardian_request"
                            }
                        }).catch(() => { }));
                    }
                    await Promise.all(notifPromises);
                } catch (_) { }
            })();
            return true;
        } catch (error) {
            console.warn("Error responding to guardian link:", error);
            throw error;
        }
    };

    /**
     * Get all accepted links for a guardian
     * @param {string} guardianId
     */
    // (2026-07-13) Query accepted links without compound index; was indexed query
    export const getAcceptedLinksForGuardian = async (guardianId, guardianEmail = "") => {
        try {
            const results = [];
            const seenDocs = new Set();
            if (guardianId) {
                const q1 = query(
                    collection(db, "guardian_links"),
                    where("guardianId", "==", guardianId),
                    where("status", "==", "accepted")
                );
                const snap1 = await getDocs(q1).catch(() => ({ docs: [] }));
                snap1.docs.forEach(doc => {
                    if (!seenDocs.has(doc.id)) {
                        seenDocs.add(doc.id);
                        results.push({ id: doc.id, ...doc.data() });
                    }
                });
                const qUid = query(
                    collection(db, "guardian_links"),
                    where("guardianUid", "==", guardianId),
                    where("status", "==", "accepted")
                );
                const snapUid = await getDocs(qUid).catch(() => ({ docs: [] }));
                snapUid.docs.forEach(doc => {
                    if (!seenDocs.has(doc.id)) {
                        seenDocs.add(doc.id);
                        results.push({ id: doc.id, ...doc.data() });
                    }
                });
            }
            if (guardianEmail) {
                const normEmail = (guardianEmail || "").trim().toLowerCase();
                const qEmail = query(
                    collection(db, "guardian_links"),
                    where("guardianEmail", "==", normEmail)
                );
                const snapEmail = await getDocs(qEmail).catch(() => ({ docs: [] }));
                snapEmail.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.status === "accepted" && !seenDocs.has(doc.id)) {
                        seenDocs.add(doc.id);
                        results.push({ id: doc.id, ...data });
                    }
                });
            }
            // (2026-07-13) Deduplicate links by UID, studentId & name; was single fallback
            const seenUids = new Set();
            const seenIds = new Set();
            const seenNames = new Set();
            return results.filter(r => {
                const uid = (r.studentUid || '').trim();
                const sid = (r.studentId ? String(r.studentId) : '').trim();
                const name = (r.studentName || '').trim().toLowerCase();
                if (uid && seenUids.has(uid)) return false;
                if (sid && seenIds.has(sid)) return false;
                if (name && !name.startsWith('student') && name !== 'child' && seenNames.has(name)) return false;
                if (uid) seenUids.add(uid);
                if (sid) seenIds.add(sid);
                if (name && !name.startsWith('student') && name !== 'child') seenNames.add(name);
                return true;
            });
        } catch (error) {
            console.warn("Error getting accepted guardian links:", error);
            return [];
        }
    };

    /**
     * Get all links for a guardian (all statuses)
     * @param {string} guardianId
     * @param {string} [guardianEmail]
     */
    // (2026-07-13) Query all links by guardianId & UID; was guardianId only
    export const getAllLinksForGuardian = async (guardianId, guardianEmail = "") => {
        try {
            const results = [];
            const seenDocs = new Set();
            if (guardianId) {
                const q = query(
                    collection(db, "guardian_links"),
                    where("guardianId", "==", guardianId)
                );
                const snap = await getDocs(q).catch(() => ({ docs: [] }));
                snap.docs.forEach(doc => {
                    if (!seenDocs.has(doc.id)) {
                        seenDocs.add(doc.id);
                        results.push({ id: doc.id, ...doc.data() });
                    }
                });
                const qUid = query(
                    collection(db, "guardian_links"),
                    where("guardianUid", "==", guardianId)
                );
                const snapUid = await getDocs(qUid).catch(() => ({ docs: [] }));
                snapUid.docs.forEach(doc => {
                    if (!seenDocs.has(doc.id)) {
                        seenDocs.add(doc.id);
                        results.push({ id: doc.id, ...doc.data() });
                    }
                });
            }
            if (guardianEmail) {
                const normEmail = (guardianEmail || "").trim().toLowerCase();
                const qEmail = query(
                    collection(db, "guardian_links"),
                    where("guardianEmail", "==", normEmail)
                );
                const snapEmail = await getDocs(qEmail).catch(() => ({ docs: [] }));
                snapEmail.docs.forEach(doc => {
                    if (!seenDocs.has(doc.id)) {
                        seenDocs.add(doc.id);
                        results.push({ id: doc.id, ...doc.data() });
                    }
                });
            }
            // (2026-07-13) Deduplicate links by UID, studentId & name; was single fallback
            const seenUids = new Set();
            const seenIds = new Set();
            const seenNames = new Set();
            return results.filter(r => {
                const uid = (r.studentUid || '').trim();
                const sid = (r.studentId ? String(r.studentId) : '').trim();
                const name = (r.studentName || '').trim().toLowerCase();
                if (uid && seenUids.has(uid)) return false;
                if (sid && seenIds.has(sid)) return false;
                if (name && !name.startsWith('student') && name !== 'child' && seenNames.has(name)) return false;
                if (uid) seenUids.add(uid);
                if (sid) seenIds.add(sid);
                if (name && !name.startsWith('student') && name !== 'child') seenNames.add(name);
                return true;
            });
        } catch (error) {
            console.warn("Error getting all guardian links:", error);
            return [];
        }
    };

    // (2026-07-13) Realtime Firestore snapshot for guardian links; was local only
    export const subscribeToGuardianLinks = (guardianId, callback, guardianEmail = "") => {
        const unsubs = [];
        let s1 = null, sUid = null, s2 = null;
        const mergeLinks = (...snaps) => {
            const map = new Map();
            const norm = (guardianEmail || "").trim().toLowerCase();
            let hasSnap = false;
            snaps.forEach(snap => {
                if (snap) hasSnap = true;
                if (snap?.docs) snap.docs.forEach(d => {
                    const item = { id: d.id, ...d.data() };
                    map.set(d.id, item);
                    upsertLocalGuardianLink(item);
                });
            });
            // (2026-07-13) Do not restore cached links if live snapshot empty; was fallback
            if (!hasSnap && map.size === 0) {
                const cached = readLocalGuardianLinks().filter(l => (guardianId && (l.guardianId === guardianId || l.guardianUid === guardianId)) || (norm && l.guardianEmail === norm));
                cached.forEach(c => map.set(c.id, c));
            }
            // (2026-07-13) Purge expired pending links on guardian side; was kept
            let list = Array.from(map.values()).filter(r => {
                if (r.status === 'removed') return false;
                if (r.status === 'pending' && isInviteExpired(r)) {
                    removeLocalGuardianLink(r.id);
                    deleteDoc(doc(db, "guardian_links", r.id)).catch(() => { });
                    cleanupInviteNotifications([r.id]).catch(() => { });
                    return false;
                }
                return true;
            });
            if (guardianEmail) {
                list = list.filter(r => !r.guardianEmail || r.guardianEmail.trim().toLowerCase() === norm || (guardianId && (r.guardianId === guardianId || r.guardianUid === guardianId)));
            }
            // (2026-07-13) Deduplicate live links by student; was duplicate entries
            const seenUids = new Set();
            const seenIds = new Set();
            const seenNames = new Set();
            return list.filter(r => {
                const uid = (r.studentUid || '').trim();
                const sid = (r.studentId ? String(r.studentId) : '').trim();
                const name = (r.studentName || '').trim().toLowerCase();
                if (uid && seenUids.has(uid)) return false;
                if (sid && seenIds.has(sid)) return false;
                if (name && !name.startsWith('student') && name !== 'child' && seenNames.has(name)) return false;
                if (uid) seenUids.add(uid);
                if (sid) seenIds.add(sid);
                if (name && !name.startsWith('student') && name !== 'child') seenNames.add(name);
                return true;
            });
        };

        const emit = () => callback(mergeLinks(s1, sUid, s2));

        if (guardianId) {
            const q1 = query(collection(db, "guardian_links"), where("guardianId", "==", guardianId));
            unsubs.push(onSnapshot(q1, (snap) => { s1 = snap; emit(); }, (err) => console.warn("GuardianId snap error:", err)));
            const qUid = query(collection(db, "guardian_links"), where("guardianUid", "==", guardianId));
            unsubs.push(onSnapshot(qUid, (snap) => { sUid = snap; emit(); }, (err) => console.warn("GuardianUid snap error:", err)));
        }
        if (guardianEmail) {
            const norm = (guardianEmail || "").trim().toLowerCase();
            const q2 = query(collection(db, "guardian_links"), where("guardianEmail", "==", norm));
            unsubs.push(onSnapshot(q2, (snap) => { s2 = snap; emit(); }, (err) => console.warn("GuardianEmail snap error:", err)));
        }

        return () => unsubs.forEach(u => u());
    };

    /**
     * Get all guardian links for a student (by studentId string or studentUid)
     * Returns pending + accepted links so the student can see who is linked or requesting
     * @param {string} studentId - 7-digit student ID
     * @param {string} studentUid - Firebase UID of the student
     */
    export const getLinksForStudent = async (studentId, studentUid) => {
        try {
            const results = [];
            // Query by studentId (covers pending requests before UID is set)
            if (studentId) {
                const q1 = query(collection(db, "guardian_links"), where("studentId", "==", studentId));
                const snap1 = await getDocs(q1);
                snap1.docs.forEach(d => results.push({ id: d.id, ...d.data() }));
            }
            // Query by studentUid (covers accepted links)
            if (studentUid) {
                const q2 = query(collection(db, "guardian_links"), where("studentUid", "==", studentUid));
                const snap2 = await getDocs(q2);
                snap2.docs.forEach(d => {
                    if (!results.find(r => r.id === d.id)) results.push({ id: d.id, ...d.data() });
                });
            }
            return results.filter(r => r.status === 'pending' || r.status === 'accepted');
        } catch (error) {
            console.warn("Error getting links for student:", error);
            return [];
        }
    };

    /**
     * Subscribe to accepted guardian links for a student so reminder/status updates can appear live.
     * @param {string} studentUid
     * @param {function} callback
     */
    // (2026-07-13) Multi-query student links realtime snap; was failing OR query
    export const subscribeToStudentLinks = (studentUid, callback, studentId = null) => {
        if (!studentUid && !studentId) {
            callback([]);
            return () => { };
        }

        let guardianUnsubs = new Map();
        let latestLinks = [];
        let guardianProfiles = new Map();
        let snapUidDocs = new Map();
        let snapIdDocs = new Map();

        const notify = () => {
            const localUsers = readLocalUsers();
            const enriched = latestLinks.map((link) => {
                const gid = link.guardianId || link.guardianUid;
                const email = (link.guardianEmail || "").toLowerCase().trim();
                const localProfile = localUsers.find(u =>
                    (gid && String(u.id || u.uid || '') === String(gid)) ||
                    (email && (String(u.email || '').toLowerCase().trim() === email || String(u.personalEmail || '').toLowerCase().trim() === email))
                );
                const snapshotProfile = (email ? guardianProfiles.get(email) : null) || (gid ? guardianProfiles.get(gid) : null);
                const profile = snapshotProfile || localProfile;
                let isWatchingLive = false;
                if (profile && profile.isWatching) {
                    let lastActive = 0;
                    if (profile.lastActiveAt) {
                        if (typeof profile.lastActiveAt.toMillis === 'function') {
                            lastActive = profile.lastActiveAt.toMillis();
                        } else if (profile.lastActiveAt.seconds) {
                            lastActive = profile.lastActiveAt.seconds * 1000;
                        } else if (typeof profile.lastActiveAt === 'number') {
                            lastActive = profile.lastActiveAt;
                        } else if (typeof profile.lastActiveAt === 'string') {
                            lastActive = new Date(profile.lastActiveAt).getTime();
                        }
                    }
                    if (Date.now() - lastActive < 120000) {
                        isWatchingLive = true;
                    }
                }
                return {
                    ...link,
                    guardianName: profile?.name || link.guardianName || "Parent",
                    guardianRole: profile?.role || "guardian",
                    isWatchingLive
                };
            });
            callback(enriched);
        };

        let userSyncChannel = null;
        try {
            userSyncChannel = new BroadcastChannel('securo_users_channel');
            userSyncChannel.onmessage = (event) => {
                if (event.data?.type === 'guardian_link_removed') {
                    const { linkId, meta } = event.data || {};
                    latestLinks = latestLinks.filter((l) => {
                        if (linkId && l.id === linkId) return false;
                        const gMatch = (meta?.guardianId && (l.guardianId === meta.guardianId || l.guardianUid === meta.guardianId)) ||
                            (meta?.guardianEmail && (l.guardianEmail || '').toLowerCase().trim() === (meta.guardianEmail || '').toLowerCase().trim());
                        const sMatch = (meta?.studentUid && l.studentUid === meta.studentUid) ||
                            (meta?.studentId && String(l.studentId).trim() === String(meta.studentId).trim());
                        return !(gMatch && sMatch);
                    });
                }
                notify();
            };
        } catch (e) { }

        const handleStorage = (e) => {
            if (!e.key || e.key === LOCAL_USERS_KEY || e.key === 'securo_unlinked_links') notify();
        };
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', handleStorage);
        }

        const processMergedDocs = () => {
            const unlinked = (() => {
                try { return JSON.parse(localStorage.getItem('securo_unlinked_links') || '[]'); } catch (e) { return []; }
            })();

            const mergedMap = new Map();
            snapUidDocs.forEach((val, k) => mergedMap.set(k, val));
            snapIdDocs.forEach((val, k) => mergedMap.set(k, val));

            latestLinks = Array.from(mergedMap.values()).filter((link) => {
                if (link.status !== "accepted" && link.status !== "pending") return false;
                // (2026-07-13) Match unlinked links strictly by exact link ID; was pair match
                const isUnlinked = unlinked.some((u) => u.linkId && u.linkId === link.id);
                if (isUnlinked) {
                    deleteDoc(doc(db, "guardian_links", link.id)).catch(() => { });
                    return false;
                }
                return true;
            });

            const activeGuardianIds = new Set();
            const activeGuardianEmails = new Set();
            latestLinks.forEach((link) => {
                let gid = link.guardianId || link.guardianUid;
                const email = (link.guardianEmail || '').toLowerCase().trim();
                if (!gid && email) {
                    const localUsers = readLocalUsers();
                    const matched = localUsers.find(u => String(u.email || '').toLowerCase().trim() === email);
                    if (matched?.id) gid = matched.id;
                }
                if (gid) activeGuardianIds.add(gid);
                if (email) activeGuardianEmails.add(email);
            });

            for (const [gid, unsub] of guardianUnsubs.entries()) {
                if (gid.startsWith("email:")) {
                    const em = gid.slice(6);
                    if (!activeGuardianEmails.has(em)) {
                        unsub();
                        guardianUnsubs.delete(gid);
                        guardianProfiles.delete(em);
                    }
                } else if (!activeGuardianIds.has(gid)) {
                    unsub();
                    guardianUnsubs.delete(gid);
                    guardianProfiles.delete(gid);
                }
            }

            activeGuardianIds.forEach((gid) => {
                if (!guardianUnsubs.has(gid)) {
                    const unsub = onSnapshot(doc(db, "users", gid), (userSnap) => {
                        if (userSnap.exists()) {
                            const data = userSnap.data();
                            guardianProfiles.set(gid, data);
                            if (data.email) guardianProfiles.set(data.email.toLowerCase(), data);
                            if (data.name) {
                                latestLinks.forEach((l) => {
                                    if ((l.guardianId === gid || l.guardianUid === gid) && l.guardianName !== data.name) {
                                        l.guardianName = data.name;
                                        updateDoc(doc(db, "guardian_links", l.id), {
                                            guardianName: data.name,
                                            lastSyncedAt: serverTimestamp()
                                        }).catch(() => { });
                                    }
                                });
                            }
                        }
                        notify();
                    }, () => { });
                    guardianUnsubs.set(gid, unsub);
                }
            });

            activeGuardianEmails.forEach((email) => {
                const emailKey = "email:" + email;
                if (!guardianUnsubs.has(emailKey)) {
                    try {
                        const eq = query(collection(db, "users"), where("email", "==", email));
                        const unsub = onSnapshot(eq, (snap) => {
                            if (!snap.empty) {
                                const uDoc = snap.docs[0];
                                const data = uDoc.data();
                                guardianProfiles.set(email, data);
                                if (uDoc.id) guardianProfiles.set(uDoc.id, data);
                                if (data.name) {
                                    latestLinks.forEach((l) => {
                                        if ((l.guardianEmail || '').toLowerCase().trim() === email && l.guardianName !== data.name) {
                                            l.guardianName = data.name;
                                            updateDoc(doc(db, "guardian_links", l.id), {
                                                guardianName: data.name,
                                                lastSyncedAt: serverTimestamp()
                                            }).catch(() => { });
                                        }
                                    });
                                }
                            }
                            notify();
                        }, () => { });
                        guardianUnsubs.set(emailKey, unsub);
                    } catch (e) { }
                }
            });

            notify();
        };

        const unsubs = [];
        if (studentUid) {
            const qUid = query(collection(db, "guardian_links"), where("studentUid", "==", studentUid));
            unsubs.push(onSnapshot(qUid, (snap) => {
                snapUidDocs = new Map();
                snap.docs.forEach(d => snapUidDocs.set(d.id, { id: d.id, ...d.data() }));
                processMergedDocs();
            }, (err) => console.warn("Student links UID snap error:", err)));
        }
        if (studentId && studentId !== studentUid) {
            const qId = query(collection(db, "guardian_links"), where("studentId", "==", String(studentId).trim()));
            unsubs.push(onSnapshot(qId, (snap) => {
                snapIdDocs = new Map();
                snap.docs.forEach(d => snapIdDocs.set(d.id, { id: d.id, ...d.data() }));
                processMergedDocs();
            }, (err) => console.warn("Student links ID snap error:", err)));
        }

        return () => {
            unsubs.forEach((u) => u());
            guardianUnsubs.forEach((unsub) => unsub());
            guardianUnsubs.clear();
            if (userSyncChannel) userSyncChannel.close();
            if (typeof window !== 'undefined') {
                window.removeEventListener('storage', handleStorage);
            }
        };
    };

    // (2026-07-13) Purge cached & matching link docs on cancellation; was id only
    export const removeGuardianLink = async (linkId, meta = {}) => {
        let success = false;
        const toDeleteIds = new Set();
        if (linkId) toDeleteIds.add(linkId);

        // (2026-07-13) Only sweep duplicate links when student is specified; was wildcard
        const currentUid = auth.currentUser?.uid;
        const currentEmail = (auth.currentUser?.email || meta.guardianEmail || '').trim().toLowerCase();
        const targetStudentUid = meta.studentUid || null;
        const targetStudentId = meta.studentId ? String(meta.studentId).trim() : null;
        const targetGuardianId = meta.guardianId || currentUid || null;
        const targetGuardianEmail = meta.guardianEmail ? String(meta.guardianEmail).trim().toLowerCase() : (currentEmail || null);

        if ((targetStudentUid || targetStudentId) && (targetGuardianId || targetGuardianEmail)) {
            const permittedQueries = [];
            if (targetStudentId) {
                permittedQueries.push(query(collection(db, "guardian_links"), where("studentId", "==", targetStudentId)));
            }
            if (targetStudentUid) {
                permittedQueries.push(query(collection(db, "guardian_links"), where("studentUid", "==", targetStudentUid)));
            }

            for (const qItem of permittedQueries) {
                try {
                    const snap = await getDocs(qItem);
                    snap.docs.forEach((d) => {
                        const data = d.data();
                        const matchStudent = Boolean(
                            (targetStudentUid && (data.studentUid === targetStudentUid || data.studentId === targetStudentUid)) ||
                            (targetStudentId && String(data.studentId || "").trim() === targetStudentId)
                        );
                        const matchGuardian = Boolean(
                            (targetGuardianId && (data.guardianId === targetGuardianId || data.guardianUid === targetGuardianId)) ||
                            (targetGuardianEmail && String(data.guardianEmail || "").trim().toLowerCase() === targetGuardianEmail)
                        );
                        if (matchStudent && matchGuardian) {
                            toDeleteIds.add(d.id);
                        }
                    });
                } catch (e) { }
            }
        }

        toDeleteIds.forEach(id => removeLocalGuardianLink(id));
        try {
            const remaining = readLocalGuardianLinks().filter(l => {
                if (toDeleteIds.has(l.id)) return false;
                if (meta.studentId && String(l.studentId).trim() === String(meta.studentId).trim()) return false;
                if (meta.studentUid && l.studentUid === meta.studentUid) return false;
                return true;
            });
            writeLocalGuardianLinks(remaining);
        } catch (_) { }

        if (toDeleteIds.size > 0) {
            const deleteOps = Array.from(toDeleteIds).map(async (id) => {
                try {
                    await deleteDoc(doc(db, "guardian_links", id));
                } catch (err) {
                    await updateDoc(doc(db, "guardian_links", id), { status: "removed" }).catch(() => { });
                }
            });
            await Promise.all(deleteOps);
            // (2026-07-13) Remove invite notifications when link cancelled; was orphan
            await cleanupInviteNotifications(Array.from(toDeleteIds)).catch(() => { });
            success = true;
        }

        try {
            const unlinkedKey = 'securo_unlinked_links';
            const existing = JSON.parse(localStorage.getItem(unlinkedKey) || '[]');
            existing.push({
                linkId,
                guardianId: meta.guardianId || currentUid,
                guardianEmail: meta.guardianEmail,
                studentUid: meta.studentUid,
                studentId: meta.studentId,
                time: Date.now()
            });
            localStorage.setItem(unlinkedKey, JSON.stringify(existing.slice(-20)));
        } catch (e) { }

        try {
            const ch = new BroadcastChannel('securo_users_channel');
            // (2026-07-13) Broadcast all deleted link IDs on cancel; was single linkId
            ch.postMessage({ type: 'guardian_link_removed', linkId, deletedIds: Array.from(toDeleteIds), meta });
            ch.close();
        } catch (e) { }

        return success;
    };

    /**
     * Update the student ID in an existing guardian link (sends new request)
     * @param {string} linkId
     * @param {string} newStudentId
     */
    // (2026-07-13) Resolve student & notify on ID update; was wiping studentUid
    export const updateGuardianLinkStudentId = async (linkId, newStudentId) => {
        try {
            const studentRecord = await findStudentUidByStudentId(newStudentId).catch(() => null);
            const linkRef = doc(db, "guardian_links", linkId);
            const linkSnap = await getDoc(linkRef);
            const existingData = linkSnap.exists() ? linkSnap.data() : {};
            const updatePayload = {
                studentId: newStudentId,
                status: "pending",
                studentUid: studentRecord?.uid || null,
                studentName: studentRecord?.name || existingData.studentName || "Student",
                respondedAt: null,
                createdAt: serverTimestamp()
            };
            await updateDoc(linkRef, updatePayload);

            if (studentRecord?.uid) {
                await sendAccountNotification({
                    userId: studentRecord.uid,
                    recipientUid: studentRecord.uid,
                    type: "guardian_request",
                    title: "Guardian Link Request",
                    message: `${existingData.guardianName || "A parent or guardian"} wants to link to your account.`,
                    sourceUserId: existingData.guardianId || "",
                    sourceName: existingData.guardianName || "Guardian",
                    requestId: linkId,
                    studentId: newStudentId,
                    priority: "high"
                }).catch(() => { });
            }

            try {
                const ch = new BroadcastChannel('securo_users_channel');
                ch.postMessage({ type: 'guardian_link_created', linkId, payload: { ...existingData, ...updatePayload } });
                ch.close();
            } catch (_) { }

            return true;
        } catch (error) {
            console.warn("Error updating guardian link student ID:", error);
            throw error;
        }
    };

    /**
     * Guardian-triggered location reminder stored on the accepted guardian link.
     * @param {string} linkId
     * @param {object} payload
     */
    export const sendGuardianLocationReminder = async (linkId, payload = {}) => {
        if (!linkId) {
            throw new Error("Guardian link is required.");
        }

        const linkRef = doc(db, "guardian_links", linkId);
        await updateDoc(linkRef, {
            locationReminderRequestedAt: serverTimestamp(),
            locationReminderRequestedBy: payload.guardianId || "",
            locationReminderRequestedByName: payload.guardianName || "",
            locationReminderMessage: payload.message || "",
            locationReminderStudentId: payload.studentId || "",
            updatedAt: serverTimestamp()
        });
        return true;
    };

    /**
     * Subscribe to attendance changes for a specific student (for guardian alerts)
     * @param {string} studentUid
     * @param {function} callback
     */
    export const subscribeToStudentAttendance = (studentUid, callback) => {
        const q = query(
            collection(db, "attendance"),
            where("userId", "==", studentUid)
        );

        return onSnapshot(q, (snapshot) => {
            const logs = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(item => item.type === "in" || item.type === "out")
                .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
            callback(logs);
        }, () => callback([]));
    };

    /**
     * Update student live location (called when student is timed in)
     * @param {string} studentUid
     * @param {object} location { lat, lng }
     */
    // (2026-07-13) Pause location sharing when outside campus; was broadcasting
    export const updateStudentLiveLocation = async (studentUid, location) => {
        try {
            const isInside = location.isInside !== false;
            if (!isInside) {
                await setDoc(doc(db, "student_locations", studentUid), {
                    studentUid,
                    isInside: false,
                    sharingEnabled: false,
                    sharingState: "outside_campus",
                    sharingMessage: "Student is outside campus bounds. Tracking paused.",
                    updatedAt: serverTimestamp()
                }, { merge: true });
                return;
            }
            await setDoc(doc(db, "student_locations", studentUid), {
                studentUid,
                lat: location.lat,
                lng: location.lng,
                isInside: true,
                sharingEnabled: true,
                sharingState: "live",
                sharingMessage: "",
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.warn("Error updating student live location:", error);
        }
    };

    /**
     * Update student location-sharing availability without overwriting the last coordinates
     * @param {string} studentUid
     * @param {object} status
     */
    export const setStudentLocationSharingStatus = async (studentUid, status = {}) => {
        try {
            await setDoc(doc(db, "student_locations", studentUid), {
                studentUid,
                sharingEnabled: !!status.sharingEnabled,
                sharingState: status.sharingState || (status.sharingEnabled ? "live" : "off"),
                sharingMessage: status.sharingMessage || "",
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.warn("Error updating student location sharing status:", error);
        }
    };

    /**
     * Subscribe to a student's live location
     * @param {string} studentUid
     * @param {function} callback
     */
    export const subscribeToStudentLocation = (studentUid, callback) => {
        const docRef = doc(db, "student_locations", studentUid);
        return onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                callback(snap.data());
            } else {
                callback(null);
            }
        }, () => callback(null));
    };

    // (2026-07-13) Multi-strategy student lookup by ID; was single string query
    export const findStudentUidByStudentId = async (studentId) => {
        const rawId = String(studentId || "").trim();
        if (!rawId) return null;
        const numId = Number(rawId);

        try {
            const q1 = query(collection(db, "users"), where("studentId", "==", rawId));
            const snap1 = await getDocs(q1);
            if (!snap1.empty) {
                const u = snap1.docs[0];
                return { uid: u.id, ...u.data() };
            }
        } catch (e) { }

        if (!isNaN(numId)) {
            try {
                const q2 = query(collection(db, "users"), where("studentId", "==", numId));
                const snap2 = await getDocs(q2);
                if (!snap2.empty) {
                    const u = snap2.docs[0];
                    return { uid: u.id, ...u.data() };
                }
            } catch (e) { }
        }

        // (2026-07-13) Fallback lookup student UID from existing links; was users only
        try {
            const qLink = query(collection(db, "guardian_links"), where("studentId", "==", rawId));
            const snapLink = await getDocs(qLink);
            const match = snapLink.docs.map(d => d.data()).find(d => d.studentUid);
            if (match) {
                return { uid: match.studentUid, name: match.studentName || "Student", studentId: rawId };
            }
        } catch (_) { }

        try {
            const allUsers = await getAllUsers();
            const found = allUsers.find(u => String(u.studentId || '').trim() === rawId || String(u.id || '').trim() === rawId);
            if (found) {
                return { uid: found.uid || found.id, ...found };
            }
        } catch (e) { }

        try {
            const local = readLocalUsers();
            const found = local.find(u => String(u.studentId || '').trim() === rawId || String(u.id || '').trim() === rawId);
            if (found) {
                return { uid: found.uid || found.id, ...found };
            }
        } catch (e) { }

        return null;
    };

    // (2026-07-13) Robust findUserByEmail with personalEmail and case-insensitive matching; was strict
    export const findUserByEmail = async (email) => {
        try {
            const rawEmail = String(email || "").trim();
            const normalized = normalizeEmail(rawEmail);
            if (!normalized) return null;

            try {
                const q1 = query(collection(db, "users"), where("email", "==", normalized));
                const snap1 = await getDocs(q1);
                if (!snap1.empty) {
                    const u = snap1.docs[0];
                    return { uid: u.id, ...u.data() };
                }
            } catch (e) { }

            if (rawEmail !== normalized) {
                try {
                    const q2 = query(collection(db, "users"), where("email", "==", rawEmail));
                    const snap2 = await getDocs(q2);
                    if (!snap2.empty) {
                        const u = snap2.docs[0];
                        return { uid: u.id, ...u.data() };
                    }
                } catch (e) { }
            }

            try {
                const q3 = query(collection(db, "users"), where("personalEmail", "==", normalized));
                const snap3 = await getDocs(q3);
                if (!snap3.empty) {
                    const u = snap3.docs[0];
                    return { uid: u.id, ...u.data() };
                }
            } catch (e) { }

            const allUsers = await getAllUsers();
            const matched = allUsers.find((u) => {
                const uEm = normalizeEmail(u?.email);
                const uPem = normalizeEmail(u?.personalEmail);
                return uEm === normalized || uPem === normalized;
            });

            if (matched) {
                return {
                    uid: matched.uid || matched.id || matched.userId || "",
                    ...matched,
                    email: matched.email || matched.personalEmail || normalized
                };
            }

            return null;
        } catch (error) {
            console.warn("Error finding user by email:", error);
            return null;
        }
    };

    /**
     * Send a persistent account notification
     * @param {object} payload
     */
    // (2026-07-13) Support email notifications & multi-key link subs; was UID only
    export const sendAccountNotification = async (payload) => {
        const targetUid = payload?.recipientUid || payload?.userId || payload?.recipientEmail;
        if (!targetUid) {
            throw new Error("Notification recipient is required.");
        }

        try {
            const isRead = payload.isRead === true || payload.read === true;
            const normRecipientEmail = normalizeEmail(payload.recipientEmail || payload.email || (payload.userId && payload.userId.includes("@") ? payload.userId : ""));
            const notificationData = {
                recipientUid: targetUid,
                userId: targetUid,
                recipientEmail: normRecipientEmail,
                type: payload.type || "info",
                title: payload.title || "Notification",
                message: payload.message || "",
                priority: payload.priority || (payload.type?.includes("sos") ? "urgent" : "normal"),
                status: payload.status || "active",
                relatedId: payload.relatedId || payload.requestId || payload.incidentId || "",
                sourceUserId: payload.sourceUserId || "",
                sourceName: payload.sourceName || "",
                requestId: payload.requestId || payload.relatedId || "",
                studentId: payload.studentId || "",
                metadata: payload.metadata || {},
                actionUrl: payload.actionUrl || null,
                resolvedStatus: payload.resolvedStatus || "",
                isRead: isRead,
                read: isRead,
                readAt: isRead ? serverTimestamp() : null,
                createdAt: payload.createdAt || serverTimestamp()
            };

            const docRef = await addDoc(collection(db, "notifications"), notificationData);
            Logger.info("Notifications", "Notification sent", { recipientUid: targetUid, type: payload.type });
            return docRef.id;
        } catch (error) {
            // (2026-07-13) Handle notification permission denial gracefully; was error
            if (isPermissionDeniedError(error)) {
                Logger.warn("Notifications", "Notification permissions restricted; relying on link stream", error);
                return "fallback_" + Date.now();
            }
            Logger.error("Notifications", "Failed to send notification", { payload, error });
            throw error;
        }
    };

    /**
     * Mark a notification as read
     * @param {string} notificationId
     * @param {object} extraUpdates
     */
    export const markAccountNotificationRead = async (notificationId, extraUpdates = {}) => {
        if (!notificationId) return;
        await updateDoc(doc(db, "notifications", notificationId), {
            isRead: true,
            readAt: serverTimestamp(),
            ...extraUpdates
        });
    };

    // (2026-07-13) Export deleteAccountNotification for cancelled invite cleanup; was missing
    export const deleteAccountNotification = async (notificationId) => {
        if (!notificationId || String(notificationId).startsWith("guardian-request-")) return;
        try {
            await deleteDoc(doc(db, "notifications", notificationId));
        } catch (_) {
            await updateDoc(doc(db, "notifications", notificationId), {
                resolvedStatus: "cancelled",
                isRead: true,
                read: true
            }).catch(() => { });
        }
    };

    // (2026-07-13) Subscribe notifs by userId, recipientUid & email; was 2 queries
    export const subscribeToAccountNotifications = (userId, callback, userEmail = "") => {
        if (!userId && !userEmail) return () => { };

        try {
            const mergeNotifications = (...snaps) => {
                const map = new Map();
                snaps.forEach(snap => {
                    if (snap?.docs) {
                        snap.docs.forEach((d) => map.set(d.id, { id: d.id, ...d.data() }));
                    }
                });
                // (2026-07-13) Purge expired & duplicate invite notifs; was keeping stale
                const sorted = Array.from(map.values()).sort((a, b) => {
                    const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
                    const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
                    return timeB - timeA;
                });
                const seenInviteReqIds = new Set();
                const list = sorted.filter((item) => {
                    const isInviteNotif = item.type === "guardian_request" || item.type === "student_guardian_request";
                    if (!isInviteNotif) return true;
                    if (!item.resolvedStatus && isInviteExpired(item)) {
                        deleteDoc(doc(db, "notifications", item.id)).catch(() => { });
                        return false;
                    }
                    if (item.requestId) {
                        if (seenInviteReqIds.has(item.requestId)) {
                            deleteDoc(doc(db, "notifications", item.id)).catch(() => { });
                            return false;
                        }
                        seenInviteReqIds.add(item.requestId);
                    }
                    return true;
                });
                return list.slice(0, 50);
            };

            let s1 = null, s2 = null, s3 = null;
            const emit = () => callback(mergeNotifications(s1, s2, s3));

            const unsubs = [];
            if (userId) {
                const q1 = query(collection(db, "notifications"), where("userId", "==", userId), limit(50));
                const q2 = query(collection(db, "notifications"), where("recipientUid", "==", userId), limit(50));
                unsubs.push(onSnapshot(q1, (snap) => { s1 = snap; emit(); }, () => { s1 = { docs: [] }; emit(); }));
                unsubs.push(onSnapshot(q2, (snap) => { s2 = snap; emit(); }, () => { s2 = { docs: [] }; emit(); }));
            }
            const normEmail = normalizeEmail(userEmail);
            if (normEmail) {
                const q3 = query(collection(db, "notifications"), where("recipientEmail", "==", normEmail), limit(50));
                unsubs.push(onSnapshot(q3, (snap) => { s3 = snap; emit(); }, () => { s3 = { docs: [] }; emit(); }));
            }

            return () => unsubs.forEach(u => u());
        } catch (e) {
            console.warn("Notification subscription fallback:", e);
            callback([]);
            return () => { };
        }
    };

    // (2026-07-13) Notify guardians of geofence event; was client toast only
    export const notifyGuardiansOfGeofenceEvent = async (studentUid, studentName, type, location = {}) => {
        if (!studentUid) return [];
        try {
            const links = await getLinksForStudent(null, studentUid);
            const acceptedLinks = (Array.isArray(links) ? links : []).filter(l => l.status === 'accepted' && l.guardianId);
            const isEntry = type === 'in';
            const actionText = isEntry ? 'entered campus bounds (Time In)' : 'left campus bounds (Time Out)';
            const title = `Campus Geofence: ${studentName || 'Your Child'} ${isEntry ? 'Entered' : 'Departed'}`;
            const message = `${studentName || 'Your child'} has ${actionText} at ${location.address || 'Campus Grounds'}.`;

            const dispatches = acceptedLinks.map(link =>
                sendAccountNotification({
                    userId: link.guardianId,
                    type: isEntry ? 'campus_entry' : 'campus_exit',
                    title,
                    message,
                    sourceUserId: studentUid,
                    sourceName: studentName || 'Student',
                    studentId: link.studentId || '',
                    metadata: {
                        type,
                        lat: location.lat || null,
                        lng: location.lng || null,
                        address: location.address || '',
                        timestamp: new Date().toISOString()
                    }
                }).catch(err => {
                    console.warn("Failed to notify guardian:", link.guardianId, err);
                    return null;
                })
            );

            // (2026-07-13) Notify student of geofence time in/out; was guardian only
            dispatches.push(
                sendAccountNotification({
                    userId: studentUid,
                    type: isEntry ? 'campus_entry' : 'campus_exit',
                    title: isEntry ? "Campus Entry" : "Campus Exit",
                    message: isEntry
                        ? "You've entered the campus, successfully timed in."
                        : "You've exited the campus, successfully timed out.",
                    sourceUserId: studentUid,
                    sourceName: "Campus Safety",
                    studentId: "",
                    metadata: {
                        type,
                        lat: location.lat || null,
                        lng: location.lng || null,
                        address: location.address || '',
                        timestamp: new Date().toISOString()
                    }
                }).catch(err => {
                    console.warn("Failed to notify student of geofence event:", err);
                    return null;
                })
            );

            return await Promise.all(dispatches);
        } catch (error) {
            console.warn("Error notifying guardians of geofence event:", error);
            return [];
        }
    };
    // (2026-07-13) Dispatch persistent SOS alerts to all guardians; was guardianId only
    export const notifyGuardiansSOS = async (studentUid, studentName, location = {}, metadata = {}) => {
        if (!studentUid) return [];
        try {
            const links = await getLinksForStudent(null, studentUid);
            const acceptedLinks = (Array.isArray(links) ? links : []).filter(l => l.status === 'accepted' && (l.guardianId || l.guardianUid));
            const title = "SECuro Emergency Alert";
            const message = `${studentName || 'Your linked student'} has triggered an SOS emergency. Open Securo to view the emergency information.`;

            const dispatches = acceptedLinks.map(link => {
                const gUid = link.guardianUid || link.guardianId;
                return sendAccountNotification({
                    recipientUid: gUid,
                    userId: gUid,
                    type: 'sos',
                    title,
                    message,
                    priority: 'urgent',
                    sourceUserId: studentUid,
                    sourceName: studentName || 'Student',
                    studentId: link.studentId || '',
                    metadata: {
                        type: 'sos',
                        lat: location.lat || null,
                        lng: location.lng || null,
                        address: location.address || '',
                        timestamp: new Date().toISOString()
                    }
                }).catch(err => {
                    console.warn("Failed to notify guardian of SOS:", gUid, err);
                    return null;
                });
            });

            dispatches.push(
                sendAccountNotification({
                    recipientUid: 'admin',
                    userId: 'admin',
                    type: 'sos',
                    title: `🚨 Emergency SOS: ${studentName || 'Student'}`,
                    message: `Active emergency alert triggered by ${studentName || 'Student'} at ${location.address || 'Campus bounds'}.`,
                    priority: 'urgent',
                    sourceUserId: studentUid,
                    sourceName: studentName || 'Student',
                    studentId: metadata.studentId || '',
                    metadata: {
                        type: 'sos',
                        lat: location.lat || null,
                        lng: location.lng || null,
                        address: location.address || '',
                        timestamp: new Date().toISOString()
                    }
                }).catch(err => {
                    console.warn("Failed to notify admin of SOS:", err);
                    return null;
                })
            );

            return await Promise.all(dispatches);
        } catch (error) {
            console.warn("Error notifying guardians of SOS:", error);
            return [];
        }
    };

    // (2026-07-13) Query all student SOS logs; was active only
    export const subscribeToStudentSOS = (studentUid, callback) => {
        if (!studentUid) return () => { };
        try {
            const q = query(collection(db, "sos_logs"), where("userId", "==", studentUid));
            return onSnapshot(q, (snap) => {
                const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                logs.sort((a, b) => {
                    const ta = a.timestamp?.seconds || (a.timestamp?.toDate ? a.timestamp.toDate().getTime() / 1000 : 0);
                    const tb = b.timestamp?.seconds || (b.timestamp?.toDate ? b.timestamp.toDate().getTime() / 1000 : 0);
                    return tb - ta;
                });
                callback(logs);
            }, (err) => {
                console.warn("SOS listener error:", err);
                callback([]);
            });
        } catch (e) {
            return () => { };
        }
    };

    // (2026-07-13) Add GAD messaging and SOS stats query helpers; was end of file
    const LOCAL_GAD_MESSAGES_KEY = "securo_gad_messages_local";

    const readLocalGADMessages = () => {
        try {
            const raw = localStorage.getItem(LOCAL_GAD_MESSAGES_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
            // (2026-07-13) Fix catch block syntax in readLocalGADMessages; was catch without param
        } catch (e) {
            return [];
        }
    };

    const writeLocalGADMessages = (messages) => {
        try {
            localStorage.setItem(LOCAL_GAD_MESSAGES_KEY, JSON.stringify(messages));
        } catch (e) {
            console.warn("Local GAD write error:", e);
        }
    };

    // (2026-07-13) Include location and notify admin on GAD send; was text only
    export const sendGADMessage = async (messageData) => {
        const isAnon = !!messageData.isAnonymous;
        const alias = isAnon ? (messageData.anonymousAlias || `Student-${Math.floor(1000 + Math.random() * 9000)}`) : "";
        const localId = `gad_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const payload = {
            studentUid: messageData.studentUid || "",
            studentName: isAnon ? alias : (messageData.studentName || "Student"),
            studentId: isAnon ? "" : (messageData.studentId || ""),
            isAnonymous: isAnon,
            anonymousAlias: alias,
            subject: messageData.subject || "General Inquiry",
            category: messageData.category || "counseling",
            message: messageData.message || "",
            location: messageData.location || null,
            status: "open",
            reply: null,
            repliedAt: null,
            repliedBy: null,
            createdAt: new Date().toISOString()
        };

        const localMessages = readLocalGADMessages();
        localMessages.unshift({ id: localId, ...payload });
        writeLocalGADMessages(localMessages);

        // (2026-07-13) Always send unified chat message even if gad_messages fails; was after
        const senderRole = String(messageData.role || 'student').toLowerCase();
        const defaultRoleName = senderRole === 'staff' ? 'Campus Staff' : 'Student';
        const displaySenderName = isAnon
            ? (senderRole === 'staff' ? 'Anonymous Staff' : 'Anonymous Student')
            : (messageData.studentName || defaultRoleName);
        if (messageData.studentUid) {
            await sendChatMessage(messageData.studentUid, "system_admin_securo", messageData.message || "", displaySenderName, {
                threadId: [messageData.studentUid, "system_admin_securo"].sort().join("_"),
                senderRole,
                recipientRole: "admin",
                supportMode: "gad_support",
                isAnonymous: isAnon,
                senderLabel: displaySenderName,
                ownerId: messageData.studentUid
            }).catch((err) => console.warn("Unified GAD chat sync warning:", err));
        }

        try {
            const docRef = await addDoc(collection(db, "gad_messages"), {
                ...payload,
                role: senderRole,
                createdAt: serverTimestamp()
            });

            sendAccountNotification({
                userId: 'admin',
                type: 'gad',
                title: 'GAD Support Activity',
                message: isAnon ? 'A new confidential GAD report was submitted.' : `New GAD report from ${messageData.studentName || defaultRoleName}.`,
                sourceUserId: messageData.studentUid || '',
                sourceName: isAnon ? 'Confidential' : (messageData.studentName || defaultRoleName),
                metadata: {
                    category: messageData.category || 'counseling',
                    subject: messageData.subject || '',
                    location: messageData.location || null
                }
            }).catch(err => console.warn("Failed GAD admin notify:", err));

            return { id: docRef.id, ...payload };
        } catch (error) {
            console.warn("Firestore GAD message save fallback to local:", error);
            return { id: localId, ...payload, isLocalFallback: true };
        }
    };

    export const subscribeToGADMessages = (studentUid, callback) => {
        const local = readLocalGADMessages().filter(m => !studentUid || m.studentUid === studentUid);
        callback(local);

        try {
            const q = studentUid
                ? query(collection(db, "gad_messages"), where("studentUid", "==", studentUid))
                : query(collection(db, "gad_messages"));

            return onSnapshot(q, (snapshot) => {
                const remote = snapshot.docs.map(doc => normalizeMsgForCache({ id: doc.id, ...doc.data() }));
                const merged = [...remote];
                local.forEach(l => {
                    if (!merged.some(r => r.id === l.id)) merged.push(l);
                });
                merged.sort((a, b) => {
                    const aT = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
                    const bT = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
                    return bT - aT;
                });
                // (2026-07-13) Persist remote GAD messages to local cache; was volatile
                if (remote.length) {
                    const allCachedGad = readLocalGADMessages();
                    const combined = [...remote];
                    allCachedGad.forEach(m => { if (!combined.some(r => r.id === m.id)) combined.push(m); });
                    writeLocalGADMessages(combined);
                }
                callback(merged);
                // (2026-07-13) Fix catch block in subscribeToGADMessages; was catch without param
            }, () => callback(local));
        } catch (e) {
            return () => { };
        }
    };

    export const replyToGADMessage = async (messageId, replyText, adminName = "GAD Desk") => {
        const local = readLocalGADMessages();
        const targetIdx = local.findIndex(m => m.id === messageId);
        if (targetIdx >= 0) {
            local[targetIdx].reply = replyText;
            local[targetIdx].status = "answered";
            local[targetIdx].repliedAt = new Date().toISOString();
            local[targetIdx].repliedBy = adminName;
            writeLocalGADMessages(local);
        }

        // (2026-07-13) Synchronize GAD reply into unified chat thread; was isolated
        try {
            if (targetIdx >= 0 && local[targetIdx]?.studentUid) {
                sendChatMessage("system_admin_securo", local[targetIdx].studentUid, replyText, adminName, {
                    threadId: [local[targetIdx].studentUid, "system_admin_securo"].sort().join("_"),
                    supportMode: "gad_support",
                    senderRole: "admin",
                    recipientRole: "student"
                }).catch(() => { });
            }
        } catch (_) { }

        try {
            await updateDoc(doc(db, "gad_messages", messageId), {
                reply: replyText,
                status: "answered",
                repliedAt: serverTimestamp(),
                repliedBy: adminName
            });
        } catch (e) {
            console.warn("Firestore GAD reply fallback:", e);
        }
    };

    // (2026-07-13) Add dual-collection Firestore and multi-event live sync for campus map; was single doc
    const campusMapBroadcast = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('securo_campus_map_channel') : null;

    // (2026-07-13) Firestore-safe geofence object formatting; was nested array (rejected by Firestore)
    export const saveCampusMapConfig = async (config) => {
        try {
            const cleanGeofence = Array.isArray(config?.geofence)
                ? config.geofence.map(pt => [Number(pt[0] ?? pt.lat), Number(pt[1] ?? pt.lng)])
                : [];
            const cleanBuildings = Array.isArray(config?.buildings)
                ? config.buildings.map(b => ({
                    name: String(b.name || ""),
                    icon: String(b.icon || "location_on"),
                    coords: [Number(b.coords?.[0] ?? b.lat ?? b.coords?.lat), Number(b.coords?.[1] ?? b.lng ?? b.coords?.lng)],
                    desc: String(b.desc || "")
                }))
                : [];

            if (cleanGeofence.length >= 3) {
                localStorage.setItem("securo_custom_geofence", JSON.stringify(cleanGeofence));
            }
            if (cleanBuildings.length > 0) {
                localStorage.setItem("securo_campus_buildings", JSON.stringify(cleanBuildings));
            }
            if (campusMapBroadcast) {
                try { campusMapBroadcast.postMessage({ geofence: cleanGeofence, buildings: cleanBuildings }); } catch (e) { }
            }
            try {
                window.dispatchEvent(new CustomEvent("securo_campus_map_updated", { detail: { geofence: cleanGeofence, buildings: cleanBuildings } }));
                window.dispatchEvent(new Event("storage"));
            } catch (e) { }

            const firestoreGeofence = cleanGeofence.map(pt => ({ lat: Number(pt[0]), lng: Number(pt[1]) }));
            const firestoreBuildings = cleanBuildings.map(b => ({
                name: String(b.name || ""),
                icon: String(b.icon || "location_on"),
                lat: Number(b.coords?.[0] ?? b.lat),
                lng: Number(b.coords?.[1] ?? b.lng),
                desc: String(b.desc || "")
            }));

            const payload = {
                geofence: firestoreGeofence,
                geofenceJson: JSON.stringify(cleanGeofence),
                buildings: firestoreBuildings,
                buildingsJson: JSON.stringify(cleanBuildings),
                updatedAt: serverTimestamp()
            };

            // (2026-07-13) Set 2.5s network timeout on Firestore save; was blocking indefinitely
            await Promise.race([
                Promise.allSettled([
                    setDoc(doc(db, "system_settings", "campus_map"), payload, { merge: true }),
                    setDoc(doc(db, "emergency_posts", "campus_map_config"), payload, { merge: true }),
                    setDoc(doc(db, "campus_config", "map"), payload, { merge: true })
                ]),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500))
            ]).catch(() => { });
        } catch (e) {
            console.warn("Firestore campus map save fallback to local:", e);
        }
    };

    export const subscribeToCampusMapConfig = (callback) => {
        const getLocal = () => {
            let geofence = null;
            let buildings = null;
            try {
                const g = localStorage.getItem("securo_custom_geofence");
                if (g) geofence = JSON.parse(g);
                const b = localStorage.getItem("securo_campus_buildings");
                if (b) buildings = JSON.parse(b);
            } catch (e) { }
            return { geofence, buildings };
        };

        callback(getLocal());

        if (campusMapBroadcast) {
            campusMapBroadcast.addEventListener("message", (e) => {
                if (e.data) {
                    if (e.data.geofence) {
                        localStorage.setItem("securo_custom_geofence", JSON.stringify(e.data.geofence));
                    }
                    if (e.data.buildings) {
                        localStorage.setItem("securo_campus_buildings", JSON.stringify(e.data.buildings));
                    }
                    callback(e.data);
                }
            });
        }

        try {
            window.addEventListener("securo_campus_map_updated", (e) => {
                if (e.detail) callback(e.detail);
            });
        } catch (e) { }

        const handleSnap = (snap) => {
            if (snap && snap.exists()) {
                const data = snap.data();
                let geofence = null;
                if (data.geofenceJson) {
                    try { geofence = JSON.parse(data.geofenceJson); } catch (e) { }
                }
                if (!geofence && Array.isArray(data.geofence)) {
                    geofence = data.geofence.map(pt => [Number(pt.lat ?? pt[0]), Number(pt.lng ?? pt[1])]);
                }
                if (Array.isArray(geofence) && geofence.length >= 3) {
                    localStorage.setItem("securo_custom_geofence", JSON.stringify(geofence));
                }

                let buildings = null;
                if (data.buildingsJson) {
                    try { buildings = JSON.parse(data.buildingsJson); } catch (e) { }
                }
                if (!buildings && Array.isArray(data.buildings)) {
                    buildings = data.buildings.map(b => ({
                        name: b.name,
                        icon: b.icon,
                        desc: b.desc,
                        coords: [Number(b.coords?.[0] ?? b.lat), Number(b.coords?.[1] ?? b.lng)]
                    }));
                }
                if (Array.isArray(buildings) && buildings.length > 0) {
                    localStorage.setItem("securo_campus_buildings", JSON.stringify(buildings));
                }

                const cleanConfig = { geofence, buildings };
                callback(cleanConfig);
                try {
                    window.dispatchEvent(new CustomEvent("securo_campus_map_updated", { detail: cleanConfig }));
                } catch (e) { }
            }
        };

        try {
            onSnapshot(doc(db, "system_settings", "campus_map"), handleSnap, () => { });
        } catch (e) { }
        try {
            onSnapshot(doc(db, "campus_config", "map"), handleSnap, () => { });
        } catch (e) { }
        try {
            return onSnapshot(doc(db, "emergency_posts", "campus_map_config"), handleSnap, () => callback(getLocal()));
        } catch (e) {
            return () => { };
        }
    };

    // (2026-08-17) Multi-document fetch of admin campus map config; was single doc
    export const fetchLatestCampusMapConfig = async () => {
        const docsToTry = [
            doc(db, "system_settings", "campus_map"),
            doc(db, "campus_config", "map"),
            doc(db, "emergency_posts", "campus_map_config")
        ];

        for (const dRef of docsToTry) {
            try {
                const snap = await getDoc(dRef);
                if (snap.exists()) {
                    const data = snap.data();
                    let geofence = null;
                    if (data.geofenceJson) {
                        try { geofence = JSON.parse(data.geofenceJson); } catch (e) { }
                    }
                    if (!geofence && Array.isArray(data.geofence)) {
                        geofence = data.geofence.map(pt => [Number(pt.lat ?? pt[0]), Number(pt.lng ?? pt[1])]);
                    }
                    if (Array.isArray(geofence) && geofence.length >= 3) {
                        localStorage.setItem("securo_custom_geofence", JSON.stringify(geofence));
                    }

                    let buildings = null;
                    if (data.buildingsJson) {
                        try { buildings = JSON.parse(data.buildingsJson); } catch (e) { }
                    }
                    if (!buildings && Array.isArray(data.buildings)) {
                        buildings = data.buildings.map(b => ({
                            name: b.name,
                            icon: b.icon,
                            desc: b.desc,
                            coords: [Number(b.coords?.[0] ?? b.lat), Number(b.coords?.[1] ?? b.lng)]
                        }));
                    }
                    if (Array.isArray(buildings) && buildings.length > 0) {
                        localStorage.setItem("securo_campus_buildings", JSON.stringify(buildings));
                    }

                    if (geofence || buildings) {
                        return { geofence, buildings };
                    }
                }
            } catch (e) { }
        }

        try {
            const g = localStorage.getItem("securo_custom_geofence");
            const b = localStorage.getItem("securo_campus_buildings");
            return {
                geofence: g ? JSON.parse(g) : null,
                buildings: b ? JSON.parse(b) : null
            };
        } catch (e) { }
        return {};
    };


    // ========================================================
    // AUDIT LOGGING SYSTEM (Date: 2026-10-06)
    // Tracks all critical user actions for security and compliance
    // ========================================================

    /**
     * Log an audit event
     * @param {object} event - { userId, action, details, timestamp }
     */
    export const logAuditEvent = async (event) => {
        try {
            const auditEntry = {
                userId: event.userId || 'unknown',
                action: event.action || 'unknown_action',
                details: event.details || {},
                timestamp: serverTimestamp(),
                ipAddress: null, // Future: capture from server
                userAgent: navigator.userAgent || 'unknown',
                sessionId: sessionStorage.getItem('securo_session_id') || 'no_session'
            };

            await addDoc(collection(db, "audit_logs"), auditEntry);
            return true;
        } catch (error) {
            Logger.warn("AuditLog", "Failed to log audit event", { event, error });
            return false;
        }
    };

    /**
     * Get audit logs for a specific user (Admin only)
     * @param {string} userId 
     * @param {number} limitCount 
     */
    export const getUserAuditLogs = async (userId, limitCount = 50) => {
        try {
            const q = query(
                collection(db, "audit_logs"),
                where("userId", "==", userId),
                orderBy("timestamp", "desc"),
                limit(limitCount)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            Logger.error("AuditLog", "Failed to get user audit logs", { userId, error });
            return [];
        }
    };

    /**
     * Get all audit logs (Admin only)
     * @param {number} limitCount 
     */
    export const getAllAuditLogs = async (limitCount = 100) => {
        try {
            const q = query(
                collection(db, "audit_logs"),
                orderBy("timestamp", "desc"),
                limit(limitCount)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            Logger.error("AuditLog", "Failed to get all audit logs", error);
            return [];
        }
    };

    // ========================================================
    // OFFLINE QUEUE SYSTEM (Date: 2026-10-06)
    // Queue operations when offline and sync when back online
    // ========================================================

    const OFFLINE_QUEUE_KEY = "securo_offline_queue";

    /**
     * Add operation to offline queue
     * @param {object} operation - { type, data, timestamp }
     */
    export const queueOfflineOperation = (operation) => {
        try {
            const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
            queue.push({
                ...operation,
                queuedAt: new Date().toISOString(),
                id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            });
            localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
            Logger.info("OfflineQueue", "Operation queued", operation);
            return true;
        } catch (error) {
            Logger.error("OfflineQueue", "Failed to queue operation", error);
            return false;
        }
    };

    /**
     * Process offline queue when back online
     */
    export const processOfflineQueue = async () => {
        try {
            const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
            if (queue.length === 0) return { processed: 0, failed: 0 };

            let processed = 0;
            let failed = 0;
            const failedOps = [];

            for (const operation of queue) {
                try {
                    // Process based on operation type
                    switch (operation.type) {
                        case 'sos_log':
                            await logSOS(operation.data.userId, operation.data.location, operation.data.metadata);
                            break;
                        case 'attendance':
                            await logAttendance(operation.data.userId, operation.data.type, operation.data.location);
                            break;
                        case 'emergency_post':
                            await saveEmergencyPost(operation.data);
                            break;
                        default:
                            Logger.warn("OfflineQueue", "Unknown operation type", operation);
                    }
                    processed++;
                } catch (error) {
                    Logger.error("OfflineQueue", "Failed to process operation", { operation, error });
                    failedOps.push(operation);
                    failed++;
                }
            }

            // Keep only failed operations in queue
            localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(failedOps));

            Logger.info("OfflineQueue", "Queue processed", { processed, failed });
            return { processed, failed };
        } catch (error) {
            Logger.error("OfflineQueue", "Queue processing failed", error);
            return { processed: 0, failed: 0 };
        }
    };

    /**
     * Get current offline queue size
     */
    export const getOfflineQueueSize = () => {
        try {
            const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
            return queue.length;
        } catch {
            return 0;
        }
    };

    // ========================================================
    // NOTIFICATION SYSTEM (Date: 2026-10-06)
    // In-app notifications for account events
    // ========================================================

    // (2026-07-13) Remove duplicate sendAccountNotification; was redefined here

    /**
     * Get user notifications
     * @param {string} userId 
     * @param {boolean} unreadOnly 
     */
    export const getUserNotifications = async (userId, unreadOnly = false) => {
        try {
            let q = query(
                collection(db, "notifications"),
                where("userId", "==", userId),
                orderBy("createdAt", "desc"),
                limit(50)
            );

            if (unreadOnly) {
                q = query(
                    collection(db, "notifications"),
                    where("userId", "==", userId),
                    where("read", "==", false),
                    orderBy("createdAt", "desc")
                );
            }

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            Logger.error("Notifications", "Failed to get notifications", { userId, error });
            return [];
        }
    };

    /**
     * Mark notification as read
     * @param {string} notificationId 
     */
    export const markNotificationAsRead = async (notificationId) => {
        try {
            await updateDoc(doc(db, "notifications", notificationId), {
                read: true,
                readAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            Logger.error("Notifications", "Failed to mark as read", { notificationId, error });
            return false;
        }
    };

    /**
     * Mark all notifications as read for a user
     * @param {string} userId 
     */
    export const markAllNotificationsAsRead = async (userId) => {
        try {
            const q = query(
                collection(db, "notifications"),
                where("userId", "==", userId),
                where("read", "==", false)
            );
            const querySnapshot = await getDocs(q);

            const updates = querySnapshot.docs.map(doc =>
                updateDoc(doc.ref, { read: true, readAt: serverTimestamp() })
            );

            await Promise.all(updates);
            Logger.info("Notifications", "All notifications marked as read", { userId });
            return true;
        } catch (error) {
            Logger.error("Notifications", "Failed to mark all as read", { userId, error });
            return false;
        }
    };

    /**
     * Subscribe to real-time notifications
     * @param {string} userId 
     * @param {function} callback 
     */
    export const subscribeToNotifications = (userId, callback) => {
        const q = query(
            collection(db, "notifications"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc"),
            limit(50)
        );

        return onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(notifications);
        }, (error) => {
            Logger.error("Notifications", "Subscription error", error);
            callback([]);
        });
    };

    /**
     * Delete a notification
     * @param {string} notificationId 
     */
    export const deleteNotification = async (notificationId) => {
        try {
            await deleteDoc(doc(db, "notifications", notificationId));
            return true;
        } catch (error) {
            Logger.error("Notifications", "Failed to delete notification", { notificationId, error });
            return false;
        }
    };

    // ========================================================
    // ANALYTICS & REPORTING (Date: 2026-10-06)
    // Generate usage statistics and reports
    // ========================================================

    /**
     * Get attendance statistics for date range
     * @param {Date} startDate 
     * @param {Date} endDate 
     */
    export const getAttendanceStats = async (startDate, endDate) => {
        try {
            const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const end = endDate ? new Date(endDate) : new Date();

            const q = query(
                collection(db, "attendance"),
                where("timestamp", ">=", start),
                where("timestamp", "<=", end)
            );

            const querySnapshot = await getDocs(q);
            const records = querySnapshot.docs.map(doc => doc.data());

            const stats = {
                totalCheckIns: records.filter(r => r.type === 'in').length,
                totalCheckOuts: records.filter(r => r.type === 'out').length,
                uniqueUsers: new Set(records.map(r => r.userId)).size,
                byDate: {},
                byUser: {}
            };

            // Group by date
            records.forEach(record => {
                const date = new Date(record.timestamp?.seconds * 1000).toLocaleDateString();
                stats.byDate[date] = (stats.byDate[date] || 0) + 1;

                stats.byUser[record.userId] = (stats.byUser[record.userId] || 0) + 1;
            });

            return stats;
        } catch (error) {
            Logger.error("Analytics", "Failed to get attendance stats", error);
            return null;
        }
    };

    /**
     * Get SOS statistics
     */
    export const getSOSStats = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "sos_logs"));
            const logs = querySnapshot.docs.map(doc => doc.data());

            const stats = {
                total: logs.length,
                byStatus: {},
                byUser: {},
                averageResponseTime: 0,
                recentAlerts: logs.slice(0, 10).map(log => ({
                    userId: log.userId,
                    timestamp: log.timestamp,
                    location: log.location
                }))
            };

            logs.forEach(log => {
                stats.byStatus[log.status || 'unknown'] = (stats.byStatus[log.status || 'unknown'] || 0) + 1;
                stats.byUser[log.userId] = (stats.byUser[log.userId] || 0) + 1;
            });

            return stats;
        } catch (error) {
            Logger.error("Analytics", "Failed to get SOS stats", error);
            return null;
        }
    };

    /**
     * Get user activity summary
     * @param {string} userId 
     */
    export const getUserActivitySummary = async (userId) => {
        try {
            const [attendance, sosLogs, emergencyPosts] = await Promise.all([
                getAttendanceHistory(userId),
                getUserSOSLogs(userId),
                getUserEmergencyPosts(userId)
            ]);

            return {
                attendanceCount: attendance.length,
                sosCount: sosLogs.length,
                emergencyPostsCount: emergencyPosts.length,
                lastActivity: attendance[0]?.timestamp || null,
                recentActions: [
                    ...attendance.slice(0, 5).map(a => ({ type: 'attendance', ...a })),
                    ...sosLogs.slice(0, 5).map(s => ({ type: 'sos', ...s }))
                ].sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
            };
        } catch (error) {
            Logger.error("Analytics", "Failed to get user activity", { userId, error });
            return null;
        }
    };

    // (2026-07-13) Support guardian passwords in store/lookup; was admin-only
    export const saveAdminUserPassword = async (userId, email, password) => {
        const normEmail = String(email || '').trim().toLowerCase();
        // (2026-07-13) Track previous password for live auth sync; was overwritten
        try {
            const prev = normEmail ? (localStorage.getItem('securo_admin_pwd_' + normEmail) || localStorage.getItem('securo_guardian_pwd_' + normEmail)) : null;
            if (prev && prev !== password && normEmail) {
                localStorage.setItem('securo_prev_pwd_' + normEmail, prev);
            }
        } catch (_) { }
        try {
            if (userId) {
                await setDoc(doc(db, "users", userId), {
                    password,
                    passwordUpdatedAt: serverTimestamp()
                }, { merge: true }).catch(() => { });
            }
            if (normEmail) {
                await setDoc(doc(db, "user_passwords", normEmail), {
                    email: normEmail,
                    password,
                    updatedAt: serverTimestamp()
                }, { merge: true }).catch(() => { });
                localStorage.setItem('securo_admin_pwd_' + normEmail, password);
                localStorage.setItem('securo_guardian_pwd_' + normEmail, password);
            }
        } catch (e) {
            if (normEmail) {
                localStorage.setItem('securo_admin_pwd_' + normEmail, password);
                localStorage.setItem('securo_guardian_pwd_' + normEmail, password);
            }
        }
    };

    export const getAdminUserPassword = async (email) => {
        const normEmail = String(email || '').trim().toLowerCase();
        if (!normEmail) return null;
        try {
            const snap = await getDoc(doc(db, "user_passwords", normEmail));
            if (snap.exists() && snap.data()?.password) {
                return snap.data().password;
            }
            const userDoc = await findUserByEmail(normEmail);
            if (userDoc?.password) return userDoc.password;
            const users = readLocalUsers();
            const found = users.find(u => String(u.email || '').toLowerCase() === normEmail);
            if (found?.password) return found.password;
        } catch (_) { }
        return localStorage.getItem('securo_admin_pwd_' + normEmail) || localStorage.getItem('securo_guardian_pwd_' + normEmail) || null;
    };

    // (2026-07-13) Realtime user presence heartbeat & watcher; was static
    const PRESENCE_STORAGE_KEY = 'securo_user_presence_map';
    let _activePresenceStopFn = null;

    function writeLocalPresenceEntry(userId, isOnline) {
        if (!userId) return;
        const entry = { isOnline: Boolean(isOnline), lastActiveMs: Date.now() };
        try {
            const raw = localStorage.getItem(PRESENCE_STORAGE_KEY);
            const map = raw ? JSON.parse(raw) : {};
            map[String(userId)] = entry;
            localStorage.setItem(PRESENCE_STORAGE_KEY, JSON.stringify(map));
        } catch (_) { }
        try {
            const ch = new BroadcastChannel('securo_presence_channel');
            ch.postMessage({ userId: String(userId), ...entry });
            ch.close();
        } catch (_) { }
    }

    export const readLocalPresenceMap = () => {
        try {
            const raw = localStorage.getItem(PRESENCE_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : {};
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (_) {
            return {};
        }
    };

    export const updateUserPresence = async (userId, isOnline = true) => {
        if (!userId) return;
        writeLocalPresenceEntry(userId, isOnline);
        try {
            await setDoc(doc(db, "users", String(userId)), {
                isOnline: Boolean(isOnline),
                lastActiveMs: Date.now(),
                lastActiveAt: serverTimestamp()
            }, { merge: true });
        } catch (_) { }
    };

    export const startUserPresenceHeartbeat = (userId) => {
        if (!userId) return () => { };
        if (typeof _activePresenceStopFn === 'function') {
            _activePresenceStopFn();
        }
        const uid = String(userId);
        const beat = () => {
            const visible = typeof document === 'undefined' ? true : document.visibilityState === 'visible';
            updateUserPresence(uid, visible);
        };
        beat();
        const timer = setInterval(() => {
            if (typeof document === 'undefined' || document.visibilityState === 'visible') {
                updateUserPresence(uid, true);
            }
        }, 25000);
        const onVis = () => beat();
        const onOffline = () => updateUserPresence(uid, false);
        if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVis);
        if (typeof window !== 'undefined') {
            window.addEventListener('pagehide', onOffline);
            window.addEventListener('beforeunload', onOffline);
        }
        const stop = () => {
            clearInterval(timer);
            if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVis);
            if (typeof window !== 'undefined') {
                window.removeEventListener('pagehide', onOffline);
                window.removeEventListener('beforeunload', onOffline);
            }
            updateUserPresence(uid, false);
            if (_activePresenceStopFn === stop) _activePresenceStopFn = null;
        };
        _activePresenceStopFn = stop;
        return stop;
    };

    export const subscribeToAllUsersPresence = (callback) => {
        const presenceMap = { ...readLocalPresenceMap() };
        const emit = () => {
            try { callback({ ...presenceMap }); } catch (_) { }
        };
        emit();

        let unsubFirestore = null;
        try {
            unsubFirestore = onSnapshot(collection(db, "users"), (snap) => {
                snap.docs.forEach((d) => {
                    const data = d.data() || {};
                    const tsMs = data.lastActiveAt?.toMillis
                        ? data.lastActiveAt.toMillis()
                        : (data.lastActiveAt?.seconds ? data.lastActiveAt.seconds * 1000 : Number(data.lastActiveMs || 0));
                    const localEntry = presenceMap[d.id];
                    if (!localEntry || tsMs >= (localEntry.lastActiveMs || 0)) {
                        presenceMap[d.id] = {
                            isOnline: data.isOnline === true || data.isWatching === true,
                            lastActiveMs: tsMs || 0
                        };
                    }
                });
                emit();
            }, () => { });
        } catch (_) { }

        let channel = null;
        try {
            channel = new BroadcastChannel('securo_presence_channel');
            channel.onmessage = (e) => {
                if (e.data?.userId) {
                    presenceMap[String(e.data.userId)] = {
                        isOnline: Boolean(e.data.isOnline),
                        lastActiveMs: Number(e.data.lastActiveMs || Date.now())
                    };
                    emit();
                }
            };
        } catch (_) { }

        const onStorage = (e) => {
            if (e.key === PRESENCE_STORAGE_KEY) {
                Object.assign(presenceMap, readLocalPresenceMap());
                emit();
            }
        };
        if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);

        return () => {
            if (unsubFirestore) unsubFirestore();
            if (channel) channel.close();
            if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
        };
    };
