const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);
module.exports = WalletTransaction;
