import express from 'express'
import passport from 'passport'
import User from '../models/user.js'
import Cafe from '../models/cafe.js'
import r from 'request'
import { promisify } from 'util'
const request = promisify(r)
const router = express.Router()
// get user session
router.get('/', (req, res) => {
	if (req.user) {
		if (req.user.type > 0) {
			res.json({ user: req.user.username, cafeId: req.user.cafeId.toString() })
		} else
			res.json({ user: req.user.username, userId: req.user._id })
	} else return res.status(409).json({ user: null })
})
// login user
router.post('/', passport.authenticate('local'), (req, res) => {
	if (req.user) {
		if (req.user.type > 0) {
			res.json({ user: req.user.username, cafeId: req.user.cafeId.toString() })
		} else
			res.json({ user: req.user.username, userId: req.user._id })
	} else return res.status(409).json({ user: null })

})
// register user
router.post('/register', (req, res) => {
	console.log(req.body)
	User.register(new User({ username: req.body.username }), req.body.password, (err, account) => {
		if (err) return res.status(409).json({ user: null })
		passport.authenticate('local')(req, res, () => {
			res.json({ user: req.user.username, userId: req.user._id })
		})
	})
})
// register a cafe
router.post('/register/cafe', (req, res) => {
	console.log(req.body)
	let cafeId = null
	const { title, description, location, image, cuisine } = req.body.cafe
	User.register(new User({ username: req.body.username, type: 1 }), req.body.password, async (err, account) => {
		if (err) {
			console.log(err)
			return res.status(409).json({ user: null })
		}
		await passport.authenticate('local')(req, res, async () => {
			console.log(1)
			// add a cafe
			const cafe = await request({ url: 'http://localhost:5000/cafe', json: true, method: 'POST', body: { title, description, location, image, cuisine } })
			if (cafe.statusCode != 200) return res.status(409).json({ user: null })
			console.log(cafe.body)
			try {
				await User.findByIdAndUpdate(req.user._id, { cafeId: cafe.body.matches._id }, { new: true })
				res.json({ user: req.user.username })
			} catch (e) {
				console.log(e)
				res.status(409).json({ user: null })
			}
		})
	})
})
// log user out
router.get('/logout', (req, res) => {
	req.logout()
	res.json({ user: null })
})

export default router