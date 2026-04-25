const mongoose = require('mongoose');

const workPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // conecting with User model
        required: true
    },
    // Original inputs used for generation
    inputs: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    // AI generated work plan details
    workplan: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('WorkPlan', workPlanSchema);