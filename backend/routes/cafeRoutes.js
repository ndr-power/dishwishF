import express from 'express'
import cafeController from '../controllers/cafeController.js'
const router = express.Router()
// get cafes
router.get('/', cafeController.getCafes) 
// add cafe
router.post('/', cafeController.addCafe) 
router.post('/recommend', cafeController.recommend)
// get one cafe info
router.get('/:id', cafeController.getCafe) 
// update cafe info
router.patch('/:id', cafeController.updateCafe)  
// add to cafe's menu
router.post('/:id/menu', cafeController.addToMenu) 
// remove from cafe's menu
router.delete('/:id/:dishid', cafeController.removeFromMenu) 
// update a dish from cafe's menu
router.patch('/:id/:dishid', cafeController.updateDishFromMenu) 
// add a review to a dish from cafe
router.post('/:id/:dishid/r', cafeController.addReviewToDish) 
// confirmation of sentiment analysis
router.post('/:id/:dishid/:reviewid/confirmSentiment', cafeController.confirmSentiment)
export default router