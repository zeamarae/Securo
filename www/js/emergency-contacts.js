/**
 * Emergency Contact Quick-Dial System
 * Date: 2026-10-06
 * Provides one-tap emergency calling during SOS situations
 */

import { Logger, UI, Storage } from './utils.js';
import { getUserProfile } from './db.js';

// Default emergency contacts
const DEFAULT_CONTACTS = [
    {
        id: 'emergency_911',
        name: '911 Emergency',
        number: '911',
        icon: 'emergency',
        color: '#d11f34',
        priority: 1,
        type: 'emergency'
    },
    {
        id: 'campus_security',
        name: 'Campus Security',
        number: '',
        icon: 'security',
        color: '#5a1fe0',
        priority: 2,
        type: 'campus'
    },
    {
        id: 'campus_medical',
        name: 'Campus Medical',
        number: '',
        icon: 'medical_services',
        color: '#0f9b67',
        priority: 3,
        type: 'campus'
    }
];

/**
 * Get user's emergency contacts
 * @param {string} userId 
 */
export async function getEmergencyContacts(userId) {
    try {
        // Get saved custom contacts
        const customContacts = Storage.get('emergency_contacts', []);
        
        // Get guardian contacts from profile
        const profile = await getUserProfile(userId);
        const guardianContacts = [];
        
        if (profile?.guardianPhone) {
            guardianContacts.push({
                id: 'guardian_primary',
                name: profile.guardianName || 'Guardian',
                number: profile.guardianPhone,
                icon: 'family_restroom',
                color: '#f43f5e',
                priority: 4,
                type: 'guardian'
            });
        }

        // Merge all contacts
        const allContacts = [
            ...DEFAULT_CONTACTS,
            ...guardianContacts,
            ...customContacts
        ];

        return allContacts.sort((a, b) => a.priority - b.priority);
    } catch (error) {
        Logger.error('EmergencyContacts', 'Failed to get contacts', error);
        return DEFAULT_CONTACTS;
    }
}

/**
 * Add custom emergency contact
 * @param {object} contact - { name, number, relationship }
 */
export function addEmergencyContact(contact) {
    try {
        const contacts = Storage.get('emergency_contacts', []);
        
        const newContact = {
            id: `custom_${Date.now()}`,
            name: contact.name,
            number: contact.number,
            relationship: contact.relationship || 'Other',
            icon: 'contact_phone',
            color: '#06b6d4',
            priority: 10 + contacts.length,
            type: 'custom'
        };

        contacts.push(newContact);
        Storage.set('emergency_contacts', contacts);
        
        Logger.info('EmergencyContacts', 'Contact added', newContact);
        return newContact;
    } catch (error) {
        Logger.error('EmergencyContacts', 'Failed to add contact', error);
        return null;
    }
}

/**
 * Remove custom emergency contact
 * @param {string} contactId 
 */
export function removeEmergencyContact(contactId) {
    try {
        const contacts = Storage.get('emergency_contacts', []);
        const updated = contacts.filter(c => c.id !== contactId);
        Storage.set('emergency_contacts', updated);
        
        Logger.info('EmergencyContacts', 'Contact removed', { contactId });
        return true;
    } catch (error) {
        Logger.error('EmergencyContacts', 'Failed to remove contact', error);
        return false;
    }
}

/**
 * Update campus emergency numbers (Admin only)
 * @param {object} numbers - { security, medical, gad }
 */
export function updateCampusContacts(numbers) {
    try {
        Storage.set('campus_emergency_numbers', numbers);
        Logger.info('EmergencyContacts', 'Campus contacts updated', numbers);
        return true;
    } catch (error) {
        Logger.error('EmergencyContacts', 'Failed to update campus contacts', error);
        return false;
    }
}

/**
 * Get campus emergency numbers
 */
export function getCampusContacts() {
    return Storage.get('campus_emergency_numbers', {
        security: '',
        medical: '',
        gad: ''
    });
}

/**
 * Initiate phone call
 * @param {string} number 
 * @param {string} contactName 
 */
export function initiateCall(number, contactName = 'Emergency Contact') {
    try {
        if (!number) {
            UI.showToast('No phone number available', 'error');
            return false;
        }

        // Clean number
        const cleanNumber = number.replace(/\D/g, '');
        
        // Create tel: link
        const telLink = `tel:${cleanNumber}`;
        
        // Log the call attempt
        Logger.info('EmergencyContacts', 'Call initiated', { 
            contact: contactName, 
            number: cleanNumber 
        });

        // Open dialer
        window.location.href = telLink;
        
        // Show confirmation
        UI.showToast(`Calling ${contactName}...`, 'info', 2000);
        
        return true;
    } catch (error) {
        Logger.error('EmergencyContacts', 'Call failed', error);
        UI.showToast('Failed to initiate call', 'error');
        return false;
    }
}

/**
 * Send emergency SMS
 * @param {string} number 
 * @param {string} message 
 */
export function sendEmergencySMS(number, message = 'Emergency! I need help.') {
    try {
        if (!number) {
            UI.showToast('No phone number available', 'error');
            return false;
        }

        const cleanNumber = number.replace(/\D/g, '');
        const encodedMessage = encodeURIComponent(message);
        
        // Create SMS link
        const smsLink = `sms:${cleanNumber}?body=${encodedMessage}`;
        
        Logger.info('EmergencyContacts', 'SMS initiated', { number: cleanNumber });
        
        window.location.href = smsLink;
        UI.showToast('Opening messaging app...', 'info', 2000);
        
        return true;
    } catch (error) {
        Logger.error('EmergencyContacts', 'SMS failed', error);
        UI.showToast('Failed to send SMS', 'error');
        return false;
    }
}

/**
 * Create emergency contact widget
 * @param {string} containerId 
 * @param {string} userId 
 */
export async function renderEmergencyContactWidget(containerId, userId) {
    const container = document.getElementById(containerId);
    if (!container) {
        Logger.error('EmergencyContacts', 'Container not found', { containerId });
        return;
    }

    try {
        const contacts = await getEmergencyContacts(userId);
        
        container.innerHTML = `
            <div class="emergency-contacts-widget">
                <h3 class="widget-title">
                    <span class="material-symbols-outlined">phone</span>
                    Emergency Contacts
                </h3>
                <div class="contacts-list">
                    ${contacts.filter(c => c.number).map(contact => `
                        <button class="contact-btn" data-number="${contact.number}" data-name="${contact.name}" style="--contact-color: ${contact.color}">
                            <span class="contact-icon material-symbols-outlined">${contact.icon}</span>
                            <div class="contact-info">
                                <span class="contact-name">${contact.name}</span>
                                <span class="contact-number">${contact.number}</span>
                            </div>
                            <span class="material-symbols-outlined call-icon">call</span>
                        </button>
                    `).join('')}
                </div>
                <button class="add-contact-btn">
                    <span class="material-symbols-outlined">add</span>
                    <span>Add Contact</span>
                </button>
            </div>
        `;

        // Add styles
        if (!document.getElementById('emergency-contacts-styles')) {
            const style = document.createElement('style');
            style.id = 'emergency-contacts-styles';
            style.textContent = `
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
            `;
            document.head.appendChild(style);
        }

        // Add event listeners
        container.querySelectorAll('.contact-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const number = btn.dataset.number;
                const name = btn.dataset.name;
                initiateCall(number, name);
            });
        });

        container.querySelector('.add-contact-btn')?.addEventListener('click', () => {
            showAddContactModal();
        });

        Logger.info('EmergencyContacts', 'Widget rendered', { contactCount: contacts.length });
    } catch (error) {
        Logger.error('EmergencyContacts', 'Widget render failed', error);
        container.innerHTML = '<p style="color: #d11f34;">Failed to load emergency contacts</p>';
    }
}

/**
 * Show add contact modal
 */
function showAddContactModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    `;

    modal.innerHTML = `
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
    `;

    document.body.appendChild(modal);

    modal.querySelector('#cancelBtn').addEventListener('click', () => modal.remove());
    modal.querySelector('#saveBtn').addEventListener('click', () => {
        const name = document.getElementById('contactName').value.trim();
        const number = document.getElementById('contactNumber').value.trim();
        const relationship = document.getElementById('contactRelationship').value;

        if (!name || !number) {
            UI.showToast('Please enter name and number', 'error');
            return;
        }

        addEmergencyContact({ name, number, relationship });
        UI.showToast('Contact added successfully', 'success');
        modal.remove();
        
        // Refresh widget if exists
        const widget = document.querySelector('.emergency-contacts-widget');
        if (widget?.parentElement?.id) {
            renderEmergencyContactWidget(widget.parentElement.id, 'current');
        }
    });
}

/**
 * Create SOS FAB with emergency contacts
 */
export function createSOSFabWithContacts() {
    const fab = document.createElement('div');
    fab.id = 'sos-fab-enhanced';
    fab.className = 'sos-fab-enhanced';
    
    fab.innerHTML = `
        <button class="sos-main-btn" id="sosMainBtn">
            <span class="material-symbols-outlined">emergency</span>
        </button>
        <div class="sos-menu" id="sosMenu">
            <button class="sos-menu-item" data-action="call-911">
                <span class="material-symbols-outlined">emergency</span>
                <span>Call 911</span>
            </button>
            <button class="sos-menu-item" data-action="call-security">
                <span class="material-symbols-outlined">security</span>
                <span>Campus Security</span>
            </button>
            <button class="sos-menu-item" data-action="call-guardian">
                <span class="material-symbols-outlined">family_restroom</span>
                <span>Call Guardian</span>
            </button>
            <button class="sos-menu-item" data-action="sos-alert">
                <span class="material-symbols-outlined">notification_important</span>
                <span>Send SOS Alert</span>
            </button>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .sos-fab-enhanced {
            position: fixed;
            right: 24px;
            bottom: 100px;
            z-index: 1000;
        }
        .sos-main-btn {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #ff4b61, #d71f35);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 12px 32px rgba(215,31,53,0.4);
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        .sos-main-btn:active {
            transform: scale(0.9);
        }
        .sos-main-btn .material-symbols-outlined {
            font-size: 32px;
        }
        .sos-menu {
            position: absolute;
            bottom: 76px;
            right: 0;
            display: none;
            flex-direction: column;
            gap: 12px;
            min-width: 200px;
        }
        .sos-menu.active {
            display: flex;
            animation: sosMenuSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes sosMenuSlide {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .sos-menu-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 18px;
            border: none;
            border-radius: 16px;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-weight: 700;
            cursor: pointer;
            transition: transform 0.2s ease;
            text-align: left;
        }
        .sos-menu-item:hover {
            transform: translateX(-4px);
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(fab);

    // Toggle menu
    const mainBtn = fab.querySelector('#sosMainBtn');
    const menu = fab.querySelector('#sosMenu');

    mainBtn.addEventListener('click', () => {
        menu.classList.toggle('active');
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (!fab.contains(e.target)) {
            menu.classList.remove('active');
        }
    });

    // Handle menu actions
    fab.querySelectorAll('.sos-menu-item').forEach(item => {
        item.addEventListener('click', async () => {
            const action = item.dataset.action;
            menu.classList.remove('active');

            switch (action) {
                case 'call-911':
                    initiateCall('911', '911 Emergency');
                    break;
                case 'call-security':
                    const campusNumbers = getCampusContacts();
                    if (campusNumbers.security) {
                        initiateCall(campusNumbers.security, 'Campus Security');
                    } else {
                        UI.showToast('Campus security number not configured', 'warning');
                    }
                    break;
                case 'call-guardian':
                    const contacts = await getEmergencyContacts('current');
                    const guardian = contacts.find(c => c.type === 'guardian');
                    if (guardian) {
                        initiateCall(guardian.number, guardian.name);
                    } else {
                        UI.showToast('No guardian contact found', 'warning');
                    }
                    break;
                case 'sos-alert':
                    // Trigger existing SOS system
                    window.dispatchEvent(new CustomEvent('trigger-sos'));
                    break;
            }
        });
    });

    return fab;
}

export default {
    getEmergencyContacts,
    addEmergencyContact,
    removeEmergencyContact,
    updateCampusContacts,
    getCampusContacts,
    initiateCall,
    sendEmergencySMS,
    renderEmergencyContactWidget,
    createSOSFabWithContacts
};
