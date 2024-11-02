const mongoose = require('mongoose')

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    isListed: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

const brandModel = mongoose.model('Brands', brandSchema)
module.exports = brandModel