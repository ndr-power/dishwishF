import User from './models/user.js'
import fs from 'fs'
import mongoose from 'mongoose'
const connectionUrl = process.env.MONGO_URL
const port = process.env.SERVER_PORT

mongoose.connect('mongodb://localhost:27017', { useNewUrlParser: true })
	.then(() => console.log('Server is running'))
	.catch(console.log)
fs.readFile('./user_accounts_more_diverse.json', 'utf-8', (err, data) => {
    const accounts = JSON.parse(data)
    console.log(accounts)
    accounts.users.map(async acc => {
       await User.register(new User({ username: acc.username }), acc.password, (err, acct) =>{
        console.log(err)
       })
    })
    // User.register(new User({ username: req.body.username }), req.body.password)
})
// User.register(new User({ username: req.body.username }), req.body.password)