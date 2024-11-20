const authRouter = require('./authRoutes')
const userRouter = require('./userRoutes')
const adminRouter = require('./adminRoutes')
const { verifyRefreshToken } = require('../middleware/user_token')
const { preventAdminLog } = require('../middleware/preventAdminLogin')
const { verifyingToken } = require('../middleware/admin_token')
const { roleChecking } = require('../middleware/checking')
const express = require('express')



const router = express.Router()


router.use('/auth', authRouter)
router.use('/user', verifyRefreshToken, userRouter)
router.use('/admin', verifyingToken, adminRouter)
router.use('/*', roleChecking, async (req, res) => {
    console.log('Handling 404 for:', req.originalUrl);
    if (req.role === 'admin') {
        res.status(404).render('admin404', { title: 'Admin - Page Not Found' });
    } else if (req.role === 'user') {
        res.status(404).render('user404', { title: 'User - Page Not Found' });
    } else {
        res.status(404).send('404 - Page Not Found');
    }
});

module.exports = router