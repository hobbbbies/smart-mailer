const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const queries = require('../db/queries');

const verifyCallback = async (username, password, done) => {
    try {
        const user = await queries.findOne(username);
        if (!user) return done(null, false);

        const isValid = validPassword(password, user.hash, user.salt);
        if (isValid) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch(err) {
        done(err);
    }
} 

const strategy = new LocalStrategy(verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
    done(null, user.userid);
});

passport.deserializeUser( async (userid, done) => {
    try {
        const user = await queries.findById(userid);
        done(null, user);
    } catch(err) {
        done(err);
    }
    
});