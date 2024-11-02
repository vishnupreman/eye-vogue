const jwt = require('jsonwebtoken')
require('dotenv').config()

const generateToken = (userId,secret,expiresIn)=>{
    return jwt.sign({userId} , secret ,{expiresIn})
}

/// Generate access token 
const generateaccessToken = (userId) =>{
    const accessTokenSecret = process.env.JWT_ACCESS_SECRET
    const accessTokenExpires = '15m' /// expiration time is 15 minutes
    return generateToken(userId,accessTokenSecret,accessTokenExpires)
}

/// Generate refresh token
const generateRefreshToken = (userId) =>{
     const refreshTokenSecret = process.env.JWT_REFRESH_SECRET
     const refreshTokenExpires= '30d' /// expires after 30 days
     return generateToken(userId,refreshTokenSecret,refreshTokenExpires)
}

module.exports = {generateaccessToken,generateRefreshToken}