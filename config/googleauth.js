const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy
const userModel = require('../model/userModel') // Import your user model
require('dotenv').config()

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_URL,
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Find or create user in your database
            let user = await userModel.findOne({ googleId: profile.id });
            if (!user) {
                user = new userModel({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    number: null
                });
                await user.save();
            }
            return done(null, user);
        } catch (error) {
            return done(error, false);
        }
    }));
