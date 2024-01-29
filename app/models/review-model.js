const mongoose=require('mongoose')
const {Schema,model}=mongoose

const reviewSchema=new Schema({
    title:String,
    description:String,
    rating:Number,
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    restaurantId:{
        type:Schema.Types.ObjectId,
        ref:'Restaurant'
    }
})
const Review=model('Review',reviewSchema)
module.exports=Review