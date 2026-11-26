import fs from 'fs';
import path from 'path';

// (2026-07-13) Convert all 14 HTML pages into React components + Vite entrypoints
const root = process.cwd();

const pages = [
  { html: 'index.html', name: 'landing', pascal: 'Landing', controller: '../../public/public.js', dataPage: 'landing', bodyClass: 'page-landing' },
  { html: 'admin/admin.html', name: 'admin', pascal: 'AdminPortal', controller: '../../admin/admin.js' },
  { html: 'student/student.html', name: 'student', pascal: 'StudentPortal', controller: '../../student/student.js', hasBootstrapInBody: true },
  { html: 'staff/staff.html', name: 'staff', pascal: 'StaffPortal', controller: '../../staff/staff.js', hasBootstrapInBody: true },
  { html: 'parent/parent.html', name: 'parent', pascal: 'ParentPortal', controller: '../../parent/parent.js' },
  { html: 'public/login.html', name: 'login', pascal: 'Login', controller: '../../public/public.js', dataPage: 'login', bodyClass: 'page-login' },
  { html: 'public/role-selection.html', name: 'role-selection', pascal: 'RoleSelection', controller: '../../public/public.js', dataPage: 'role-selection', bodyClass: 'page-role-selection' },
  { html: 'public/profile.html', name: 'profile', pascal: 'Profile', controller: '../../public/public.js', dataPage: 'profile', bodyClass: 'page-profile' },
  { html: 'public/settings.html', name: 'settings', pascal: 'Settings', controller: '../../public/public.js', dataPage: 'settings', bodyClass: 'page-settings' },
  { html: 'public/about.html', name: 'about', pascal: 'About', controller: '../../public/public.js', dataPage: 'about', bodyClass: 'page-about' },
  { html: 'public/hotlines.html', name: 'hotlines', pascal: 'Hotlines', controller: '../../public/public.js', dataPage: 'hotlines', bodyClass: 'page-hotlines' },
  { html: 'public/incident-report.html', name: 'incident-report', pascal: 'IncidentReport', controller: '../../public/public.js', dataPage: 'incident', bodyClass: 'page-incident' },
  { html: 'public/permissions-onboarding.html', name: 'permissions-onboarding', pascal: 'PermissionsOnboarding', controller: '../../public/public.js', dataPage: 'permissions', bodyClass: 'page-permissions' },
  { html: 'public/terms.html', name: 'terms', pascal: 'Terms', controller: '../../public/public.js', dataPage: 'terms', bodyClass: 'page-terms' }
];

fs.mkdirSync(path.join(root, 'src/templates'), { recursive: true });
fs.mkdirSync(path.join(root, 'src/pages'), { recursive: true });
fs.mkdirSync(path.join(root, 'src/entries'), { recursive: true });

const BOOTSTRAP_TAG = '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer></script>';

for (const page of pages) {
  const htmlPath = path.join(root, page.html);
  const raw = fs.readFileSync(htmlPath, 'utf8');

  const bodyOpenMatch = raw.match(/<body([^>]*)>/i);
  const bodyCloseIdx = raw.lastIndexOf('</body>');
  if (!bodyOpenMatch || bodyCloseIdx === -1) {
    throw new Error(`Could not locate <body> in ${page.html}`);
  }

  const bodyStartIdx = bodyOpenMatch.index + bodyOpenMatch[0].length;
  let headPart = raw.slice(0, bodyOpenMatch.index);
  const bodyAttrs = bodyOpenMatch[1] || '';
  let bodyInner = raw.slice(bodyStartIdx, bodyCloseIdx);
  const tailPart = raw.slice(bodyCloseIdx);

  // Move Bootstrap script from body to head if present
  if (page.hasBootstrapInBody) {
    bodyInner = bodyInner.replace(/<script[^>]*bootstrap\.bundle\.min\.js[^>]*><\/script>\s*/i, '');
    if (!headPart.includes('bootstrap.bundle.min.js')) {
      headPart = headPart.replace(/<\/head>/i, `    ${BOOTSTRAP_TAG}\n</head>`);
    }
  }

  // Strip the page's module controller script tag from body template
  bodyInner = bodyInner.replace(/<script\s+type="module"\s+src="[^"]+"[^>]*><\/script>\s*/gi, '').trim();

  // Save extracted HTML body template
  fs.writeFileSync(path.join(root, `src/templates/${page.name}.html`), bodyInner + '\n', 'utf8');

  // Create React page component
  const pageComponent = `import React from 'react';
import PortalShell from '../components/PortalShell.jsx';
import templateHtml from '../templates/${page.name}.html?raw';

const loadController = () => import('${page.controller}');

export default function ${page.pascal}Page() {
  return (
    <PortalShell
      templateHtml={templateHtml}
      loadController={loadController}
      ${page.bodyClass ? `bodyClass="${page.bodyClass}"` : ''}
      ${page.dataPage ? `dataPage="${page.dataPage}"` : ''}
    />
  );
}
`;
  fs.writeFileSync(path.join(root, `src/pages/${page.pascal}Page.jsx`), pageComponent, 'utf8');

  // Create React entry point
  const entryCode = `import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactErrorBoundary from '../components/ReactErrorBoundary.jsx';
import ${page.pascal}Page from '../pages/${page.pascal}Page.jsx';

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <ReactErrorBoundary>
      <${page.pascal}Page />
    </ReactErrorBoundary>
  );
}
`;
  fs.writeFileSync(path.join(root, `src/entries/${page.name}.jsx`), entryCode, 'utf8');

  // Rewrite HTML file into a clean React root shell
  const isNested = page.html.includes('/');
  const entrySrc = isNested ? `../src/entries/${page.name}.jsx` : `./src/entries/${page.name}.jsx`;
  const newHtml = `${headPart}<body${bodyAttrs}>
    <div id="root"></div>
    <script type="module" src="${entrySrc}"></script>
${tailPart}`;

  fs.writeFileSync(htmlPath, newHtml, 'utf8');
  console.log(`Converted ${page.html} -> src/pages/${page.pascal}Page.jsx`);
}

// Create src/App.jsx as a clean React router/index reference
const appJsx = `import React from 'react';
import LandingPage from './pages/LandingPage.jsx';

export default function App() {
  return <LandingPage />;
}
`;
fs.writeFileSync(path.join(root, 'src/App.jsx'), appJsx, 'utf8');
console.log('All 14 pages converted to React components cleanly!');
