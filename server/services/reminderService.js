const Agenda = require('agenda');
const emailService = require('./emailService');
const Order = require('../models/Order');

const agenda = new Agenda({
    db: { address: process.env.MONGO_URI, collection: 'agenda_jobs' },
    processEvery: '1 minute'
});

/**
 * Normalizes input time string to HH:mm format
 */
const normalizeTime = (timeStr) => {
    if (!timeStr) return "09:00";
    const parts = timeStr.split(':');
    const hours = parts[0].padStart(2, '0');
    const minutes = (parts[1] || '00').padStart(2, '0');
    return `${hours}:${minutes}`;
};

/**
 * Job Definition: Send Return Reminder
 */
agenda.define('send-return-reminder', async (job) => {
    const { orderId } = job.attrs.data;
    const order = await Order.findById(orderId);

    if (!order || order.reminderStatus === "SENT") {
        return;
    }

    // Only send reminders for orders that have been completed (delivered to student)
    if (order.status !== "Completed") {
        console.log(`Reminder Service - Skipping reminder for order ${order.orderId} as status is ${order.status}`);
        return;
    }

    try {
        const result = await emailService.sendReturnReminderEmail(order);
        
        if (result.success) {
            order.reminderStatus = "SENT";
            await order.save();
            console.log(`Reminder Service - Successfully sent reminder for order ${order.orderId}`);
        } else {
            throw new Error(result.error || "Unknown email failure");
        }
    } catch (error) {
        order.reminderRetryCount += 1;
        if (order.reminderRetryCount >= 3) {
            order.reminderStatus = "FAILED";
        }
        await order.save();
        console.error(`Reminder Service - Error sending reminder for ${order.orderId}:`, error);
        throw error; // Let agenda handle the retry if retry limit not reached
    }
});

/**
 * Job Definition: Recovery Watchdog
 * Checks for any SCHEDULED orders whose reminder time has passed but status is not SENT.
 */
agenda.define('recovery-watchdog', async () => {
    const now = new Date();
    const missedOrders = await Order.find({
        status: "Completed",
        reminderStatus: "SCHEDULED",
        reminderScheduledAt: { $lte: now }
    });

    for (const order of missedOrders) {
        console.log(`Reminder Service - Watchdog found missed reminder for ${order.orderId}. Rescheduling immediately.`);
        // Reschedule immediately
        await agenda.now('send-return-reminder', { orderId: order._id });
    }
});

/**
 * Starts the agenda scheduler
 */
const start = async () => {
    await agenda.start();
    // Schedule the recovery watchdog to run every hour
    await agenda.every('1 hour', 'recovery-watchdog');
    console.log("Reminder Service - Agenda scheduler started");
};

/**
 * Schedules a return reminder for an order
 */
const scheduleReturnReminder = async (order) => {
    try {
        const returnDate = new Date(order.rentalDates.return);
        const timeStr = normalizeTime(order.rentalDates.pickupTime);
        
        // Build return date time in ISO format to ensure absolute UTC conversion
        const YYYY = returnDate.getFullYear();
        const MM = String(returnDate.getMonth() + 1).padStart(2, '0');
        const DD = String(returnDate.getDate()).padStart(2, '0');
        
        // Create a local date-time string first
        const isoString = `${YYYY}-${MM}-${DD}T${timeStr}:00`;
        const returnDateTime = new Date(isoString);
        
        // Calculate reminder time (12 hours before)
        const reminderTime = new Date(returnDateTime.getTime() - (12 * 60 * 60 * 1000));

        // 1. Scoped Cancel existing jobs to prevent duplicates
        await agenda.cancel({ 
            name: 'send-return-reminder', 
            'data.orderId': order._id 
        });

        // 2. Update Order metadata
        order.reminderScheduledAt = reminderTime;
        order.reminderStatus = "SCHEDULED";
        order.reminderRetryCount = 0;
        await order.save();

        // 3. Schedule the new job
        // If the calculation resulted in a past time, run it soon
        const scheduleAt = reminderTime < new Date() ? new Date(Date.now() + 10000) : reminderTime;
        
        await agenda.schedule(scheduleAt, 'send-return-reminder', { orderId: order._id });
        
        console.log(`Reminder Service - Scheduled reminder for ${order.orderId} at ${scheduleAt.toISOString()}`);
    } catch (error) {
        console.error(`Reminder Service - Failed to schedule reminder for ${order.orderId}:`, error);
    }
};

module.exports = {
    start,
    scheduleReturnReminder
};
