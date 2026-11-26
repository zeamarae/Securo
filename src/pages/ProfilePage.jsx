import React from 'react';
import PortalShell from '../components/PortalShell.jsx';
import templateHtml from '../templates/profile.html?raw';

const loadController = () => import('../../public/public.js');

export default function ProfilePage() {
  return (
    <PortalShell
      templateHtml={templateHtml}
      loadController={loadController}
      bodyClass="page-profile"
      dataPage="profile"
    />
  );
}
