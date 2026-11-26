import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactErrorBoundary from '../components/ReactErrorBoundary.jsx';
import AboutPage from '../pages/AboutPage.jsx';

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <ReactErrorBoundary>
      <AboutPage />
    </ReactErrorBoundary>
  );
}
