const mongoose = require('mongoose')
const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'productModel',
        required: true
    },
    color: {
        type: String,
        enum: ['yellow', 'black', 'red', 'green'], 
        required: true
    },
    size: {
        type: String,
        enum: ['s', 'm', 'l'], 
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        max: 10 
    },
    price: {
        type: Number,
        required: true
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    items: [cartItemSchema], 
    totalPrice: {
        type: Number,
        // required: true,
        default: 0
    },
}, { timestamps: true });

const cart = mongoose.model('Cart',cartSchema)
module.exports = cart