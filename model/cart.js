const mongoose = require('mongoose');

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
        default: 0
    }
}, { timestamps: true });


cartSchema.methods.calculateTotalPrice = function () {
    let total = 0;
    this.items.forEach(item => {
        total += (item.discountedPrice || item.price) * item.quantity; 
    });
    this.totalPrice = total;
};

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
