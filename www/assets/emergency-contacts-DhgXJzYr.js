import{Ht as e,Ut as t,W as n,Wt as r}from"./install-sw-BcId-7Bf.js";var i=[{id:`emergency_911`,name:`911 Emergency`,number:`911`,icon:`emergency`,color:`#d11f34`,priority:1,type:`emergency`},{id:`campus_security`,name:`Campus Security`,number:``,icon:`security`,color:`#5a1fe0`,priority:2,type:`campus`},{id:`campus_medical`,name:`Campus Medical`,number:``,icon:`medical_services`,color:`#0f9b67`,priority:3,type:`campus`}];async function a(r){try{let e=t.get(`emergency_contacts`,[]),a=await n(r),o=[];return a?.guardianPhone&&o.push({id:`guardian_primary`,name:a.guardianName||`Guardian`,number:a.guardianPhone,icon:`family_restroom`,color:`#f43f5e`,priority:4,type:`guardian`}),[...i,...o,...e].sort((e,t)=>e.priority-t.priority)}catch(t){return e.error(`EmergencyContacts`,`Failed to get contacts`,t),i}}function o(n){try{let r=t.get(`emergency_contacts`,[]),i={id:`custom_${Date.now()}`,name:n.name,number:n.number,relationship:n.relationship||`Other`,icon:`contact_phone`,color:`#06b6d4`,priority:10+r.length,type:`custom`};return r.push(i),t.set(`emergency_contacts`,r),e.info(`EmergencyContacts`,`Contact added`,i),i}catch(t){return e.error(`EmergencyContacts`,`Failed to add contact`,t),null}}function s(t,n=`Emergency Contact`){try{if(!t)return r.showToast(`No phone number available`,`error`),!1;let i=t.replace(/\D/g,``),a=`tel:${i}`;return e.info(`EmergencyContacts`,`Call initiated`,{contact:n,number:i}),window.location.href=a,r.showToast(`Calling ${n}...`,`info`,2e3),!0}catch(t){return e.error(`EmergencyContacts`,`Call failed`,t),r.showToast(`Failed to initiate call`,`error`),!1}}async function c(t,n){let r=document.getElementById(t);if(!r)e.error(`EmergencyContacts`,`Container not found`,{containerId:t});else try{let t=await a(n);if(r.innerHTML=`
            <div class="emergency-contacts-widget">
                <h3 class="widget-title">
                    <span class="material-symbols-outlined">phone</span>
                    Emergency Contacts
                </h3>
                <div class="contacts-list">
                    ${t.filter(e=>e.number).map(e=>`
                        <button class="contact-btn" data-number="${e.number}" data-name="${e.name}" style="--contact-color: ${e.color}">
                            <span class="contact-icon material-symbols-outlined">${e.icon}</span>
                            <div class="contact-info">
                                <span class="contact-name">${e.name}</span>
                                <span class="contact-number">${e.number}</span>
                            </div>
                            <span class="material-symbols-outlined call-icon">call</span>
                        </button>
                    `).join(``)}
                </div>
                <button class="add-contact-btn">
                    <span class="material-symbols-outlined">add</span>
                    <span>Add Contact</span>
                </button>
            </div>
        `,!document.getElementById(`emergency-contacts-styles`)){let e=document.createElement(`style`);e.id=`emergency-contacts-styles`,e.textContent=`
                .emergency-contacts-widget {
                    background: white;
                    border-radius: 20px;
                    padding: 24px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .widget-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 1.2rem;
                    font-weight: 700;
                    margin: 0 0 20px;
                }
                .contacts-list {
                    display: grid;
                    gap: 12px;
                    margin-bottom: 16px;
                }
                .contact-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    border: 2px solid var(--contact-color);
                    border-radius: 16px;
                    background: rgba(255,255,255,0.9);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    width: 100%;
                }
                .contact-btn:hover {
                    background: var(--contact-color);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
                }
                .contact-btn:hover .contact-name,
                .contact-btn:hover .contact-number,
                .contact-btn:hover .contact-icon,
                .contact-btn:hover .call-icon {
                    color: white;
                }
                .contact-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 14px;
                    background: var(--contact-color);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                }
                .contact-info {
                    flex: 1;
                    text-align: left;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .contact-name {
                    font-weight: 700;
                    font-size: 1rem;
                    color: #171428;
                }
                .contact-number {
                    font-size: 0.85rem;
                    color: #6e6a84;
                }
                .call-icon {
                    color: var(--contact-color);
                    font-size: 24px;
                }
                .add-contact-btn {
                    width: 100%;
                    padding: 14px;
                    border: 2px dashed #cbd5e1;
                    border-radius: 14px;
                    background: transparent;
                    color: #6e6a84;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .add-contact-btn:hover {
                    border-color: #5a1fe0;
                    color: #5a1fe0;
                    background: rgba(90,31,224,0.05);
                }
            `,document.head.appendChild(e)}r.querySelectorAll(`.contact-btn`).forEach(e=>{e.addEventListener(`click`,()=>{s(e.dataset.number,e.dataset.name)})}),r.querySelector(`.add-contact-btn`)?.addEventListener(`click`,()=>{l()}),e.info(`EmergencyContacts`,`Widget rendered`,{contactCount:t.length})}catch(t){e.error(`EmergencyContacts`,`Widget render failed`,t),r.innerHTML=`<p style="color: #d11f34;">Failed to load emergency contacts</p>`}}function l(){let e=document.createElement(`div`);e.className=`modal-overlay`,e.style.cssText=`
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    `,e.innerHTML=`
        <div style="background: white; padding: 32px; border-radius: 24px; max-width: 400px; width: 100%;">
            <h3 style="margin: 0 0 20px; font-size: 1.5rem; font-weight: 800;">Add Emergency Contact</h3>
            <div style="display: grid; gap: 16px;">
                <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Name</label>
                    <input type="text" id="contactName" placeholder="e.g., Mom" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 12px;">
                </div>
                <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Phone Number</label>
                    <input type="tel" id="contactNumber" placeholder="e.g., +1 (555) 123-4567" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 12px;">
                </div>
                <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Relationship</label>
                    <select id="contactRelationship" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 12px;">
                        <option>Parent</option>
                        <option>Guardian</option>
                        <option>Sibling</option>
                        <option>Friend</option>
                        <option>Other</option>
                    </select>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 16px;">
                    <button id="cancelBtn" style="flex: 1; padding: 14px; border: none; border-radius: 12px; background: #f1f5f9; font-weight: 700; cursor: pointer;">Cancel</button>
                    <button id="saveBtn" style="flex: 1; padding: 14px; border: none; border-radius: 12px; background: #5a1fe0; color: white; font-weight: 700; cursor: pointer;">Save</button>
                </div>
            </div>
        </div>
    `,document.body.appendChild(e),e.querySelector(`#cancelBtn`).addEventListener(`click`,()=>e.remove()),e.querySelector(`#saveBtn`).addEventListener(`click`,()=>{let t=document.getElementById(`contactName`).value.trim(),n=document.getElementById(`contactNumber`).value.trim(),i=document.getElementById(`contactRelationship`).value;if(!t||!n){r.showToast(`Please enter name and number`,`error`);return}o({name:t,number:n,relationship:i}),r.showToast(`Contact added successfully`,`success`),e.remove();let a=document.querySelector(`.emergency-contacts-widget`);a?.parentElement?.id&&c(a.parentElement.id,`current`)})}export{c as t};