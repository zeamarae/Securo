import React from 'react';
import PortalShell from '../components/PortalShell.jsx';
import templateHtml from '../templates/incident-report.html?raw';

const loadController = () => import('../../public/public.js');

export default function IncidentReportPage() {
  return (
    <PortalShell
      templateHtml={templateHtml}
      loadController={loadController}
      bodyClass="page-incident"
      dataPage="incident"
    />
  );
}
