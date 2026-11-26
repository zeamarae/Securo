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
console.log('React Vite build assets & clean routes synced to dist/ and www/');
