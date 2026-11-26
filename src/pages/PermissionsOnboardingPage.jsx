import React from 'react';
import PortalShell from '../components/PortalShell.jsx';
import templateHtml from '../templates/permissions-onboarding.html?raw';

const loadController = () => import('../../public/public.js');

export default function PermissionsOnboardingPage() {
  return (
    <PortalShell
      templateHtml={templateHtml}
      loadController={loadController}
      bodyClass="page-permissions"
      dataPage="permissions"
    />
  );
}
