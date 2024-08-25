import passport from 'passport'
import LocalStrategy from 'passport-local/Strategy'
import User from '../models/User'
// sets passport to use local strategy
passport.use(new LocalStrategy(User.authenticate()))

// sets user details in req.user
passport.serializeUser(User.serializeUser())