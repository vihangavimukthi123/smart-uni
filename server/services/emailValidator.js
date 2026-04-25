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
        console.error("DNS MX Lookup Error:", error);
        // We treat ENOTFOUND or ENODATA as "No MX records"
        if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
            return { isValid: false, error: "Email domain does not exist or has no mail servers" };
        }
        // For other errors (timeout, etc.), we allow it as a "soft fail"
        return { isValid: true, warning: "Domain validation in-conclusive, proceeding with OTP" };
    }
};

module.exports = {
    validateSyntax,
    validateDomain
};
