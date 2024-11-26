const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy
const userModel = require('../model/userModel') // Import your user model
require('dotenv').config()
const walletModel = require('../model/wallet')

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_URL,
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Find the user by Google ID
            let user = await userModel.findOne({ googleId: profile.id });

            // If the user doesn't exist, create a new one
            if (!user) {
                user = new userModel({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    number: null
                });
                await user.save();

                // Create a wallet for the new user
                const wallet = new walletModel({
                    user: user._id,
                    balance: 0,
                    transactions: []
                });
                await wallet.save();
            } else {
                // Ensure the user has a wallet
                let wallet = await walletModel.findOne({ user: user._id });
                if (!wallet) {
                    wallet = new walletModel({
                        user: user._id,
                        balance: 0,
                        transactions: []
                    });
                    await wallet.save();
                }
            }

            // Continue the authentication process
            return done(null, user);
        } catch (error) {
            console.error("Error in GoogleStrategy:", error);
            return done(error, false);
        }
    }));

