const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [14, 'Username cannot exceed more than 14 words'],
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address'],
        trim: true
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId;
        }
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    googleId: {
        type: String,
    },
    walletBalance: {
        type: Number,
        default: 0  
    }

}, { timestamps: true })

 
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})


userSchema.methods.comparePassword = async function (enterpassword) {
    console.log(enterpassword);
    const isMatch = await bcrypt.compare(enterpassword, this.password)
    return isMatch
}

const User = mongoose.model('User', userSchema)

module.exports = User
