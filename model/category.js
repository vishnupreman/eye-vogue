const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'Category name is required'],
        trim: true
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


categorySchema.pre('save', function (next) {
    this.next = this.name.toLowerCase()
    next()
})

/// Apply case-insensitive indexing to name field
categorySchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

const categoryModel = mongoose.model('Category', categorySchema)
module.exports = categoryModel
