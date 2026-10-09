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
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { Logger } from './utils.js';

const LOCAL_EMERGENCY_POSTS_KEY = "securo_emergency_posts_local";
const LOCAL_USERS_KEY = "securo_users_local";

const readLocalEmergencyPosts = () => {
    try {
        const raw = localStorage.getItem(LOCAL_EMERGENCY_POSTS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
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

const readLocalUsers = () => {
    try {
        const raw = localStorage.getItem(LOCAL_USERS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
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

const writeLocalUsers = (users) => {
    try {
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    } catch (error) {
        Logger.warn("DB", "Error writing local users", error);
    }
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

const mergeEmergencyPosts = (remotePosts, localPosts) => {
    const combined = [...(Array.isArray(localPosts) ? localPosts : []), ...(Array.isArray(remotePosts) ? remotePosts : [])];
    return combined.sort((a, b) => {
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
        await syncGuardianLinksForGuardian(userId, profileData).catch(() => {});
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
// (2026-07-13) Include guardian links and notify in SOS log; was userId only
export const logSOS = async (userId, location, metadata = {}) => {
    try {
        const localUsers = readLocalUsers();
        const fallback = localUsers.find(u => String(u.id || u.uid || '') === String(userId)) || {};
        const links = await getLinksForStudent(null, userId).catch(() => []);
        const guardianUids = (Array.isArray(links) ? links : []).filter(l => l.status === 'accepted' && l.guardianId).map(l => l.guardianId);
        const name = metadata.userName || fallback.name || "Student";
        const email = metadata.userEmail || fallback.email || "";
        const studentId = metadata.studentId || fallback.studentId || "";

        await addDoc(collection(db, "sos_logs"), {
            userId,
            studentUid: userId,
            guardianUids,
            userName: name,
            userEmail: email,
            studentId,
            role: metadata.role || fallback.role || "student",
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
            studentName: name,
            studentId,
            type: "sos",
            location: location || {},
            timestamp: serverTimestamp()
        }).catch(err => console.warn("SOS attendance log sync fallback:", err));

        notifyGuardiansSOS(userId, name, location, metadata).catch(e => console.warn("SOS notify err:", e));
    } catch (error) {
        if (error?.code === "permission-denied" || /permissions/i.test(error?.message)) {
            console.warn("SOS log could not be saved to Firestore due to permission denied. The emergency signal is still active on this device.");
            return;
        }
        console.warn("Error logging SOS:", error);
        throw error;
    }
};

/**
 * Save a posted emergency capture package
 * @param {object} payload
 */
export const saveEmergencyPost = async (payload) => {
    try {
        await addDoc(collection(db, "emergency_posts"), {
            ...payload,
            gadVisible: payload.gadVisible !== false,
            guardianVisible: payload.guardianVisible !== false,
            status: payload.status || "posted",
            createdAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        if (error?.code === "permission-denied" || /insufficient permissions/i.test(error?.message || "")) {
            const localPosts = readLocalEmergencyPosts();
            localPosts.unshift({
                id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                ...payload,
                gadVisible: payload.gadVisible !== false,
                guardianVisible: payload.guardianVisible !== false,
                status: payload.status || "posted",
                createdAt: new Date().toISOString(),
                isLocalFallback: true
            });
            writeLocalEmergencyPosts(localPosts);
            console.warn("Emergency post saved locally because Firestore denied access.");
            return true;
        }
        console.warn("Error saving emergency post:", error);
        throw error;
    }
};

/**
 * Fetch emergency posts for the current user
 * @param {string} userId
 */
export const getUserEmergencyPosts = async (userId) => {
    if (!userId) {
        console.warn("getUserEmergencyPosts called without userId, returning empty.");
        return [];
    }
    
    const localPosts = readLocalEmergencyPosts().filter((post) => String(post.userId) === String(userId));
    
    try {
        const q = query(
            collection(db, "emergency_posts"), 
            where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        const remotePosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return mergeEmergencyPosts(remotePosts, localPosts);
    } catch (error) {
        // Detailed logging for debugging permission issues (Date: 2026-05-02)
        if (error?.code === "permission-denied" || /permissions/i.test(error?.message)) {
            console.warn(`Firestore read access denied for emergency_posts (UID: ${userId}). This usually means Firestore Security Rules need to be updated to allow 'read' access for this user. Falling back to local storage.`);
        } else {
            console.warn("Error getting user emergency posts:", error);
        }
        return mergeEmergencyPosts([], localPosts);
    }
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
export const getAllEmergencyPosts = async () => {
    const localPosts = readLocalEmergencyPosts();
    try {
        const q = query(collection(db, "emergency_posts"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const remotePosts = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(post => post.gadVisible !== false); // Respect privacy toggle
            
        return mergeEmergencyPosts(remotePosts, localPosts.filter(p => p.gadVisible !== false));
    } catch (error) {
        console.warn("Error getting all emergency posts:", error);
        // Fallback to filtered local posts if query fails (e.g. missing index)
        return mergeEmergencyPosts([], localPosts.filter(p => p.gadVisible !== false));
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
export const isStudentIdTaken = async (studentId) => {
    try {
        const q = query(collection(db, "users"), where("studentId", "==", studentId));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.warn("Error checking student ID:", error);
        return false;
    }
};

/**
 * Find user email by Student ID
 * @param {string} studentId 
 */
export const getEmailByStudentId = async (studentId) => {
    try {
        const q = query(collection(db, "users"), where("studentId", "==", studentId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data().email;
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
export const updateUserProfile = async (uid, data) => {
    upsertLocalUser(uid, data);
    try {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, {
            ...data,
            updatedAt: serverTimestamp()
        }, { merge: true });
        await syncGuardianLinksForStudent(uid, data).catch((error) => {
            console.warn("Guardian link sync skipped after updateUserProfile:", error);
        });
        // (2026-07-13) Sync guardian link names on profile update; was student only
        await syncGuardianLinksForGuardian(uid, data).catch(() => {});
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
// (2026-07-13) Broadcast GAD post to students & parents; was post only
export const saveGADPost = async (postData) => {
    try {
        const docRef = await addDoc(collection(db, "gad_posts"), {
            ...postData,
            likes: 0,
            likedBy: [],
            createdAt: serverTimestamp()
        });

        // Broadcast notification to students and guardians
        try {
            const allUsers = await getAllUsers().catch(() => []);
            const targetUsers = allUsers.filter((u) => u.uid && (u.role === 'student' || u.role === 'guardian'));
            const snippet = String(postData.content || "New GAD announcement published").slice(0, 100);
            await Promise.all(targetUsers.map((u) =>
                sendAccountNotification({
                    userId: u.uid,
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
        } catch (e) {
            console.warn("GAD notification broadcast skipped:", e);
        }

        return true;
    } catch (error) {
        console.warn("Error saving GAD post:", error);
        throw error;
    }
};

/**
 * Fetch latest GAD posts
 */
export const getGADPosts = async () => {
    try {
        const q = query(collection(db, "gad_posts"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    } catch (error) {
        console.warn("Error getting GAD posts:", error);
        return [];
    }
};

/**
 * Toggle like on a GAD post
 * @param {string} postId 
 * @param {string} userId 
 */
export const toggleLikeGADPost = async (postId, userId) => {
    try {
        const postRef = doc(db, "gad_posts", postId);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
            const data = postSnap.data();
            const likedBy = data.likedBy || [];
            const isLiked = likedBy.includes(userId);
            
            const newLikedBy = isLiked 
                ? likedBy.filter(id => id !== userId)
                : [...likedBy, userId];
            
            await setDoc(postRef, {
                likedBy: newLikedBy,
                likes: newLikedBy.length
            }, { merge: true });
            
            return { likes: newLikedBy.length, isLiked: !isLiked };
        }
    } catch (error) {
        console.warn("Error toggling like:", error);
        throw error;
    }
};

/**
 * Delete a GAD post
 * @param {string} postId 
 */
export const deleteGADPost = async (postId) => {
    try {
        await deleteDoc(doc(db, "gad_posts", postId));
        return true;
    } catch (error) {
        console.warn("Error deleting post:", error);
        throw error;
    }
};

/**
 * Update a GAD post
 * @param {string} postId 
 * @param {object} updatedData 
 */
export const updateGADPost = async (postId, updatedData) => {
    try {
        const postRef = doc(db, "gad_posts", postId);
        await updateDoc(postRef, {
            ...updatedData,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.warn("Error updating post:", error);
        throw error;
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

// (2026-07-13) Add getAllAttendance for reports; was user-scoped only
export const getAllAttendance = async () => {
    try {
        const q = query(collection(db, "attendance"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
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
/**
 * Fetch all SOS logs for admin
 */
export const getAllSOSLogs = async () => {
    try {
        const q = query(collection(db, "sos_logs"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
export const getAllUsers = async () => {
    const [usersResult, attendanceResult, guardianLinksResult] = await Promise.allSettled([
        getDocs(collection(db, "users")),
        getDocs(query(collection(db, "attendance"), where("type", "==", "profile_bootstrap"))),
        getDocs(collection(db, "guardian_links"))
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

// (2026-09-09) accept adminUid; two where-queries so Firestore rules pass
export const getAllChatThreadsOnce = async (adminUid = "system_admin_securo") => {
    const ADMIN_CONST = "system_admin_securo";
    try {
        const [sentSnap, recvSnap] = await Promise.all([
            // messages the admin sent (senderId == real UID)
            getDocs(query(collection(db, "messages"), where("senderId", "==", adminUid))),
            // messages sent TO the admin (receiverId == hardcoded constant)
            getDocs(query(collection(db, "messages"), where("receiverId", "==", ADMIN_CONST)))
        ]);
        const allDocs = [...sentSnap.docs, ...recvSnap.docs];
        const threadsMap = new Map();
        allDocs.forEach((entry) => {
            const payload = { id: entry.id, ...entry.data() };
            if (!payload.threadId) return;
            const existing = threadsMap.get(payload.threadId);
            const t = payload.timestamp?.seconds || 0;
            if (!existing || t > (existing.timestamp?.seconds || 0)) {
                threadsMap.set(payload.threadId, payload);
            }
        });
        return Array.from(threadsMap.values())
            .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
    } catch (error) {
        console.warn("Error getting chat threads once:", error);
        return [];
    }
};

export const getAllGuardianLinksAdmin = async () => {
    try {
        const snapshot = await getDocs(collection(db, "guardian_links"));
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
    
    const q = query(
        collection(db, "messages"),
        where("threadId", "==", threadId)
    );

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
        callback(messages);
    }, () => callback([]));
};

/**
 * Messaging: Subscribe to a specific thread directly
 * @param {string} threadId
 * @param {function} callback
 */
export const subscribeToMessagesByThread = (threadId, callback) => {
    const q = query(
        collection(db, "messages"),
        where("threadId", "==", threadId)
    );

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
        callback(messages);
    }, () => callback([]));
};

/**
 * Messaging: Send a message with threadId
 */
// (2026-07-13) Persist senderUid, recipientUid and notify; was senderId only
export const sendChatMessage = async (senderId, receiverId, text, senderName, options = {}) => {
    const threadId = options.threadId || [senderId, receiverId].sort().join("_");
    const senderRole = options.senderRole || (senderId === "system_admin_securo" ? "admin" : "student");
    const recipientRole = options.recipientRole || (receiverId === "system_admin_securo" ? "admin" : "student");
    try {
        await addDoc(collection(db, "messages"), {
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
            timestamp: serverTimestamp(),
            read: false
        });

        const targetUid = receiverId === "system_admin_securo" ? "admin" : receiverId;
        const noteTitle = senderRole === "admin" ? "New message from Admin" : `Message from ${senderName || "Student"}`;
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
        console.warn("Error sending chat message:", error);
        throw error;
    }
};


/**
 * Messaging: Get all chat threads (for Admin)
 */
// (2026-09-09) accept adminUid; two where-queries so Firestore rules pass
export const getAllChatThreads = (adminUid = "system_admin_securo", callback) => {
    const ADMIN_CONST = "system_admin_securo";
    const merge = (snap1, snap2) => {
        const allDocs = [...snap1.docs, ...snap2.docs];
        const threadsMap = new Map();
        allDocs.forEach(entry => {
            const msg = { id: entry.id, ...entry.data() };
            if (!msg.threadId) return;
            const existing = threadsMap.get(msg.threadId);
            if (!existing || (msg.timestamp?.seconds || 0) > (existing.timestamp?.seconds || 0)) {
                threadsMap.set(msg.threadId, msg);
            }
        });
        return Array.from(threadsMap.values())
            .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
    };

    let snap1 = null, snap2 = null;
    const tryCallback = () => { if (snap1 && snap2) callback(merge(snap1, snap2)); };

    // messages the admin sent (senderId == real UID)
    const qSent = query(collection(db, "messages"), where("senderId", "==", adminUid));
    // messages sent TO the admin (receiverId == hardcoded constant stored by users)
    const qRecv = query(collection(db, "messages"), where("receiverId", "==", ADMIN_CONST));

    const unsub1 = onSnapshot(qSent,  s => { snap1 = s; tryCallback(); }, err => { console.warn("getAllChatThreads(sent) error:", err); snap1 = { docs: [] }; tryCallback(); });
    const unsub2 = onSnapshot(qRecv,  s => { snap2 = s; tryCallback(); }, err => { console.warn("getAllChatThreads(recv) error:", err); snap2 = { docs: [] }; tryCallback(); });

    return () => { unsub1(); unsub2(); };
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
        const profile = await getUserProfile(userId).catch(() => null);

        await setDoc(doc(db, "users", userId), {
            isDeleted: true,
            deletedAt: new Date().toISOString()
        }, { merge: true });

        await deleteDoc(doc(db, "student_locations", userId)).catch(() => {});

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
        await Promise.all(Array.from(guardianLinkIds).map((id) => deleteDoc(doc(db, "guardian_links", id)).catch(() => {})));

        const messagesSnapshot = await getDocs(collection(db, "messages")).catch(() => null);
        const messageIds = (messagesSnapshot?.docs || [])
            .filter((entry) => {
                const data = entry.data();
                return String(data.senderId) === String(userId) || String(data.receiverId) === String(userId);
            })
            .map((entry) => entry.id);
        await Promise.all(messageIds.map((id) => deleteDoc(doc(db, "messages", id)).catch(() => {})));

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

// (2026-07-13) Delete user auth and database records; was missing
export const deleteCurrentUserAccount = async (password = "") => {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user to delete.");

    if (password && user.email) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
    }

    const uid = user.uid;
    await deleteUserRecord(uid).catch((err) => {
        console.warn("deleteUserRecord partial failure during account deletion:", err);
    });

    await deleteUser(user);

    try {
        localStorage.clear();
        sessionStorage.clear();
    } catch (e) {}

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
export const syncGuardianLinksForGuardian = async (guardianUid, profileData = {}) => {
    if (!guardianUid && !profileData?.email) return false;

    const normEmail = (profileData?.email || '').toLowerCase().trim();
    const updates = {
        ...(profileData?.name ? { guardianName: profileData.name } : {}),
        ...(normEmail ? { guardianEmail: normEmail } : {}),
        ...(guardianUid ? { guardianId: guardianUid, guardianUid: guardianUid } : {}),
        lastSyncedAt: serverTimestamp()
    };
    if (!profileData?.name && !normEmail) return false;

    try {
        const snap = await getDocs(collection(db, "guardian_links"));
        const updatePromises = [];
        snap.docs.forEach((entry) => {
            const data = entry.data();
            const linkGid = data.guardianId || data.guardianUid;
            const linkEmail = (data.guardianEmail || '').toLowerCase().trim();
            const matches = (guardianUid && linkGid === guardianUid) || (normEmail && linkEmail === normEmail);
            if (matches) {
                updatePromises.push(updateDoc(doc(db, "guardian_links", entry.id), updates));
            }
        });
        if (updatePromises.length) {
            await Promise.all(updatePromises);
        }
        return true;
    } catch (e) {
        console.warn("Error syncing guardian links:", e);
        return false;
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
            status: "accepted",
            createdAt: serverTimestamp(),
            approvedAt: serverTimestamp(),
            respondedAt: serverTimestamp()
        };

        // (2026-07-13) Instant link creation & re-add support; was strict pending
        const existingLink = await findExistingGuardianStudentLink({
            guardianId: enrichedLinkData.guardianId,
            guardianEmail: enrichedLinkData.guardianEmail,
            studentId: enrichedLinkData.studentId,
            studentUid: enrichedLinkData.studentUid
        });

        let linkId = "";
        if (existingLink?.id) {
            linkId = existingLink.id;
            await updateDoc(doc(db, "guardian_links", existingLink.id), enrichedLinkData);
        } else {
            const docRef = await addDoc(collection(db, "guardian_links"), enrichedLinkData);
            linkId = docRef.id;
        }

        await sendAccountNotification({
            userId: studentRecord.uid,
            recipientUid: studentRecord.uid,
            type: "guardian_request_accepted",
            title: "Parent / Guardian Connected",
            message: `${enrichedLinkData.guardianName || "A parent or guardian"} is now connected to your account.`,
            sourceUserId: enrichedLinkData.guardianId,
            sourceName: enrichedLinkData.guardianName,
            requestId: linkId,
            studentId: enrichedLinkData.studentId,
            priority: "normal"
        }).catch((err) => console.warn("Guardian request notification skipped:", err));

        try {
            const ch = new BroadcastChannel('securo_users_channel');
            ch.postMessage({ type: 'guardian_link_created', linkId, payload: enrichedLinkData });
            ch.close();
        } catch (e) {}

        return linkId;
    } catch (error) {
        console.warn("Error creating guardian link request:", error);
        throw error;
    }
};

// (2026-07-13) Student ID + Parent Gmail linking with validation; was unverified
export const createGuardianLinkFromStudent = async (requestData) => {
    try {
        if (!requestData?.studentUid) {
            throw new Error("Student authentication is required.");
        }
        const studentProfile = await getUserProfile(requestData.studentUid).catch(() => null);
        if (studentProfile?.role && studentProfile.role !== "student") {
            throw new Error("Only students can link a parent or guardian from this screen.");
        }

        const guardianRecord = await findUserByEmail(requestData.guardianEmail);
        if (!guardianRecord?.uid) {
            throw new Error("No registered parent or guardian account was found with that email.");
        }

        if (inferUserRole(guardianRecord) !== "guardian") {
            throw new Error("That registered account is not an authorized guardian account.");
        }

        if (guardianRecord.uid === requestData.studentUid) {
            throw new Error("You cannot add your own account as a parent or guardian.");
        }

        const existingLink = await findExistingGuardianStudentLink({
            guardianId: guardianRecord.uid,
            guardianEmail: guardianRecord.email || requestData.guardianEmail || "",
            studentId: requestData.studentId || studentProfile?.studentId,
            studentUid: requestData.studentUid
        });
        if (existingLink) {
            const existingStatus = existingLink.status;
            if (existingStatus === "accepted") {
                throw new Error("That parent or guardian is already linked to your account.");
            }
            if (existingStatus === "pending") {
                throw new Error("A request for that parent or guardian is already pending.");
            }
        }

        await assertGuardianCapacityForRequest({
            guardianId: guardianRecord.uid,
            studentId: requestData.studentId || studentProfile?.studentId,
            currentLinkId: existingLink?.id || null
        });

        const linkPayload = {
            guardianId: guardianRecord.uid,
            guardianUid: guardianRecord.uid,
            guardianName: guardianRecord.name || requestData.guardianName || guardianRecord.email || "Guardian",
            guardianEmail: guardianRecord.email || requestData.guardianEmail || "",
            studentId: requestData.studentId || studentProfile?.studentId || "",
            studentUid: requestData.studentUid || "",
            studentName: requestData.studentName || studentProfile?.name || "Student",
            status: "accepted",
            requestedBy: "student",
            relationshipType: requestData.relationshipType || "parent",
            permissions: { sosAlerts: true, attendanceAlerts: true, liveLocation: true },
            createdAt: serverTimestamp(),
            approvedAt: serverTimestamp(),
            respondedAt: serverTimestamp()
        };

        let linkId = "";
        if (existingLink?.id) {
            await updateDoc(doc(db, "guardian_links", existingLink.id), linkPayload);
            linkId = existingLink.id;
        } else {
            const docRef = await addDoc(collection(db, "guardian_links"), linkPayload);
            linkId = docRef.id;
        }

        await sendAccountNotification({
            userId: guardianRecord.uid,
            recipientUid: guardianRecord.uid,
            type: "student_guardian_request",
            title: "Student linked your guardian account",
            message: `${requestData.studentName || studentProfile?.name || "A student"} connected you as their parent or guardian.`,
            sourceUserId: requestData.studentUid || "",
            sourceName: requestData.studentName || studentProfile?.name || "Student",
            requestId: linkId,
            studentId: requestData.studentId || studentProfile?.studentId || "",
            priority: "normal"
        }).catch((error) => {
            console.warn("Student guardian link notification skipped:", error);
        });

        if (requestData.studentUid) {
            await sendAccountNotification({
                userId: requestData.studentUid,
                recipientUid: requestData.studentUid,
                type: "guardian_request_accepted",
                title: "Parent or guardian linked",
                message: `${guardianRecord.name || guardianRecord.email || "Your parent or guardian"} is now connected to your account.`,
                sourceUserId: guardianRecord.uid || "",
                sourceName: guardianRecord.name || guardianRecord.email || "",
                requestId: linkId,
                studentId: requestData.studentId || studentProfile?.studentId || "",
                metadata: {
                    linkOrigin: "student_request",
                    resolvedStatus: "accepted"
                },
                priority: "normal"
            }).catch((error) => {
                console.warn("Student accepted-link notification skipped:", error);
            });
        }

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
export const subscribeToGuardianRequests = (studentId, callback) => {
    const q = query(
        collection(db, "guardian_links"),
        where("studentId", "==", studentId),
        where("status", "==", "pending")
    );

    return onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(requests);
    }, () => callback([]));
};

// (2026-07-13) Dispatch persistent approval notifications; was userId only
export const respondToGuardianLink = async (linkId, response, studentUid, studentProfileData = {}) => {
    try {
        const linkRef = doc(db, "guardian_links", linkId);
        const linkSnap = await getDoc(linkRef);
        if (!linkSnap.exists()) {
            throw new Error("Guardian link request not found.");
        }

        const linkData = linkSnap.data();
        if (response === "accepted") {
            await assertGuardianCapacityForRequest({
                guardianId: linkData.guardianId,
                studentId: linkData.studentId,
                currentLinkId: linkId
            });
        }

        const resolvedStudentProfile = response === "accepted"
            ? {
                studentId: studentProfileData?.studentId || linkData.studentId || "",
                studentName: studentProfileData?.name || ""
            }
            : {};

        const guardianUid = linkData.guardianUid || linkData.guardianId;

        await updateDoc(linkRef, {
            status: response,
            studentUid: studentUid || null,
            guardianUid: guardianUid,
            ...(response === "accepted" ? {
                approvedAt: serverTimestamp(),
                studentId: resolvedStudentProfile.studentId || linkData.studentId || "",
                studentName: resolvedStudentProfile.studentName || linkData.studentName || ""
            } : {}),
            respondedAt: serverTimestamp()
        });

        if (guardianUid) {
            await sendAccountNotification({
                userId: guardianUid,
                recipientUid: guardianUid,
                type: response === "accepted" ? "guardian_request_accepted" : "guardian_request_declined",
                title: response === "accepted" ? "Child link accepted" : "Child link declined",
                message: response === "accepted"
                    ? `${studentProfileData?.name || linkData.studentName || "Your child"} accepted your monitoring request.`
                    : `${studentProfileData?.name || linkData.studentName || "Your child"} declined your monitoring request.`,
                sourceUserId: studentUid || "",
                sourceName: studentProfileData?.name || linkData.studentName || "",
                requestId: linkId,
                studentId: studentProfileData?.studentId || linkData.studentId || "",
                priority: "normal"
            }).catch((error) => {
                console.warn("Guardian response notification skipped:", error);
            });
        }

        if (studentUid) {
            await sendAccountNotification({
                userId: studentUid,
                recipientUid: studentUid,
                type: response === "accepted" ? "guardian_request_accepted" : "guardian_request_declined",
                title: response === "accepted" ? "Parent or guardian linked" : "Parent or guardian request declined",
                message: response === "accepted"
                    ? `${linkData.guardianName || "A parent or guardian"} is now connected to your account.`
                    : `${linkData.guardianName || "A parent or guardian"} request was declined.`,
                sourceUserId: guardianUid || "",
                sourceName: linkData.guardianName || "",
                requestId: linkId,
                studentId: studentProfileData?.studentId || linkData.studentId || "",
                metadata: {
                    resolvedStatus: response,
                    linkOrigin: "guardian_request"
                },
                priority: "normal"
            }).catch((error) => {
                console.warn("Student response notification skipped:", error);
            });
        }
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
export const getAcceptedLinksForGuardian = async (guardianId) => {
    try {
        const q = query(
            collection(db, "guardian_links"),
            where("guardianId", "==", guardianId),
            where("status", "==", "accepted")
        );
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.warn("Error getting accepted guardian links:", error);
        return [];
    }
};

/**
 * Get all links for a guardian (all statuses)
 * @param {string} guardianId
 */
export const getAllLinksForGuardian = async (guardianId) => {
    try {
        const q = query(
            collection(db, "guardian_links"),
            where("guardianId", "==", guardianId)
        );
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.warn("Error getting all guardian links:", error);
        return [];
    }
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
// (2026-07-13) Resolve live and local guardian profile in links; was Firestore only
export const subscribeToStudentLinks = (studentUid, callback) => {
    if (!studentUid) {
        callback([]);
        return () => {};
    }

    const q = query(
        collection(db, "guardian_links"),
        where("studentUid", "==", studentUid)
    );

    let guardianUnsubs = new Map();
    let latestLinks = [];
    let guardianProfiles = new Map();

    // (2026-07-13) Sync guardian profile by email snapshot; was uid only
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
            return {
                ...link,
                guardianName: profile?.name || link.guardianName || "Parent",
                guardianRole: profile?.role || "guardian"
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
    } catch (e) {}

    const handleStorage = (e) => {
        if (!e.key || e.key === LOCAL_USERS_KEY || e.key === 'securo_unlinked_links') notify();
    };
    if (typeof window !== 'undefined') {
        window.addEventListener('storage', handleStorage);
    }

    // (2026-07-13) Filter unlinked guardians and auto-purge; was Firestore filter
    const mainUnsub = onSnapshot(q, (snapshot) => {
        const unlinked = (() => {
            try { return JSON.parse(localStorage.getItem('securo_unlinked_links') || '[]'); } catch (e) { return []; }
        })();

        latestLinks = snapshot.docs
            .map((entry) => ({ id: entry.id, ...entry.data() }))
            .filter((link) => {
                if (link.status !== "accepted" && link.status !== "pending") return false;
                const isUnlinked = unlinked.some((u) => {
                    if (u.linkId && u.linkId === link.id) return true;
                    const gMatch = (u.guardianId && (link.guardianId === u.guardianId || link.guardianUid === u.guardianId)) ||
                        (u.guardianEmail && (link.guardianEmail || '').toLowerCase().trim() === (u.guardianEmail || '').toLowerCase().trim());
                    const sMatch = (u.studentUid && link.studentUid === u.studentUid) ||
                        (u.studentId && String(link.studentId).trim() === String(u.studentId).trim());
                    return gMatch && sMatch;
                });
                if (isUnlinked) {
                    deleteDoc(doc(db, "guardian_links", link.id)).catch(() => {});
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
                                    }).catch(() => {});
                                }
                            });
                        }
                    }
                    notify();
                }, () => {});
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
                                        }).catch(() => {});
                                    }
                                });
                            }
                        }
                        notify();
                    }, () => {});
                    guardianUnsubs.set(emailKey, unsub);
                } catch (e) {}
            }
        });

        notify();
    }, () => callback([]));

    return () => {
        mainUnsub();
        guardianUnsubs.forEach((unsub) => unsub());
        guardianUnsubs.clear();
        if (userSyncChannel) userSyncChannel.close();
        if (typeof window !== 'undefined') {
            window.removeEventListener('storage', handleStorage);
        }
    };
};

// (2026-07-13) Clean up all matching link docs via query; was collection get
export const removeGuardianLink = async (linkId, meta = {}) => {
    let success = false;
    const toDeleteIds = new Set();
    if (linkId) toDeleteIds.add(linkId);

    const currentUid = auth.currentUser?.uid;
    const permittedQueries = [];
    if (currentUid) {
        permittedQueries.push(query(collection(db, "guardian_links"), where("guardianId", "==", currentUid)));
        permittedQueries.push(query(collection(db, "guardian_links"), where("guardianUid", "==", currentUid)));
        permittedQueries.push(query(collection(db, "guardian_links"), where("studentUid", "==", currentUid)));
    }

    for (const qItem of permittedQueries) {
        try {
            const snap = await getDocs(qItem);
            snap.docs.forEach((d) => {
                const data = d.data();
                const targetStudentUid = meta.studentUid;
                const targetStudentId = meta.studentId ? String(meta.studentId).trim() : null;
                const targetGuardianId = meta.guardianId;
                const targetGuardianEmail = meta.guardianEmail ? String(meta.guardianEmail).trim().toLowerCase() : null;

                const matchStudent = (!targetStudentUid && !targetStudentId) ||
                    (targetStudentUid && (data.studentUid === targetStudentUid || data.studentId === targetStudentUid)) ||
                    (targetStudentId && String(data.studentId || "").trim() === targetStudentId);

                const matchGuardian = (!targetGuardianId && !targetGuardianEmail) ||
                    (targetGuardianId && (data.guardianId === targetGuardianId || data.guardianUid === targetGuardianId)) ||
                    (targetGuardianEmail && String(data.guardianEmail || "").trim().toLowerCase() === targetGuardianEmail);

                if (matchStudent && matchGuardian) {
                    toDeleteIds.add(d.id);
                }
            });
        } catch (e) {}
    }

    if (toDeleteIds.size > 0) {
        const deleteOps = Array.from(toDeleteIds).map(async (id) => {
            try {
                await deleteDoc(doc(db, "guardian_links", id));
            } catch (err) {
                await updateDoc(doc(db, "guardian_links", id), { status: "removed" }).catch(() => {});
            }
        });
        await Promise.all(deleteOps);
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
    } catch (e) {}

    try {
        const ch = new BroadcastChannel('securo_users_channel');
        ch.postMessage({ type: 'guardian_link_removed', linkId, meta });
        ch.close();
    } catch (e) {}

    return success;
};

/**
 * Update the student ID in an existing guardian link (sends new request)
 * @param {string} linkId
 * @param {string} newStudentId
 */
export const updateGuardianLinkStudentId = async (linkId, newStudentId) => {
    try {
        const linkRef = doc(db, "guardian_links", linkId);
        await updateDoc(linkRef, {
            studentId: newStudentId,
            status: "pending",
            studentUid: null,
            respondedAt: null,
            createdAt: serverTimestamp()
        });
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
export const updateStudentLiveLocation = async (studentUid, location) => {
    try {
        await setDoc(doc(db, "student_locations", studentUid), {
            studentUid,
            lat: location.lat,
            lng: location.lng,
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
    } catch (e) {}

    if (!isNaN(numId)) {
        try {
            const q2 = query(collection(db, "users"), where("studentId", "==", numId));
            const snap2 = await getDocs(q2);
            if (!snap2.empty) {
                const u = snap2.docs[0];
                return { uid: u.id, ...u.data() };
            }
        } catch (e) {}
    }

    try {
        const allUsers = await getAllUsers();
        const found = allUsers.find(u => String(u.studentId || '').trim() === rawId || String(u.id || '').trim() === rawId);
        if (found) {
            return { uid: found.uid || found.id, ...found };
        }
    } catch (e) {}

    try {
        const local = readLocalUsers();
        const found = local.find(u => String(u.studentId || '').trim() === rawId || String(u.id || '').trim() === rawId);
        if (found) {
            return { uid: found.uid || found.id, ...found };
        }
    } catch (e) {}

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
        } catch (e) {}

        if (rawEmail !== normalized) {
            try {
                const q2 = query(collection(db, "users"), where("email", "==", rawEmail));
                const snap2 = await getDocs(q2);
                if (!snap2.empty) {
                    const u = snap2.docs[0];
                    return { uid: u.id, ...u.data() };
                }
            } catch (e) {}
        }

        try {
            const q3 = query(collection(db, "users"), where("personalEmail", "==", normalized));
            const snap3 = await getDocs(q3);
            if (!snap3.empty) {
                const u = snap3.docs[0];
                return { uid: u.id, ...u.data() };
            }
        } catch (e) {}

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
// (2026-07-13) Persist recipientUid, priority, status in notifs; was userId only
export const sendAccountNotification = async (payload) => {
    const targetUid = payload?.recipientUid || payload?.userId;
    if (!targetUid) {
        throw new Error("Notification recipient is required.");
    }

    try {
        const isRead = payload.isRead === true || payload.read === true;
        const notificationData = {
            recipientUid: targetUid,
            userId: targetUid,
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

// (2026-07-13) Query without composite index to prevent disappearing alerts; was order
export const subscribeToAccountNotifications = (userId, callback) => {
    if (!userId) return () => {};

    try {
        const mergeNotifications = (snap1, snap2) => {
            const map = new Map();
            if (snap1?.docs) {
                snap1.docs.forEach((d) => map.set(d.id, { id: d.id, ...d.data() }));
            }
            if (snap2?.docs) {
                snap2.docs.forEach((d) => map.set(d.id, { id: d.id, ...d.data() }));
            }
            const list = Array.from(map.values()).sort((a, b) => {
                const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
                const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
                return timeB - timeA;
            });
            return list.slice(0, 50);
        };

        let s1 = null, s2 = null;
        const emit = () => {
            if (s1 !== null || s2 !== null) {
                callback(mergeNotifications(s1, s2));
            }
        };

        const q1 = query(collection(db, "notifications"), where("userId", "==", userId), limit(50));
        const q2 = query(collection(db, "notifications"), where("recipientUid", "==", userId), limit(50));

        const unsub1 = onSnapshot(q1, (snap) => { s1 = snap; emit(); }, (err) => { console.warn("Notif q1 warn:", err); s1 = { docs: [] }; emit(); });
        const unsub2 = onSnapshot(q2, (snap) => { s2 = snap; emit(); }, (err) => { console.warn("Notif q2 warn:", err); s2 = { docs: [] }; emit(); });

        return () => { unsub1(); unsub2(); };
    } catch (e) {
        console.warn("Notification subscription fallback:", e);
        callback([]);
        return () => {};
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

export const subscribeToStudentSOS = (studentUid, callback) => {
    if (!studentUid) return () => {};
    try {
        const q = query(collection(db, "sos_logs"), where("userId", "==", studentUid), where("status", "==", "active"));
        return onSnapshot(q, (snap) => {
            const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(logs);
        }, (err) => {
            console.warn("SOS listener error:", err);
            callback([]);
        });
    } catch (e) {
        return () => {};
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

    try {
        const docRef = await addDoc(collection(db, "gad_messages"), {
            ...payload,
            createdAt: serverTimestamp()
        });

        sendAccountNotification({
            userId: 'admin',
            type: 'gad',
            title: 'GAD Support Activity',
            message: isAnon ? 'A new confidential GAD report was submitted.' : `New GAD report from ${messageData.studentName || 'Student'}.`,
            sourceUserId: messageData.studentUid || '',
            sourceName: isAnon ? 'Confidential' : (messageData.studentName || 'Student'),
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
            const remote = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const merged = [...remote];
            local.forEach(l => {
                if (!merged.some(r => r.id === l.id)) merged.push(l);
            });
            merged.sort((a, b) => {
                const aT = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
                const bT = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
                return bT - aT;
            });
            callback(merged);
// (2026-07-13) Fix catch block in subscribeToGADMessages; was catch without param
        }, () => callback(local));
    } catch (e) {
        return () => {};
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
            try { campusMapBroadcast.postMessage({ geofence: cleanGeofence, buildings: cleanBuildings }); } catch (e) {}
        }
        try {
            window.dispatchEvent(new CustomEvent("securo_campus_map_updated", { detail: { geofence: cleanGeofence, buildings: cleanBuildings } }));
            window.dispatchEvent(new Event("storage"));
        } catch (e) {}

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
        ]).catch(() => {});
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
        } catch (e) {}
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
    } catch (e) {}

    const handleSnap = (snap) => {
        if (snap && snap.exists()) {
            const data = snap.data();
            let geofence = null;
            if (data.geofenceJson) {
                try { geofence = JSON.parse(data.geofenceJson); } catch (e) {}
            }
            if (!geofence && Array.isArray(data.geofence)) {
                geofence = data.geofence.map(pt => [Number(pt.lat ?? pt[0]), Number(pt.lng ?? pt[1])]);
            }
            if (Array.isArray(geofence) && geofence.length >= 3) {
                localStorage.setItem("securo_custom_geofence", JSON.stringify(geofence));
            }

            let buildings = null;
            if (data.buildingsJson) {
                try { buildings = JSON.parse(data.buildingsJson); } catch (e) {}
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
            } catch (e) {}
        }
    };

    try {
        onSnapshot(doc(db, "system_settings", "campus_map"), handleSnap, () => {});
    } catch (e) {}
    try {
        onSnapshot(doc(db, "campus_config", "map"), handleSnap, () => {});
    } catch (e) {}
    try {
        return onSnapshot(doc(db, "emergency_posts", "campus_map_config"), handleSnap, () => callback(getLocal()));
    } catch (e) {
        return () => {};
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
                    try { geofence = JSON.parse(data.geofenceJson); } catch (e) {}
                }
                if (!geofence && Array.isArray(data.geofence)) {
                    geofence = data.geofence.map(pt => [Number(pt.lat ?? pt[0]), Number(pt.lng ?? pt[1])]);
                }
                if (Array.isArray(geofence) && geofence.length >= 3) {
                    localStorage.setItem("securo_custom_geofence", JSON.stringify(geofence));
                }

                let buildings = null;
                if (data.buildingsJson) {
                    try { buildings = JSON.parse(data.buildingsJson); } catch (e) {}
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
        } catch (e) {}
    }

    try {
        const g = localStorage.getItem("securo_custom_geofence");
        const b = localStorage.getItem("securo_campus_buildings");
        return {
            geofence: g ? JSON.parse(g) : null,
            buildings: b ? JSON.parse(b) : null
        };
    } catch (e) {}
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

// (2026-07-13) Admin password override store & lookup helpers; was absent
export const saveAdminUserPassword = async (userId, email, password) => {
    const normEmail = String(email || '').trim().toLowerCase();
    try {
        if (userId) {
            await setDoc(doc(db, "users", userId), {
                password,
                passwordUpdatedAt: serverTimestamp()
            }, { merge: true }).catch(() => {});
        }
        if (normEmail) {
            await setDoc(doc(db, "user_passwords", normEmail), {
                email: normEmail,
                password,
                updatedAt: serverTimestamp()
            }, { merge: true }).catch(() => {});
            localStorage.setItem('securo_admin_pwd_' + normEmail, password);
        }
    } catch (e) {
        if (normEmail) localStorage.setItem('securo_admin_pwd_' + normEmail, password);
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
        const users = readLocalUsers();
        const found = users.find(u => String(u.email || '').toLowerCase() === normEmail);
        if (found?.password) return found.password;
    } catch (_) {}
    return localStorage.getItem('securo_admin_pwd_' + normEmail) || null;
};
