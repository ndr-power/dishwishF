import mongoose from 'mongoose'
import { reviewSchema} from './review.js'
// dish schema
const dishSchema = mongoose.Schema({
    title: String,
    image: String,
    ingredients: String,
    reviews: [reviewSchema],
    rating: {
        type: Number,
        default: 0
    }
})
// dish model
const Dish = mongoose.model('Dish', dishSchema)

export default Dish
