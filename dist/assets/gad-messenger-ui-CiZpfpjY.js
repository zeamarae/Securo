import{Wt as e}from"./install-sw-ZnPeoSkn.js";var t=`securo-gad-messenger-ui-styles`;function n(){if(document.getElementById(t))return;let e=document.createElement(`style`);e.id=t,e.textContent=`
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
        .gad-chat-edit-alias-btn {
            display: none;
            align-items: center;
            gap: 4px;
            padding: 5px 10px;
            border-radius: 999px;
            border: 1px solid rgba(15, 23, 42, 0.12);
            background: #f8fafc;
            color: #334155;
            font-size: 0.72rem;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.16s ease, color 0.16s ease;
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
    `,document.head.appendChild(e)}var r={student:{accent:`linear-gradient(135deg, #682ef1, #4e14e6)`,color:`#5a1fe0`,soft:`rgba(90, 31, 224, 0.1)`,hover:`rgba(90, 31, 224, 0.06)`,border:`rgba(90, 31, 224, 0.16)`},staff:{accent:`linear-gradient(135deg, #2563eb, #1d4ed8)`,color:`#2563eb`,soft:`rgba(37, 99, 235, 0.1)`,hover:`rgba(37, 99, 235, 0.06)`,border:`rgba(37, 99, 235, 0.18)`},parent:{accent:`linear-gradient(135deg, #f43f5e, #e11d48)`,color:`#e11d48`,soft:`rgba(225, 29, 72, 0.1)`,hover:`rgba(225, 29, 72, 0.06)`,border:`rgba(225, 29, 72, 0.16)`}};function i(e){let t=String(e||`U`).trim().split(/\s+/).filter(Boolean);return t.length?t.length===1?t[0].slice(0,2).toUpperCase():(t[0][0]+t[t.length-1][0]).toUpperCase():`U`}function a(t){n();let{role:a=`student`,headerBtnId:o,chatHeaderLeftSelector:s,chatHeaderActionsSelector:c,getUid:l,getRealName:u,getAlias:d,saveAlias:f,getUnreadCounts:p,isAdminOnline:m,openMode:h,onBackToChooser:g}=t,_=r[a]||r.student,v=null,y=null,b=null,x=document.querySelector(s);x&&!x.querySelector(`.gad-chat-back-btn`)&&(y=document.createElement(`button`),y.type=`button`,y.className=`gad-chat-back-btn`,y.title=`Choose account`,y.setAttribute(`aria-label`,`Back to account chooser`),y.innerHTML=`<span class="material-symbols-outlined">arrow_back</span>`,y.addEventListener(`click`,e=>{e.stopPropagation(),typeof g==`function`&&g()}),x.prepend(y));let S=document.querySelector(c);S&&!S.querySelector(`.gad-chat-edit-alias-btn`)&&(b=document.createElement(`button`),b.type=`button`,b.className=`gad-chat-edit-alias-btn`,b.title=`Edit your anonymous name`,b.innerHTML=`<span class="material-symbols-outlined">edit</span><span>Edit Alias</span>`,b.addEventListener(`click`,async t=>{t.stopPropagation();let n=l?.();if(!n)return;let r=d?.(n)||``,i=await e.showPrompt(`Edit Anonymous Name`,`Change your anonymous display name while keeping your same conversation history.`,{defaultValue:r,placeholder:`e.g. Silent Owl`,maxLength:32,confirmText:`Save`});if(i===null)return;let a=i.trim();a.length<2||(await f?.(n,a),h?.(`anonymous`))}),S.prepend(b));let C=null,w=x?.closest(`.gad-chat-header, .chat-header`);w&&w.parentElement&&!w.parentElement.querySelector(`.gad-anon-mode-banner`)&&(C=document.createElement(`div`),C.className=`gad-anon-mode-banner`,C.innerHTML=`
            <span class="gad-anon-mode-left">
                <span class="material-symbols-outlined">visibility_off</span>
                <span class="gad-anon-mode-text">Messaging anonymously</span>
            </span>
            <span class="gad-anon-mode-pill">Identity Hidden</span>
        `,w.insertAdjacentElement(`afterend`,C));function T(e){if(y&&y.classList.toggle(`visible`,e===`named`||e===`anonymous`),b&&b.classList.toggle(`visible`,e===`anonymous`),C){let t=e===`anonymous`;if(C.classList.toggle(`visible`,t),t){let e=l?.(),t=e?(d?.(e)||``).trim():``,n=C.querySelector(`.gad-anon-mode-text`);n&&(n.textContent=t?`Messaging anonymously as "${t}"`:`Messaging anonymously`)}}}function E(){[`notifDropdown`,`profileDropdown`,`guardianProfileDropdown`,`profileMenu`].forEach(e=>{let t=document.getElementById(e);t&&t.classList.remove(`active`,`open`,`show`)});let e=document.getElementById(`guardianNotifDropdown`);e&&(e.style.display=`none`,e.classList.remove(`active`,`open`,`show`)),document.querySelectorAll(`.notif-dropdown.active, .profile-dropdown.active`).forEach(e=>{e.classList.remove(`active`)})}function D(){if(!v)return;let e=v;v=null,e.classList.add(`closing`),setTimeout(()=>e.remove(),170)}window.closeActiveGadPopover=D;function O(e,t=!1){if(E(),v&&(D(),!t))return;let n=l?.();if(!n)return;let r=u?.()||`My Account`;d?.(n);let a=p?.()||{named:0,anon:0},o=!!m?.(),s=document.createElement(`div`);s.className=`gad-messenger-popover`,s.style.setProperty(`--gad-mp-accent`,_.accent),s.style.setProperty(`--gad-mp-color`,_.color),s.style.setProperty(`--gad-mp-soft`,_.soft),s.style.setProperty(`--gad-mp-hover`,_.hover),s.style.setProperty(`--gad-mp-border`,_.border);let c=e?.getBoundingClientRect?.();c&&(s.style.top=`${Math.min(c.bottom+10,window.innerHeight-280)}px`,s.style.right=`${Math.max(12,window.innerWidth-c.right)}px`);let g=e=>{let t=d?.(n)||``;if(s.innerHTML=`
                <div class="gad-mp-head">
                    <h3 class="gad-mp-title">Chats</h3>
                    <span class="gad-mp-status ${o?`online`:``}">
                        <span class="gad-mp-status-dot"></span>
                        <span>GAD ${o?`Online`:`Offline`}</span>
                    </span>
                </div>
                <div class="gad-mp-sub">Choose which identity to message GAD Support with</div>
                <div class="gad-mp-list">
                    <button type="button" class="gad-mp-row" data-mp-mode="named">
                        <div class="gad-mp-avatar">${i(r)}</div>
                        <div class="gad-mp-copy">
                            <div class="gad-mp-name-line">
                                <span class="gad-mp-name">${r}</span>
                                <span class="gad-mp-pill">Real Name</span>
                            </div>
                            <div class="gad-mp-preview">GAD Support · Official conversation</div>
                        </div>
                        <div class="gad-mp-right">
                            ${a.named>0?`<span class="gad-mp-unread">${a.named>99?`99+`:a.named}</span>`:``}
                        </div>
                    </button>
                    <div class="gad-mp-row" role="button" tabindex="0" data-mp-mode="anonymous">
                        <div class="gad-mp-avatar anon"><span class="material-symbols-outlined">visibility_off</span></div>
                        <div class="gad-mp-copy">
                            <div class="gad-mp-name-line">
                                <span class="gad-mp-name">${t||`Anonymous Alias`}</span>
                                <span class="gad-mp-pill anon">Anonymous</span>
                            </div>
                            <div class="gad-mp-preview">${t?`Same private history · Tap pencil to rename`:`Set your single anonymous display name`}</div>
                        </div>
                        <div class="gad-mp-right">
                            ${a.anon>0?`<span class="gad-mp-unread">${a.anon>99?`99+`:a.anon}</span>`:``}
                            <button type="button" class="gad-mp-edit-btn" data-mp-edit-alias="1" title="${t?`Edit anonymous alias`:`Create anonymous alias`}">
                                <span class="material-symbols-outlined">edit</span>
                            </button>
                        </div>
                    </div>
                </div>
                ${e?`
                    <div class="gad-mp-alias-editor">
                        <label for="gadMpAliasInput">${t?`Edit your anonymous name`:`Create your anonymous name`}</label>
                        <div class="gad-mp-alias-form">
                            <input type="text" id="gadMpAliasInput" maxlength="32" value="${t.replace(/"/g,`&quot;`)}" placeholder="e.g. Silent Owl">
                            <button type="button" id="gadMpAliasSaveBtn">${t?`Save`:`Continue`}</button>
                        </div>
                        <div class="gad-mp-alias-err" id="gadMpAliasErr"></div>
                        <div class="gad-mp-alias-note">One anonymous alias per account. Renaming keeps your existing chat history.</div>
                    </div>
                `:``}
            `,s.querySelector(`[data-mp-mode="named"]`)?.addEventListener(`click`,e=>{e.stopPropagation(),D(),h?.(`named`)}),s.querySelector(`[data-mp-edit-alias="1"]`)?.addEventListener(`click`,e=>{e.stopPropagation(),g(!0),setTimeout(()=>s.querySelector(`#gadMpAliasInput`)?.focus(),40)}),s.querySelector(`[data-mp-mode="anonymous"]`)?.addEventListener(`click`,e=>{e.stopPropagation(),d?.(n)?(D(),h?.(`anonymous`)):(g(!0),setTimeout(()=>s.querySelector(`#gadMpAliasInput`)?.focus(),40))}),e){let e=s.querySelector(`#gadMpAliasInput`),t=s.querySelector(`#gadMpAliasSaveBtn`),r=s.querySelector(`#gadMpAliasErr`),i=async()=>{let t=(e?.value||``).trim();t.length<2?r&&(r.textContent=`Enter at least 2 characters.`):(await f?.(n,t),D(),h?.(`anonymous`))};t?.addEventListener(`click`,i),e?.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),i())})}};s.addEventListener(`click`,e=>e.stopPropagation()),g(t),document.body.appendChild(s),v=s}if(document.addEventListener(`click`,e=>{if(!v)return;let t=document.getElementById(o);v.contains(e.target)||t&&t.contains(e.target)||D()},!0),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&v&&D()}),!window._securoGadViewportBound){window._securoGadViewportBound=!0;let e=()=>{let e=window.visualViewport,t=e?Math.round(e.height):window.innerHeight,n=e?Math.max(0,Math.round(e.offsetTop)):0,r=e?window.innerHeight-e.height>100:!1;document.documentElement.style.setProperty(`--gad-vv-height`,`${t}px`),document.documentElement.style.setProperty(`--gad-vv-top`,`${n}px`);let i=document.querySelector(`#gadPmModal.active, #guardianChatOverlay.active`);if(i&&(i.classList.toggle(`keyboard-open`,r),i.id===`guardianChatOverlay`&&(i.style.top=`${n}px`,i.style.height=`${t}px`,i.style.bottom=`auto`),r)){let e=i.querySelector(`#gadChatThread, #guardianChatMessages`);e&&requestAnimationFrame(()=>{e.scrollTop=e.scrollHeight})}};window.visualViewport&&(window.visualViewport.addEventListener(`resize`,e),window.visualViewport.addEventListener(`scroll`,e)),window.addEventListener(`resize`,e),document.addEventListener(`focusin`,t=>{t.target&&t.target.closest(`#gadPmModal, #guardianChatOverlay`)&&(setTimeout(e,60),setTimeout(e,280))}),document.addEventListener(`focusout`,t=>{t.target&&t.target.closest(`#gadPmModal, #guardianChatOverlay`)&&setTimeout(e,120)}),e()}return{togglePopover:e=>O(e||document.getElementById(o),!1),closePopover:D,setChatHeaderState:T}}export{a as t};