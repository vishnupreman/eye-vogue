const jwt = require('jsonwebtoken')
const User = require('../model/userModel')
const { generateaccessToken } = require('../utility/token')
require('dotenv').config()
const verifyingToken = async (req, res, next) => {
    const accessToken = req.cookies.accessToken
    const refreshToken = req.cookies.refreshToken

    try {
        if (accessToken) {
            console.log('access token found');
            try {
                const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET)
                if (!decoded) {
                    return res.redirect('/auth/adminlogin')
                }
                req.userId = decoded.userId
                const checkadmin = decoded.userId
                const admin = await User.findById(checkadmin)
                if (admin.role === 'admin') {
                    return next()
                } else {
                    return res.redirect('/auth/adminlogin')
                }
            } catch (error) {

                return res.redirect('/auth/adminlogin')
            }
        } else {
            if (!refreshToken) {
                res.redirect('/auth/adminlogin')
                console.log('no refreshToken found');
            } else {
                console.log('hiii');
                const decode = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
                req.userId = decode.userId
                userId = decode.userId

                if (decode) {
                    const newAccessToken = generateaccessToken(userId)
                    console.log('new access created', newAccessToken);
                    console.log('hi from new access token');

                    res.cookie('accessToken', newAccessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        maxAge: 10 * 60 * 1000
                    })
                    next()
                }
            }
        }

    } catch (error) {
        console.log(error);
        // return res.status(500).json({success:false,message:'server error'})
    }
}

module.exports = { verifyingToken }