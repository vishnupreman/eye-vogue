
const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    const token = req.cookies.token
    if (!token) {
        return res.redirect('/auth/adminlogin')
    }
    try {
        /// Verify token
        const decoded = jwt.verify(token, process.env.JWT_OTP_TOKEN);
        console.log(decoded)
        req.user = decoded.userId; 
        next(); 
    } catch (error) {
        console.error('JWT verification failed:', error);
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
}
module.exports = { verifyToken }