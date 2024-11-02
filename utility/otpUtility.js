const nodemailer = require('nodemailer')
require('dotenv').config()
// const tempData = require('../model/tempotp')

/// Generate random 6digit number
const generateOtp = ()=>{
    const otp = Math.floor(100000 + Math.random() * 900000)
    const otpExpiresAt = new Date(Date.now() +2 *60 *1000)
    return { otp , otpExpiresAt}
}


const sendOtpEmail = async(email,otp)=>{
    const transporter = nodemailer.createTransport({
        service : 'Gmail',
        auth:{
            user:process.env.EMAIL,
            pass:process.env.EMAIL_PASS
        }
    })

    //EMAIL CONTENT
    const mailOption = {
        from : process.env.EMAIL,
        to : email,
        subject : 'Your OTP  for account verification',
        text : ` your otp number is ${otp} . Valid for 5 minutes`
    }

    // sending mail
    try{
        await transporter.sendMail(mailOption)
        console.log(`OTP sent to ${email}`);
    }catch(error){
        console.log(` Error sending email to ${email}`);
        throw new Error(' Failed to send OTP ')
    }
}



module.exports = {generateOtp,sendOtpEmail}