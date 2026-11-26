import React from 'react';
import PortalShell from '../components/PortalShell.jsx';
import templateHtml from '../templates/admin.html?raw';

const loadController = () => import('../../admin/admin.js');

export default function AdminPortalPage() {
  return (
    <PortalShell
      templateHtml={templateHtml}
      loadController={loadController}
      
      
    />
  );
}
