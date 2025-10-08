/**
 * Freemium Activation System for English for Uzbek Seasonal Workers
 * Implements freemium model with Chapters 0-5 free, Chapters 6-24 premium
 */

/**
 * AccessControlManager - Manages premium access and chapter availability
 * Handles localStorage persistence and activation status
 */
class AccessControlManager {
    constructor() {
        this.freeChapters = [0, 1, 2, 3, 4, 5]; // Chapters 0-5 are free
        this.premiumChapters = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]; // Chapters 6-24 are premium
        this.storageKey = 'englishCourse_premiumAccess';

        // Set default language to Uzbek if not already set
        this.setDefaultLanguage();

        this.checkActivationStatus();
    }

    /**
     * Checks if a specific chapter is accessible to the user
     * @param {number} chapterNumber - The chapter number to check
     * @returns {boolean} - True if accessible, false otherwise
     */
    isChapterAccessible(chapterNumber) {
        // Free chapters are always accessible
        if (this.freeChapters.includes(chapterNumber)) {
            return true;
        }

        // Premium chapters require activation
        if (this.premiumChapters.includes(chapterNumber)) {
            return this.isPremiumActivated();
        }

        return false;
    }

    /**
     * Checks if premium access is currently activated
     * @returns {boolean} - True if premium is activated, false otherwise
     */
    isPremiumActivated() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) return false;

            const activationData = JSON.parse(data);
            return activationData.isPremiumActivated === true;
        } catch (error) {
            console.error('Error checking premium status:', error);
            this.handleStorageError('checking premium status', error);
            return false;
        }
    }

    /**
     * Handles localStorage errors with graceful degradation
     * @param {string} operation - The operation that failed
     * @param {Error} error - The error object
     */
    handleStorageError(operation, error) {
        console.warn(`localStorage error during ${operation}:`, error);

        // Try sessionStorage as fallback
        if (this.storageKey && typeof sessionStorage !== 'undefined') {
            try {
                // Attempt to use sessionStorage as fallback
                const sessionData = sessionStorage.getItem(this.storageKey);
                if (sessionData) {
                    console.log('Using sessionStorage as fallback');
                    return JSON.parse(sessionData);
                }
            } catch (sessionError) {
                console.warn('sessionStorage also unavailable:', sessionError);
            }
        }

        // Show user-friendly error message
        this.showStorageErrorMessage();
        return null;
    }

    /**
     * Shows user-friendly error message for storage issues
     */
    showStorageErrorMessage() {
        const errorMessage = this.getLocalizedMessage('storage_error');
        this.displaySystemError(errorMessage);
    }

    /**
     * Gets localized error messages
     * @param {string} key - Message key
     * @returns {string} - Localized message
     */
    getLocalizedMessage(key) {
        const messages = {
            'storage_error': {
                'en': 'Unable to save activation data. Please check your browser settings and try again.',
                'uz': 'Faollashtirish ma\'lumotlarini saqlab bo\'lmadi. Brauzer sozlamalarini tekshiring va qayta urinib ko\'ring.'
            },
            'activation_failed': {
                'en': 'Activation failed. Please check your key and try again.',
                'uz': 'Faollashtirish muvaffaqiyatsiz. Kalitni tekshiring va qayta urinib ko\'ring.'
            },
            'invalid_key_format': {
                'en': 'Invalid key format. Please enter a 16-character key in XXXX-XXXX-XXXX-XXXX format.',
                'uz': 'Noto\'g\'ri kalit formati. XXXX-XXXX-XXXX-XXXX formatida 16 belgili kalitni kiriting.'
            },
            'key_already_used': {
                'en': 'This activation key has already been used.',
                'uz': 'Bu faollashtirish kaliti allaqachon ishlatilgan.'
            },
            'network_error': {
                'en': 'Network error. Please check your connection and try again.',
                'uz': 'Tarmoq xatosi. Internetga ulanishni tekshiring va qayta urinib ko\'ring.'
            }
        };

        // Default to English if key not found
        const language = this.detectLanguage();
        return messages[key]?.[language] || messages[key]?.['en'] || 'An error occurred';
    }

    /**
     * Detects user language preference
     * @returns {string} - Language code ('en' or 'uz')
     */
    detectLanguage() {
        // Check localStorage for saved preference
        try {
            const savedLang = localStorage.getItem('preferred_language');
            if (savedLang && ['en', 'uz'].includes(savedLang)) {
                return savedLang;
            }
        } catch (error) {
            console.warn('Cannot access localStorage for language preference');
        }

        // Check browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang && browserLang.toLowerCase().includes('uz')) {
            return 'uz';
        }

        // Default to Uzbek
        return 'uz';
    }

    /**
     * Displays system-level error messages
     * @param {string} message - Error message to display
     */
    displaySystemError(message) {
        // Create or update error notification
        let errorNotification = document.getElementById('system-error-notification');

        if (!errorNotification) {
            errorNotification = document.createElement('div');
            errorNotification.id = 'system-error-notification';
            errorNotification.setAttribute('role', 'alert');
            errorNotification.setAttribute('aria-live', 'assertive');

            // Style the notification
            errorNotification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 400px;
                background: #ffeaea;
                color: #ba1a1a;
                padding: 16px 20px;
                border-radius: 12px;
                border-left: 4px solid #ba1a1a;
                box-shadow: 0 4px 12px rgba(186, 26, 26, 0.15);
                z-index: 10001;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 14px;
                line-height: 1.4;
                animation: slideInRight 0.3s ease;
            `;

            document.body.appendChild(errorNotification);
        }

        errorNotification.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0; margin-top: 2px;">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                    <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                </svg>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">System Error</div>
                    <div>${message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer; padding: 4px; border-radius: 4px; margin-left: 8px;" aria-label="Close error message">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        `;

        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (errorNotification && errorNotification.parentNode) {
                errorNotification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (errorNotification.parentNode) {
                        errorNotification.parentNode.removeChild(errorNotification);
                    }
                }, 300);
            }
        }, 8000);

        // Add CSS animations if not already present
        this.addErrorAnimations();
    }

    /**
     * Adds CSS animations for error notifications
     */
    addErrorAnimations() {
        if (!document.getElementById('error-notification-animations')) {
            const style = document.createElement('style');
            style.id = 'error-notification-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                
                /* Reduced motion support */
                @media (prefers-reduced-motion: reduce) {
                    @keyframes slideInRight {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideOutRight {
                        from { opacity: 1; }
                        to { opacity: 0; }
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Activates premium access with the provided key
     * @param {string} activationKey - The activation key to use
     * @returns {Promise<{success: boolean, error?: string}>} - Activation result
     */
    async activatePremium(activationKey) {
        try {
            // Validate input
            if (!activationKey || typeof activationKey !== 'string') {
                return {
                    success: false,
                    error: this.getLocalizedMessage('invalid_key_format')
                };
            }

            const activationData = {
                isPremiumActivated: true,
                activationDate: new Date().toISOString(),
                activationKey: this.hashKey(activationKey),
                deviceInfo: this.getDeviceInfo()
            };

            // Try localStorage first
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(activationData));
            } catch (storageError) {
                console.warn('localStorage failed, trying sessionStorage:', storageError);

                // Fallback to sessionStorage
                try {
                    sessionStorage.setItem(this.storageKey, JSON.stringify(activationData));
                    this.showStorageWarning();
                } catch (sessionError) {
                    console.error('Both localStorage and sessionStorage failed:', sessionError);
                    return {
                        success: false,
                        error: this.getLocalizedMessage('storage_error')
                    };
                }
            }

            // Verify activation was saved
            const verification = this.isPremiumActivated();
            if (!verification) {
                return {
                    success: false,
                    error: this.getLocalizedMessage('activation_failed')
                };
            }

            return { success: true };

        } catch (error) {
            console.error('Error activating premium:', error);
            return {
                success: false,
                error: this.getLocalizedMessage('activation_failed')
            };
        }
    }

    /**
     * Gets basic device info for activation tracking
     * @returns {object} - Device information
     */
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent.substring(0, 100), // Truncate for privacy
            language: navigator.language,
            platform: navigator.platform,
            timestamp: Date.now()
        };
    }

    /**
     * Shows warning when using sessionStorage fallback
     */
    showStorageWarning() {
        const warningMessage = this.detectLanguage() === 'uz'
            ? 'Faollashtirish vaqtincha saqlandi. Brauzer yopilganda qayta faollashtirish kerak bo\'lishi mumkin.'
            : 'Activation saved temporarily. You may need to reactivate when browser is closed.';

        this.displaySystemWarning(warningMessage);
    }

    /**
     * Displays system warning messages
     * @param {string} message - Warning message to display
     */
    displaySystemWarning(message) {
        // Create warning notification
        const warningNotification = document.createElement('div');
        warningNotification.setAttribute('role', 'alert');
        warningNotification.setAttribute('aria-live', 'polite');

        warningNotification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 400px;
            background: #fff3cd;
            color: #856404;
            padding: 16px 20px;
            border-radius: 12px;
            border-left: 4px solid #ffc107;
            box-shadow: 0 4px 12px rgba(255, 193, 7, 0.15);
            z-index: 10001;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            animation: slideInRight 0.3s ease;
        `;

        warningNotification.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0; margin-top: 2px;">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="17" r="1" fill="currentColor"/>
                </svg>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">Warning</div>
                    <div>${message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer; padding: 4px; border-radius: 4px; margin-left: 8px;" aria-label="Close warning message">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(warningNotification);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (warningNotification && warningNotification.parentNode) {
                warningNotification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (warningNotification.parentNode) {
                        warningNotification.parentNode.removeChild(warningNotification);
                    }
                }, 300);
            }
        }, 10000);
    }

    /**
     * Checks activation status on initialization
     */
    checkActivationStatus() {
        // This method can be extended for additional startup checks
        const isActivated = this.isPremiumActivated();
        console.log('Premium activation status:', isActivated);
    }

    /**
     * Sets default language to Uzbek if not already set
     */
    setDefaultLanguage() {
        try {
            const savedLang = localStorage.getItem('preferred_language');
            if (!savedLang) {
                localStorage.setItem('preferred_language', 'uz');
                console.log('Default language set to Uzbek');
            }
        } catch (error) {
            console.warn('Could not set default language in localStorage:', error);
        }
    }

    /**
     * Hashes the activation key for secure storage
     * @param {string} key - The key to hash
     * @returns {string} - Hashed key
     */
    hashKey(key) {
        // Simple hash function for client-side security
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            const char = key.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }
}

/**
 * KeyValidator - Validates activation keys and prevents reuse
 * Implements security measures for the key system
 */
class KeyValidator {
    constructor() {
        this.usedKeysStorageKey = 'englishCourse_usedKeys';
        this.validKeyPattern = /^[A-Z0-9]{16}$/;

        // Pre-generated valid keys for demonstration
        // In production, this would be a more secure system
        this.validKeys = this.generateValidKeys();
    }

    /**
     * Validates the format of an activation key
     * @param {string} key - The key to validate
     * @returns {boolean} - True if format is valid, false otherwise
     */
    validateKeyFormat(key) {
        if (!key || typeof key !== 'string') {
            return false;
        }

        const cleanKey = key.replace(/-/g, '').toUpperCase();
        return this.validKeyPattern.test(cleanKey);
    }

    /**
     * Checks if a key has already been used
     * @param {string} key - The key to check
     * @returns {boolean} - True if key is used, false otherwise
     */
    isKeyUsed(key) {
        try {
            // Check both local used keys and admin database
            const usedKeys = this.getUsedKeys();
            const hashedKey = this.hashKey(key);
            
            // Check local used keys list
            let isUsedLocally = false;
            if (usedKeys) {
                isUsedLocally = usedKeys.includes(hashedKey);
            }
            
            // Check admin database for activation status
            let isUsedInAdmin = false;
            try {
                const adminKeyDatabase = localStorage.getItem('admin_key_database');
                if (adminKeyDatabase) {
                    const keyDatabase = JSON.parse(adminKeyDatabase);
                    const cleanKey = key.replace(/-/g, '').toUpperCase();
                    const formattedKey = key.toUpperCase();
                    
                    // Check if key exists and is activated in admin database
                    if (keyDatabase[formattedKey] && keyDatabase[formattedKey].activated) {
                        isUsedInAdmin = true;
                    } else if (keyDatabase[cleanKey] && keyDatabase[cleanKey].activated) {
                        isUsedInAdmin = true;
                    }
                }
            } catch (adminError) {
                console.warn('Could not check admin database:', adminError);
            }
            
            const isUsed = isUsedLocally || isUsedInAdmin;
            console.log('Key usage check:', {
                key: key,
                usedLocally: isUsedLocally,
                usedInAdmin: isUsedInAdmin,
                finalResult: isUsed
            });
            
            return isUsed;
            
        } catch (error) {
            console.error('Error checking key usage:', error);
            this.handleKeyValidationError('checking key usage', error);
            return false; // Assume not used on error to allow activation attempt
        }
    }

    /**
     * Handles key validation errors
     * @param {string} operation - The operation that failed
     * @param {Error} error - The error object
     */
    handleKeyValidationError(operation, error) {
        console.warn(`Key validation error during ${operation}:`, error);

        // Check if it's a storage-related error
        if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
            this.handleStorageQuotaError();
        } else if (error.name === 'SecurityError') {
            this.handleSecurityError();
        } else {
            // Generic error handling
            const message = this.getLocalizedMessage('validation_error');
            this.displayValidationError(message);
        }
    }

    /**
     * Handles storage quota exceeded errors
     */
    handleStorageQuotaError() {
        const message = this.detectLanguage() === 'uz'
            ? 'Brauzer xotirasi to\'lgan. Ba\'zi ma\'lumotlarni o\'chirib, qayta urinib ko\'ring.'
            : 'Browser storage is full. Please clear some data and try again.';
        this.displayValidationError(message);
    }

    /**
     * Handles security errors
     */
    handleSecurityError() {
        const message = this.detectLanguage() === 'uz'
            ? 'Xavfsizlik xatosi. Brauzer sozlamalarini tekshiring.'
            : 'Security error. Please check your browser settings.';
        this.displayValidationError(message);
    }

    /**
     * Displays validation error messages
     * @param {string} message - Error message to display
     */
    displayValidationError(message) {
        // Use the same error display system as AccessControlManager
        if (window.accessControlManager && typeof window.accessControlManager.displaySystemError === 'function') {
            window.accessControlManager.displaySystemError(message);
        } else {
            console.error('Validation Error:', message);
            alert(message); // Fallback for critical errors
        }
    }

    /**
     * Gets localized error messages (shared with AccessControlManager)
     * @param {string} key - Message key
     * @returns {string} - Localized message
     */
    getLocalizedMessage(key) {
        const messages = {
            'validation_error': {
                'en': 'Key validation error. Please try again.',
                'uz': 'Kalit tekshirishda xato. Qayta urinib ko\'ring.'
            },
            'invalid_key_format': {
                'en': 'Invalid key format. Please enter a 16-character key in XXXX-XXXX-XXXX-XXXX format.',
                'uz': 'Noto\'g\'ri kalit formati. XXXX-XXXX-XXXX-XXXX formatida 16 belgili kalitni kiriting.'
            },
            'key_already_used': {
                'en': 'This activation key has already been used.',
                'uz': 'Bu faollashtirish kaliti allaqachon ishlatilgan.'
            }
        };

        const language = this.detectLanguage();
        return messages[key]?.[language] || messages[key]?.['en'] || 'An error occurred';
    }

    /**
     * Detects user language preference
     * @returns {string} - Language code ('en' or 'uz')
     */
    detectLanguage() {
        try {
            const savedLang = localStorage.getItem('preferred_language');
            if (savedLang && ['en', 'uz'].includes(savedLang)) {
                return savedLang;
            }
        } catch (error) {
            // Ignore localStorage errors for language detection
        }

        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang && browserLang.toLowerCase().includes('uz')) {
            return 'uz';
        }

        return 'uz';
    }

    /**
     * Marks a key as used to prevent reuse
     * @param {string} key - The key to mark as used
     * @param {string} email - User's email address for tracking
     * @returns {boolean} - True if successfully marked, false otherwise
     */
    markKeyAsUsed(key, email = null) {
        try {
            const usedKeys = this.getUsedKeys();
            if (!usedKeys) {
                console.error('Could not retrieve used keys list');
                return false;
            }

            const hashedKey = this.hashKey(key);

            if (!usedKeys.includes(hashedKey)) {
                usedKeys.push(hashedKey);

                // Record activation for admin tracking
                this.recordActivationForAdmin(key, email);

                // Try localStorage first
                try {
                    localStorage.setItem(this.usedKeysStorageKey, JSON.stringify(usedKeys));
                    return true;
                } catch (storageError) {
                    console.warn('localStorage failed for marking key as used, trying sessionStorage:', storageError);

                    // Fallback to sessionStorage
                    try {
                        sessionStorage.setItem(this.usedKeysStorageKey, JSON.stringify(usedKeys));
                        this.showKeyStorageWarning();
                        return true;
                    } catch (sessionError) {
                        console.error('Both localStorage and sessionStorage failed for key marking:', sessionError);
                        this.handleKeyValidationError('marking key as used', sessionError);
                        return false;
                    }
                }
            }

            return true; // Key was already marked as used
        } catch (error) {
            console.error('Error marking key as used:', error);
            this.handleKeyValidationError('marking key as used', error);
            return false;
        }
    }

    /**
     * Records activation for admin tracking
     * @param {string} key - The activated key
     * @param {string} email - User's email address
     */
    recordActivationForAdmin(key, email = null) {
        try {
            // Get existing admin activation log
            let adminLog = [];
            try {
                const existingLog = localStorage.getItem('admin_activation_log');
                if (existingLog) {
                    adminLog = JSON.parse(existingLog);
                }
            } catch (error) {
                console.warn('Could not load existing admin log:', error);
            }

            // Detect source/platform
            const source = this.detectActivationSource();

            // Get approximate location (country level only for privacy)
            const location = this.getApproximateLocation();

            // Create activation record
            const activation = {
                id: Date.now() + Math.random(),
                key: key,
                email: email || 'Not provided',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                source: source,
                userId: this.generateAnonymousUserId(),
                ipAddress: 'Hidden for privacy',
                location: location,
                language: this.detectLanguage(),
                platform: navigator.platform,
                referrer: document.referrer || 'Direct'
            };

            // Add to log (keep at beginning)
            adminLog.unshift(activation);

            // Keep only last 1000 activations to prevent storage bloat
            if (adminLog.length > 1000) {
                adminLog = adminLog.slice(0, 1000);
            }

            // Update admin key database
            this.updateAdminKeyDatabase(key, activation);

            // Save updated log
            localStorage.setItem('admin_activation_log', JSON.stringify(adminLog));

            console.log('Activation recorded for admin tracking:', key);

        } catch (error) {
            console.warn('Could not record activation for admin tracking:', error);
            // Don't fail the activation process if admin tracking fails
        }
    }

    /**
     * Updates admin key database with activation info
     * @param {string} key - The activated key
     * @param {Object} activation - Activation details
     */
    updateAdminKeyDatabase(key, activation) {
        try {
            let keyDatabase = {};
            try {
                const existingDb = localStorage.getItem('admin_key_database');
                if (existingDb) {
                    keyDatabase = JSON.parse(existingDb);
                }
            } catch (error) {
                console.warn('Could not load existing key database:', error);
            }

            // Update key record
            if (keyDatabase[key]) {
                keyDatabase[key].activated = true;
                keyDatabase[key].activationDate = activation.timestamp;
                keyDatabase[key].activationDetails = activation;
            } else {
                // Create new record if key not found in database
                keyDatabase[key] = {
                    generated: 'Unknown', // We don't know when it was generated
                    activated: true,
                    activationDate: activation.timestamp,
                    activationDetails: activation,
                    batchId: 'Unknown'
                };
            }

            // Save updated database
            localStorage.setItem('admin_key_database', JSON.stringify(keyDatabase));

        } catch (error) {
            console.warn('Could not update admin key database:', error);
        }
    }

    /**
     * Detects the activation source/platform
     * @returns {string} - Source description
     */
    detectActivationSource() {
        // Check if running in Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp) {
            return 'Telegram Bot';
        }

        // Check if it's a mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Check referrer for more context
        const referrer = document.referrer;
        if (referrer.includes('telegram')) {
            return 'Telegram Link';
        } else if (referrer.includes('whatsapp')) {
            return 'WhatsApp Link';
        } else if (referrer.includes('facebook')) {
            return 'Facebook Link';
        } else if (referrer.includes('instagram')) {
            return 'Instagram Link';
        } else if (referrer.includes('google')) {
            return 'Google Search';
        } else if (referrer.includes('youtube')) {
            return 'YouTube Link';
        }

        // Default based on device type
        if (isMobile) {
            return 'Mobile Browser';
        } else {
            return 'Desktop Browser';
        }
    }

    /**
     * Gets approximate location (country level for privacy)
     * @returns {string} - Location description
     */
    getApproximateLocation() {
        // Use browser language and timezone to approximate location
        const language = navigator.language || navigator.userLanguage;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Map common timezones to countries (privacy-friendly)
        const timezoneToCountry = {
            'Europe/London': 'United Kingdom',
            'Europe/Moscow': 'Russia',
            'Asia/Tashkent': 'Uzbekistan',
            'Asia/Almaty': 'Kazakhstan',
            'Asia/Bishkek': 'Kyrgyzstan',
            'Asia/Dushanbe': 'Tajikistan',
            'Asia/Ashgabat': 'Turkmenistan',
            'Europe/Berlin': 'Germany',
            'Europe/Paris': 'France',
            'Europe/Rome': 'Italy',
            'Europe/Madrid': 'Spain',
            'America/New_York': 'United States',
            'America/Los_Angeles': 'United States'
        };

        const country = timezoneToCountry[timezone];
        if (country) {
            return country;
        }

        // Fallback to language-based guess
        if (language.startsWith('uz')) return 'Uzbekistan';
        if (language.startsWith('ru')) return 'Russia/CIS';
        if (language.startsWith('en-GB')) return 'United Kingdom';
        if (language.startsWith('en-US')) return 'United States';
        if (language.startsWith('en')) return 'English-speaking country';

        return 'Unknown';
    }

    /**
     * Generates anonymous user ID for tracking
     * @returns {string} - Anonymous user ID
     */
    generateAnonymousUserId() {
        // Try to get existing anonymous ID
        try {
            let anonymousId = localStorage.getItem('anonymous_user_id');
            if (!anonymousId) {
                // Generate new anonymous ID
                anonymousId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('anonymous_user_id', anonymousId);
            }
            return anonymousId;
        } catch (error) {
            // Fallback to session-based ID
            return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
    }

    /**
     * Shows warning when key storage falls back to sessionStorage
     */
    showKeyStorageWarning() {
        const message = this.detectLanguage() === 'uz'
            ? 'Kalit ma\'lumotlari vaqtincha saqlandi. Brauzer yopilganda kalit qayta ishlatilishi mumkin.'
            : 'Key data saved temporarily. Key may be reusable when browser is closed.';

        if (window.accessControlManager && typeof window.accessControlManager.displaySystemWarning === 'function') {
            window.accessControlManager.displaySystemWarning(message);
        }
    }

    /**
     * Validates if a key is valid and unused
     * @param {string} key - The key to validate
     * @returns {boolean} - True if key is valid and unused, false otherwise
     */
    isValidKey(key) {
        if (!this.validateKeyFormat(key)) {
            console.log('Key validation failed: Invalid format for key:', key);
            return false;
        }

        const cleanKey = key.replace(/-/g, '').toUpperCase();
        const formattedKey = key.toUpperCase();

        // Check if key exists in predefined valid keys list
        const inValidKeysList = this.validKeys.includes(cleanKey);
        console.log('Key in predefined list:', inValidKeysList, 'Key:', cleanKey);

        // Check if key exists in admin-generated keys database
        let inAdminDatabase = false;
        try {
            const adminKeyDatabase = localStorage.getItem('admin_key_database');
            if (adminKeyDatabase) {
                const keyDatabase = JSON.parse(adminKeyDatabase);
                inAdminDatabase = keyDatabase.hasOwnProperty(formattedKey) || keyDatabase.hasOwnProperty(cleanKey);
                console.log('Key in admin database:', inAdminDatabase, 'Formatted key:', formattedKey, 'Clean key:', cleanKey);
                console.log('Available keys in database:', Object.keys(keyDatabase));
            } else {
                console.log('No admin key database found');
            }
        } catch (error) {
            console.warn('Could not access admin key database:', error);
        }

        // Key is valid if it's in either the predefined list or admin database
        if (!inValidKeysList && !inAdminDatabase) {
            console.log('Key validation failed: Key not found in any database');
            return false;
        }

        // Check if key has been used
        if (this.isKeyUsed(cleanKey)) {
            console.log('Key validation failed: Key already used');
            return false;
        }

        console.log('Key validation successful for:', key);
        return true;
    }

    /**
     * Gets the list of used keys from storage with fallback handling
     * @returns {Array|null} - Array of used key hashes, or null on error
     */
    getUsedKeys() {
        // Try localStorage first
        try {
            const data = localStorage.getItem(this.usedKeysStorageKey);
            return data ? JSON.parse(data) : [];
        } catch (localStorageError) {
            console.warn('localStorage failed for getting used keys, trying sessionStorage:', localStorageError);

            // Try sessionStorage as fallback
            try {
                const sessionData = sessionStorage.getItem(this.usedKeysStorageKey);
                return sessionData ? JSON.parse(sessionData) : [];
            } catch (sessionStorageError) {
                console.error('Both localStorage and sessionStorage failed for getting used keys:', sessionStorageError);

                // Handle different types of errors
                if (localStorageError.name === 'SecurityError' || sessionStorageError.name === 'SecurityError') {
                    this.handleSecurityError();
                } else {
                    this.handleKeyValidationError('retrieving used keys', localStorageError);
                }

                return null; // Return null to indicate error, not empty array
            }
        }
    }

    /**
     * Hashes a key for secure storage
     * @param {string} key - The key to hash
     * @returns {string} - Hashed key
     */
    hashKey(key) {
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            const char = key.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    /**
     * Generates a set of valid keys for demonstration
     * In production, this would be handled server-side
     * @returns {Array} - Array of valid keys
     */
    generateValidKeys() {
        // Use centralized key system if available, otherwise fallback to local keys
        if (window.VALID_ACTIVATION_KEYS && Array.isArray(window.VALID_ACTIVATION_KEYS)) {
            console.log('Using centralized key system with', window.VALID_ACTIVATION_KEYS.length, 'keys');
            return window.VALID_ACTIVATION_KEYS;
        }

        // Fallback to local keys if centralized system not loaded
        console.log('Using fallback local key system');
        return [
            // Demo keys for testing
            'DEMO1234ABCD5678',
            'TEST9876WXYZ4321',
            'SAMPLE123456ABCD',
            'TRIAL789DEFG0123',
            'PREMIUM456789XYZ'
        ];
    }
}

/**
 * ChapterNavigationController - Controls navigation and access to chapters
 * Manages visual indicators and premium content blocking
 */
class ChapterNavigationController {
    constructor(accessControlManager) {
        this.accessControl = accessControlManager || new AccessControlManager();
        this.activationModal = null;

        this.init();
    }

    /**
     * Initializes the chapter navigation controller
     */
    init() {
        // Create activation modal instance
        this.activationModal = new ActivationModal();

        // Update chapter links and status
        this.updateChapterLinks();

        // Add premium access button to header
        this.addPremiumAccessButton();
    }

    /**
     * Updates chapter links based on access level
     * Adds lock icons and click handlers for premium chapters
     */
    updateChapterLinks() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.updateChapterStatus();
            });
        } else {
            this.updateChapterStatus();
        }
    }

    /**
     * Updates the visual status of all chapters
     */
    updateChapterStatus() {
        const chapterCards = document.querySelectorAll('.chapter-card');

        chapterCards.forEach((card, index) => {
            const chapterNumber = index; // Assuming cards are in order
            const isAccessible = this.accessControl.isChapterAccessible(chapterNumber);

            if (!isAccessible) {
                this.addLockIndicator(card, chapterNumber);
                this.addClickHandler(card, chapterNumber);
            } else {
                this.removeLockIndicator(card);
            }
        });
    }

    /**
     * Adds lock indicator to premium chapters
     * @param {HTMLElement} card - The chapter card element
     * @param {number} chapterNumber - The chapter number
     */
    addLockIndicator(card, chapterNumber) {
        // Remove existing lock indicator if present
        const existingLock = card.querySelector('.premium-lock-indicator');
        if (existingLock) {
            existingLock.remove();
        }

        // Create lock indicator
        const lockIndicator = document.createElement('div');
        lockIndicator.className = 'premium-lock-indicator';
        lockIndicator.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
                <path d="M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>Premium</span>
        `;

        // Add premium styling to card
        card.classList.add('premium-locked');

        // Insert lock indicator
        card.appendChild(lockIndicator);

        // Update card accessibility
        card.setAttribute('aria-label', `Chapter ${chapterNumber}: Premium content - requires activation`);
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
    }

    /**
     * Removes lock indicator from accessible chapters
     * @param {HTMLElement} card - The chapter card element
     */
    removeLockIndicator(card) {
        const lockIndicator = card.querySelector('.premium-lock-indicator');
        if (lockIndicator) {
            lockIndicator.remove();
        }

        card.classList.remove('premium-locked');
        card.removeAttribute('role');
        card.removeAttribute('tabindex');
    }

    /**
     * Adds click handler for locked chapters
     * @param {HTMLElement} card - The chapter card element
     * @param {number} chapterNumber - The chapter number
     */
    addClickHandler(card, chapterNumber) {
        // Remove existing event listeners
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);

        // Add new event listener
        newCard.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPremiumPrompt(chapterNumber);
        });

        // Add keyboard support
        newCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.showPremiumPrompt(chapterNumber);
            }
        });
    }

    /**
     * Shows premium prompt for locked chapters
     * @param {number} chapterNumber - The chapter number that was clicked
     */
    showPremiumPrompt(chapterNumber) {
        // Show the activation modal
        this.redirectToActivation();
    }

    /**
     * Redirects to activation modal
     */
    redirectToActivation() {
        if (this.activationModal) {
            this.activationModal.show();
        }
    }

    /**
     * Updates chapter links based on access control
     * Called when premium status changes
     */
    updateChapterLinks() {
        // Re-render chapters to reflect new access status
        if (typeof renderChapters === 'function') {
            try {
                renderChapters();
            } catch (error) {
                console.error('Error re-rendering chapters:', error);
                // Fallback to basic rendering
                if (typeof renderBasicChapters === 'function') {
                    renderBasicChapters();
                }
            }
        } else if (typeof renderBasicChapters === 'function') {
            renderBasicChapters();
        }
    }

    /**
     * Shows premium prompt for locked chapters
     * @param {number} chapterNumber - The chapter number that was clicked
     */
    showPremiumPrompt(chapterNumber) {
        console.log(`Premium access required for Chapter ${chapterNumber}`);
        this.redirectToActivation();
    }

    /**
     * Redirects to activation modal
     */
    redirectToActivation() {
        if (this.activationModal) {
            this.activationModal.show();
        } else {
            console.error('Activation modal not available');
        }
    }

    /**
     * Updates the visual status of chapters
     * Called after premium activation
     */
    updateChapterStatus() {
        // This will trigger a re-render of all chapters
        this.updateChapterLinks();

        // Update the premium access button visibility
        this.updatePremiumButton();
    }

    /**
     * Updates premium button visibility based on activation status
     */
    updatePremiumButton() {
        const existingButton = document.querySelector('.premium-access-button');

        if (this.accessControl.isPremiumActivated()) {
            // Remove the button if premium is activated
            if (existingButton) {
                existingButton.remove();
            }
        } else {
            // Add the button if premium is not activated and button doesn't exist
            if (!existingButton) {
                this.addPremiumAccessButton();
            }
        }
    }

    /**
     * Adds premium access button to the header
     */
    addPremiumAccessButton() {
        // Check if premium is already activated
        if (this.accessControl.isPremiumActivated()) {
            return; // Don't show button if already activated
        }

        // Find the header navigation area
        const headerNav = document.querySelector('.header div[style*="margin-top: 24px"]');
        if (!headerNav) {
            return;
        }

        // Create premium access button
        const premiumButton = document.createElement('a');
        premiumButton.href = '#';
        premiumButton.className = 'premium-access-button';
        premiumButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
                <path d="M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11" stroke="currentColor" stroke-width="2"/>
            </svg>
            Buy Premium Access £15
        `;

        // Style the button
        premiumButton.style.cssText = `
            display: inline-flex; 
            align-items: center; 
            gap: 8px; 
            padding: 12px 20px; 
            background: #ff6b35; 
            color: #ffffff; 
            text-decoration: none; 
            border-radius: 20px; 
            font-weight: 500; 
            transition: all 0.2s ease; 
            box-shadow: var(--md-sys-elevation-level1);
            min-height: 44px;
        `;

        // Add hover effects
        premiumButton.addEventListener('mouseenter', () => {
            premiumButton.style.boxShadow = 'var(--md-sys-elevation-level2)';
            premiumButton.style.transform = 'translateY(-2px)';
            premiumButton.style.background = '#e55a2b';
        });

        premiumButton.addEventListener('mouseleave', () => {
            premiumButton.style.boxShadow = 'var(--md-sys-elevation-level1)';
            premiumButton.style.transform = 'translateY(0)';
            premiumButton.style.background = '#ff6b35';
        });

        // Add click handler
        premiumButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.redirectToActivation();
        });

        // Add to header
        headerNav.appendChild(premiumButton);
    }

    /**
     * Creates a Telegram purchase button with consistent styling
     * @param {string} text - Button text
     * @param {string} context - Context for analytics (optional)
     * @returns {HTMLElement} - The created button element
     */
    createTelegramPurchaseButton(text = 'Buy via Telegram £15', context = 'general') {
        const button = document.createElement('button');
        button.className = 'telegram-purchase-btn';
        button.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 2L3 8.5L10 12L13.5 19L21 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 12L21 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            ${text}
        `;

        // Style the button with M3 design principles
        button.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            background: #0088cc;
            color: #ffffff;
            border: none;
            border-radius: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(0, 136, 204, 0.2);
            min-height: 44px;
        `;

        // Add hover and focus effects
        button.addEventListener('mouseenter', () => {
            button.style.background = '#006699';
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 4px 12px rgba(0, 136, 204, 0.3)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.background = '#0088cc';
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 2px 8px rgba(0, 136, 204, 0.2)';
        });

        button.addEventListener('focus', () => {
            button.style.outline = '2px solid #0088cc';
            button.style.outlineOffset = '2px';
        });

        button.addEventListener('blur', () => {
            button.style.outline = 'none';
        });

        // Add click handler to open Telegram
        button.addEventListener('click', () => {
            this.openTelegramForPurchase(context);
        });

        return button;
    }

    /**
     * Opens Telegram with purchase message
     * @param {string} context - Context for the purchase (for analytics)
     */
    openTelegramForPurchase(context = 'general') {
        const telegramUrl = 'https://t.me/ZoirUK_Help';
        const contextMessages = {
            'general': '🎓 Hello! I would like to purchase premium access for the English course (£15).',
            'chapter-locked': '🔒 Hello! I tried to access a premium chapter and would like to purchase full access (£15).',
            'modal': '💬 Hello! I saw the activation modal and want to buy premium access (£15).',
            'header': '⭐ Hello! I clicked the premium button and want to purchase the full course (£15).'
        };

        const baseMessage = contextMessages[context] || contextMessages['general'];
        const fullMessage = encodeURIComponent(
            `${baseMessage}\n\n` +
            '📚 Course: English for Uzbek Seasonal Workers\n' +
            '💰 Price: £15 (or equivalent in USD, EUR, UZS, RUB)\n' +
            '🎯 Access: All 24 chapters + exercises + certificate\n\n' +
            'Please provide payment details and send me an activation key after payment. Thank you!'
        );

        const fullUrl = `${telegramUrl}?text=${fullMessage}`;

        try {
            // Open Telegram
            window.open(fullUrl, '_blank', 'noopener,noreferrer');

            // Show feedback to user
            console.log(`Telegram opened for purchase (context: ${context})`);

            // Optional: Show a temporary success message
            this.showTemporaryMessage('Opening Telegram... Contact @ZoirUK_Help for instant support!');

        } catch (error) {
            console.error('Error opening Telegram:', error);
            // Fallback: copy username to clipboard
            this.copyTelegramUsername();
        }
    }

    /**
     * Shows a temporary message to the user
     * @param {string} message - Message to display
     */
    showTemporaryMessage(message) {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #0088cc;
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 136, 204, 0.3);
            z-index: 10000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);

        // Add CSS animations if not already present
        if (!document.getElementById('telegram-animations')) {
            const style = document.createElement('style');
            style.id = 'telegram-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Copies Telegram username to clipboard as fallback
     */
    copyTelegramUsername() {
        const username = '@ZoirUK_Help';

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(username).then(() => {
                this.showTemporaryMessage('Telegram username copied! Open Telegram and search for @ZoirUK_Help');
            }).catch(() => {
                this.showManualCopyInstructions(username);
            });
        } else {
            this.showManualCopyInstructions(username);
        }
    }

    /**
     * Shows manual copy instructions when clipboard API is not available
     * @param {string} username - Telegram username to copy
     */
    showManualCopyInstructions(username) {
        alert(`Please manually copy this Telegram username: ${username}\n\nThen open Telegram and search for it to contact me for premium access.`);
    }
}

/**
 * ActivationModal - Handles the premium activation user interface
 * Provides responsive modal dialog for key activation and purchase flow
 */
class ActivationModal {
    constructor() {
        this.modal = null;
        this.overlay = null;
        this.keyInput = null;
        this.activateButton = null;
        this.buyButton = null;
        this.closeButton = null;
        this.feedbackContainer = null;

        this.createModalHTML();
        this.attachEventListeners();
    }

    /**
     * Creates the modal HTML structure with M3 design principles
     * Implements responsive design with proper ARIA attributes
     */
    createModalHTML() {
        // Create modal overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'activation-modal-overlay';
        this.overlay.setAttribute('aria-hidden', 'true');

        // Create modal container
        this.modal = document.createElement('div');
        this.modal.className = 'activation-modal';
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-modal', 'true');
        this.modal.setAttribute('aria-labelledby', 'activation-modal-title');
        this.modal.setAttribute('aria-describedby', 'activation-modal-description');

        // Modal HTML content
        this.modal.innerHTML = `
            <div class="activation-modal-content">
                <div class="activation-modal-header">
                    <h2 id="activation-modal-title" class="activation-modal-title">
                        Premium kirish talab qilinadi
                    </h2>
                    <button type="button" class="activation-modal-close" aria-label="Close modal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                
                <div class="activation-modal-body">
                    <p id="activation-modal-description" class="activation-modal-description">
                        6–24-boblarni ochish uchun siz aktivatsiya kaliti yordamida premium kirishni faollashtirishingiz kerak. 
                        <strong>Email manzili majburiy</strong> - bu qo'llab-quvvatlash va xavfsizlik uchun zarur.
                    </p>
                    
                    <div class="activation-email-section">
                        <label for="activation-email-input" class="activation-email-label">
                            Elektron pochta manzili (Email)
                        </label>
                        <input 
                            type="email" 
                            id="activation-email-input" 
                            class="activation-email-input"
                            placeholder="example@email.com"
                            autocomplete="email"
                            aria-describedby="email-format-hint"
                            required
                        />
                        <div id="email-format-hint" class="email-format-hint">
                            <strong>Majburiy:</strong> Faollashtirish va qo'llab-quvvatlash uchun to'g'ri email manzilni kiriting
                        </div>
                    </div>

                    <div class="activation-key-section">
                        <label for="activation-key-input" class="activation-key-label">
                            Aktivatsiya kaliti
                        </label>
                        <input 
                            type="text" 
                            id="activation-key-input" 
                            class="activation-key-input"
                            placeholder="XXXX-XXXX-XXXX-XXXX"
                            maxlength="19"
                            autocomplete="off"
                            aria-describedby="key-format-hint"
                            required
                        />
                        <div id="key-format-hint" class="key-format-hint">
                            16 belgidan iborat aktivatsiya kalitingizni kiriting
                        </div>
                    </div>
                    
                    <div class="activation-feedback" role="alert" aria-live="polite">
                        <!-- Success/error messages will be displayed here -->
                    </div>
                </div>
                
                <div class="activation-modal-actions">
                    <button type="button" class="activation-button activation-button-primary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Premiumni faollashtirish
                    </button>
                    
                    <button type="button" class="activation-button activation-button-secondary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11M5 11H19L18 21H6L5 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Premium kirishni sotib olish — £15
                    </button>
                </div>

            </div>
        `;

        // Add modal to overlay
        this.overlay.appendChild(this.modal);

        // Get references to interactive elements
        this.emailInput = this.modal.querySelector('.activation-email-input');
        this.keyInput = this.modal.querySelector('.activation-key-input');
        this.activateButton = this.modal.querySelector('.activation-button-primary');
        this.buyButton = this.modal.querySelector('.activation-button-secondary');
        this.closeButton = this.modal.querySelector('.activation-modal-close');
        this.feedbackContainer = this.modal.querySelector('.activation-feedback');

        // Add CSS styles
        this.addModalStyles();

        // Append to document body
        document.body.appendChild(this.overlay);
    }

    /**
     * Adds M3-compliant CSS styles for the modal
     * Implements responsive design and accessibility features
     */
    addModalStyles() {
        const styleId = 'activation-modal-styles';

        // Check if styles already exist
        if (document.getElementById(styleId)) {
            return;
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Modal Overlay */
            .activation-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(4px);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 16px;
                box-sizing: border-box;
            }
            
            .activation-modal-overlay.show {
                display: flex;
            }
            
            /* Modal Container */
            .activation-modal {
                background: #ffffff;
                border-radius: 28px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                max-width: 480px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                transform: scale(0.9);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .activation-modal-overlay.show .activation-modal {
                transform: scale(1);
                opacity: 1;
            }
            
            /* Modal Content */
            .activation-modal-content {
                padding: 24px;
            }
            
            /* Modal Header */
            .activation-modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 24px;
            }
            
            .activation-modal-title {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 24px;
                font-weight: 600;
                color: #1c1b1f;
                margin: 0;
                line-height: 1.3;
            }
            
            .activation-modal-close {
                background: none;
                border: none;
                padding: 8px;
                border-radius: 20px;
                cursor: pointer;
                color: #49454f;
                transition: all 0.2s ease;
                min-width: 44px;
                min-height: 44px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .activation-modal-close:hover {
                background: #f3f0f4;
                color: #1c1b1f;
            }
            
            .activation-modal-close:focus {
                outline: 2px solid #6750a4;
                outline-offset: 2px;
            }
            
            /* Modal Body */
            .activation-modal-description {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 16px;
                color: #49454f;
                line-height: 1.5;
                margin: 0 0 24px 0;
            }
            
            /* Email Section */
            .activation-email-section {
                margin-bottom: 24px;
            }
            
            .activation-email-label {
                display: block;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 14px;
                font-weight: 500;
                color: #49454f;
                margin-bottom: 8px;
            }
            
            .activation-email-input {
                width: 100%;
                padding: 16px;
                border: 1px solid #79747e;
                border-radius: 12px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 16px;
                color: #1c1b1f;
                background: #ffffff;
                transition: all 0.2s ease;
                box-sizing: border-box;
            }
            
            .activation-email-input:focus {
                outline: none;
                border-color: #6750a4;
                box-shadow: 0 0 0 2px rgba(103, 80, 164, 0.12);
            }
            
            .activation-email-input:invalid {
                border-color: #ba1a1a;
            }
            
            .activation-email-input:valid {
                border-color: #2e7d32;
            }
            
            .activation-email-input:required {
                border-left: 4px solid #ff9800;
            }
            
            .activation-email-input:required:valid {
                border-left: 4px solid #4caf50;
            }
            
            .email-format-hint {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 12px;
                color: #79747e;
                margin-top: 4px;
            }

            /* Activation Key Section */
            .activation-key-section {
                margin-bottom: 24px;
            }
            
            .activation-key-label {
                display: block;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 14px;
                font-weight: 500;
                color: #49454f;
                margin-bottom: 8px;
            }
            
            .activation-key-input {
                width: 100%;
                padding: 16px;
                border: 1px solid #79747e;
                border-radius: 12px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 16px;
                color: #1c1b1f;
                background: #ffffff;
                transition: all 0.2s ease;
                box-sizing: border-box;
                text-align: center;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            
            .activation-key-input:focus {
                outline: none;
                border-color: #6750a4;
                box-shadow: 0 0 0 2px rgba(103, 80, 164, 0.12);
            }
            
            .activation-key-input:invalid {
                border-color: #ba1a1a;
            }
            
            .key-format-hint {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 12px;
                color: #79747e;
                margin-top: 4px;
                text-align: center;
            }
            
            /* Feedback Container */
            .activation-feedback {
                margin-bottom: 24px;
                min-height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .activation-feedback.success {
                color: #1e7e34;
                background: #d4edda;
                padding: 12px 16px;
                border-radius: 12px;
                font-weight: 500;
            }
            
            .activation-feedback.error {
                color: #ba1a1a;
                background: #ffeaea;
                padding: 12px 16px;
                border-radius: 12px;
                font-weight: 500;
            }
            
            /* Modal Actions */
            .activation-modal-actions {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-bottom: 24px;
            }
            
            .activation-button {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 16px 24px;
                border-radius: 20px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
                min-height: 44px;
                text-decoration: none;
            }
            
            .activation-button-primary {
                background: #6750a4;
                color: #ffffff;
            }
            
            .activation-button-primary:hover {
                background: #5a4593;
                box-shadow: 0 2px 8px rgba(103, 80, 164, 0.3);
            }
            
            .activation-button-primary:focus {
                outline: 2px solid #6750a4;
                outline-offset: 2px;
            }
            
            .activation-button-primary:disabled {
                background: #e8e8e8;
                color: #a0a0a0;
                cursor: not-allowed;
            }
            
            .activation-button-secondary {
                background: #ffffff;
                color: #6750a4;
                border: 1px solid #6750a4;
            }
            
            .activation-button-secondary:hover {
                background: #f3f0f4;
                box-shadow: 0 2px 8px rgba(103, 80, 164, 0.15);
            }
            
            .activation-button-secondary:focus {
                outline: 2px solid #6750a4;
                outline-offset: 2px;
            }
            
            /* Modal Footer */
            .activation-modal-footer {
                text-align: center;
                padding-top: 16px;
                border-top: 1px solid #e8e8e8;
            }
            
            .purchase-info {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 14px;
                color: #79747e;
                margin: 0;
                line-height: 1.4;
            }
            
            /* Mobile Responsive Design */
            @media (max-width: 768px) {
                .activation-modal-overlay {
                    padding: 8px;
                }
                
                .activation-modal {
                    border-radius: 20px;
                    max-height: 95vh;
                }
                
                .activation-modal-content {
                    padding: 20px;
                }
                
                .activation-modal-title {
                    font-size: 20px;
                }
                
                .activation-modal-actions {
                    gap: 8px;
                }
                
                .activation-button {
                    padding: 14px 20px;
                    font-size: 15px;
                }
            }
            
            /* High contrast mode support */
            @media (prefers-contrast: high) {
                .activation-modal {
                    border: 2px solid #000000;
                }
                
                .activation-key-input {
                    border-width: 2px;
                }
                
                .activation-button-primary {
                    border: 2px solid #000000;
                }
            }
            
            /* Loading spinner animation */
            .loading-spinner {
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            /* Feedback message icons */
            .activation-feedback svg {
                flex-shrink: 0;
                margin-right: 8px;
            }
            
            .activation-feedback span {
                flex: 1;
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .activation-modal-overlay,
                .activation-modal,
                .activation-button,
                .activation-modal-close {
                    transition: none;
                }
                
                .loading-spinner {
                    animation: none;
                }
            }




            
            /* Mobile Responsive Adjustments */
            @media (max-width: 480px) {

            }
        `;

        document.head.appendChild(style);
    }

    /**
     * Attaches event listeners for modal interactions
     * Handles close button, overlay clicks, and keyboard navigation
     */
    attachEventListeners() {
        // Close button click
        this.closeButton.addEventListener('click', () => {
            this.hide();
        });

        // Overlay click to close
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });

        // Email input validation
        this.emailInput.addEventListener('input', (e) => {
            this.validateEmailInput(e.target);
        });

        // Format key input as user types
        this.keyInput.addEventListener('input', (e) => {
            this.formatKeyInput(e.target);
        });

        // Activate button click
        this.activateButton.addEventListener('click', () => {
            const email = this.emailInput.value.trim();
            const key = this.keyInput.value.trim();
            this.handleKeySubmission(key, email);
        });

        // Buy premium button click
        this.buyButton.addEventListener('click', () => {
            this.redirectToTelegram();
        });



        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.overlay.classList.contains('show')) {
                if (e.key === 'Escape') {
                    this.hide();
                } else if (e.key === 'Enter' && e.target === this.keyInput) {
                    this.activateButton.click();
                }
            }
        });
    }

    /**
     * Validates email input and provides visual feedback
     * @param {HTMLInputElement} input - Email input element
     * @returns {Object} Validation result with isValid and message
     */
    validateEmailInput(input) {
        const email = input.value.trim();

        if (!email) {
            input.classList.remove('valid');
            input.classList.add('invalid');
            return {
                isValid: false,
                message: 'Email manzili kiritilishi shart'
            };
        }

        // Basic email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            input.classList.remove('valid');
            input.classList.add('invalid');
            return {
                isValid: false,
                message: 'To\'g\'ri email manzili kiriting (masalan: user@example.com)'
            };
        }

        // Additional validation for common email providers
        const commonProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'mail.ru', 'yandex.ru', 'yandex.com'];
        const domain = email.split('@')[1]?.toLowerCase();

        if (domain && !commonProviders.includes(domain) && !domain.includes('.')) {
            input.classList.remove('valid');
            input.classList.add('invalid');
            return {
                isValid: false,
                message: 'Email manzili noto\'g\'ri ko\'rinadi. Tekshiring va qayta kiriting'
            };
        }

        input.classList.remove('invalid');
        input.classList.add('valid');
        return {
            isValid: true,
            message: ''
        };
    }

    /**
     * Formats the activation key input with dashes
     * Ensures proper XXXX-XXXX-XXXX-XXXX format
     */
    formatKeyInput(input) {
        let value = input.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

        // Limit to 16 characters
        if (value.length > 16) {
            value = value.substring(0, 16);
        }

        // Add dashes every 4 characters
        const formatted = value.replace(/(.{4})/g, '$1-').replace(/-$/, '');

        input.value = formatted;
    }

    /**
     * Shows the activation modal
     * Manages focus and accessibility attributes
     */
    show() {
        // Show the modal
        this.overlay.classList.add('show');
        this.overlay.setAttribute('aria-hidden', 'false');

        // Clear any previous feedback
        this.clearFeedback();

        // Clear input fields and focus email first
        this.emailInput.value = '';
        this.keyInput.value = '';
        this.emailInput.focus();

        // Prevent body scrolling
        document.body.style.overflow = 'hidden';

        // Store the previously focused element for restoration
        this.previouslyFocusedElement = document.activeElement;

        // Trap focus within modal
        this.trapFocus();
    }

    /**
     * Hides the activation modal
     * Restores focus and accessibility attributes
     */
    hide() {
        // Hide the modal
        this.overlay.classList.remove('show');
        this.overlay.setAttribute('aria-hidden', 'true');

        // Restore body scrolling
        document.body.style.overflow = '';

        // Restore focus to previously focused element
        if (this.previouslyFocusedElement) {
            this.previouslyFocusedElement.focus();
        }

        // Clear feedback
        this.clearFeedback();
    }

    /**
     * Handles activation key submission with comprehensive error handling and feedback
     * Validates email and key, processes activation with loading states
     */
    async handleKeySubmission(key, email) {
        // Clear previous feedback
        this.clearFeedback();

        // Validate email first - REQUIRED
        if (!email || email.trim() === '') {
            this.displayError('Email manzili majburiy! Iltimos, to\'g\'ri email kiriting.');
            this.emailInput.focus();
            this.shakeInput(this.emailInput);
            return;
        }

        const emailValidation = this.validateEmailInput(this.emailInput);
        if (!emailValidation.isValid) {
            this.displayError(emailValidation.message);
            this.emailInput.focus();
            this.shakeInput(this.emailInput);
            return;
        }

        // Validate key format with detailed feedback
        const validationResult = this.validateKeyInput(key);
        if (!validationResult.isValid) {
            this.displayError(validationResult.message);
            this.keyInput.focus();
            this.shakeInput(this.keyInput); // Visual feedback for invalid input
            return;
        }

        const cleanKey = key.replace(/-/g, '').toUpperCase();

        // Show loading state with progress indication
        this.setLoadingState(true, 'Validating key...');

        try {
            // Get instances with error handling
            const keyValidator = this.getKeyValidatorInstance();
            const accessControl = this.getAccessControlInstance();

            if (!keyValidator || !accessControl) {
                throw new Error('System components not available');
            }

            // Step 1: Validate key format and existence
            this.updateLoadingMessage('Kalit formati tekshirilmoqda...');
            await this.delay(500); // Small delay for UX

            if (!keyValidator.validateKeyFormat(cleanKey)) {
                this.displayError(this.getLocalizedMessage('invalid_key_format'));
                return;
            }

            // Step 2: Check if key is already used
            this.updateLoadingMessage('Kalit mavjudligi tekshirilmoqda...');
            await this.delay(500);

            if (keyValidator.isKeyUsed(cleanKey)) {
                this.displayError(this.getLocalizedMessage('key_already_used'));
                return;
            }

            // Step 3: Validate key against valid keys list
            this.updateLoadingMessage('Kalit haqiqiyligi tekshirilmoqda...');
            await this.delay(500);

            if (!keyValidator.isValidKey(cleanKey)) {
                this.displayError(this.getLocalizedMessage('invalid_key'));
                return;
            }

            // Step 4: Activate premium access
            this.updateLoadingMessage('Premium kirish faollashtirilmoqda...');
            await this.delay(500);

            const activationResult = await accessControl.activatePremium(cleanKey);

            if (activationResult.success) {
                // Step 5: Mark key as used
                this.updateLoadingMessage('Faollashtirish yakunlanmoqda...');
                await this.delay(300);

                const keyMarked = keyValidator.markKeyAsUsed(cleanKey, email);
                
                // Also use global function if available for better synchronization
                if (window.markKeyAsUsed && typeof window.markKeyAsUsed === 'function') {
                    window.markKeyAsUsed(key, {
                        email: email,
                        timestamp: new Date().toISOString(),
                        source: 'Activation Modal'
                    });
                }
                
                if (!keyMarked) {
                    console.warn('Key activation succeeded but marking as used failed');
                }

                // Show success with animation
                this.displaySuccessWithAnimation('Premium kirish muvaffaqiyatli faollashtirildi!');

                // Update chapter navigation
                if (window.chapterNavigationController) {
                    window.chapterNavigationController.updateChapterStatus();
                }

                // Show completion message and auto-close
                setTimeout(() => {
                    this.displaySuccess('Yangilangan kursga yo\'naltirilmoqda...');
                }, 1500);

                setTimeout(() => {
                    this.hide();
                    window.location.reload();
                }, 3000);

            } else {
                this.displayError(activationResult.error || this.getLocalizedMessage('activation_failed'));
            }

        } catch (error) {
            console.error('Activation error:', error);

            // Handle specific error types
            if (error.name === 'NetworkError' || error.message.includes('network')) {
                this.displayError(this.getLocalizedMessage('network_error'));
            } else if (error.name === 'SecurityError') {
                this.displayError(this.getLocalizedMessage('security_error'));
            } else {
                this.displayError(this.getLocalizedMessage('activation_failed'));
            }

        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * Validates key input with detailed feedback
     * @param {string} key - The key to validate
     * @returns {object} - Validation result with isValid and message
     */
    validateKeyInput(key) {
        if (!key || key.trim() === '') {
            return {
                isValid: false,
                message: this.getLocalizedMessage('empty_key')
            };
        }

        const cleanKey = key.replace(/-/g, '');

        if (cleanKey.length !== 16) {
            return {
                isValid: false,
                message: this.getLocalizedMessage('invalid_key_length')
            };
        }

        if (!/^[A-Z0-9]{16}$/i.test(cleanKey)) {
            return {
                isValid: false,
                message: this.getLocalizedMessage('invalid_key_characters')
            };
        }

        return { isValid: true };
    }

    /**
     * Gets KeyValidator instance with error handling
     * @returns {KeyValidator|null} - KeyValidator instance or null
     */
    getKeyValidatorInstance() {
        try {
            return window.keyValidator || new KeyValidator();
        } catch (error) {
            console.error('Failed to get KeyValidator instance:', error);
            return null;
        }
    }

    /**
     * Gets AccessControlManager instance with error handling
     * @returns {AccessControlManager|null} - AccessControlManager instance or null
     */
    getAccessControlInstance() {
        try {
            return window.accessControlManager || new AccessControlManager();
        } catch (error) {
            console.error('Failed to get AccessControlManager instance:', error);
            return null;
        }
    }

    /**
     * Creates a delay for better UX during loading states
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} - Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Updates the loading message during activation process
     * @param {string} message - Loading message to display
     */
    updateLoadingMessage(message) {
        const loadingText = this.activateButton.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = message;
        }
    }

    /**
     * Shakes the input field for visual feedback on invalid input
     */
    shakeInput(input = this.keyInput) {
        input.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            input.style.animation = '';
        }, 500);

        // Add shake animation CSS if not present
        this.addShakeAnimation();
    }

    /**
     * Adds shake animation CSS
     */
    addShakeAnimation() {
        if (!document.getElementById('shake-animation')) {
            const style = document.createElement('style');
            style.id = 'shake-animation';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                
                @media (prefers-reduced-motion: reduce) {
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        50% { transform: translateX(-2px); }
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Displays success message with animation
     * @param {string} message - Success message to display
     */
    displaySuccessWithAnimation(message) {
        this.feedbackContainer.className = 'activation-feedback success';
        this.feedbackContainer.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="success-icon">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>${message}</span>
        `;

        // Add success animation
        this.feedbackContainer.style.animation = 'successPulse 0.6s ease-out';

        // Announce to screen readers
        this.feedbackContainer.setAttribute('aria-live', 'polite');

        // Add success animation CSS if not present
        this.addSuccessAnimation();
    }

    /**
     * Adds success animation CSS
     */
    addSuccessAnimation() {
        if (!document.getElementById('success-animation')) {
            const style = document.createElement('style');
            style.id = 'success-animation';
            style.textContent = `
                @keyframes successPulse {
                    0% { transform: scale(0.8); opacity: 0; }
                    50% { transform: scale(1.05); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                .success-icon {
                    animation: checkmarkDraw 0.8s ease-out;
                }
                
                @keyframes checkmarkDraw {
                    0% { stroke-dasharray: 0 100; }
                    100% { stroke-dasharray: 100 0; }
                }
                
                @media (prefers-reduced-motion: reduce) {
                    @keyframes successPulse {
                        0% { opacity: 0; }
                        100% { opacity: 1; }
                    }
                    
                    .success-icon {
                        animation: none;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Gets localized messages for the modal
     * @param {string} key - Message key
     * @returns {string} - Localized message
     */
    getLocalizedMessage(key) {
        const messages = {
            'empty_key': {
                'en': 'Please enter an activation key',
                'uz': 'Iltimos, faollashtirish kalitini kiriting'
            },
            'invalid_key_length': {
                'en': 'Activation key must be exactly 16 characters long',
                'uz': 'Faollashtirish kaliti aynan 16 belgidan iborat bo\'lishi kerak'
            },
            'invalid_key_characters': {
                'en': 'Activation key can only contain letters and numbers',
                'uz': 'Faollashtirish kalitida faqat harflar va raqamlar bo\'lishi mumkin'
            },
            'invalid_key_format': {
                'en': 'Invalid key format. Please enter a 16-character key.',
                'uz': 'Noto\'g\'ri kalit formati. 16 belgili kalitni kiriting.'
            },
            'key_already_used': {
                'en': 'This activation key has already been used',
                'uz': 'Bu faollashtirish kaliti allaqachon ishlatilgan'
            },
            'invalid_key': {
                'en': 'Invalid activation key. Please check your key and try again.',
                'uz': 'Noto\'g\'ri faollashtirish kaliti. Kalitni tekshiring va qayta urinib ko\'ring.'
            },
            'activation_failed': {
                'en': 'Activation failed. Please try again or contact support.',
                'uz': 'Faollashtirish muvaffaqiyatsiz. Qayta urinib ko\'ring yoki yordam so\'rang.'
            },
            'network_error': {
                'en': 'Network error. Please check your connection and try again.',
                'uz': 'Tarmoq xatosi. Internetga ulanishni tekshiring va qayta urinib ko\'ring.'
            },
            'security_error': {
                'en': 'Security error. Please check your browser settings.',
                'uz': 'Xavfsizlik xatosi. Brauzer sozlamalarini tekshiring.'
            }
        };

        const language = this.detectLanguage();
        return messages[key]?.[language] || messages[key]?.['en'] || 'An error occurred';
    }

    /**
     * Detects user language preference
     * @returns {string} - Language code ('en' or 'uz')
     */
    detectLanguage() {
        try {
            const savedLang = localStorage.getItem('preferred_language');
            if (savedLang && ['en', 'uz'].includes(savedLang)) {
                return savedLang;
            }
        } catch (error) {
            // Ignore localStorage errors for language detection
        }

        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang && browserLang.toLowerCase().includes('uz')) {
            return 'uz';
        }

        return 'uz';
    }

    /**
     * Displays error message to user
     * Updates ARIA live region for screen readers
     */
    displayError(message) {
        this.feedbackContainer.className = 'activation-feedback error';
        this.feedbackContainer.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>${message}</span>
        `;

        // Announce to screen readers
        this.feedbackContainer.setAttribute('aria-live', 'assertive');
    }

    /**
     * Displays success message to user
     * Updates ARIA live region for screen readers
     */
    displaySuccess(message) {
        this.feedbackContainer.className = 'activation-feedback success';
        this.feedbackContainer.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>${message}</span>
        `;

        // Announce to screen readers
        this.feedbackContainer.setAttribute('aria-live', 'polite');
    }

    /**
     * Clears feedback messages
     */
    clearFeedback() {
        this.feedbackContainer.className = 'activation-feedback';
        this.feedbackContainer.innerHTML = '';
        this.feedbackContainer.removeAttribute('aria-live');
    }

    /**
     * Sets loading state for activation button with progress indication
     * @param {boolean} isLoading - Whether to show loading state
     * @param {string} message - Loading message to display
     */
    setLoadingState(isLoading, message = 'Processing...') {
        if (isLoading) {
            // Disable button and other interactive elements
            this.activateButton.disabled = true;
            this.buyButton.disabled = true;
            this.keyInput.disabled = true;
            this.closeButton.disabled = true;

            // Add loading class for styling
            this.activateButton.classList.add('loading');

            // Create loading content with spinner and message
            this.activateButton.innerHTML = `
                <div class="loading-content">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="loading-spinner">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-dasharray="62.83" stroke-dashoffset="62.83">
                            <animate attributeName="stroke-dasharray" dur="1.5s" values="0 62.83;31.415 31.415;0 62.83" repeatCount="indefinite"/>
                            <animate attributeName="stroke-dashoffset" dur="1.5s" values="0;-31.415;-62.83" repeatCount="indefinite"/>
                        </circle>
                    </svg>
                    <span class="loading-text">${message}</span>
                </div>
            `;

            // Add loading styles if not present
            this.addLoadingStyles();

            // Show progress indicator in feedback area
            this.showProgressIndicator();

        } else {
            // Re-enable all interactive elements
            this.activateButton.disabled = false;
            this.buyButton.disabled = false;
            this.keyInput.disabled = false;
            this.closeButton.disabled = false;

            // Remove loading class
            this.activateButton.classList.remove('loading');

            // Restore original button content
            this.activateButton.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Activate Premium
            `;

            // Hide progress indicator
            this.hideProgressIndicator();
        }
    }

    /**
     * Shows progress indicator in the feedback area
     */
    showProgressIndicator() {
        this.feedbackContainer.className = 'activation-feedback progress';
        this.feedbackContainer.innerHTML = `
            <div class="progress-indicator">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-text">Processing your activation...</div>
            </div>
        `;

        // Animate progress bar
        setTimeout(() => {
            const progressFill = this.feedbackContainer.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = '100%';
            }
        }, 100);
    }

    /**
     * Hides progress indicator
     */
    hideProgressIndicator() {
        if (this.feedbackContainer.classList.contains('progress')) {
            this.feedbackContainer.className = 'activation-feedback';
            this.feedbackContainer.innerHTML = '';
        }
    }

    /**
     * Adds loading-specific CSS styles
     */
    addLoadingStyles() {
        if (!document.getElementById('loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                /* Loading button styles */
                .activation-button.loading {
                    cursor: not-allowed;
                    opacity: 0.8;
                }
                
                .loading-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .loading-spinner {
                    animation: spin 1.5s linear infinite;
                }
                
                .loading-text {
                    font-size: 14px;
                    font-weight: 500;
                }
                
                /* Progress indicator styles */
                .activation-feedback.progress {
                    background: #f0f8ff;
                    border: 1px solid #6750a4;
                    border-radius: 12px;
                    padding: 16px;
                }
                
                .progress-indicator {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    align-items: center;
                }
                
                .progress-bar {
                    width: 100%;
                    height: 4px;
                    background: #e8e8e8;
                    border-radius: 2px;
                    overflow: hidden;
                }
                
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #6750a4, #8b7cc8);
                    width: 0%;
                    transition: width 2s ease-out;
                    border-radius: 2px;
                }
                
                .progress-text {
                    font-size: 14px;
                    color: #6750a4;
                    font-weight: 500;
                    text-align: center;
                }
                
                /* Spinner animation */
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                /* Pulse animation for loading states */
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
                
                .loading-content .loading-text {
                    animation: pulse 2s ease-in-out infinite;
                }
                
                /* Disabled state styles */
                .activation-button:disabled,
                .activation-key-input:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                .activation-modal-close:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                    pointer-events: none;
                }
                
                /* Reduced motion support */
                @media (prefers-reduced-motion: reduce) {
                    .loading-spinner,
                    .loading-content .loading-text {
                        animation: none;
                    }
                    
                    .progress-fill {
                        transition: none;
                    }
                }
                
                /* High contrast mode support */
                @media (prefers-contrast: high) {
                    .progress-bar {
                        border: 1px solid #000000;
                    }
                    
                    .progress-fill {
                        background: #000000;
                    }
                }
                
                /* Mobile optimizations */
                @media (max-width: 480px) {
                    .loading-text {
                        font-size: 13px;
                    }
                    
                    .progress-text {
                        font-size: 13px;
                    }
                    
                    .progress-indicator {
                        gap: 6px;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Traps focus within the modal for accessibility
     */
    trapFocus() {
        const focusableElements = this.modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];

        this.modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    /**
     * Handles Telegram redirect for premium purchase
     * Opens Telegram with pre-filled message for easy contact
     */
    redirectToTelegram() {
        const telegramUrl = 'https://t.me/ZoirUK_Help';
        const message = encodeURIComponent(
            '🎓 Hello! I would like to purchase premium access for the English for Uzbek Seasonal Workers course.\n\n' +
            '💰 Price: £15 (or equivalent in USD, EUR, UZS, RUB)\n' +
            '📚 Access: All 24 chapters + interactive exercises + certificate\n\n' +
            'Please let me know the payment methods available and provide me with an activation key after payment. Thank you!'
        );
        const fullUrl = `${telegramUrl}?text=${message}`;

        try {
            // Try to open in new tab/window
            const newWindow = window.open(fullUrl, '_blank', 'noopener,noreferrer');

            // Check if popup was blocked
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                // Fallback: show instructions for manual contact
                this.showTelegramFallback();
            } else {
                // Show success message
                this.displaySuccess('Opening Telegram... If it doesn\'t open automatically, contact @ZoirUK_Help manually.');

                // Hide modal after a short delay
                setTimeout(() => {
                    this.hide();
                }, 3000);
            }
        } catch (error) {
            console.error('Error opening Telegram:', error);
            this.showTelegramFallback();
        }
    }

    /**
     * Shows fallback instructions when Telegram redirect fails
     */
    showTelegramFallback() {
        const fallbackMessage = `
            <div style="text-align: center; padding: 16px;">
                <h3 style="color: #0088cc; margin-bottom: 12px;">📱 Contact via Telegram</h3>
                <p style="margin-bottom: 16px;">Please contact me manually:</p>
                <div style="background: #f0f8ff; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                    <strong>@ZoirUK_Help</strong>
                </div>
                <p style="font-size: 14px; color: #666;">
                    Send this message:<br>
                    <em>"Hello! I want to buy the English course for £15. Please provide payment details and activation key."</em>
                </p>
                <button onclick="navigator.clipboard.writeText('@ZoirUK_Help').then(() => alert('Username copied!'))" 
                        style="background: #0088cc; color: white; border: none; padding: 8px 16px; border-radius: 6px; margin-top: 12px; cursor: pointer;">
                    📋 Copy Username
                </button>
            </div>
        `;

        this.feedbackContainer.innerHTML = fallbackMessage;
        this.feedbackContainer.className = 'activation-feedback success';
    }
}