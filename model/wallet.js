const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true 
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    transactions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'WalletTransaction'
        }
    ]
}, { timestamps: true });

const Wallet = mongoose.model('Wallet', walletSchema);
module.exports = Wallet;
