import React, { useEffect, useRef } from 'react';

const CLEAN_ROUTE_MAP = {
  '/index.html': '/',
  '/admin/admin.html': '/admin/',
  '/student/student.html': '/student/',
  '/staff/staff.html': '/staff/',
  '/parent/parent.html': '/parent/',
  '/public/login.html': '/login/',
  '/public/role-selection.html': '/role-selection/',
  '/public/profile.html': '/profile/',
  '/public/settings.html': '/settings/',
  '/public/about.html': '/about/',
  '/public/hotlines.html': '/hotlines/',
  '/public/incident-report.html': '/incident-report/',
  '/public/permissions-onboarding.html': '/permissions-onboarding/',
  '/public/terms.html': '/terms/'
};

// (2026-07-13) Reusable React portal shell with clean URL normalization; was .html URL
export default function PortalShell({ templateHtml, loadController, bodyClass, dataPage }) {
  const containerRef = useRef(null);
  const bootedRef = useRef(false);

  useEffect(() => {
    // (2026-07-13) Strip legacy #/ hash & normalize to short route; was preserving hash
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      const cleanPath = CLEAN_ROUTE_MAP[window.location.pathname] || window.location.pathname;
      const cleanHash = window.location.hash && window.location.hash.startsWith('#/') ? '' : window.location.hash;
      const nextUrl = cleanPath + window.location.search + cleanHash;
      const curUrl = window.location.pathname + window.location.search + window.location.hash;
      if (nextUrl !== curUrl) {
        try {
          window.history.replaceState(null, '', nextUrl);
        } catch (_) { }
      }
    }

    // (2026-07-13) Remove duplicate template preloader overlay; js/preloader.js owns it
    if (containerRef.current) {
      containerRef.current.querySelectorAll('#securo-preloader-overlay').forEach((el) => el.remove());
    }

    if (bodyClass) {
      bodyClass.split(/\s+/).filter(Boolean).forEach((cls) => document.body.classList.add(cls));
    }
    if (dataPage) {
      document.body.dataset.page = dataPage;
    }

    if (bootedRef.current) return;
    bootedRef.current = true;

    if (typeof loadController === 'function') {
      loadController().catch((err) => {
        console.error('[Securo React PortalShell] Controller boot failed:', err);
      });
    }
  }, [bodyClass, dataPage, loadController]);

  return (
    <div
      ref={containerRef}
      className="securo-react-portal-root"
      style={{ display: 'contents' }}
      dangerouslySetInnerHTML={{ __html: templateHtml }}
    />
  );
}
