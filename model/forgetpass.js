const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const resetPass = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address'],
    trim: true
  },
  password: {
    type: String,
    maxlength: [20, 'password cannot exceed more than 20 character']
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
  },
  lastotp: {
    type: Date,
    default: Date.now
  }

})

resetPass.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

const forgetpass = mongoose.model('forgetpassword', resetPass)

module.exports = forgetpass