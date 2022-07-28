const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true, //valid number/decimal
        trim: true
    },
    currencyId: {
        type: String,
        rquired: true,  //INR
        uppercase: true,
        trim: true
    },
    currencyFormat: {
        type: String,
        required: true, //rupee symbol
        trim: true
    },
    isFreeShipping: {
        type: Boolean,
        default: false
    },
    productImage: {
        type: String,
        required: true,
        trim: true
    },
    style: {
        type: String,
        trim: true
    },
    availableSizes: [{
        type: String,
        required: true,
        enum: ["S", "XS", "M", "X", "L", "XXL", "XL"],
        uppercase: true,
        trim: true
    }],
    installments: {
        type: Number,
        trim: true
    },
    deletedAt: Date,
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('product', productSchema)
