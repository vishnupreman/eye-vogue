const jwt = require('jsonwebtoken')
require('dotenv').config()
const User = require('../model/userModel')

const preventAdminLog = async (req, res, next) => {
    const token = req.cookies.accessToken
    if (token) {
        console.log('hi first');
        try {
            try {
                // console.log('hiiiiii');
                const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
                // console.log('hi second');
                // console.log(decoded);
                if (decoded) {
                    const checkingUser = decoded.userId
                    const user = await User.findById(checkingUser)
                    if (user.role === 'admin') {
                        return res.redirect('/admin/home')
                    }
                    else {
                        next()
                    }
                } else {
                    next()
                }
            } catch (error) {
                console.log(error)
                console.log('redctng');
                next()
            }
        } catch (error) {
            console.log(error);
        }
    } else {

        next()
    }
}

module.exports = { preventAdminLog }