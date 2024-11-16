const User = require('../model/userModel')
const tempData = require('../model/tempotp')
const forgetpass = require('../model/forgetpass')
const { generateOtp, sendOtpEmail } = require('../utility/otpUtility')
const jwt = require('jsonwebtoken')
const { generateaccessToken, generateRefreshToken } = require('../utility/token')
const bcrypt = require('bcryptjs')
const walletModel = require('../model/wallet')
// render login page
const renderUserLogin = async (req, res) => {
    res.render('userLogin')
}

// render signup
const renderSignUp = async (req, res) => {
    console.log('redering sign up');

    res.render('signup')
}

//render otp page
const renderOtpPage = async (req, res) => {
    const token = req.cookies.token
    console.log(token);
    if (!token) {
        return res.redirect('/auth/signup')
    }
    try {
        // const decode = jwt.verify(token,process.env.JWT_OTP_TOKEN)
        return res.render('otp')
    } catch (error) {
        console.error("Token verification failed:", error);
        return res.redirect('/auth/signup'); // Redirect if token is invalid
    }
}

// user signup
const registerUser = async (req, res) => {
    const { name, email, password, phone } = req.body
    console.log(req.body);

    try {
        const emailChecking = await User.findOne({ email })
        if (emailChecking) {
            return res.status(401).json({ success: false, message: 'Email already exists' });
        }
        const user = new tempData({
            name,
            email,
            password,
            number: phone
        })
        console.log(user);

        await user.save()
        const userId = user._id
        const token = jwt.sign({ userId }, process.env.JWT_OTP_TOKEN, { expiresIn: '10m' })
        // console.log(token);

        // Set the JWT token in a cookie (normal cookie, not httpOnly)
        res.cookie('token', token, {
            httpOnly: false,
            maxAge: 10 * 60 * 1000,
        })
        res.status(200).json({ success: true, message: 'User registered successfully', token });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Error registering user' });
    }

}


/// receiving otp
const getOtp = async (req, res) => {
    const userId = req.user
    console.log(userId);

    try {
        const user = await tempData.findById(userId)


        if (!user) {
            return res.status(400).json({ success: false, message: 'no user found with this ID' })
        } else {
            // generating new otp
            const { otp, otpExpiresAt } = generateOtp()
            console.log(otp);

            //upating otp and otp exprire
            user.otp = otp
            user.otpExpiresAt = otpExpiresAt

            await user.save()

            //sending email
            await sendOtpEmail(user.email, otp)

            return res.status(200).json({ success: true, message: 'otp have send' })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Server error occurred' });
    }
}


// verifying otp
const verifyOtp = async (req, res) => {
    const userId = req.user
    const { otp } = req.body
    try {
        const tempuser = await tempData.findById(userId)
        if (!tempuser.otp) {
            return res.status(400).json({ success: false, message: 'no otp found for the email' })
        }
        if (otp === tempuser.otp) {
            console.log('hi');

            if (Date.now() > tempuser.otpExpiresAt) {
                return res.status(400).json({ success: false, message: 'otp expired' })
            }

            const user = new User({
                name: tempuser.name,
                email: tempuser.email,
                password: tempuser.password,
                number: tempuser.number,
                role: tempuser.role
            })

            await user.save()
            const wallet = new walletModel({
                user:user._id,
                balance:0,
                transactions:[]
            })
            await wallet.save()
           
            return res.status(200).json({ success: true, message: 'otp verfied and new user registerd' })
        } else {
            res.status(400).json({ success: false, message: 'invalid otp' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'server error' })
    }
}

// userlogin
const userLogin = async (req, res) => {

    const { email, password } = req.body
    // console.log(email, password)
    try {
        const user = await User.findOne({ email })
        if (!user || !await (user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'invalid user or email id' })
        }
        if (user.isBlocked) {
            return res.redirect('/auth/login')
        }
        //generate token
        const accessToken = generateaccessToken(user._id)
        const refreshToken = generateRefreshToken(user._id)

        //set token in httpcookie
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 10 * 60 * 1000  // set to 1 min
        })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000 // set to 30 days
            // maxAge: 20*60*1000 
        })

        return res.status(200).json({ success: true, message: 'logged in successfully' })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'server error' })
    }
}


const renderAdminLogin = async (req, res) => {
    res.render('adminLogin')
}

const adminLogin = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })
        if (!user || !(await user.comparePassword(password))) {
            return res.render('adminLogin', { errorMessage: 'Incorrect email or password' })
        }
        if (!user.role === 'admin') {
            return res.render('adminLogin', { errorMessage: 'You are not admin' })
        }

        //generate token 
        const accessToken = generateaccessToken(user._id)
        const refreshToken = generateRefreshToken(user._id)

        // setting cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 10 * 60 * 1000
        })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000
        })

        return res.redirect('/admin/home')
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'server error' })
    }
}

const renderForgetPassword = async (req, res) => {
    res.render('forgetpassword')
}

const forgetPassword = async (req, res) => {
    const { email } = req.body
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.render('forgetpassword', { errorMessage: 'invalid email id' })

        }
        const { otp, otpExpiresAt } = generateOtp()
        sendOtpEmail(email, otp)
        console.log(otp);


        const forgetPassUsers = new forgetpass({
            email,
            otp,
            otpExpiresAt
        })

        await forgetPassUsers.save()
        const userId = forgetPassUsers._id

        const token = jwt.sign({ userId }, process.env.JWT_OTP_TOKEN, { expiresIn: '10m' })
        res.cookie('token', token, {
            httpOnly: false,
            maxAge: 10 * 60 * 1000,
        })
        return res.redirect('/auth/forgetotp')

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'you are facing some server issue' })
    }
}

const renderForgetOtpPage = async (req, res) => {
    res.render('forgetotp')
}

const verifyForgetPassOtp = async (req, res) => {
    const { otp } = req.body
    console.log('otp is', otp);
    const userId = req.userId
    console.log(userId);

    try {
        const verifiedUser = await forgetpass.findById(userId)
        if (!verifiedUser.otp) {
            return res.render('forgetotp', { errorMessage: 'no otp found' })
        }
        if (verifiedUser.otp === otp) {
            if (Date.now() > verifiedUser.otpExpiresAt) {
                return res.render('forgetotp', { errorMessage: 'otp expired' })
            }
            return res.redirect('/auth/resetpassword')
        }
        else if (verifiedUser.otp !== otp) {
            return res.render('forgetotp', { errorMessage: 'invalid otp' })
        }

    } catch (error) {
        console.log(error);
    }
}

const renderResetPassPage = async (req, res) => {
    res.render('resetpassword')
}

const resetingpassword = async (req, res) => {
    const { reenterPassword } = req.body
    const userId = req.userId
    console.log(reenterPassword);


    try {
        const user = await forgetpass.findById(userId)
        console.log(user.email);

        const newuser = await User.findOneAndUpdate({ email: user.email }, { $set: { password: reenterPassword } })
        await newuser.save()
        return res.redirect('/auth/login')
    } catch (error) {
        console.log(error, 'server error at reseting pass');
    }

}

const resetPassResendOtp = async (req, res) => {
    const userId = req.userId
    try {
        const user = await forgetpass.findById(userId)
        const currentTime = Date.now();
        const lastOtpTime = currentTime - user.lastotp;

        if (lastOtpTime < 60 * 1000) {
            const timeLeft = Math.ceil((60 * 1000 - lastOtpTime) / 1000);  // Calculate time left in seconds
            return res.render('forgetotp', { errorMessage: ` Please wait ${timeLeft} seconds before requesting a new OTP` });
        }
        const { otp, otpExpiresAt } = generateOtp();
        console.log(otp);

        user.otp = otp;
        user.otpExpiresAt = otpExpiresAt
        user.lastOtp = currentTime

        await user.save();
        await sendOtpEmail(user.email, otp)
        return res.status(200).json({ success: true, message: "OTP has been resent" });

    } catch (error) {
        console.log(error);

    }
}

const logout = async (req, res) => {
    try {
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')

        return res.redirect('/auth/adminlogin')
    } catch (error) {
        console.log(error)
    }
}

const userLogout = async (req, res) => {
    try {
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')
        return res.redirect('/auth/login')
    } catch (error) {
        console.log(error);
    }
}


const googleSignin = async (req, res) => {
    const userId = req.user._id
    try {
        const accessToken = generateaccessToken(userId)
        const refreshToken = generateRefreshToken(userId)

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 10 * 60 * 1000
        })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000
        })
        return res.redirect('/user/home')
    } catch (error) {
        console.log(error);

    }
}
module.exports = {
    renderUserLogin,
    renderSignUp,
    renderOtpPage,
    registerUser,
    getOtp,
    verifyOtp,
    userLogin,
    renderAdminLogin,
    adminLogin,
    renderForgetPassword,
    forgetPassword,
    renderForgetOtpPage,
    verifyForgetPassOtp,
    renderResetPassPage,
    resetingpassword,
    resetPassResendOtp,
    logout,
    userLogout,
    googleSignin
}
