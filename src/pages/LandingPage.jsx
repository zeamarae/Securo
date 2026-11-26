import React from 'react';
import PortalShell from '../components/PortalShell.jsx';
import templateHtml from '../templates/landing.html?raw';

const loadController = () => import('../../public/public.js');

export default function LandingPage() {
  return (
    <PortalShell
      templateHtml={templateHtml}
      loadController={loadController}
      bodyClass="page-landing"
      dataPage="landing"
    />
  );
}
