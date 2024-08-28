// recalculates all ratings
async function countRatings(id, dishId, Cafe) {
	 id = id.toString()
	 dishId = dishId.toString()
	const cafe = await Cafe.findById(id)
	console.log(cafe._id)
	const dish = cafe.menu.find(val => val._id.toString() == dishId)
	console.log(dish._id)
	if (dish) {
		if (!dish.reviews.length) return
		console.log('Dish Found')
		await Cafe.findOneAndUpdate({_id: id}, {reviewsCount: cafe.reviewsCount + 1})
		
		let dates = []
        // substrings all dates to format them to YYYY-MM-DD format
		dish.reviews.map(val => dates.push((new Date(val.date)).toISOString().toString().substring(0, 10)))
        // removes duplicates
		dates = [...new Set(dates)]
		const amountOfDates = dates.length
        // calculates delta W
		const weightInterval = 1 / amountOfDates
		let weights = []
        // maps weights to dates
		dates.map((val, i) => weights.push(i * weightInterval + weightInterval))
		let weightDivider = 0
		let comRating = 0
		let serviceRating = 0
        // calculates weighted ratings
		dish.reviews
			.map(val => {

				for (let i = 0; i < dates.length; i++) {
					const indDate = dates[i]
					if ((new Date(val.date)).toISOString().indexOf(indDate) > -1) {
						comRating += val.ratingOverall * weights[i]
						weightDivider += weights[i]
						break
					}
				}
			})
		const res = { json: () => true }
        // updates rating
		await controllerUtils.updateOneFromSubArray(Cafe, 'menu', id, dishId, { rating: (comRating / weightDivider).toFixed(1) }, res)
		const cafeNew = await Cafe.findById(id)
		let serviceRatingSum = 0
		let ratingOverallSum = 0 
		cafeNew.menu.map(dish => {
			dish.reviews.map(rev => {
				serviceRatingSum += rev.ratingService
				ratingOverallSum += rev.ratingOverall
			})
		})
		console.log(serviceRatingSum/ cafe.reviewsCount, serviceRatingSum / cafe.reviewsCount)
		await Cafe.findOneAndUpdate({_id: id}, { '$set': {overallRating: ratingOverallSum/cafe.reviewsCount}})
		await Cafe.findOneAndUpdate({_id: id}, { '$set': {ratingService: serviceRatingSum / cafe.reviewsCount}})
	}
}
const controllerUtils = {
    // gets all objects of collection
	getAll: async (Model, res) => {
		try {
			const matches = await Model.find()
			res.json({ matches })
		} catch (e) {
			res.status(404).json({ e })
		}
	},
    // adds one object to a collection
	addOne: async (Model, params, res) => {
		try {
			const newDoc = new Model(params)
			await newDoc.save();
			res.json({ matches: newDoc })
		} catch (e) {
			res.status(409).json({ e })
		}
	},
    // deletes one object from collection by it's id
	deleteOneById: async (Model, id, res) => {
		try {
			if (!(await Model.exists({ id }))) return res.status(404).json({ e: 'not found' })
			await Model.findByIdAndRemove(id, { new: true })
			res.json({ success: true })
		} catch (e) {
			res.status(409).json({ e })
		}
	},
    // gets one object from the collection by id
	getOneById: async (Model, id, res) => {
		try {
			const doc = await Model.findById(id)
			res.json({ matches: doc })
		} catch (e) {
			res.status(404).json({ e })
		}
	},
    // updates one object from the collection by it's id
	updateOneById: async (Model, id, params, res) => {
		try {
			if (!(await Model.exists({ id }))) return res.status(404).json({ e: 'not found' })
			const updatedDoc = await Model.findByIdAndUpdate(id, params, { new: true })
			res.json({ matches: updatedDoc })

		} catch (e) {
			res.status(409).json({ e })
		}
	},
    // nests an specific type object inside a field of a object specified by id
	addToSubArray: async (Model, field, id, SecondModel, params, res) => {
		try {
			let pushObj = {}
			pushObj[field] = [new SecondModel(params)]
			console.log(pushObj)
			const updatedDoc = await Model.findByIdAndUpdate(id, {
				$push: pushObj
			}, { new: true })
			res.json({ matches: updatedDoc })
		} catch (e) {
			console.log(e)
			res.status(409).json({ e })
		}
	},
    // removes a nested object
	removeFromSubArray: async (Model, field, id, subId, res) => {
		try {
			console.log({ _id: id, [`${field}._id`]: subId })
			const doc = await Model.findOneAndUpdate({ _id: id, [`${field}._id`]: subId }, {
				$pull: {
					[field]: { "_id": subId } }
			}, { new: true })
			res.json({ matches: doc })
		} catch (e) {
			console.log(e)
			res.status(409).json({ e })
		}
	},
    // updates a nested object
	updateOneFromSubArray: async (Model, field, id, subId, params, res) => {
		try {
			console.log({ _id: id, [`${field}._id`]: subId })
			let obj = {}
			Object.keys(params).forEach(val => {
				obj[`${field}.$.${val}`] = params[val]
			})
			const doc = await Model.findOneAndUpdate({ _id: id, [`${field}._id`]: subId }, { $set: obj }, {
				new: true,
				upsert: true,
				setDefaultsOnInsert: false
			})
			res.json({ matches: doc })
		} catch (e) {
			console.log(e)
			res.status(409).json({ e })
		}
	},
    // nests a object inside of a nested object inside of a collection's object with a specified id (e.g. - cafe[menu].dish[reviews] <--)
	addToSubSubArray: async (Model, field, subField, id, subId, SecondModel, params, res) => {
		try {
			console.log({ _id: id, [`${field}._id`]: subId })
			let pushObj = {}
			pushObj[subField] = [new SecondModel(params)]
			const doc = await Model.findOneAndUpdate({ _id: id, [`${field}._id`]: subId }, {
				$push: {
					[`${field}.$.${subField}`]: new SecondModel(params) }
			}, { new: true })
			console.log(doc)
            // if adding a review => recount all reviews
			if (subField == 'reviews') await countRatings(id, subId, Model)
			res.json({ matches: doc })
		} catch (e) {
			console.log(e)
			res.status(409).json({ e })
		}
	},
	 countReviews: async (Cafe, cafeId, dishId)  => {
		await countRatings(cafeId, dishId, Cafe)
		return true
	 }

}
export default controllerUtils