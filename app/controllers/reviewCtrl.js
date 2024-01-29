const Review=require('../models/review-model')
const _=require('lodash')
const {validationResult}=require('express-validator')
const reviewCltr={}
  
reviewCltr.create=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(404).json({errors:errors.array()})
    }
    const body=_.pick(req.body,(['title','description','rating']))
    const review=new Review(body)
    console.log(review)
    try{
        review.userId=req.user.id
        review.restaurantId=req.params.restaurantId
        await review.save()
        console.log(review)
        res.status(201).json(review)


    }
    catch(e){
        res.status(500).json(e)
    }

}
reviewCltr.update=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json(errors)
    }
    const body=_.pick(req.body,(['title','description']))
    
    
    const restaurantId=req.params.restaurantId
    const reviewId=req.params.reviewId

    const review=await Review.findOne({_id:reviewId})
    if(!review){
        return res.status(400).json({error:'Review not found'})

    }
    try{
        const updatedReview=await Review.findOneAndUpdate({_id:reviewId},body,{new:true})
        console.log(updatedReview)
       
        res.status(200).json(updatedReview)
    }
    catch(e){
        res.status(500).json(e)
    }
    

}
reviewCltr.getAll=async(req,res)=>{
    const restaruntId=req.params.restaurantId
    console.log(restaruntId)
    try{
        const allReviews=await Review.find({restaurantId:restaruntId})
        console.log(allReviews)
        if(allReviews.length==0){
            return res.status(400).json({error:'reviews not found'})
        }
        
        res.status(200).json(allReviews)
    }
    catch(e){
        res.status(500).json(e)
    }

}



module.exports=reviewCltr