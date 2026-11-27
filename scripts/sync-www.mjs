import fs from 'fs';
import path from 'path';

// (2026-07-13) Copy static assets, generate clean GitHub Pages route indexes, & sync www/
const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const wwwDir = path.join(rootDir, 'www');

function copyRecursive(src, dst) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dst, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  }
}

for (const dir of ['assets', 'css', 'js']) {
  copyRecursive(path.join(rootDir, dir), path.join(distDir, dir));
}
for (const file of ['service-worker.js', 'CNAME', '.nojekyll', '.htaccess']) {
  const srcFile = path.join(rootDir, file);
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, path.join(distDir, file));
  }
}

// Generate clean extensionless route index.html files for GitHub Pages (/staff/, /login/, etc.)
const cleanRouteMirrors = [
  ['admin/admin.html', 'admin/index.html'],
  ['student/student.html', 'student/index.html'],
  ['staff/staff.html', 'staff/index.html'],
  ['parent/parent.html', 'parent/index.html'],
  ['public/login.html', 'login/index.html'],
  ['public/role-selection.html', 'role-selection/index.html'],
  ['public/profile.html', 'profile/index.html'],
  ['public/settings.html', 'settings/index.html'],
  ['public/about.html', 'about/index.html'],
  ['public/hotlines.html', 'hotlines/index.html'],
  ['public/incident-report.html', 'incident-report/index.html'],
  ['public/permissions-onboarding.html', 'permissions-onboarding/index.html'],
  ['public/terms.html', 'terms/index.html']
];

for (const [srcRel, dstRel] of cleanRouteMirrors) {
  const srcFile = path.join(distDir, srcRel);
  const dstFile = path.join(distDir, dstRel);
  if (fs.existsSync(srcFile)) {
    fs.mkdirSync(path.dirname(dstFile), { recursive: true });
    fs.copyFileSync(srcFile, dstFile);
  }
}

// Sync dist/ to www/ for Capacitor Android builds
if (fs.existsSync(wwwDir)) {
  for (const entry of fs.readdirSync(wwwDir)) {
    if (entry !== '.nojekyll') {
      fs.rmSync(path.join(wwwDir, entry), { recursive: true, force: true });
    }
  }
} else {
  fs.mkdirSync(wwwDir, { recursive: true });
}
copyRecursive(distDir, wwwDir);

// (2026-07-13) Exclude landing page & its screenshots from APK www/; was bundled
const apkEntryHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>Securo</title>
  <style>
    html, body { margin: 0; height: 100%; background: #ffffff; display: flex; align-items: center; justify-content: center; }
    img { width: 88px; height: 88px; object-fit: contain; }
  </style>
  <script>
    (function () {
      // (2026-07-13) Use root-absolute .html paths & map clean SPA fallbacks in APK
      var routeMap = {
        '/login': '/public/login.html',
        '/role-selection': '/public/role-selection.html',
        '/student': '/student/student.html',
        '/staff': '/staff/staff.html',
        '/parent': '/parent/parent.html',
        '/guardian': '/parent/parent.html',
        '/admin': '/admin/admin.html',
        '/profile': '/public/profile.html',
        '/settings': '/public/settings.html',
        '/about': '/public/about.html',
        '/hotlines': '/public/hotlines.html',
        '/incident-report': '/public/incident-report.html',
        '/permissions-onboarding': '/public/permissions-onboarding.html',
        '/terms': '/public/terms.html'
      };
      // (2026-07-13) Strip trailing slashes without regex escaping; was broken //+$/
      var cleanPath = window.location.pathname || '/';
      while (cleanPath.length > 1 && cleanPath.endsWith('/')) cleanPath = cleanPath.slice(0, -1);
      if (routeMap[cleanPath]) {
        window.location.replace(routeMap[cleanPath] + window.location.search + window.location.hash);
        return;
      }
      try {
        var token = localStorage.getItem('securo_session_token');
        var role = (localStorage.getItem('securo_user_role') || '').toLowerCase();
        var camOk = localStorage.getItem('securo_camera_granted') === 'true';
        var locOk = localStorage.getItem('securo_location_granted') === 'true';
        if (token && role) {
          if (!camOk || !locOk) {
            window.location.replace('/public/permissions-onboarding.html');
            return;
          }
          if (role === 'admin') { window.location.replace('/admin/admin.html'); return; }
          if (role === 'staff') { window.location.replace('/staff/staff.html'); return; }
          if (role === 'guardian' || role === 'parent') { window.location.replace('/parent/parent.html'); return; }
          window.location.replace('/student/student.html');
          return;
        }
      } catch (e) {}
      window.location.replace('/public/role-selection.html');
    })();
  </script>
</head>
<body>
  <img src="/assets/images/logo.png" alt="Securo" />
</body>
</html>`;
fs.writeFileSync(path.join(wwwDir, 'index.html'), apkEntryHtml, 'utf8');

const landingOnlyPatterns = [
  /^landing_mobile/i,
  /^db campus\.png$/i,
  /^guardian_dashboard/i,
  /^student_attendance/i,
  /^student_gad/i,
  /^student_map/i,
  /^student_sos/i,
  /^student_vault/i
];
for (const sub of ['assets', path.join('assets', 'images')]) {
  const dirPath = path.join(wwwDir, sub);
  if (!fs.existsSync(dirPath)) continue;
  for (const file of fs.readdirSync(dirPath)) {
    if (landingOnlyPatterns.some((re) => re.test(file))) {
      fs.rmSync(path.join(dirPath, file), { force: true });
    }
  }
}

console.log('React Vite build assets & clean routes synced to dist/ and www/ (APK excludes landing page)');
