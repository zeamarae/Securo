import React from 'react';
import PortalShell from '../components/PortalShell.jsx';
import templateHtml from '../templates/settings.html?raw';

const loadController = () => import('../../public/public.js');

export default function SettingsPage() {
  return (
    <PortalShell
      templateHtml={templateHtml}
      loadController={loadController}
      bodyClass="page-settings"
      dataPage="settings"
    />
  );
}
