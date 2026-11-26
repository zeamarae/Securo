import React from 'react';
import PortalShell from '../components/PortalShell.jsx';
import templateHtml from '../templates/role-selection.html?raw';

const loadController = () => import('../../public/public.js');

export default function RoleSelectionPage() {
  return (
    <PortalShell
      templateHtml={templateHtml}
      loadController={loadController}
      bodyClass="page-role-selection"
      dataPage="role-selection"
    />
  );
}
