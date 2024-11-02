const jwt = require('jsonwebtoken')
const { generateaccessToken } = require('../utility/token')
const User = require('../model/userModel')
require('dotenv').config()


const
    verifyRefreshToken = async (req, res, next) => {
        const refreshToken = req.cookies.refreshToken
        const accessToken = req.cookies.accessToken
        try {
            if (accessToken) {
                console.log("Access token found");
                try {
                    const decode = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET)
                    if (!decode) {
                        return res.redirect('/auth/login')
                    }
                    req.userId = decode.userId   /// attach user info to the request
                    const userId = decode.userId

                    const user = await User.findById(userId)
                    if (user.isBlocked) {
                        res.clearCookie('accessToken')
                        res.clearCookie('refreshToken')
                        return res.redirect('/auth/login')
                    }

                    return next()
                } catch (error) {
                    return res.redirect('/auth/login')
                }

            } else {
                if (!refreshToken) {
                    res.redirect('http://localhost:3000/auth/login')
                    console.log('refresh token expired');

                } else {
                    const decode = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
                    req.userId = decode.userId
                    const userId = decode.userId
                    console.log(userId);
                    console.log(decode);


                    if (decode) {
                        console.log('hi');

                        const newAccessToken = generateaccessToken(userId)  /// generating new access token
                        console.log("newwAcess", newAccessToken)
                        res.cookie('accessToken', newAccessToken, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === 'production',
                            maxAge: 15 * 60 * 1000 /// expires after 15 minutes
                        })
                        next()
                    }
                }

            }
        } catch (error) {
            console.log('Access token expired or invalid', error);

        }
    }

module.exports = { verifyRefreshToken }