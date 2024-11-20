const jwt = require('jsonwebtoken')
const User = require('../model/userModel')
const { generateaccessToken } = require('../utility/token')
require('dotenv').config()
const roleChecking = async (req, res, next) => {
    const accessToken = req.cookies.accessToken
    const refreshToken = req.cookies.refreshToken

    try {
        if (accessToken) {
            console.log('asdfasd')
           
            try {
                const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET)
                console.log(decoded)
                if (!decoded) {
                    return res.redirect('/auth/login')
                }
                req.userId = decoded.userId
                const checkadmin = decoded.userId
            
                const user = await User.findById(checkadmin)
               req.role=user.role
               next()
            } catch (error) {

                return res.redirect('/auth/adminlogin')
            }
        } else {
            if (!refreshToken) {

              req.role='nobody'
            } else {
             
                const decode = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
                req.userId = decode.userId
                userId = decode.userId

                if (decode) {
                    const newAccessToken = generateaccessToken(userId)
                

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

module.exports = { roleChecking }