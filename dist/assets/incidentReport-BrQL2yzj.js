const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./public-BvtDXr_t.js","./install-sw-BcId-7Bf.js","./preload-helper-BXBgov45.js"])))=>i.map(i=>d[i]);
import{a as e,i as t,n,o as r,r as i,t as a}from"./preload-helper-BXBgov45.js";/* empty css               */r();var o=e(),s=`<div class="toast-stack" id="toastStack" aria-live="polite"></div>\r
\r
    <div class="page-shell">\r
        <div class="glass-shell">\r
            <header class="topbar">\r
                <div class="brand-wrap">\r
                    <div class="brand-badge">\r
                        <span class="material-symbols-outlined">description</span>\r
                    </div>\r
                    <div>\r
                        <h1>Incident Report</h1>\r
                        <p>Detailed emergency capture record.</p>\r
                    </div>\r
                </div>\r
                <div class="topbar-actions">\r
                    <!-- (2026-07-13) Add print and export buttons; was back link only -->\r
                    <button id="btnPrintOfficialReport" class="ghost-btn pub-incident-u1" type="button">\r
                        <span class="material-symbols-outlined pub-incident-u2">print</span>\r
                        <span>Print Dossier</span>\r
                    </button>\r
                    <button id="btnExportOfficialJson" class="ghost-btn pub-incident-u1" type="button">\r
                        <span class="material-symbols-outlined pub-incident-u2">data_object</span>\r
                        <span>Export JSON</span>\r
                    </button>\r
                    <a href="../admin/admin.html" class="ghost-btn">\r
                        <span class="material-symbols-outlined">arrow_back</span>\r
                        <span>Back to Admin</span>\r
                    </a>\r
                </div>\r
            </header>\r
\r
            <main class="content">\r
                <section class="panel-card">\r
                    <div class="eyebrow">Emergency Record</div>\r
                    <h2 class="hero-title" id="incidentTitle">Loading report...</h2>\r
                    <p class="hero-copy" id="incidentCopy">Fetching incident details and attachments.</p>\r
                </section>\r
\r
                <section class="panel-card">\r
                    <div class="info-grid">\r
                        <div class="info-card">\r
                            <strong>Report ID</strong>\r
                            <span id="incidentId">--</span>\r
                        </div>\r
                        <div class="info-card">\r
                            <strong>User</strong>\r
                            <span id="incidentUser">--</span>\r
                        </div>\r
                        <div class="info-card">\r
                            <strong>Time</strong>\r
                            <span id="incidentTime">--</span>\r
                        </div>\r
                        <div class="info-card">\r
                            <strong>Status</strong>\r
                            <span id="incidentStatus">--</span>\r
                        </div>\r
                    </div>\r
                </section>\r
\r
                <section class="panel-card">\r
                    <div class="info-grid">\r
                        <div class="info-card pub-incident-u3">\r
                            <strong>Location</strong>\r
                            <span id="incidentLocation">--</span>\r
                        </div>\r
                    </div>\r
                </section>\r
\r
                <section class="panel-card">\r
                    <div class="eyebrow">Attachments</div>\r
                    <div class="attachment-grid" id="attachmentGrid">\r
                        <div class="empty-state">Loading attachments...</div>\r
                    </div>\r
                </section>\r
            </main>\r
        </div>\r
    </div>\r
\r
    \r
    <!-- (2026-07-13) Link consolidated public module; was inline script -->\r
`,c=t(),l=()=>a(()=>import(`./public-BvtDXr_t.js`),__vite__mapDeps([0,1,2]),import.meta.url);function u(){return(0,c.jsx)(n,{templateHtml:s,loadController:l,bodyClass:`page-incident`,dataPage:`incident`})}var d=document.getElementById(`root`);d&&(0,o.createRoot)(d).render((0,c.jsx)(i,{children:(0,c.jsx)(u,{})}));