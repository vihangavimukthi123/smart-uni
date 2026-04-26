const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const emailService = require('./emailService');

/**
 * Generates a secure 6-digit OTP
 * @returns {string}
 */
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hashes the OTP for secure storage
 * @param {string} otp 
 * @returns {Promise<string>}
 */
const hashOTP = async (otp) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(otp, salt);
};

/**
 * Compares plain OTP with hashed OTP
 * @param {string} plain 
 * @param {string} hashed 
 * @returns {Promise<boolean>}
 */
const compareOTP = async (plain, hashed) => {
    return await bcrypt.compare(plain, hashed);
};

/**
 * Sends the OTP email via EmailService
 * @param {string} email 
 * @param {string} otp 
 * @param {object} orderDetails 
 */
const sendOTPEmail = async (email, otp, orderDetails) => {
    return await emailService.sendOTPEmail(email, otp, orderDetails.orderId);
};

module.exports = {
    generateOTP,
    hashOTP,
    compareOTP,
    sendOTPEmail
};
