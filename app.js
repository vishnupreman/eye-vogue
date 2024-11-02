const connectDb = require('./config/db')
const express = require('express')
const nocache = require('nocache')
const routes = require('./routers/index')
const cookieParser = require('cookie-parser')
const path = require('path');
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
require('./config/googleauth')
require('dotenv').config()
const app = express()
app.use(passport.initialize());

// setting view engine
app.set('view engine', 'ejs')
app.set('views', ['./view/user', './view/admin'])


app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

app.use(flash())

app.use(express.static('public'))
app.use('/uploads', express.static('public/uploads'));

app.use(nocache())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
app.use('/', routes)

async function server() {
    const DB = process.env.MONGO_URI
    const PORT = process.env.PORT || 3300
    try {
        await connectDb(DB) // connecting database
        app.listen(PORT, () =>
            console.log(`listening to the http://localhost:${PORT}`)
        )
    } catch (error) {
        console.log(error);
    }
};

server()
