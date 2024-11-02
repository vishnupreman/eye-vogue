const jwt = require('jsonwebtoken')
require('dotenv').config()
function preventLogin(req, res, next) {
    const token = req.cookies.accessToken;
    if (token) {
        try {

            try {
                const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
                if (decoded) {
                    console.log('hjkk');
                    return res.redirect('/user/home');
                } else { next() }
            } catch (error) {
                next()
            }

        } catch (err) {
            console.log(err);
            // return next();
        }
    } else {
        next()
    }
    // next();
}

module.exports = { preventLogin }
