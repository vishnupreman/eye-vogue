const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'productModel',
        required: true
    },
    color: {
        type: String,
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
    },
    status: {
        type: String,
        enum: ["Pending", "Shipped", "Delivered", "Cancelled", "Returned", "Confirmed"],
        default: 'Pending'
    },
    refundAmount: {
        type: Number,
        default: 0 
    }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    billingAddress: {
        address: String,
        number: String,
        pincode: String,
        country: String,
        state: String,
        city: String,
        name: String,
    },
    paymentMethod: {
        type: String,
        default: 'COD'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    totalPrice: {
        type: Number,
        required: true 
    },
    discount: {
        type: Number,
        default: 0 
    },
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        default: null 
    },
    deliveryCharge: {
         type: Number, 
         default: 40
    }
    
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
