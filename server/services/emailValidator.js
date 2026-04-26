const dns = require('dns').promises;

/**
 * Validates email syntax using a comprehensive regex
 * @param {string} email 
 * @returns {boolean}
 */
const validateSyntax = (email) => {
    // RFC 5322 compliant regex (simplified for common use cases)
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return regex.test(email);
};

/**
 * Validates domain has MX records
 * @param {string} email 
 * @returns {Promise<{isValid: boolean, error?: string}>}
 */
const validateDomain = async (email) => {
    try {
        const domain = email.split('@')[1];
        if (!domain) return { isValid: false, error: "Invalid domain format" };

        const mxRecords = await dns.resolveMx(domain);
        
        if (!mxRecords || mxRecords.length === 0) {
            return { isValid: false, error: "Domain has no valid MX records" };
        }

        return { isValid: true };
    } catch (error) {
        console.warn(`[DNS WARNING] MX Lookup for ${domain} failed: ${error.code || error.message}`);
        // We'll allow it as a "soft fail" to prevent local network/DNS issues from blocking users
        return { isValid: true, warning: "Domain validation in-conclusive, proceeding with OTP" };
    }
};

module.exports = {
    validateSyntax,
    validateDomain
};
