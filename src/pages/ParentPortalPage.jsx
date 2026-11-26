import React from 'react';
import PortalShell from '../components/PortalShell.jsx';
import templateHtml from '../templates/parent.html?raw';

const loadController = () => import('../../parent/parent.js');

export default function ParentPortalPage() {
  return (
    <PortalShell
      templateHtml={templateHtml}
      loadController={loadController}
      
      
    />
  );
}
