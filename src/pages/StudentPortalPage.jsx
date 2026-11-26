import React from 'react';
import PortalShell from '../components/PortalShell.jsx';
import templateHtml from '../templates/student.html?raw';

const loadController = () => import('../../student/student.js');

export default function StudentPortalPage() {
  return (
    <PortalShell
      templateHtml={templateHtml}
      loadController={loadController}
      
      
    />
  );
}
