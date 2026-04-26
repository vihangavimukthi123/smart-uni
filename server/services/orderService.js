const Order = require('../models/Order');
const otpService = require('./otpService');
const reminderService = require('./reminderService');

/**
 * Atomicly verify OTP and confirm order
 * @param {string} orderId 
 * @param {string} plainOTP 
 * @returns {Promise<{success: boolean, message: string, order?: object}>}
 */
const verifyAndConfirmOrder = async (orderId, plainOTP) => {
    try {
        const now = new Date();
        
        // 1. Find the order first to get the hash and check attempts
        const order = await Order.findOne({ 
            _id: orderId,
            isEmailVerified: false,
            status: "Pending"
        });

        if (!order) {
            return { success: false, message: "Order not found or already verified" };
        }

        // 2. Check cooldown
        if (order.cooldownUntil && order.cooldownUntil > now) {
            const minutesLeft = Math.ceil((order.cooldownUntil - now) / 60000);
            return { success: false, message: `Too many attempts. Please try again in ${minutesLeft} minutes.` };
        }

        // 3. Check expiry
        if (order.otpExpiresAt && order.otpExpiresAt < now) {
            return { success: false, message: "OTP has expired. Please request a new one." };
        }

        // 4. Check attempts
        if (order.otpAttempts >= 5) {
            // Enforce cooldown if not already set
            const cooldownDate = new Date(now.getTime() + 30 * 60000); // 30 minutes
            await Order.findByIdAndUpdate(orderId, { cooldownUntil: cooldownDate });
            return { success: false, message: "Max attempts exceeded. 30-minute cooldown enforced." };
        }

        // 5. Verify the OTP
        const isMatch = await otpService.compareOTP(plainOTP, order.hashedOTP);

        if (!isMatch) {
            // Atomicly increment attempts
            await Order.findOneAndUpdate(
                { _id: orderId },
                { $inc: { otpAttempts: 1 } }
            );
            return { success: false, message: "Invalid verification code" };
        }

        // 6. Success - Atomicly mark as verified and clear OTP fields
        const confirmedOrder = await Order.findOneAndUpdate(
            { 
                _id: orderId,
                isEmailVerified: false,
                otpExpiresAt: { $gt: now } // Final safety check
            },
            {
                $set: {
                    isEmailVerified: true,
                    status: "Active",
                    hashedOTP: null,
                    otpAttempts: 0,
                    otpResendCount: 0,
                    cooldownUntil: null
                }
            },
            { new: true }
        );

        if (!confirmedOrder) {
            return { success: false, message: "Failed to confirm order. OTP may have expired elsewhere." };
        }

        // 7. Schedule Return Reminder (Persistent via Agenda)
        await reminderService.scheduleReturnReminder(confirmedOrder);

        return { success: true, message: "Order verified successfully", order: confirmedOrder };
    } catch (error) {
        console.error("Verification Error:", error);
        return { success: false, message: "An unexpected error occurred during verification" };
    }
};

/**
 * Resends OTP for an order
 * @param {string} orderId 
 * @returns {Promise<{success: boolean, message: string}>}
 */
const resendOTP = async (orderId) => {
    try {
        const now = new Date();
        const order = await Order.findById(orderId);

        if (!order) {
            return { success: false, message: "Order not found" };
        }

        if (order.isEmailVerified) {
            return { success: false, message: "Order is already verified" };
        }

        // Check resend limits (max 3)
        if (order.otpResendCount >= 3) {
            return { success: false, message: "Maximum resend limit reached. Please contact support." };
        }

        // Generate new OTP
        const newOTP = otpService.generateOTP();
        const newHash = await otpService.hashOTP(newOTP);
        const expiry = new Date(now.getTime() + 10 * 60000); // 10 minutes

        // Atomicly update order with new OTP fields and increment resend count
        await Order.findByIdAndUpdate(orderId, {
            $set: {
                hashedOTP: newHash,
                otpCreatedAt: now,
                otpExpiresAt: expiry,
                otpAttempts: 0 // Reset attempts on resend
            },
            $inc: { otpResendCount: 1 }
        });

        // Send the email (non-blocking)
        otpService.sendOTPEmail(order.contactInfo.email, newOTP, { orderId: order.orderId });

        return { success: true, message: "New verification code sent successfully" };
    } catch (error) {
        console.error("Resend OTP Error:", error);
        return { success: false, message: "Failed to resend verification code" };
    }
};

module.exports = {
    verifyAndConfirmOrder,
    resendOTP
};
