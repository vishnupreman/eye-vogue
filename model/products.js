const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    brandname: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brands',
        required: true
    },
    isblocked: {
        type: Boolean,
        required: true,
        default: false
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    colors: {
        yellow: {
            images: {
                type: [String], 
                default: [] 
            },
            quantity: {
                type: Number,
                default: 0
            }
        },
        black: {
            images: {
                type: [String], 
                default: [] 
            },
            quantity: {
                type: Number,
                default: 0
            }
        },
        red: {
            images: {
                type: [String], 
                default: [] 
            },
            quantity: {
                type: Number,
                default: 0
            }
        },
        green: {
            images: {
                type: [String], 
                default: []
            },
            quantity: {
                type: Number,
                default: 0
            }
        },
    },
    gender: {
        type: String,
        required: true
    },
    frameColor: {
        type: String,
        required: true
    },
    material: {
        type: String,
        required: true
    },
    frameStyle: {
        type: String,
        required: true
    },
    size: {
        s: {
            quantity: {
                type: Number,
                default: 0,
            }
        },
        m: {
            quantity: {
                type: Number,
                default: 0,
            }
        },
        l: {
            quantity: {
                type: Number,
                default: 0,
            }
        }
    }
}, { timestamps: true });

const productModel = mongoose.model('productModel', productSchema);

module.exports = productModel;
