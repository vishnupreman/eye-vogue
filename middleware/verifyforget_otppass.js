const jwt = require('jsonwebtoken')

const verifyforget_otp = async (req, res, next) => {
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({ message: 'no token found' })
    }
    try {
        const decode = jwt.verify(token, process.env.JWT_OTP_TOKEN)
        req.userId = decode.userId
        next()
    } catch (error) {
        console.log('no token found', error)
    }
}
module.exports = { verifyforget_otp }