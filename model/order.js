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
    size: {
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
        address:{
            type:String,
          
        },
        number:{
            type:String,
            
        },
        pincode:{
            type:String,
            
        } ,
        country:{
            type:String,
            
        },
        state:{
            type:String,
            
        },
        city:{
            type:String,
            
        },
        name:{
            type:String,
            
        }
        
    },
    paymentMethod: {
        type:String,
        default:'COD'
    },
    paymentStatus:{
        type:String
    },
    totalPrice: {
        type: Number,
        
    },
    status: {
        type: String,
        enum: ["Pending", "Shipped", "Delivered", "Cancelled", "Returned","Confirmed"],
        default: 'pending'
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;