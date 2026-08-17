/**
 * Database Logic
 * Date: 2026-05-01
 * Description: Handles Firestore database operations.
 */

import { db } from './firebase-config.js';
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

const LOCAL_EMERGENCY_POSTS_KEY = "securo_emergency_posts_local";
const LOCAL_USERS_KEY = "securo_users_local";

const readLocalEmergencyPosts = () => {
    try {
        const raw = localStorage.getItem(LOCAL_EMERGENCY_POSTS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn("Error reading local emergency posts:", error);
        return [];
    }
};

const writeLocalEmergencyPosts = (posts) => {
    try {
        localStorage.setItem(LOCAL_EMERGENCY_POSTS_KEY, JSON.stringify(posts));
    } catch (error) {
        console.warn("Error writing local emergency posts:", error);
    }
};

const readLocalUsers = () => {
    try {
        const raw = localStorage.getItem(LOCAL_USERS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn("Error reading local users:", error);
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
        console.warn("Error writing local users:", error);
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
// (2026-07-13) Save reporter metadata with SOS log; was userId only
export const logSOS = async (userId, location, metadata = {}) => {
    try {
        const localUsers = readLocalUsers();
        const fallback = localUsers.find(u => String(u.id || u.uid || '') === String(userId)) || {};
        await addDoc(collection(db, "sos_logs"), {
            userId,
            userName: metadata.userName || fallback.name || "",
            userEmail: metadata.userEmail || fallback.email || "",
            studentId: metadata.studentId || fallback.studentId || "",
            role: metadata.role || fallback.role || "student",
            location,
            timestamp: serverTimestamp(),
            status: "active"
        });
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
export const saveGADPost = async (postData) => {
    try {
        await addDoc(collection(db, "gad_posts"), {
            ...postData,
            likes: 0,
            likedBy: [],
            createdAt: serverTimestamp()
        });
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

export const getAllChatThreadsOnce = async () => {
    try {
        const snapshot = await getDocs(query(collection(db, "messages"), orderBy("timestamp", "desc")));
        const threadsMap = new Map();

        snapshot.docs.forEach((entry) => {
            const payload = { id: entry.id, ...entry.data() };
            if (payload.threadId && !threadsMap.has(payload.threadId)) {
                threadsMap.set(payload.threadId, payload);
            }
        });

        return Array.from(threadsMap.values());
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
export const sendChatMessage = async (senderId, receiverId, text, senderName, options = {}) => {
    const threadId = options.threadId || [senderId, receiverId].sort().join("_");
    try {
        await addDoc(collection(db, "messages"), {
            threadId,
            senderId,
            receiverId,
            text,
            senderName: senderName || "User",
            supportMode: options.supportMode || "",
            isAnonymous: !!options.isAnonymous,
            senderLabel: options.senderLabel || "",
            ownerId: options.ownerId || "",
            anonymousSessionId: options.anonymousSessionId || "",
            timestamp: serverTimestamp(),
            read: false
        });
        return true;
    } catch (error) {
        console.warn("Error sending chat message:", error);
        throw error;
    }
};

/**
 * Messaging: Get all chat threads (for Admin)
 */
export const getAllChatThreads = (callback) => {
    const q = query(
        collection(db, "messages"),
        orderBy("timestamp", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Group by threadId and get latest message
        const threadsMap = new Map();
        messages.forEach(msg => {
            if (!threadsMap.has(msg.threadId)) {
                threadsMap.set(msg.threadId, msg);
            }
        });
        callback(Array.from(threadsMap.values()));
    }, () => callback([]));
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

const MAX_GUARDIANS_PER_STUDENT = 3;
const MAX_CHILDREN_PER_GUARDIAN = 1;

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

    const emailQuery = query(
        collection(db, "guardian_links"),
        where("guardianEmail", "==", guardianEmail)
    );
    const emailSnapshot = await getDocs(emailQuery);
    const emailMatch = emailSnapshot.docs
        .map((entry) => ({ id: entry.id, ...entry.data() }))
        .find((link) => doesGuardianLinkMatchStudent(link, studentId, studentUid));

    return emailMatch || null;
};

const assertGuardianCapacityForRequest = async ({ guardianId, studentId, currentLinkId = null }) => {
    const guardianLinks = await getGuardianLinkRecords(guardianId);
    const activeGuardianLinks = guardianLinks.filter((link) =>
        link.id !== currentLinkId &&
        (link.status === "accepted" || link.status === "pending")
    );

    const differentStudentActiveLink = activeGuardianLinks.find((link) => String(link.studentId) !== String(studentId));
    if (differentStudentActiveLink && MAX_CHILDREN_PER_GUARDIAN === 1) {
        throw new Error("Guardian accounts can only link to one child at a time.");
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

/**
 * Create a guardian link request (pending consent from student)
 * @param {object} linkData { guardianId, guardianName, guardianEmail, studentId }
 */
export const createGuardianLinkRequest = async (linkData) => {
    try {
        await assertGuardianCapacityForRequest(linkData);

        const existingLink = await findExistingGuardianStudentLink({
            guardianId: linkData.guardianId,
            guardianEmail: linkData.guardianEmail,
            studentId: linkData.studentId,
            studentUid: linkData.studentUid
        });
        if (existingLink) {
            const data = existingLink;
            if (data.status === "accepted") {
                throw new Error("You are already linked to this student.");
            }
            if (data.status === "pending") {
                throw new Error("A link request is already pending for this student.");
            }
            // If rejected, allow re-request by updating
            await assertGuardianCapacityForRequest({
                guardianId: linkData.guardianId,
                studentId: linkData.studentId,
                currentLinkId: existingLink.id
            });
            await updateDoc(doc(db, "guardian_links", existingLink.id), {
                ...linkData,
                status: "pending",
                createdAt: serverTimestamp(),
                respondedAt: null
            });
            const studentRecord = await findStudentUidByStudentId(linkData.studentId).catch(() => null);
            if (studentRecord?.uid) {
                await sendAccountNotification({
                    userId: studentRecord.uid,
                    type: "guardian_request",
                    title: "Guardian tracking request",
                    message: `${linkData.guardianName || "A parent or guardian"} wants to link to your account.`,
                    sourceUserId: linkData.guardianId || "",
                    sourceName: linkData.guardianName || "",
                    requestId: existingLink.id,
                    studentId: linkData.studentId || ""
                }).catch((error) => {
                    console.warn("Guardian request notification skipped:", error);
                });
            }
            return existingLink.id;
        }

        const docRef = await addDoc(collection(db, "guardian_links"), {
            ...linkData,
            status: "pending",
            createdAt: serverTimestamp(),
            respondedAt: null
        });
        const studentRecord = await findStudentUidByStudentId(linkData.studentId).catch(() => null);
        if (studentRecord?.uid) {
            await sendAccountNotification({
                userId: studentRecord.uid,
                type: "guardian_request",
                title: "Guardian tracking request",
                message: `${linkData.guardianName || "A parent or guardian"} wants to link to your account.`,
                sourceUserId: linkData.guardianId || "",
                sourceName: linkData.guardianName || "",
                requestId: docRef.id,
                studentId: linkData.studentId || ""
            }).catch((error) => {
                console.warn("Guardian request notification skipped:", error);
            });
        }
        return docRef.id;
    } catch (error) {
        console.warn("Error creating guardian link request:", error);
        throw error;
    }
};

/**
 * Student-initiated guardian link using a registered guardian account.
 * This is immediately accepted because the student is the one granting consent.
 * @param {object} requestData { studentUid, studentId, studentName, guardianEmail, guardianName }
 */
export const createGuardianLinkFromStudent = async (requestData) => {
    try {
        const guardianRecord = await findUserByEmail(requestData.guardianEmail);
        if (!guardianRecord?.uid) {
            throw new Error("No registered parent or guardian account was found with that email.");
        }

        if (inferUserRole(guardianRecord) !== "guardian") {
            throw new Error("That registered account is not a guardian account.");
        }

        const existingLink = await findExistingGuardianStudentLink({
            guardianId: guardianRecord.uid,
            guardianEmail: guardianRecord.email || requestData.guardianEmail || "",
            studentId: requestData.studentId,
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
            studentId: requestData.studentId,
            currentLinkId: existingLink?.id || null
        });

        const linkPayload = {
            guardianId: guardianRecord.uid,
            guardianName: guardianRecord.name || requestData.guardianName || guardianRecord.email || "Guardian",
            guardianEmail: guardianRecord.email || requestData.guardianEmail || "",
            studentId: requestData.studentId || "",
            studentUid: requestData.studentUid || "",
            studentName: requestData.studentName || "",
            status: "accepted",
            createdAt: serverTimestamp(),
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
            type: "student_guardian_request",
            title: "Student linked your guardian account",
            message: `${requestData.studentName || "A student"} added you as their parent or guardian.`,
            sourceUserId: requestData.studentUid || "",
            sourceName: requestData.studentName || "",
            requestId: linkId,
            studentId: requestData.studentId || ""
        }).catch((error) => {
            console.warn("Student guardian link notification skipped:", error);
        });

        if (requestData.studentUid) {
            await sendAccountNotification({
                userId: requestData.studentUid,
                type: "guardian_request_accepted",
                title: "Parent or guardian linked",
                message: `${guardianRecord.name || guardianRecord.email || "Your parent or guardian"} is now connected to your account.`,
                sourceUserId: guardianRecord.uid || "",
                sourceName: guardianRecord.name || guardianRecord.email || "",
                requestId: linkId,
                studentId: requestData.studentId || "",
                metadata: {
                    linkOrigin: "student_request",
                    resolvedStatus: "accepted"
                }
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

/**
 * Respond to a guardian link request (accept or reject)
 * @param {string} linkId
 * @param {string} response - "accepted" or "rejected"
 * @param {string} studentUid - The student's Firebase UID
 */
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

        await updateDoc(linkRef, {
            status: response,
            studentUid: studentUid || null,
            ...(response === "accepted" ? {
                studentId: resolvedStudentProfile.studentId || linkData.studentId || "",
                studentName: resolvedStudentProfile.studentName || linkData.studentName || ""
            } : {}),
            respondedAt: serverTimestamp()
        });

        if (linkData.guardianId) {
            await sendAccountNotification({
                userId: linkData.guardianId,
                type: response === "accepted" ? "guardian_request_accepted" : "guardian_request_declined",
                title: response === "accepted" ? "Child link accepted" : "Child link declined",
                message: response === "accepted"
                    ? `${studentProfileData?.name || linkData.studentName || "Your child"} accepted your monitoring request.`
                    : `${studentProfileData?.name || linkData.studentName || "Your child"} declined your monitoring request.`,
                sourceUserId: studentUid || "",
                sourceName: studentProfileData?.name || linkData.studentName || "",
                requestId: linkId,
                studentId: studentProfileData?.studentId || linkData.studentId || ""
            }).catch((error) => {
                console.warn("Guardian response notification skipped:", error);
            });
        }

        if (studentUid) {
            await sendAccountNotification({
                userId: studentUid,
                type: response === "accepted" ? "guardian_request_accepted" : "guardian_request_declined",
                title: response === "accepted" ? "Parent or guardian linked" : "Parent or guardian request declined",
                message: response === "accepted"
                    ? `${linkData.guardianName || "A parent or guardian"} is now connected to your account.`
                    : `${linkData.guardianName || "A parent or guardian"} request was declined.`,
                sourceUserId: linkData.guardianId || "",
                sourceName: linkData.guardianName || "",
                requestId: linkId,
                studentId: studentProfileData?.studentId || linkData.studentId || "",
                metadata: {
                    resolvedStatus: response,
                    linkOrigin: "guardian_request"
                }
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
export const subscribeToStudentLinks = (studentUid, callback) => {
    if (!studentUid) {
        callback([]);
        return () => {};
    }

    const q = query(
        collection(db, "guardian_links"),
        where("studentUid", "==", studentUid)
    );

    return onSnapshot(q, (snapshot) => {
        const links = snapshot.docs
            .map((entry) => ({ id: entry.id, ...entry.data() }))
            .filter((link) => link.status === "accepted" || link.status === "pending");
        callback(links);
    }, () => callback([]));
};

/**
 * Remove a guardian link (student-initiated unlink)
 * @param {string} linkId
 */
export const removeGuardianLink = async (linkId) => {
    try {
        await deleteDoc(doc(db, "guardian_links", linkId));
        return true;
    } catch (error) {
        console.warn("Error removing guardian link:", error);
        throw error;
    }
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

/**
 * Find a student UID by their student ID
 * @param {string} studentId
 */
export const findStudentUidByStudentId = async (studentId) => {
    try {
        const q = query(collection(db, "users"), where("studentId", "==", studentId));
        const snap = await getDocs(q);
        if (!snap.empty) {
            const userData = snap.docs[0];
            return { uid: userData.id, ...userData.data() };
        }
        return null;
    } catch (error) {
        console.warn("Error finding student by ID:", error);
        return null;
    }
};

/**
 * Find a user by registered email
 * @param {string} email
 */
export const findUserByEmail = async (email) => {
    try {
        const normalized = normalizeEmail(email);
        if (!normalized) return null;
        const q = query(collection(db, "users"), where("email", "==", normalized));
        const snap = await getDocs(q);
        if (!snap.empty) {
            const userData = snap.docs[0];
            return { uid: userData.id, ...userData.data() };
        }

        const users = await getAllUsers().catch(() => []);
        const fallbackUser = users.find((user) => normalizeEmail(user?.email) === normalized);
        if (fallbackUser) {
            return {
                uid: fallbackUser.uid || fallbackUser.userId || fallbackUser.id || "",
                ...fallbackUser,
                email: fallbackUser.email || normalized
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
export const sendAccountNotification = async (payload) => {
    if (!payload?.userId) {
        throw new Error("Notification recipient is required.");
    }

    const docRef = await addDoc(collection(db, "notifications"), {
        userId: payload.userId,
        type: payload.type || "info",
        title: payload.title || "Notification",
        message: payload.message || "",
        sourceUserId: payload.sourceUserId || "",
        sourceName: payload.sourceName || "",
        requestId: payload.requestId || "",
        studentId: payload.studentId || "",
        metadata: payload.metadata || {},
        resolvedStatus: payload.resolvedStatus || "",
        isRead: payload.isRead === true,
        readAt: payload.isRead === true ? serverTimestamp() : null,
        createdAt: payload.createdAt || serverTimestamp()
    });

    return docRef.id;
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

// (2026-07-13) Add subscribeToAccountNotifications for real-time notifications; was missing export
export const subscribeToAccountNotifications = (userId, callback) => {
    if (!userId) return () => {};

    try {
        const q = query(
            collection(db, "notifications"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc"),
            limit(40)
        );

        return onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(notifications);
        }, (error) => {
            console.warn("Firestore notification subscription error:", error);
            callback([]);
        });
    } catch (e) {
        console.warn("Notification subscription fallback:", e);
        callback([]);
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
