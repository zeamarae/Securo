import React from 'react';
import PortalShell from '../components/PortalShell.jsx';
import templateHtml from '../templates/staff.html?raw';

const loadController = () => import('../../staff/staff.js');

export default function StaffPortalPage() {
  return (
    <PortalShell
      templateHtml={templateHtml}
      loadController={loadController}
      
      
    />
  );
}
