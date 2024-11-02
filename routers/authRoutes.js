const express = require('express')
const passport = require('passport')
const router = express.Router()
const { verifyToken } = require('../middleware/verifyotp_token')
const { preventAdminLog } = require('../middleware/preventAdminLogin')
const { verifyforget_otp } = require('../middleware/verifyforget_otppass')
const { renderUserLogin, renderSignUp, renderOtpPage, registerUser, getOtp, verifyOtp, userLogin,
  renderAdminLogin, adminLogin, renderForgetPassword, forgetPassword,
  renderForgetOtpPage, verifyForgetPassOtp, renderResetPassPage,
  resetingpassword, resetPassResendOtp, logout, userLogout, googleSignin } = require('../controllers/auth.controller')
const { preventLogin } = require('../middleware/preventLogin')

router.route('/login').get(preventLogin, renderUserLogin).post(userLogin)
router.route('/signup').get(preventLogin, renderSignUp).post(registerUser)
router.route('/signup/otp').get(verifyToken, renderOtpPage).post(verifyToken, getOtp)
router.route('/signup/otp/verify').post(verifyToken, verifyOtp)
router.route('/adminlogin').get(preventAdminLog, renderAdminLogin).post(adminLogin)
router.route('/forgetpassword').get(renderForgetPassword).post(forgetPassword)
router.route('/forgetotp').get(verifyforget_otp, renderForgetOtpPage).post(verifyforget_otp, verifyForgetPassOtp)
router.route('/resetpassword').get(verifyforget_otp, renderResetPassPage).post(verifyforget_otp, resetingpassword)
router.route('/resendotp').get(verifyforget_otp, resetPassResendOtp)


///logout
router.route('/logout').get(logout)
router.route('/userlogout').get(userLogout)


/// google authentication
router.route('/google').get(passport.authenticate('google', {
  scope: ['profile', 'email']
}));

/// google callback route
router.route('/google/callback').get(preventLogin, passport.authenticate('google', { session: false }), googleSignin)
module.exports = router