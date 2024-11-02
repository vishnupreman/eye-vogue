const authRouter = require('./authRoutes')
const userRouter = require('./userRoutes')
const adminRouter = require('./adminRoutes')
const { verifyRefreshToken } = require('../middleware/user_token')
const { preventAdminLog } = require('../middleware/preventAdminLogin')
const { verifyingToken } = require('../middleware/admin_token')
const express = require('express')



const router = express.Router()


router.use('/auth', authRouter)
router.use('/user', verifyRefreshToken, userRouter)
router.use('/admin', verifyingToken, adminRouter)

module.exports = router