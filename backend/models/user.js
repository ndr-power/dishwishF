import mongoose from 'mongoose'
import passportLocalMongoose from 'passport-local-mongoose'
// user schema
const userSchema = mongoose.Schema({
    username: String, 
    type: { // 0 - user, 1 - cafe
        type: Number,
        default: 0
    },
    cafeId: {
        type: mongoose.Types.ObjectId,
        default: null
    },
    points: {
        type: Number,
        default: 50,
    },

})

// passport initialization with mongoose
userSchema.plugin(passportLocalMongoose)
// user model
let UserModel = mongoose.model('User', userSchema)

export default UserModel