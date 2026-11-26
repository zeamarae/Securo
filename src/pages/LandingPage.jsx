import React, { useMemo } from 'react';
import PortalShell from '../components/PortalShell.jsx';
import templateHtml from '../templates/landing.html?raw';
// (2026-07-13) Bundle landing images via Vite imports; was raw relative paths
import logoWithTextImg from '../../assets/images/logo with text.png';
import studentMapImg from '../../assets/images/student_map.png';
import studentSosImg from '../../assets/images/student_sos.png';
import studentVaultImg from '../../assets/images/student_vault.png';
import studentAttendanceImg from '../../assets/images/student_attendance.png';
import studentGadImg from '../../assets/images/student_gad.png';
import guardianDashboardImg from '../../assets/images/guardian_dashboard.png';

const LANDING_IMAGE_MAP = {
  'assets/images/logo with text.png': logoWithTextImg,
  'assets/images/student_map.png': studentMapImg,
  'assets/images/student_sos.png': studentSosImg,
  'assets/images/student_vault.png': studentVaultImg,
  'assets/images/student_attendance.png': studentAttendanceImg,
  'assets/images/student_gad.png': studentGadImg,
  'assets/images/guardian_dashboard.png': guardianDashboardImg
};

if (typeof window !== 'undefined') {
  window.__SECURO_LANDING_IMAGES = {
    map: studentMapImg,
    sos: studentSosImg,
    vault: studentVaultImg,
    attendance: studentAttendanceImg,
    gad: studentGadImg,
    guardian: guardianDashboardImg,
    logoWithText: logoWithTextImg
  };
}

const loadController = () => import('../../public/public.js');

export default function LandingPage() {
  const resolvedTemplateHtml = useMemo(() => {
    let html = templateHtml;
    for (const [rawPath, resolvedUrl] of Object.entries(LANDING_IMAGE_MAP)) {
      html = html.split(rawPath).join(resolvedUrl);
    }
    return html;
  }, []);

  return (
    <PortalShell
      templateHtml={resolvedTemplateHtml}
      loadController={loadController}
      bodyClass="page-landing"
      dataPage="landing"
    />
  );
}
