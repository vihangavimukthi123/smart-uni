const mongoose = require("mongoose")

const supplierSchema  = new mongoose.Schema(
    {
        semail: {
            type: String,
            required: true,
            unique: true
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            default: "supplier"
        },
        description: {
            type: String,
            default: "Premier provider of university event solutions."
        },
        profileImage: {
            type: String,
            default: ""
        },
        rating: {
            type: Number,
            default: 5.0
        },
        reviewsCount: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            default: "UNIVERSITY CERTIFIED"
        },
        isVerified: {
            type: Boolean,
            default: true
        },
        isBlocked:{
            type: Boolean,
            default: false
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        }
    }
)

const Supplier = mongoose.model("Supplier" , supplierSchema)

module.exports = Supplier