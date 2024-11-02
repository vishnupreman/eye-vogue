const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const otpSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [14, 'Username cannot exceed more than 14 words'],
    },
    email: {
        type: String,
        require: [true, 'email is required'],
        unique: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address'],
        trim: true
    },
    password: {
        type: String,
        required: true,
        // maxlength:[20,'password cannot exceed more than 20 character']
    },
    number: {
        type: String,
        require: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    otp: {
        type: String,
        default: null
    },
    otpExpiresAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // 600 seconds = 10 minutes
    }

}, { timestamps: true })

// otpSchema.pre('save',async function(next){
//     if(!this.isModified('password')) return next()
//     const salt = await bcrypt.genSalt(10)
//     this.password= await bcrypt.hash(this.password,salt)
//     next()
// })


const tempData = mongoose.model('tempData', otpSchema)

module.exports = tempData