import express from 'express'
import mongoose from 'mongoose'
import { promisify } from 'util'
import r from 'request'
import Cafe from '../models/cafe.js'
import Dish from '../models/dish.js'
import User from '../models/user.js'
import Review from '../models/review.js'
import controllerUtils from './controllerUtils.js'
import natural from 'natural'
import aposToLexForm from 'apos-to-lex-form'
import SpellCorrector  from 'spelling-corrector'
import stopword from 'stopword'
const {WordTokenizer} = natural
const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();
// request initialization with headers
const request = promisify(r.defaults({
	headers: {
		'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36',
		'Accept': 'application/json'
	}
}))
const cafeController = {
    // gets all cafes
	getCafes: async (req, res) => {
		await controllerUtils.getAll(Cafe, res)
	},
	// counts all reviews
	countReviews: async (req, res) => {
		const cafes = await Cafe.find()
		cafes.forEach(async cafe => {
			await cafe.menu.forEach(async dish => {
				await controllerUtils.countReviews(Cafe, cafe._id, dish._id)
				console.log(`[Recount] ${cafe.title} - ${dish.title}`)
			})
		})
	},
	// recommends user a dish
	recommend: async (req, res) => {
		const { userId } = req.body
		const cafes = await Cafe.find()
		let userReviews = []
		cafes.forEach(cafe => {
			cafe.menu.forEach(dish => {
				dish.reviews.map(review => {
					if (review.userId == userId) userReviews.push({review, cuisine: cafe.cuisine, rId: cafe._id, dish})
				})
			})
		})
		let likesCuisine = []
		let notLikesCuisine = []
		let likesIngredients = []
		let notLikesIngredients = []
		// check which cuisines and ingredients user likes
		userReviews.map( review => {
			if (review.review.ratingDish >= 7){
				likesCuisine.push(...review.cuisine.split(','))
				likesIngredients.push(...review.dish.ingredients.split(','))
			}else if (review.review.ratingDish <= 5){
				notLikesCuisine.push(...review.cuisine.split(','))
				notLikesIngredients.push(...review.dish.ingredients.split(','))
			}
		})
		// check which restaurant will be the best for the user
		let pointsMap = {}
		cafes.forEach(cafe => pointsMap[cafe._id] = 0)
		cafes.forEach(cafe => {
			const cuisines = cafe.cuisine.split(',')
			// add overall rating to the map
			pointsMap[cafe._id] = cafe.overallRating / 10
			cuisines.forEach(cuisine => {
				if (likesCuisine.indexOf(cuisine)> -1) pointsMap[cafe._id] += 1
				else if (notLikesCuisine.indexOf(cuisine) > -1) pointsMap[cafe._id] -= 1
				
			})
		})
		// check which dishes will be best for the user
		const bestRestId = Object.keys(pointsMap).reduce((a,b) => pointsMap[a] > pointsMap[b] ? a : b)
		let dishPointsMap = {}
		const bestRest = cafes.find(val => val._id == bestRestId)
		bestRest.menu.map(dish => {
			// sort dishes by user's ingredients preferences
			let ingredients = dish.ingredients.split(',')
			dishPointsMap[dish._id] = parseFloat(dish.rating) 
			ingredients.forEach(ingr => {
				if (likesIngredients.indexOf(ingr) > -1) dishPointsMap[dish._id] += 1
				else if (notLikesIngredients.indexOf(ingr) > -1) dishPointsMap[dish._id] -= 1
			})
		})
		const bestDishId = Object.keys(dishPointsMap).reduce((a,b) => dishPointsMap[a] > dishPointsMap[b] ? a : b)
		const bestDish = bestRest.menu.find(val => val._id == bestDishId)
		res.json({cafe: bestRest, dish: bestDish})
	},
    // adds one cafe
	addCafe: async (req, res) => {
		console.log(req.body)
		const { title, description, location, image, cuisine } = req.body
        // default coordinates
		let lat = '55.7900751'
		let lng = '49.124631'
        // parses coordinates by location string
		let data = await request({ url: 'https://nominatim.openstreetmap.org/search', qs: { q: location, format: 'json' }, headers:{
			'Referrer': 'https://dishandwish.com',
			'User-Agent': 'ndrpowerr@gmail.com'
		}})
		console.log(data.body)
		if (data.statusCode == 200) {
			data = JSON.parse(data.body)
			if (data.length) {
				const coords = data[0]
				lat = coords['lat']
				lng = coords['lon']
				console.log(lat, lng)
			}
		}
		await controllerUtils.addOne(Cafe, { title, description, menu: [], location, cuisine, image, lat, lng, overallRating: 0, ratingService: 0, reviewsCount: 0 }, res)
	},
    // gets cafe info by id
	getCafe: async (req, res) => {
		const { id } = req.params
		await controllerUtils.getOneById(Cafe, id, res)
	},
    // updates cafe info by id
	updateCafe: async (req, res) => {
		const { id } = req.params
		const { title, description, location } = req.body
		await controllerUtils.updateOneById(Cafe, id, { title, description, location }, res)
	},
    // adds a dish to menu
	addToMenu: async (req, res) => {
		const { id } = req.params
		const { title, image, ingredients } = req.body
		const matches = await Cafe.findById(id)
        // checks for dish uniqueness in the menu
		if (matches.menu.find(val => val.title.toLowerCase() == title.toLowerCase())) return res.status(409).json({ e: 'duplicate' })
		await controllerUtils.addToSubArray(Cafe, 'menu', id, Dish, { title, ingredients, reviews: [], image }, res)
	},
    // updates dish info by cafeid and dishid
	updateDishFromMenu: async (req, res) => {
		const { id, dishid } = req.params
		await controllerUtils.updateOneFromSubArray(Cafe, 'menu', id, dishid, req.body, res)
	},
    // removes a dish from menu
	removeFromMenu: async (req, res) => {
		const { id, dishid } = req.params
		await controllerUtils.removeFromSubArray(Cafe, 'menu', id, dishid, res)
	},
    // add a review to a dish
	addReviewToDish: async (req, res) => {
		const { id, dishid } = req.params
		const { title, text, ratingOverall, ratingService, ratingDish, userId, username } = req.body
		const sentimentAnalyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
		console.log(title, text)
		let sentence = title + '.' + ' ' + text;
		console.log(sentence)
		// convert apostrophe-connecting words to standart lexicone form
		sentence = aposToLexForm(sentence).toLowerCase()
		console.log(sentence)

		// remove spec chars
		sentence = sentence.replace(/[^a-zA-Z\s]+/g, '');
		console.log(sentence)

		const tokenizer = new WordTokenizer();
		// tokenize sentence
		let tokenizedReview = tokenizer.tokenize(sentence)
		console.log(tokenizedReview)
		// correct spelling on words
		tokenizedReview.forEach((wrd, i) => tokenizedReview[i] = spellCorrector.correct(wrd))
		console.log(tokenizedReview)
		// remove stop words
		tokenizedReview = stopword.removeStopwords(tokenizedReview)
		console.log(tokenizedReview)
		// calculate sentiment
		const sentiment = sentimentAnalyzer.getSentiment(tokenizedReview);
		
		await controllerUtils.addToSubSubArray(Cafe, 'menu', 'reviews', id, dishid, Review, { title, text, userId: userId.toString(), username, ratingOverall: (ratingDish * 0.6 + ratingService * 0.4).toFixed(1), date: new Date(), ratingService, ratingDish, ratingSentiment: sentiment }, res)
	},
	// confirm sentiment guess
	confirmSentiment: async (req,res) => {
		console.log('CONFIRM SENTIMENT')
		const { id, dishid, reviewid } = req.params
		const { confirm } = req.body
		// find needed 
		const cafe = await Cafe.findById(id)
		const indexOfDish = cafe.menu.indexOf(cafe.menu.find(val => val._id == dishid))
		const indexOfReview = cafe.menu[indexOfDish].reviews.indexOf(cafe.menu[indexOfDish].reviews.find(val => val._id == reviewid))
		cafe.menu[indexOfDish].reviews[indexOfReview].userConfirmsSentiment = true
		cafe.menu[indexOfDish].reviews[indexOfReview].useSentiment = confirm ? true : false
		let fRating = cafe.menu[indexOfDish].ratingOverall
		// select multiplier for the review 
		let ratingSentiment = cafe.menu[indexOfDish].reviews[indexOfReview].ratingSentiment 
		if (ratingSentiment < 0 ){
			//awful
			ratingSentiment = 0.8
		  }else if (ratingSentiment >=0 && ratingSentiment <= 0.25){
			// very bad
			ratingSentiment = 0.9
		  }else if (ratingSentiment >0.25 && ratingSentiment <= 0.5){
			// neutral
			ratingSentiment = 1
		  }else if (ratingSentiment >0.5 && ratingSentiment <= 0.75){
			// good
			ratingSentiment = 1.1
		  }else{
			// very good
			ratingSentiment = 1.2
		  }
		const finalRatingWithSentiment = cafe.menu[indexOfDish].reviews[indexOfReview].ratingOverall *ratingSentiment
		// cafe.menu[indexOfDish].ratingOverall = finalRatingWithSentiment > 10 ? 10 : finalRatingWithSentiment
		cafe.menu[indexOfDish].reviews[indexOfReview].ratingOverall = finalRatingWithSentiment > 10 ? 10: finalRatingWithSentiment

		await Cafe.findOneAndUpdate({_id: id}, cafe)
		 await controllerUtils.countReviews(Cafe, cafe._id.toString(), dishid)
		 return res.json({success: true})
	},
    // add a ingredient to the dish
	addIngredientToDish: async (req, res) => {
		const { id, dishid } = req.params
		const { title, image } = req.body
		return await controllerUtils.addToSubSubArray(Cafe, 'menu', 'ingredients', id, dishid, Review, { title, image }, res)
	}

}


export default cafeController