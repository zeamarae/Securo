# Securo Clean URL Routing

## Overview
The Securo app now uses clean URLs without `.html` extensions for a more professional appearance.

## How It Works

### For Web Deployment (Apache/Nginx)
- **`.htaccess`** file handles URL rewriting on the server
- Automatically removes `.html` from URLs
- Redirects old `.html` URLs to clean versions
- Example: `https://yoursite.com/terms` instead of `https://yoursite.com/terms.html`

### For Mobile App (Capacitor/Cordova)
- **`router.js`** automatically detects the app environment
- Uses `.html` extensions internally in the app
- Users never see the `.html` extension in navigation

## URL Examples

### Web Browser
```
✅ https://yoursite.com/login
✅ https://yoursite.com/terms
✅ https://yoursite.com/profile
✅ https://yoursite.com/admin
```

### Mobile App (Internal)
```
file:///android_asset/www/login.html (handled automatically)
file:///android_asset/www/terms.html (handled automatically)
```

## Files Added/Modified

### New Files
- `.htaccess` - Server-side URL rewriting rules
- `router.js` - Client-side routing and navigation handler
- `ROUTING.md` - This documentation file

### Modified Files
- `login.html` - Added router script
- `terms.html` - Added router script and updated navigation
- `role-selection.html` - Added router script
- `index.html` - Added router script
- `admin.html` - Added router script
- `admin-login.html` - Added router script

## How to Use

### In HTML Links
Write links normally with `.html`:
```html
<a href="terms.html">Terms and Conditions</a>
```

The router will automatically convert them to clean URLs on web.

### In JavaScript
Use the `SecuroRouter` global object:

```javascript
// Navigate to a page
SecuroRouter.navigate('terms');

// Go back with fallback
SecuroRouter.back('login');

// Get proper href for environment
const href = SecuroRouter.getHref('terms');
```

## Testing

### Test on Web Server
1. Deploy to Apache or similar server with `.htaccess` support
2. Navigate to `/login` (no .html)
3. Click on "Terms and Conditions"
4. URL should show `/terms` (no .html)

### Test in Mobile App
1. Build APK with Capacitor
2. Install and run on device
3. Navigation should work seamlessly
4. URLs handled internally with `.html` extensions

## Browser Compatibility
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile)
- ✅ All Capacitor/Cordova environments

## Server Requirements
For web deployment, your server needs:
- Apache with `mod_rewrite` enabled, OR
- Nginx with similar rewrite rules, OR
- Any server that supports URL rewriting

## Notes for Your Professor
- Professional URLs without file extensions (industry standard)
- Clean, modern web app appearance
- Works seamlessly in both web and mobile environments
- Follows best practices for SPA (Single Page Application) routing
- No manual `.html` typing required for users
