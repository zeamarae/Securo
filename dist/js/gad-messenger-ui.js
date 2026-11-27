// (2026-07-13) Messenger-style GAD account popup, back button & single editable alias; was modal only
import { UI } from './utils.js';

const STYLE_ID = 'securo-gad-messenger-ui-styles';

function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        @keyframes gadPopoverIn {
            0% { opacity: 0; transform: translateY(-10px) scale(0.94); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes gadPopoverOut {
            0% { opacity: 1; transform: translateY(0) scale(1); }
            100% { opacity: 0; transform: translateY(-8px) scale(0.95); }
        }
        @keyframes gadViewSlideIn {
            0% { opacity: 0; transform: translateX(14px); }
            100% { opacity: 1; transform: translateX(0); }
        }
        .gad-messenger-popover {
            position: fixed;
            top: 66px;
            right: 16px;
            width: min(368px, calc(100vw - 24px));
            background: #ffffff;
            border-radius: 22px;
            border: 1px solid rgba(15, 23, 42, 0.08);
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22), 0 4px 16px rgba(15, 23, 42, 0.08);
            z-index: 9500;
            padding: 16px;
            box-sizing: border-box;
            transform-origin: top right;
            animation: gadPopoverIn 0.22s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            font-family: 'Outfit', system-ui, -apple-system, sans-serif;
        }
        .gad-messenger-popover.closing {
            animation: gadPopoverOut 0.16s ease forwards;
        }
        .gad-mp-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 12px;
            padding: 0 4px;
        }
        .gad-mp-title {
            font-family: 'Sora', 'Outfit', sans-serif;
            font-size: 1.32rem;
            font-weight: 800;
            color: #181428;
            letter-spacing: -0.02em;
            margin: 0;
        }
        /* (2026-07-13) Persistent anonymous mode indicator bar in GAD chat; was missing */
        .gad-anon-mode-banner {
            display: none;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 8px 16px;
            background: linear-gradient(90deg, #0f172a, #1e293b);
            color: #f8fafc;
            font-size: 0.78rem;
            font-weight: 600;
            flex-shrink: 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .gad-anon-mode-banner.visible {
            display: flex;
        }
        .gad-anon-mode-left {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            min-width: 0;
        }
        .gad-anon-mode-left .material-symbols-outlined {
            font-size: 16px;
            color: #a5b4fc;
            flex-shrink: 0;
        }
        .gad-anon-mode-pill {
            font-size: 0.68rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            padding: 2px 8px;
            border-radius: 999px;
            background: rgba(165, 180, 252, 0.16);
            color: #c7d2fe;
            flex-shrink: 0;
        }
        .gad-mp-status {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 0.72rem;
            font-weight: 700;
            background: #f1f5f9;
            color: #64748b;
        }
        .gad-mp-status.online {
            background: rgba(16, 185, 129, 0.12);
            color: #047857;
        }
        .gad-mp-status-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #94a3b8;
        }
        .gad-mp-status.online .gad-mp-status-dot {
            background: #10b981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.22);
        }
        .gad-mp-sub {
            font-size: 0.78rem;
            color: #64748b;
            padding: 0 4px;
            margin: -4px 0 12px;
        }
        .gad-mp-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .gad-mp-row {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            padding: 10px 10px;
            border-radius: 16px;
            border: 1px solid transparent;
            background: transparent;
            cursor: pointer;
            text-align: left;
            transition: background 0.16s ease, transform 0.16s ease, border-color 0.16s ease;
            box-sizing: border-box;
        }
        .gad-mp-row:hover {
            background: var(--gad-mp-hover, rgba(90, 31, 224, 0.06));
            border-color: var(--gad-mp-border, rgba(90, 31, 224, 0.14));
            transform: translateY(-1px);
        }
        .gad-mp-row:active {
            transform: scale(0.985);
        }
        .gad-mp-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Sora', sans-serif;
            font-weight: 800;
            font-size: 0.95rem;
            color: #ffffff;
            background: var(--gad-mp-accent, linear-gradient(135deg, #682ef1, #4e14e6));
            flex-shrink: 0;
            position: relative;
            box-shadow: 0 6px 14px rgba(15, 23, 42, 0.14);
        }
        .gad-mp-avatar.anon {
            background: linear-gradient(135deg, #334155, #0f172a);
        }
        .gad-mp-avatar .material-symbols-outlined {
            font-size: 22px;
        }
        .gad-mp-copy {
            flex: 1;
            min-width: 0;
        }
        .gad-mp-name-line {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .gad-mp-name {
            font-size: 0.94rem;
            font-weight: 700;
            color: #181428;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .gad-mp-pill {
            font-size: 0.64rem;
            font-weight: 800;
            padding: 2px 7px;
            border-radius: 999px;
            background: var(--gad-mp-soft, rgba(90, 31, 224, 0.1));
            color: var(--gad-mp-color, #5a1fe0);
            flex-shrink: 0;
            text-transform: uppercase;
            letter-spacing: 0.02em;
        }
        .gad-mp-pill.anon {
            background: rgba(15, 23, 42, 0.08);
            color: #334155;
        }
        .gad-mp-preview {
            font-size: 0.78rem;
            color: #64748b;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-top: 2px;
        }
        .gad-mp-right {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
        }
        .gad-mp-unread {
            min-width: 20px;
            height: 20px;
            padding: 0 6px;
            border-radius: 999px;
            background: #dc2626;
            color: #ffffff;
            font-size: 0.7rem;
            font-weight: 800;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 8px rgba(220, 38, 38, 0.32);
        }
        .gad-mp-edit-btn {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 1px solid rgba(15, 23, 42, 0.08);
            background: #f8fafc;
            color: #475569;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.16s ease, color 0.16s ease, transform 0.16s ease;
        }
        .gad-mp-edit-btn:hover {
            background: var(--gad-mp-soft, rgba(90, 31, 224, 0.12));
            color: var(--gad-mp-color, #5a1fe0);
            transform: scale(1.06);
        }
        .gad-mp-edit-btn .material-symbols-outlined {
            font-size: 16px;
        }
        .gad-mp-alias-editor {
            margin-top: 10px;
            padding: 12px;
            border-radius: 14px;
            background: #f8fafc;
            border: 1px solid rgba(15, 23, 42, 0.08);
            animation: gadViewSlideIn 0.18s ease;
        }
        .gad-mp-alias-editor label {
            display: block;
            font-size: 0.76rem;
            font-weight: 700;
            color: #334155;
            margin-bottom: 6px;
        }
        .gad-mp-alias-form {
            display: flex;
            gap: 8px;
        }
        .gad-mp-alias-form input {
            flex: 1;
            min-width: 0;
            height: 38px;
            padding: 0 12px;
            border-radius: 10px;
            border: 1.5px solid #cbd5e1;
            font-size: 0.85rem;
            font-family: inherit;
            outline: none;
            background: #ffffff;
        }
        .gad-mp-alias-form input:focus {
            border-color: var(--gad-mp-color, #5a1fe0);
        }
        .gad-mp-alias-form button {
            height: 38px;
            padding: 0 14px;
            border-radius: 10px;
            border: none;
            background: var(--gad-mp-accent, linear-gradient(135deg, #682ef1, #4e14e6));
            color: #ffffff;
            font-size: 0.82rem;
            font-weight: 700;
            cursor: pointer;
            white-space: nowrap;
        }
        .gad-mp-alias-err {
            font-size: 0.72rem;
            font-weight: 600;
            color: #dc2626;
            margin-top: 5px;
            min-height: 14px;
        }
        .gad-mp-alias-note {
            font-size: 0.7rem;
            color: #64748b;
            margin-top: 4px;
        }
        /* Top-left back button inside GAD chat header */
        .gad-chat-back-btn {
            display: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: none;
            background: rgba(15, 23, 42, 0.06);
            color: #181428;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            flex-shrink: 0;
            margin-right: 2px;
            transition: background 0.16s ease, transform 0.16s ease;
        }
        .gad-chat-back-btn.visible {
            display: inline-flex;
        }
        .gad-chat-back-btn:hover {
            background: rgba(15, 23, 42, 0.12);
            transform: translateX(-2px);
        }
        .gad-chat-back-btn .material-symbols-outlined {
            font-size: 20px;
        }
        /* (2026-07-13) Keep Edit Alias single-line & chat header responsive; was wrapping */
        .gad-chat-edit-alias-btn {
            display: none;
            align-items: center;
            gap: 4px;
            height: 32px;
            padding: 0 11px;
            border-radius: 999px;
            border: 1px solid rgba(15, 23, 42, 0.12);
            background: #f8fafc;
            color: #334155;
            font-size: 0.74rem;
            font-weight: 700;
            line-height: 1;
            white-space: nowrap;
            flex-shrink: 0;
            cursor: pointer;
            transition: background 0.16s ease, color 0.16s ease;
        }
        .gad-chat-header,
        #guardianChatOverlay .chat-header {
            gap: 8px;
        }
        .gad-chat-header > div:first-child,
        #guardianChatOverlay .chat-header > div:first-child {
            min-width: 0;
            flex: 1;
        }
        .gad-anon-mode-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        @media (max-width: 540px) {
            .gad-messenger-popover {
                left: 12px !important;
                right: 12px !important;
                width: auto !important;
                max-width: calc(100vw - 24px);
                padding: 14px;
            }
            .gad-chat-back-btn {
                width: 32px;
                height: 32px;
            }
            .gad-chat-edit-alias-btn {
                height: 30px;
                padding: 0 9px;
                font-size: 0.7rem;
            }
            .gad-anon-mode-banner {
                padding: 7px 12px;
                font-size: 0.72rem;
            }
            .gad-anon-mode-pill {
                font-size: 0.62rem;
                padding: 2px 7px;
            }
        }
        .gad-chat-edit-alias-btn.visible {
            display: inline-flex;
        }
        .gad-chat-edit-alias-btn:hover {
            background: #eef2ff;
            color: #5a1fe0;
        }
        .gad-chat-edit-alias-btn .material-symbols-outlined {
            font-size: 14px;
        }
        .gad-mode-chooser.active,
        .gad-chat-thread.gad-anim-in {
            animation: gadViewSlideIn 0.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
    `;
    document.head.appendChild(style);
}

const THEME_TOKENS = {
    student: {
        accent: 'linear-gradient(135deg, #682ef1, #4e14e6)',
        color: '#5a1fe0',
        soft: 'rgba(90, 31, 224, 0.1)',
        hover: 'rgba(90, 31, 224, 0.06)',
        border: 'rgba(90, 31, 224, 0.16)'
    },
    staff: {
        accent: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        color: '#2563eb',
        soft: 'rgba(37, 99, 235, 0.1)',
        hover: 'rgba(37, 99, 235, 0.06)',
        border: 'rgba(37, 99, 235, 0.18)'
    },
    parent: {
        accent: 'linear-gradient(135deg, #f43f5e, #e11d48)',
        color: '#e11d48',
        soft: 'rgba(225, 29, 72, 0.1)',
        hover: 'rgba(225, 29, 72, 0.06)',
        border: 'rgba(225, 29, 72, 0.16)'
    }
};

function getInitials(name) {
    const parts = String(name || 'U').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function initGadMessengerUI(config) {
    ensureStyles();
    const {
        role = 'student',
        headerBtnId,
        chatHeaderLeftSelector,
        chatHeaderActionsSelector,
        getUid,
        getRealName,
        getAlias,
        saveAlias,
        getUnreadCounts,
        isAdminOnline,
        openMode,
        onBackToChooser
    } = config;

    const theme = THEME_TOKENS[role] || THEME_TOKENS.student;
    let activePopover = null;
    let backBtnEl = null;
    let editAliasBtnEl = null;

    // 1. Inject top-left Back button & Edit Alias button in chat header
    const headerLeft = document.querySelector(chatHeaderLeftSelector);
    if (headerLeft && !headerLeft.querySelector('.gad-chat-back-btn')) {
        backBtnEl = document.createElement('button');
        backBtnEl.type = 'button';
        backBtnEl.className = 'gad-chat-back-btn';
        backBtnEl.title = 'Choose account';
        backBtnEl.setAttribute('aria-label', 'Back to account chooser');
        backBtnEl.innerHTML = '<span class="material-symbols-outlined">arrow_back</span>';
        backBtnEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof onBackToChooser === 'function') onBackToChooser();
        });
        headerLeft.prepend(backBtnEl);
    }

    const headerActions = document.querySelector(chatHeaderActionsSelector);
    if (headerActions && !headerActions.querySelector('.gad-chat-edit-alias-btn')) {
        editAliasBtnEl = document.createElement('button');
        editAliasBtnEl.type = 'button';
        editAliasBtnEl.className = 'gad-chat-edit-alias-btn';
        editAliasBtnEl.title = 'Edit your anonymous name';
        editAliasBtnEl.innerHTML = '<span class="material-symbols-outlined">edit</span><span>Edit Alias</span>';
        editAliasBtnEl.addEventListener('click', async (e) => {
            e.stopPropagation();
            const uid = getUid?.();
            if (!uid) return;
            const current = getAlias?.(uid) || '';
            // (2026-07-13) Use styled prompt modal for alias edit; was window.prompt
            const next = await UI.showPrompt(
                'Edit Anonymous Name',
                'Change your anonymous display name while keeping your same conversation history.',
                { defaultValue: current, placeholder: 'e.g. Silent Owl', maxLength: 32, confirmText: 'Save' }
            );
            if (next === null) return;
            const clean = next.trim();
            if (clean.length < 2) return;
            await saveAlias?.(uid, clean);
            openMode?.('anonymous');
        });
        headerActions.prepend(editAliasBtnEl);
    }

    // (2026-07-13) Persistent anonymous indicator banner below chat header; was absent
    let anonBannerEl = null;
    const chatHeaderEl = headerLeft?.closest('.gad-chat-header, .chat-header');
    if (chatHeaderEl && chatHeaderEl.parentElement && !chatHeaderEl.parentElement.querySelector('.gad-anon-mode-banner')) {
        anonBannerEl = document.createElement('div');
        anonBannerEl.className = 'gad-anon-mode-banner';
        anonBannerEl.innerHTML = `
            <span class="gad-anon-mode-left">
                <span class="material-symbols-outlined">visibility_off</span>
                <span class="gad-anon-mode-text">Messaging anonymously</span>
            </span>
            <span class="gad-anon-mode-pill">Identity Hidden</span>
        `;
        chatHeaderEl.insertAdjacentElement('afterend', anonBannerEl);
    }

    function setChatHeaderState(mode) {
        if (backBtnEl) backBtnEl.classList.toggle('visible', mode === 'named' || mode === 'anonymous');
        if (editAliasBtnEl) editAliasBtnEl.classList.toggle('visible', mode === 'anonymous');
        if (anonBannerEl) {
            const isAnon = mode === 'anonymous';
            anonBannerEl.classList.toggle('visible', isAnon);
            if (isAnon) {
                const uid = getUid?.();
                const alias = uid ? (getAlias?.(uid) || '').trim() : '';
                const txt = anonBannerEl.querySelector('.gad-anon-mode-text');
                if (txt) txt.textContent = alias ? `Messaging anonymously as "${alias}"` : 'Messaging anonymously';
            }
        }
    }

    // (2026-07-13) Prevent Chats, Notifications & Profile popups overlapping; was stacked
    function closeOtherHeaderPopups() {
        ['notifDropdown', 'profileDropdown', 'guardianProfileDropdown', 'profileMenu'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('active', 'open', 'show');
        });
        const gNotif = document.getElementById('guardianNotifDropdown');
        if (gNotif) {
            gNotif.style.display = 'none';
            gNotif.classList.remove('active', 'open', 'show');
        }
        document.querySelectorAll('.notif-dropdown.active, .profile-dropdown.active').forEach((el) => {
            el.classList.remove('active');
        });
    }

    function closePopover() {
        if (!activePopover) return;
        const pop = activePopover;
        activePopover = null;
        pop.classList.add('closing');
        setTimeout(() => pop.remove(), 170);
    }
    window.closeActiveGadPopover = closePopover;

    function openPopover(anchorBtn, startInEditAlias = false) {
        closeOtherHeaderPopups();
        if (activePopover) {
            closePopover();
            if (!startInEditAlias) return;
        }
        const uid = getUid?.();
        if (!uid) return;

        const realName = getRealName?.() || 'My Account';
        const alias = getAlias?.(uid) || '';
        const counts = getUnreadCounts?.() || { named: 0, anon: 0 };
        const online = Boolean(isAdminOnline?.());

        const pop = document.createElement('div');
        pop.className = 'gad-messenger-popover';
        pop.style.setProperty('--gad-mp-accent', theme.accent);
        pop.style.setProperty('--gad-mp-color', theme.color);
        pop.style.setProperty('--gad-mp-soft', theme.soft);
        pop.style.setProperty('--gad-mp-hover', theme.hover);
        pop.style.setProperty('--gad-mp-border', theme.border);

        // (2026-07-13) Clamp popover within mobile & tablet viewports; was clipped left
        const rect = anchorBtn?.getBoundingClientRect?.();
        if (rect) {
            pop.style.top = `${Math.min(rect.bottom + 10, window.innerHeight - 280)}px`;
            if (window.innerWidth <= 540) {
                pop.style.left = '12px';
                pop.style.right = '12px';
                pop.style.width = 'auto';
            } else {
                const desiredRight = Math.max(12, window.innerWidth - rect.right);
                const maxRight = Math.max(12, window.innerWidth - 368 - 12);
                pop.style.right = `${Math.min(desiredRight, maxRight)}px`;
            }
        }

        const renderBody = (editingAlias) => {
            const curAlias = getAlias?.(uid) || '';
            pop.innerHTML = `
                <div class="gad-mp-head">
                    <h3 class="gad-mp-title">Chats</h3>
                    <span class="gad-mp-status ${online ? 'online' : ''}">
                        <span class="gad-mp-status-dot"></span>
                        <span>GAD ${online ? 'Online' : 'Offline'}</span>
                    </span>
                </div>
                <div class="gad-mp-sub">Choose which identity to message GAD Support with</div>
                <div class="gad-mp-list">
                    <button type="button" class="gad-mp-row" data-mp-mode="named">
                        <div class="gad-mp-avatar">${getInitials(realName)}</div>
                        <div class="gad-mp-copy">
                            <div class="gad-mp-name-line">
                                <span class="gad-mp-name">${realName}</span>
                                <span class="gad-mp-pill">Real Name</span>
                            </div>
                            <div class="gad-mp-preview">GAD Support · Official conversation</div>
                        </div>
                        <div class="gad-mp-right">
                            ${counts.named > 0 ? `<span class="gad-mp-unread">${counts.named > 99 ? '99+' : counts.named}</span>` : ''}
                        </div>
                    </button>
                    <div class="gad-mp-row" role="button" tabindex="0" data-mp-mode="anonymous">
                        <div class="gad-mp-avatar anon"><span class="material-symbols-outlined">visibility_off</span></div>
                        <div class="gad-mp-copy">
                            <div class="gad-mp-name-line">
                                <span class="gad-mp-name">${curAlias || 'Anonymous Alias'}</span>
                                <span class="gad-mp-pill anon">Anonymous</span>
                            </div>
                            <div class="gad-mp-preview">${curAlias ? 'Same private history · Tap pencil to rename' : 'Set your single anonymous display name'}</div>
                        </div>
                        <div class="gad-mp-right">
                            ${counts.anon > 0 ? `<span class="gad-mp-unread">${counts.anon > 99 ? '99+' : counts.anon}</span>` : ''}
                            <button type="button" class="gad-mp-edit-btn" data-mp-edit-alias="1" title="${curAlias ? 'Edit anonymous alias' : 'Create anonymous alias'}">
                                <span class="material-symbols-outlined">edit</span>
                            </button>
                        </div>
                    </div>
                </div>
                ${editingAlias ? `
                    <div class="gad-mp-alias-editor">
                        <label for="gadMpAliasInput">${curAlias ? 'Edit your anonymous name' : 'Create your anonymous name'}</label>
                        <div class="gad-mp-alias-form">
                            <input type="text" id="gadMpAliasInput" maxlength="32" value="${curAlias.replace(/"/g, '&quot;')}" placeholder="e.g. Silent Owl">
                            <button type="button" id="gadMpAliasSaveBtn">${curAlias ? 'Save' : 'Continue'}</button>
                        </div>
                        <div class="gad-mp-alias-err" id="gadMpAliasErr"></div>
                        <div class="gad-mp-alias-note">One anonymous alias per account. Renaming keeps your existing chat history.</div>
                    </div>
                ` : ''}
            `;

            pop.querySelector('[data-mp-mode="named"]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                closePopover();
                openMode?.('named');
            });

            pop.querySelector('[data-mp-edit-alias="1"]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                renderBody(true);
                setTimeout(() => pop.querySelector('#gadMpAliasInput')?.focus(), 40);
            });

            // (2026-07-13) Stop propagation so renderBody doesn't trigger outside-click close; was closing
            pop.querySelector('[data-mp-mode="anonymous"]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                const existing = getAlias?.(uid);
                if (existing) {
                    closePopover();
                    openMode?.('anonymous');
                } else {
                    renderBody(true);
                    setTimeout(() => pop.querySelector('#gadMpAliasInput')?.focus(), 40);
                }
            });

            if (editingAlias) {
                const inp = pop.querySelector('#gadMpAliasInput');
                const saveBtn = pop.querySelector('#gadMpAliasSaveBtn');
                const errEl = pop.querySelector('#gadMpAliasErr');
                const doSave = async () => {
                    const val = (inp?.value || '').trim();
                    if (val.length < 2) {
                        if (errEl) errEl.textContent = 'Enter at least 2 characters.';
                        return;
                    }
                    await saveAlias?.(uid, val);
                    closePopover();
                    openMode?.('anonymous');
                };
                saveBtn?.addEventListener('click', doSave);
                inp?.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') { e.preventDefault(); doSave(); }
                });
            }
        };

        // (2026-07-13) Keep clicks inside popover from bubbling to document close; was detaching
        pop.addEventListener('click', (e) => e.stopPropagation());
        renderBody(startInEditAlias);
        document.body.appendChild(pop);
        activePopover = pop;
    }

    // (2026-07-13) Capture clicks on other header popups to close Chats; was blocked by stopPropagation
    document.addEventListener('click', (e) => {
        if (!activePopover) return;
        const anchor = document.getElementById(headerBtnId);
        if (activePopover.contains(e.target) || (anchor && anchor.contains(e.target))) return;
        closePopover();
    }, true);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activePopover) closePopover();
    });

    // (2026-07-13) Sync GAD chat modal insets with mobile keyboard visualViewport; was static
    if (!window._securoGadViewportBound) {
        window._securoGadViewportBound = true;
        const syncGadChatViewport = () => {
            const vv = window.visualViewport;
            const vh = vv ? Math.round(vv.height) : window.innerHeight;
            const vTop = vv ? Math.max(0, Math.round(vv.offsetTop)) : 0;
            const kbOpen = vv ? (window.innerHeight - vv.height) > 100 : false;
            document.documentElement.style.setProperty('--gad-vv-height', `${vh}px`);
            document.documentElement.style.setProperty('--gad-vv-top', `${vTop}px`);
            const activeModal = document.querySelector('#gadPmModal.active, #guardianChatOverlay.active');
            if (activeModal) {
                activeModal.classList.toggle('keyboard-open', kbOpen);
                if (activeModal.id === 'guardianChatOverlay') {
                    activeModal.style.top = `${vTop}px`;
                    activeModal.style.height = `${vh}px`;
                    activeModal.style.bottom = 'auto';
                }
                if (kbOpen) {
                    const thread = activeModal.querySelector('#gadChatThread, #guardianChatMessages');
                    if (thread) {
                        requestAnimationFrame(() => { thread.scrollTop = thread.scrollHeight; });
                    }
                }
            }
        };
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', syncGadChatViewport);
            window.visualViewport.addEventListener('scroll', syncGadChatViewport);
        }
        window.addEventListener('resize', syncGadChatViewport);
        document.addEventListener('focusin', (e) => {
            if (e.target && e.target.closest('#gadPmModal, #guardianChatOverlay')) {
                setTimeout(syncGadChatViewport, 60);
                setTimeout(syncGadChatViewport, 280);
            }
        });
        document.addEventListener('focusout', (e) => {
            if (e.target && e.target.closest('#gadPmModal, #guardianChatOverlay')) {
                setTimeout(syncGadChatViewport, 120);
            }
        });
        syncGadChatViewport();
    }

    return {
        togglePopover: (anchorBtn) => openPopover(anchorBtn || document.getElementById(headerBtnId), false),
        closePopover,
        setChatHeaderState
    };
}
