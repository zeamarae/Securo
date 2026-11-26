import React from 'react';
import PortalShell from '../components/PortalShell.jsx';
import templateHtml from '../templates/terms.html?raw';

const loadController = () => import('../../public/public.js');

export default function TermsPage() {
  return (
    <PortalShell
      templateHtml={templateHtml}
      loadController={loadController}
      bodyClass="page-terms"
      dataPage="terms"
    />
  );
}
