const nodemailer = require('nodemailer');

// Configure transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'placeholder@gmail.com',
        pass: process.env.EMAIL_PASS || 'placeholderpassword'
    }
});

/**
 * Common HTML wrapper for branded emails
 */
const emailWrapper = (content) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1E40AF; margin: 0; font-size: 24px; font-weight: 800;">Smart Campus</h1>
            <p style="color: #6B7280; font-size: 14px; margin-top: 4px;">Resource Optimization Platform</p>
        </div>
        
        ${content}
        
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        
        <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
            &copy; 2024 Smart Campus Uni. All rights reserved.
        </div>
    </div>
`;

/**
 * Sends the OTP verification email
 */
const sendOTPEmail = async (email, otp, orderId) => {
    const content = `
        <h2 style="font-size: 18px; color: #111827; margin-bottom: 16px;">Order Verification Required</h2>
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
            Hello, <br/><br/>
            We've received a rental request for Order <strong>#${orderId}</strong>. To complete your booking, please enter the following verification code on the checkout page:
        </p>
        
        <div style="background-color: #F3F4F6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: 800; color: #1E40AF; letter-spacing: 8px;">${otp}</span>
            <p style="font-size: 12px; color: #9CA3AF; margin-top: 8px;">Valid for 10 minutes</p>
        </div>
        
        <p style="font-size: 13px; color: #6B7280; margin-bottom: 24px;">
            If you did not initiate this order, please ignore this email or contact support if you suspect any unauthorized activity.
        </p>
    `;

    const mailOptions = {
        from: `"Smart Campus Rental" <${process.env.EMAIL_USER || 'noreply@smartcampus.uni'}>`,
        to: email,
        subject: 'Verify Your Order - Smart Campus',
        html: emailWrapper(content)
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error("EmailService - Failed to send OTP email:", error);
        return { success: false, error };
    }
};

/**
 * Sends a reminder email for upcoming returns
 */
const sendReturnReminderEmail = async (order) => {
    const returnDate = new Date(order.rentalDates.return).toLocaleDateString();
    const returnTime = order.rentalDates.pickupTime; // Auto-assigned return time

    const content = `
        <h2 style="font-size: 18px; color: #111827; margin-bottom: 16px;">Rental Return Reminder</h2>
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
            Hello, <br/><br/>
            This is a friendly reminder that the items in your order <strong>#${order.orderId}</strong> are due for return soon.
        </p>
        
        <div style="background-color: #EFF6FF; border-radius: 8px; padding: 20px; border-left: 4px solid #1E40AF; margin: 24px 0;">
            <p style="margin: 0; color: #1E40AF; font-weight: 700; font-size: 14px;">RETURN DEADLINE</p>
            <p style="margin: 8px 0 0; color: #111827; font-size: 18px; font-weight: 800;">
                ${returnDate} at ${returnTime}
            </p>
        </div>
        
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
            Please ensure all items are returned to their respective locations by the deadline to avoid any late fees.
        </p>

        <div style="margin-top: 24px;">
            <p style="font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 8px;">Items to Return:</p>
            <ul style="padding-left: 20px; margin: 0; font-size: 14px; color: #4B5563;">
                ${order.items.map(i => `<li>${i.name} (x${i.qty})</li>`).join('')}
            </ul>
        </div>
    `;

    const mailOptions = {
        from: `"Smart Campus Rental" <${process.env.EMAIL_USER || 'noreply@smartcampus.uni'}>`,
        to: order.contactInfo.email,
        subject: 'Reminder: Your rented items are due soon - Smart Campus',
        html: emailWrapper(content)
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error(`EmailService - Failed to send return reminder for ${order.orderId}:`, error);
        return { success: false, error };
    }
};

module.exports = {
    sendOTPEmail,
    sendReturnReminderEmail
};
