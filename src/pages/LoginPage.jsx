import React from 'react';
import PortalShell from '../components/PortalShell.jsx';
import templateHtml from '../templates/login.html?raw';

const loadController = () => import('../../public/public.js');

export default function LoginPage() {
  return (
    <PortalShell
      templateHtml={templateHtml}
      loadController={loadController}
      bodyClass="page-login"
      dataPage="login"
    />
  );
}
