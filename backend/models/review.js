import mongoose from 'mongoose'
// review schema
const reviewS = mongoose.Schema({
    userId: String,
    username: String,
    title: String,
    text: String,
    date: Date,
    ratingOverall: {
        type: Number,
        default: 0
    },
    ratingService: {
        type: Number,
        default: 0
    },
    ratingDish: {
        type: Number,
        default: 0
    },
    ratingSentiment: {
        type: Number,
        default: 0
    },
    userConfirmsSentiment: {
        type: Boolean,
        default: false
    },
    useSentiment: {
        type: Boolean,
        default: false
    }
})
// review model
const Review = mongoose.model('Review', reviewS)

export default Review
export const reviewSchema = reviewS