import mongoose from 'mongoose'
import Dish from './dish.js'
// cafe schema
const cafeSchema = mongoose.Schema({
    title: String,
    description: String,
    image: String,
    cuisine: String,
    lat: String,
    lng: String,
    overallRating: Number,
    serviceRating: Number,
    reviewsCount: Number,
    menu: [Dish.schema],
    location: String,
})
// cafe model
const Cafe = mongoose.model('Cafe', cafeSchema)

export default Cafe