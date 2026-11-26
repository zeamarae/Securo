import React from 'react';
import PortalShell from '../components/PortalShell.jsx';
import templateHtml from '../templates/hotlines.html?raw';

const loadController = () => import('../../public/public.js');

export default function HotlinesPage() {
  return (
    <PortalShell
      templateHtml={templateHtml}
      loadController={loadController}
      bodyClass="page-hotlines"
      dataPage="hotlines"
    />
  );
}
