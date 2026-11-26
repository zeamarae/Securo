import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

// (2026-07-13) Multi-page React + Vite config with clean extensionless routes; was .html
const rootDir = import.meta.dirname;

const CLEAN_REWRITES = {
  '/admin/': '/admin/admin.html',
  '/student/': '/student/student.html',
  '/staff/': '/staff/staff.html',
  '/parent/': '/parent/parent.html',
  '/login/': '/public/login.html',
  '/role-selection/': '/public/role-selection.html',
  '/profile/': '/public/profile.html',
  '/settings/': '/public/settings.html',
  '/about/': '/public/about.html',
  '/hotlines/': '/public/hotlines.html',
  '/incident-report/': '/public/incident-report.html',
  '/permissions-onboarding/': '/public/permissions-onboarding.html',
  '/terms/': '/public/terms.html'
};

// (2026-07-13) Serve transformed portal HTML on clean routes; was falling back to index
function cleanRoutesPlugin() {
  const applyMiddleware = (middlewares, devServer = null) => {
    middlewares.use(async (req, res, next) => {
      if (!req.url) return next();
      const [pathname, query] = req.url.split('?');
      const qs = query ? `?${query}` : '';
      if (CLEAN_REWRITES[`${pathname}/`]) {
        res.statusCode = 302;
        res.setHeader('Location', `${pathname}/${qs}`);
        res.end();
        return;
      }
      const target = CLEAN_REWRITES[pathname];
      if (target) {
        if (devServer) {
          try {
            const filePath = resolve(rootDir, target.replace(/^\//, ''));
            const rawHtml = fs.readFileSync(filePath, 'utf-8');
            const transformed = await devServer.transformIndexHtml(target + qs, rawHtml);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(transformed);
            return;
          } catch (err) {
            return next(err);
          }
        }
        req.url = `${target}${qs}`;
      }
      next();
    });
  };
  return {
    name: 'securo-clean-routes',
    configureServer(server) { applyMiddleware(server.middlewares, server); },
    configurePreviewServer(server) { applyMiddleware(server.middlewares, null); }
  };
}

export default defineConfig({
  plugins: [react(), cleanRoutesPlugin()],
  base: './',
  publicDir: false,
  server: {
    port: 5508,
    host: true,
    open: false
  },
  preview: {
    port: 5508,
    host: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssMinify: false,
    rollupOptions: {
      input: {
        main: resolve(rootDir, 'index.html'),
        admin: resolve(rootDir, 'admin/admin.html'),
        student: resolve(rootDir, 'student/student.html'),
        staff: resolve(rootDir, 'staff/staff.html'),
        parent: resolve(rootDir, 'parent/parent.html'),
        login: resolve(rootDir, 'public/login.html'),
        roleSelection: resolve(rootDir, 'public/role-selection.html'),
        profile: resolve(rootDir, 'public/profile.html'),
        settings: resolve(rootDir, 'public/settings.html'),
        about: resolve(rootDir, 'public/about.html'),
        hotlines: resolve(rootDir, 'public/hotlines.html'),
        incidentReport: resolve(rootDir, 'public/incident-report.html'),
        permissionsOnboarding: resolve(rootDir, 'public/permissions-onboarding.html'),
        terms: resolve(rootDir, 'public/terms.html')
      }
    }
  }
});
