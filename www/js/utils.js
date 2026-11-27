/**
 * Securo Utils Library v2.0
 * Comprehensive utilities for error handling, validation, permissions, and UI
 * Date: 2026-10-06
 */

// ========================================
// ERROR HANDLING & LOGGING
// ========================================

export const Logger = {
    error: (context, error, data = {}) => {
        console.error(`[Securo Error] ${context}:`, error, data);
        // Future: Send to error tracking service
    },
    warn: (context, message, data = {}) => {
        console.warn(`[Securo Warning] ${context}:`, message, data);
    },
    info: (context, message, data = {}) => {
        console.log(`[Securo Info] ${context}:`, message, data);
    }
};

// ========================================
// PERMISSION MANAGEMENT
// ========================================

export const Permissions = {
    async checkCamera() {
        try {
            const permission = await navigator.permissions.query({ name: 'camera' });
            return permission.state === 'granted';
        } catch {
            return false;
        }
    },

    async requestCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            localStorage.setItem('securo_camera_granted', 'true');
            if (localStorage.getItem('securo_location_granted') === 'true') {
                localStorage.setItem('securo_permissions_completed', 'true');
            }
            return true;
        } catch (error) {
            Logger.warn('Permissions', 'Camera access denied', error);
            localStorage.setItem('securo_camera_granted', 'false');
            return false;
        }
    },

    async checkLocation() {
        try {
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            return permission.state === 'granted';
        } catch {
            return false;
        }
    },

    async requestLocation() {
        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                () => {
                    localStorage.setItem('securo_location_granted', 'true');
                    if (localStorage.getItem('securo_camera_granted') === 'true') {
                        localStorage.setItem('securo_permissions_completed', 'true');
                    }
                    resolve(true);
                },
                (error) => {
                    Logger.warn('Permissions', 'Location access denied', error);
                    localStorage.setItem('securo_location_granted', 'false');
                    resolve(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    },

    getCurrentLocation(options = {}) {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp
                    });
                },
                (error) => {
                    Logger.error('Permissions', 'Failed to get location', error);
                    reject(error);
                },
                {
                    enableHighAccuracy: options.highAccuracy !== false,
                    timeout: options.timeout || 15000,
                    maximumAge: options.maximumAge || 0
                }
            );
        });
    },

    // (2026-07-13) Verify both camera & location allowed; was check single flag
    async hasAllPermissionsGranted() {
        const camOk = localStorage.getItem('securo_camera_granted') === 'true';
        const locOk = localStorage.getItem('securo_location_granted') === 'true';
        if (camOk && locOk) {
            localStorage.setItem('securo_permissions_completed', 'true');
            return true;
        }
        try {
            const [cam, loc] = await Promise.all([
                this.checkCamera().catch(() => false),
                this.checkLocation().catch(() => false)
            ]);
            if (cam && loc) {
                localStorage.setItem('securo_camera_granted', 'true');
                localStorage.setItem('securo_location_granted', 'true');
                localStorage.setItem('securo_permissions_completed', 'true');
                return true;
            }
        } catch {
            // ignore
        }
        localStorage.removeItem('securo_permissions_completed');
        return false;
    },

    // (2026-07-13) Show onboarding unless both permissions allowed; was flag check
    shouldShowPermissionOnboarding() {
        const camOk = localStorage.getItem('securo_camera_granted') === 'true';
        const locOk = localStorage.getItem('securo_location_granted') === 'true';
        if (camOk && locOk) {
            return false;
        }
        return true;
    }
};

// ========================================
// VALIDATION
// ========================================

export const Validation = {
    studentId(id) {
        const cleaned = String(id || '').trim();
        // Support 7-digit format
        if (/^\d{7}$/.test(cleaned)) {
            return { valid: true, value: cleaned, format: '7-digit' };
        }
        // Support legacy YYYY-XXXXX format
        if (/^\d{4}-\d{5}$/.test(cleaned)) {
            return { valid: true, value: cleaned, format: 'legacy' };
        }
        return { valid: false, error: 'Student ID must be 7 digits (e.g., 1234567) or YYYY-XXXXX format' };
    },

    email(email) {
        const cleaned = String(email || '').trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleaned)) {
            return { valid: false, error: 'Please enter a valid email address' };
        }
        return { valid: true, value: cleaned };
    },

    password(password, options = {}) {
        const minLength = options.minLength || 8;
        const pwd = String(password || '');
        
        if (pwd.length < minLength) {
            return { valid: false, error: `Password must be at least ${minLength} characters` };
        }
        
        const strength = {
            score: 0,
            feedback: []
        };

        if (pwd.length >= 12) strength.score++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) {
            strength.score++;
            strength.feedback.push('Mixed case');
        }
        if (/\d/.test(pwd)) {
            strength.score++;
            strength.feedback.push('Contains numbers');
        }
        if (/[^a-zA-Z0-9]/.test(pwd)) {
            strength.score++;
            strength.feedback.push('Contains symbols');
        }

        return { 
            valid: true, 
            value: pwd,
            strength: strength.score >= 2 ? 'strong' : strength.score === 1 ? 'medium' : 'weak',
            strengthScore: strength.score,
            feedback: strength.feedback
        };
    },

    name(name) {
        const cleaned = String(name || '').trim();
        if (cleaned.length < 2) {
            return { valid: false, error: 'Name must be at least 2 characters' };
        }
        if (cleaned.length > 100) {
            return { valid: false, error: 'Name is too long' };
        }
        return { valid: true, value: cleaned };
    },

    phoneNumber(phone) {
        const cleaned = String(phone || '').replace(/\D/g, '');
        if (cleaned.length < 10 || cleaned.length > 15) {
            return { valid: false, error: 'Please enter a valid phone number' };
        }
        return { valid: true, value: cleaned };
    }
};

// ========================================
// UI UTILITIES
// ========================================

export const UI = {
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `securo-toast securo-toast-${type}`;
        
        const icons = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };

        toast.innerHTML = `
            <span class="material-symbols-outlined">${icons[type] || 'info'}</span>
            <span>${message}</span>
        `;

        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 16px;
            background: ${type === 'error' ? '#d11f34' : type === 'success' ? '#0f9b67' : type === 'warning' ? '#f59e0b' : '#5a1fe0'};
            color: white;
            font-weight: 600;
            font-size: 0.9rem;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            max-width: 400px;
            backdrop-filter: blur(12px);
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    setButtonLoading(button, isLoading, originalText = '') {
        if (!button) return;

        if (isLoading) {
            button.dataset.originalText = button.textContent;
            button.classList.add('is-busy');
            button.disabled = true;
        } else {
            button.classList.remove('is-busy');
            button.disabled = false;
            if (originalText || button.dataset.originalText) {
                button.textContent = originalText || button.dataset.originalText;
            }
        }
    },

    // (2026-07-13) Inject shared styles for UI.showModal & overlay; was unstyled
    ensureModalStyles() {
        if (document.getElementById('securo-ui-modal-styles')) return;
        const style = document.createElement('style');
        style.id = 'securo-ui-modal-styles';
        style.textContent = `
            @keyframes securoModalFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes securoModalFadeOut { from { opacity: 1; } to { opacity: 0; } }
            @keyframes securoModalPopIn { from { opacity: 0; transform: scale(0.92) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            .securo-modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(23, 20, 40, 0.62);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10050;
                padding: 20px;
                animation: securoModalFadeIn 0.2s ease forwards;
                font-family: 'Outfit', system-ui, -apple-system, sans-serif;
            }
            .securo-modal-overlay.closing {
                animation: securoModalFadeOut 0.18s ease forwards;
            }
            .securo-modal-card {
                width: 100%;
                max-width: 368px;
                background: #ffffff;
                border-radius: 26px;
                padding: 28px 24px 22px;
                text-align: center;
                box-shadow: 0 24px 60px rgba(23, 20, 40, 0.28), 0 0 0 1px rgba(90, 31, 224, 0.08);
                animation: securoModalPopIn 0.22s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                box-sizing: border-box;
            }
            .securo-modal-icon {
                width: 60px;
                height: 60px;
                border-radius: 18px;
                margin: 0 auto 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(90, 31, 224, 0.12);
                color: var(--primary, #5a1fe0);
            }
            .securo-modal-icon .material-symbols-outlined {
                font-size: 30px;
                line-height: 1;
            }
            .securo-modal-icon.success { background: rgba(16, 185, 129, 0.14); color: #059669; }
            .securo-modal-icon.warning { background: rgba(245, 158, 11, 0.14); color: #d97706; }
            .securo-modal-icon.error { background: rgba(220, 38, 38, 0.14); color: #dc2626; }
            .securo-modal-title {
                margin: 0 0 8px;
                font-family: 'Sora', 'Outfit', sans-serif;
                font-size: 1.24rem;
                font-weight: 800;
                color: #181428;
                letter-spacing: -0.02em;
            }
            .securo-modal-message {
                margin: 0 0 22px;
                font-size: 0.9rem;
                line-height: 1.5;
                color: #64748b;
            }
            .securo-modal-actions {
                display: flex;
                gap: 10px;
                width: 100%;
            }
            .securo-modal-actions button {
                flex: 1;
                height: 46px;
                border-radius: 14px;
                border: none;
                font-family: inherit;
                font-size: 0.92rem;
                font-weight: 700;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
            }
            .securo-modal-actions button:active {
                transform: scale(0.97);
            }
            .securo-modal-actions .btn-secondary {
                background: #f1f0f7;
                color: #475569;
            }
            .securo-modal-actions .btn-secondary:hover {
                background: #e5e3f0;
                color: #1e293b;
            }
            .securo-modal-actions .btn-primary {
                background: linear-gradient(135deg, var(--primary, #682ef1), #4e14e6);
                color: #ffffff;
                box-shadow: 0 8px 20px rgba(90, 31, 224, 0.26);
            }
            .securo-modal-actions .btn-primary.error {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                box-shadow: 0 8px 20px rgba(220, 38, 38, 0.26);
            }
            .securo-modal-actions .btn-primary.success {
                background: linear-gradient(135deg, #10b981, #059669);
                box-shadow: 0 8px 20px rgba(5, 150, 105, 0.26);
            }
            .securo-modal-actions .btn-primary.warning {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                box-shadow: 0 8px 20px rgba(217, 119, 6, 0.26);
            }
            #securo-loading-overlay .spinner {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 3.5px solid rgba(255, 255, 255, 0.25);
                border-top-color: #ffffff;
                animation: securoSpin 0.8s linear infinite;
            }
            @keyframes securoSpin { to { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);
    },

    showModal(title, message, options = {}) {
        return new Promise((resolve) => {
            this.ensureModalStyles();
            const type = options.type || 'info';
            const modal = document.createElement('div');
            modal.className = 'securo-modal-overlay';
            modal.innerHTML = `
                <div class="securo-modal-card" role="dialog" aria-modal="true">
                    <div class="securo-modal-icon ${type}">
                        <span class="material-symbols-outlined">
                            ${type === 'error' ? 'error' : type === 'success' ? 'check_circle' : type === 'warning' ? 'warning' : 'info'}
                        </span>
                    </div>
                    <h3 class="securo-modal-title">${title}</h3>
                    <p class="securo-modal-message">${message}</p>
                    <div class="securo-modal-actions">
                        ${options.showCancel ? `<button type="button" class="btn-secondary" data-action="cancel">${options.cancelText || 'Cancel'}</button>` : ''}
                        <button type="button" class="btn-primary ${type}" data-action="confirm">${options.confirmText || 'OK'}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const closeModal = (confirmed) => {
                modal.classList.add('closing');
                setTimeout(() => modal.remove(), 180);
                resolve(confirmed);
            };

            modal.addEventListener('click', (e) => {
                const actionBtn = e.target.closest('[data-action]');
                if (actionBtn) {
                    closeModal(actionBtn.dataset.action === 'confirm');
                } else if (e.target === modal && options.showCancel) {
                    closeModal(false);
                }
            });
        });
    },

    showLoadingOverlay(message = 'Loading...') {
        this.ensureModalStyles();
        const overlay = document.createElement('div');
        overlay.id = 'securo-loading-overlay';
        overlay.innerHTML = `
            <div class="spinner"></div>
            <p>${message}</p>
        `;
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(23, 20, 40, 0.85);
            backdrop-filter: blur(8px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
            z-index: 9999;
            color: white;
            font-weight: 600;
        `;
        document.body.appendChild(overlay);
    },

    hideLoadingOverlay() {
        const overlay = document.getElementById('securo-loading-overlay');
        if (overlay) overlay.remove();
    }
};

// ========================================
// DATA FORMATTING
// ========================================

export const Format = {
    date(timestamp, format = 'relative') {
        if (!timestamp) return 'Unknown';

        const date = timestamp?.seconds 
            ? new Date(timestamp.seconds * 1000)
            : new Date(timestamp);

        if (format === 'relative') {
            const now = Date.now();
            const diff = now - date.getTime();
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            if (minutes < 1) return 'Just now';
            if (minutes < 60) return `${minutes}m ago`;
            if (hours < 24) return `${hours}h ago`;
            if (days < 7) return `${days}d ago`;
        }

        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    fileSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    },

    initials(name) {
        if (!name) return '?';
        const parts = String(name).trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    },

    truncate(text, maxLength = 50) {
        const str = String(text || '');
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength) + '...';
    }
};

// ========================================
// STORAGE UTILITIES
// ========================================

export const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(`securo_${key}`, JSON.stringify(value));
            return true;
        } catch (error) {
            Logger.error('Storage', 'Failed to save data', { key, error });
            return false;
        }
    },

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(`securo_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            Logger.error('Storage', 'Failed to retrieve data', { key, error });
            return defaultValue;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(`securo_${key}`);
            return true;
        } catch (error) {
            Logger.error('Storage', 'Failed to remove data', { key, error });
            return false;
        }
    },

    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('securo_')) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            Logger.error('Storage', 'Failed to clear storage', error);
            return false;
        }
    }
};

// ========================================
// NETWORK & CONNECTIVITY
// ========================================

export const Network = {
    isOnline() {
        return navigator.onLine;
    },

    onStatusChange(callback) {
        window.addEventListener('online', () => callback(true));
        window.addEventListener('offline', () => callback(false));
    },

    async checkFirestoreConnection() {
        // Will be implemented with actual Firestore health check
        return this.isOnline();
    }
};

// ========================================
// DEBOUNCE & THROTTLE
// ========================================

export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========================================
// DEVICE DETECTION
// ========================================

export const Device = {
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    },

    isAndroid() {
        return /Android/.test(navigator.userAgent);
    },

    hasNotch() {
        // Check for iPhone X and newer
        return this.isIOS() && window.screen.height >= 812;
    },

    getBatteryLevel() {
        if ('getBattery' in navigator) {
            return navigator.getBattery().then(battery => ({
                level: Math.round(battery.level * 100),
                charging: battery.charging
            }));
        }
        return Promise.resolve({ level: null, charging: null });
    }
};

// Export all as default
export default {
    Logger,
    Permissions,
    Validation,
    UI,
    Format,
    Storage,
    Network,
    debounce,
    throttle,
    Device
};

// (2026-07-13) Prevent image drag across entire application; was draggable
if (typeof window !== 'undefined') {
    window.addEventListener('dragstart', (e) => {
        if (e.target && e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    }, false);
}

