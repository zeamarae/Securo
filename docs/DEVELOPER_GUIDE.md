# Securo v2.0 - Developer Quick Reference
**For Developers Working on Securo**

---

## 📁 **Project Structure**

```
securo/
├── index.html              # Main student dashboard
├── login.html              # Universal login page
├── admin.html              # Admin control panel
├── admin-analytics.html    # Analytics dashboard
├── admin-login.html        # Admin-specific login
├── guardian.html           # Guardian registration
├── guardian-dashboard.html # Guardian control panel
├── profile.html            # User profile page
├── settings.html           # Settings page
├── permissions-onboarding.html # Permission flow
├── incident-report.html    # Incident viewer
├── role-selection.html     # Role picker
├── terms.html              # Terms and conditions
│
├── firebase-config.js      # Firebase initialization
├── auth.js                 # Authentication logic
├── db.js                   # Database operations (2867 lines!)
├── router.js               # Unified routing system
├── utils.js                # Utility library
├── emergency-contacts.js   # Emergency dial system
├── install-sw.js           # Service worker installer
├── service-worker.js       # Offline support
│
├── manifest.json           # PWA manifest
├── firestore.rules         # Firestore security rules
├── IMPLEMENTATION_LOG.md   # Detailed change log
├── DEPLOYMENT_GUIDE.md     # Deployment instructions
├── FEATURES.md             # Complete feature list
└── DEVELOPER_GUIDE.md      # This file
```

---

## 🔧 **Common Development Tasks**

### **1. Adding a New Feature**

```javascript
// 1. Import utilities
import { Logger, UI, Validation } from './utils.js';

// 2. Log what you're doing
Logger.info('FeatureName', 'Feature initialized');

// 3. Add validation
const result = Validation.email(inputValue);
if (!result.valid) {
    UI.showToast(result.error, 'error');
    return;
}

// 4. Show loading state
UI.setButtonLoading(button, true);

// 5. Do your work
try {
    await yourAsyncFunction();
    UI.showToast('Success!', 'success');
} catch (error) {
    Logger.error('FeatureName', 'Operation failed', error);
    UI.showToast('Something went wrong', 'error');
} finally {
    UI.setButtonLoading(button, false);
}
```

### **2. Adding a New Database Function**

```javascript
// In db.js

/**
 * Brief description of what this does
 * @param {string} userId - User ID
 * @param {object} data - Data object
 * @returns {Promise<boolean>}
 */
export const yourNewFunction = async (userId, data) => {
    try {
        // Always log important operations
        Logger.info('DB', 'Starting operation', { userId });
        
        // Your Firestore operation
        await setDoc(doc(db, "collection", userId), data);
        
        return true;
    } catch (error) {
        // Handle permission errors gracefully
        if (isPermissionDeniedError(error)) {
            Logger.warn('DB', 'Permission denied, using fallback');
            // Save to localStorage as fallback
            upsertLocalUser(userId, data);
            return true;
        }
        
        Logger.error('DB', 'Operation failed', error);
        throw error;
    }
};
```

### **3. Adding a New HTML Page**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Securo - Page Title</title>
    
    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=swap" rel="stylesheet">
    
    <!-- Router -->
    <script src="router.js"></script>
</head>
<body>
    <!-- Your content here -->
    
    <script type="module">
        // ALWAYS import these first
        import { Logger, UI, Permissions, Validation } from './utils.js';
        import './install-sw.js'; // Service worker
        
        import { auth } from './firebase-config.js';
        import { checkAuth } from './auth.js';
        import { getUserProfile } from './db.js';
        
        // Check authentication
        checkAuth();
        
        // Your page logic here
        Logger.info('PageName', 'Page initialized');
    </script>
</body>
</html>
```

---

## 🎯 **Best Practices**

### **Error Handling**
```javascript
// ❌ DON'T
console.log('Error:', error);
console.warn('Warning:', warning);

// ✅ DO
Logger.error('Context', 'Error message', error);
Logger.warn('Context', 'Warning message', data);
Logger.info('Context', 'Info message', data);
```

### **User Feedback**
```javascript
// ❌ DON'T
alert('Success!');

// ✅ DO
UI.showToast('Operation successful', 'success');
UI.showToast('Something went wrong', 'error');
UI.showToast('Please wait...', 'info');
```

### **Loading States**
```javascript
// ❌ DON'T
button.disabled = true;
button.textContent = 'Loading...';

// ✅ DO
UI.setButtonLoading(button, true);
// ... do work ...
UI.setButtonLoading(button, false);
```

### **Validation**
```javascript
// ❌ DON'T
if (!email.includes('@')) {
    return false;
}

// ✅ DO
const result = Validation.email(email);
if (!result.valid) {
    UI.showToast(result.error, 'error');
    return;
}
```

### **Async Operations**
```javascript
// ❌ DON'T (no error handling)
const data = await fetchData();

// ✅ DO
try {
    const data = await fetchData();
    // handle success
} catch (error) {
    Logger.error('Context', 'Fetch failed', error);
    UI.showToast('Failed to load data', 'error');
}
```

---

## 🔐 **Security Guidelines**

### **Authentication Checks**
```javascript
// Always check auth before accessing protected resources
import { checkAuth } from './auth.js';
checkAuth(); // Redirects to login if not authenticated

// Check user role
if (appState.user.role !== 'admin') {
    window.location.href = 'index.html';
}
```

### **Firestore Queries**
```javascript
// ❌ DON'T query without user context
const q = query(collection(db, "users"));

// ✅ DO query user's own data
const q = query(
    collection(db, "users"),
    where("userId", "==", auth.currentUser.uid)
);
```

### **Input Sanitization**
```javascript
// Always validate and sanitize user input
const result = Validation.studentId(input.value.trim());
if (!result.valid) {
    return;
}
const sanitizedId = result.value; // Use this, not raw input
```

---

## 📦 **Utils.js API Reference**

### **Logger**
```javascript
Logger.error(context, message, errorObject);
Logger.warn(context, message, dataObject);
Logger.info(context, message, dataObject);
```

### **UI**
```javascript
UI.showToast(message, type, duration);
UI.setButtonLoading(button, isLoading);
UI.showModal(title, message, options);
UI.showLoadingOverlay(message);
UI.hideLoadingOverlay();
```

### **Validation**
```javascript
Validation.studentId(id);        // Returns {valid, value, format, error}
Validation.email(email);          // Returns {valid, value, error}
Validation.password(pwd, options); // Returns {valid, strength, error}
Validation.name(name);            // Returns {valid, value, error}
Validation.phoneNumber(phone);    // Returns {valid, value, error}
```

### **Permissions**
```javascript
await Permissions.checkCamera();
await Permissions.requestCamera();
await Permissions.checkLocation();
await Permissions.requestLocation();
await Permissions.getCurrentLocation(options);
Permissions.shouldShowPermissionOnboarding();
```

### **Format**
```javascript
Format.date(timestamp, 'relative'); // "5m ago"
Format.fileSize(bytes);             // "2.5 MB"
Format.initials(name);              // "JD"
Format.truncate(text, maxLength);   // "Hello wo..."
```

### **Storage**
```javascript
Storage.set(key, value);
Storage.get(key, defaultValue);
Storage.remove(key);
Storage.clear();
```

### **Network**
```javascript
Network.isOnline();
Network.onStatusChange(callback);
await Network.checkFirestoreConnection();
```

### **Device**
```javascript
Device.isMobile();
Device.isIOS();
Device.isAndroid();
Device.hasNotch();
await Device.getBatteryLevel();
```

---

## 🗃️ **Database (db.js) Key Functions**

### **User Management**
```javascript
await saveUserProfile(userId, profileData);
await getUserProfile(userId);
await updateUserProfile(userId, data);
await isStudentIdTaken(studentId);
```

### **Emergency**
```javascript
await logSOS(userId, location, metadata);
await saveEmergencyPost(payload);
await getUserEmergencyPosts(userId);
await deleteEmergencyPost(postId);
```

### **Attendance**
```javascript
await logAttendance(userId, type, location); // type: 'in' or 'out'
await getAttendanceHistory(userId);
await getAllAttendance(); // Admin
```

### **Guardian Links**
```javascript
await getLinksForStudent(studentId, uid);
await createGuardianLinkRequest(guardianUid, studentId);
await respondToGuardianLink(linkId, status, studentUid, data);
await removeGuardianLink(linkId);
```

### **Notifications**
```javascript
await sendAccountNotification(notificationData);
await getUserNotifications(userId);
await markNotificationAsRead(notifId);
subscribeToNotifications(userId, callback);
```

### **Analytics**
```javascript
await getAttendanceStats(dateRange);
await getSOSStats(dateRange);
await getUserActivitySummary(userId);
```

### **Audit Logging**
```javascript
await logAuditEvent(userId, eventType, metadata);
await getUserAuditLogs(userId);
await getAllAuditLogs(); // Admin
```

### **Offline Queue**
```javascript
await queueOfflineOperation(operation);
await processOfflineQueue();
await getOfflineQueueSize();
```

---

## 🐛 **Debugging Tips**

### **Check Service Worker**
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => console.log(reg));
});
```

### **Check LocalStorage**
```javascript
// View all Securo data
Object.keys(localStorage)
    .filter(key => key.startsWith('securo_'))
    .forEach(key => {
        console.log(key, localStorage.getItem(key));
    });
```

### **Check Firestore Connection**
```javascript
import { Network } from './utils.js';
const connected = await Network.checkFirestoreConnection();
console.log('Firestore connected:', connected);
```

### **Check Auth State**
```javascript
import { auth } from './firebase-config.js';
auth.onAuthStateChanged(user => {
    console.log('Current user:', user);
});
```

### **Enable Verbose Logging**
```javascript
// Temporarily set this at the top of your script
window.SECURO_DEBUG = true;

// Then Logger will output more details
```

---

## 🚦 **Common Error Messages**

### **"permission-denied"**
- **Cause:** Firestore security rules blocking the operation
- **Fix:** Check `firestore.rules` and ensure rules match your operation
- **Workaround:** Many functions have LocalStorage fallback

### **"User not found"**
- **Cause:** Profile not created yet or deleted
- **Fix:** Ensure `saveUserProfile()` was called after registration

### **"Service worker registration failed"**
- **Cause:** HTTPS required or browser incompatibility
- **Fix:** Use localhost or deploy to HTTPS. Check browser support.

### **"Camera permission denied"**
- **Cause:** User denied permission or browser settings block it
- **Fix:** Guide user to browser settings or use fallback (gallery upload)

---

## 📝 **Code Style Guide**

### **Naming Conventions**
```javascript
// Variables: camelCase
const userName = 'John';

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5000000;

// Functions: camelCase (verb + noun)
function getUserProfile() {}

// Classes: PascalCase
class UserManager {}

// Private functions: _prefixed
function _internalHelper() {}
```

### **Comments**
```javascript
// Use JSDoc for functions
/**
 * Get user profile from database
 * @param {string} userId - Firebase user ID
 * @returns {Promise<object|null>} User profile or null
 */
export const getUserProfile = async (userId) => {};

// Use inline comments for complex logic
// Check if user is within campus boundary before auto check-in
if (isWithinGeofence(lat, lng)) {
    // ... code
}

// Use date stamps for significant changes
// (2026-10-06) Added offline queue support; was direct Firestore only
```

---

## 🧪 **Testing Checklist**

### **Before Committing**
- [ ] Test authentication flow (login/logout/register)
- [ ] Test on mobile (Chrome DevTools device emulation)
- [ ] Check browser console for errors
- [ ] Verify service worker registered successfully
- [ ] Test offline functionality
- [ ] Check Firestore rules (no permission errors)
- [ ] Test with different user roles

### **Before Deploying**
- [ ] Update `firebase-config.js` with production credentials
- [ ] Deploy `firestore.rules` to Firebase
- [ ] Test on real mobile devices
- [ ] Verify PWA installation works
- [ ] Check all external links work
- [ ] Test emergency features (SOS, contacts)
- [ ] Verify admin panel access restricted

---

## 🔗 **Useful Resources**

### **Documentation**
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA](https://web.dev/progressive-web-apps/)

### **Tools**
- [Firebase Console](https://console.firebase.google.com)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) (PWA audit)

---

## 💡 **Quick Commands**

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Test Firestore rules locally
firebase emulators:start --only firestore

# Clear browser cache (DevTools)
# Application → Storage → Clear site data

# Unregister service worker (DevTools)
# Application → Service Workers → Unregister
```

---

## 🆘 **Getting Help**

1. **Check Implementation Log:** `IMPLEMENTATION_LOG.md`
2. **Check Features Doc:** `FEATURES.md`
3. **Check Deployment Guide:** `DEPLOYMENT_GUIDE.md`
4. **Search in db.js:** Most functions are documented
5. **Check browser console:** Logger outputs detailed errors
6. **Check Firebase Console:** For Firestore errors and logs

---

**Happy Coding! 🚀**
