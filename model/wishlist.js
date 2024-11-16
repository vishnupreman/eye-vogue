const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wishlistItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'productModel',  
        required: true
    },
    color: {
        type: String,
        required: true, 
    },
    price: {
        type: Number,
        
    },
});

const wishlistSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [wishlistItemSchema]
}, { timestamps: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
