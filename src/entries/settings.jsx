import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactErrorBoundary from '../components/ReactErrorBoundary.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <ReactErrorBoundary>
      <SettingsPage />
    </ReactErrorBoundary>
  );
}
