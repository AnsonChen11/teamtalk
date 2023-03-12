const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const dotenv = require("dotenv");
dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.google_auth_clientId,
            clientSecret: process.env.google_auth_secret,
            callbackURL: "https://teamtalk.buzz/auth/google/callback",
            scope: ["profile", "email"],
        }, 
        async (accessToken, refreshToken, profile, done) => {
            if(profile._json){
                return done(null, profile)
            }
            return done(null, false)
        }
    )
)
passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.facebook_auth_clientId,
            clientSecret: process.env.facebook_auth_secret,
            callbackURL: "https://teamtalk.buzz/auth/facebook/callback",
            profileFields: ["id", "displayName", "emails", "picture.type(large)"]
        },
        async (accessToken, refreshToken, profile, done) => {
            if(profile._json){
                return done(null, profile)
            }
            return done(null, false)
        }
    )
)

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = passport