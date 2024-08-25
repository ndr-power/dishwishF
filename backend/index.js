import 'dotenv/config'
import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import { Strategy } from 'passport-local'
import session from 'express-session'
import User from './models/user.js'
// routers 

import cafeRoutes from './routes/cafeRoutes.js'
import authRoutes from './routes/authRoutes.js'

// express initialization
const app = express()
// uses session
app.use(session({
	secret: process.env.COOKIE_SECRET,
	resave: false,
	saveUninitialized: false
}))
// initializes passport
app.use(passport.initialize());
// initializes passport session
app.use(passport.session());
// uses a passport strategy
passport.use(new Strategy(User.authenticate()))
// sets functions for serialization and deserealization
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
// uses cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET))
// cors white-list
const whitelist = [process.env.WHITELIST_IP]
// cors options
const corsOptions = {
	origin: function(origin, callback) {
		if (!origin || whitelist.indexOf(origin) !== -1) {
			callback(null, true)
		} else {
			callback(new Error("Not allowed by CORS"))
		}
	},
	credentials: true,
}
// initializes cors
app.use(cors(corsOptions))
// initizlizes body-parser
app.use(bodyParser.json({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }))
// initializes routers
app.use('/cafe', cafeRoutes)
app.use('/login', authRoutes)
// initializes database connection
const connectionUrl = process.env.MONGO_URL
const port = process.env.SERVER_PORT

mongoose.connect(connectionUrl, { useNewUrlParser: true })
	.then(() => app.listen(port, () => console.log('Server is running')))
	.catch(console.log)