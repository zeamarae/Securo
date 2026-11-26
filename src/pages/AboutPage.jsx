import React from 'react';
import PortalShell from '../components/PortalShell.jsx';
import templateHtml from '../templates/about.html?raw';

const loadController = () => import('../../public/public.js');

export default function AboutPage() {
  return (
    <PortalShell
      templateHtml={templateHtml}
      loadController={loadController}
      bodyClass="page-about"
      dataPage="about"
    />
  );
}
