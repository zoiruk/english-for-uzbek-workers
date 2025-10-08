/**
 * Global Used Keys Tracking System
 * This file tracks all activated keys globally across all devices and browsers
 * 
 * IMPORTANT: This file should be updated on the server when a key is activated
 * For GitHub Pages, this needs to be manually maintained
 */

// Global array of used activation keys (hashed for security)
window.USED_ACTIVATION_KEYS = [
    // Add hashed versions of used keys here
    // Format: hash of the key (not the actual key for security)
    
    // Example entries (replace with actual used key hashes):
    // 'a1b2c3d4e5f6',  // Hash of used key 1
    // 'f6e5d4c3b2a1',  // Hash of used key 2
    
    // Add your used keys here when they are activated:
    // When key '90CF-8581-7F2E-1A18' is used, add its hash here
];

/**
 * Hash function for keys (same as in activation-system.js)
 * @param {string} key - Key to hash
 * @returns {string} - Hashed key
 */
window.hashActivationKey = function(key) {
    const cleanKey = key.replace(/-/g, '').toUpperCase();
    let hash = 0;
    for (let i = 0; i < cleanKey.length; i++) {
        const char = cleanKey.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
};

/**
 * Check if a key is globally used (across all devices)
 * @param {string} key - Key to check
 * @returns {boolean} - True if key is used globally
 */
window.isKeyGloballyUsed = function(key) {
    const hashedKey = window.hashActivationKey(key);
    return window.USED_ACTIVATION_KEYS.includes(hashedKey);
};

/**
 * Enhanced validation that checks both local and global usage
 * @param {string} key - Key to validate
 * @returns {boolean} - True if valid and unused
 */
window.validateActivationKeyEnhanced = function(key) {
    const cleanKey = key.replace(/-/g, '').toUpperCase();
    const formattedKey = key.toUpperCase();
    
    // Check if key exists in valid keys
    if (!window.VALID_ACTIVATION_KEYS.includes(cleanKey)) {
        console.log('Key not found in valid keys list:', cleanKey);
        return false;
    }
    
    // Check if key is globally used (most important check)
    if (window.isKeyGloballyUsed(key)) {
        console.log('Key is globally used:', cleanKey);
        return false;
    }
    
    // Check if key has been used locally (backup check)
    let isUsedLocally = false;
    try {
        const usedKeys = JSON.parse(localStorage.getItem('englishCourse_usedKeys') || '[]');
        const hashedKey = window.hashActivationKey(key);
        isUsedLocally = usedKeys.includes(hashedKey);
    } catch (error) {
        console.warn('Error checking local used keys:', error);
    }
    
    // Check admin database (backup check)
    let isUsedInAdmin = false;
    try {
        const adminKeyDatabase = localStorage.getItem('admin_key_database');
        if (adminKeyDatabase) {
            const keyDatabase = JSON.parse(adminKeyDatabase);
            if (keyDatabase[formattedKey] && keyDatabase[formattedKey].activated) {
                isUsedInAdmin = true;
            } else if (keyDatabase[cleanKey] && keyDatabase[cleanKey].activated) {
                isUsedInAdmin = true;
            }
        }
    } catch (error) {
        console.warn('Error checking admin database:', error);
    }
    
    const isUsed = isUsedLocally || isUsedInAdmin;
    
    console.log('Enhanced key validation:', {
        key: cleanKey,
        inValidList: true,
        globallyUsed: window.isKeyGloballyUsed(key),
        usedLocally: isUsedLocally,
        usedInAdmin: isUsedInAdmin,
        finalResult: !isUsed && !window.isKeyGloballyUsed(key)
    });
    
    // Key is valid only if it's not used globally AND not used locally
    return !isUsed && !window.isKeyGloballyUsed(key);
};

console.log('Global Used Keys System Loaded. Used keys count:', window.USED_ACTIVATION_KEYS.length);