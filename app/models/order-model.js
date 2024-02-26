const mongoose=require('mongoose')
const {Schema,model}=mongoose


const orderSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    tableId:{
        type:Schema.Types.ObjectId,
        ref:"Table"
    },
    restaurantId:{
        type:Schema.Types.ObjectId,
        ref:"Restaurant"
    },
    orderDate:{
        type:Date,
        default:Date.now
    },
    amount:Number,
    pamentId:String,
    status:{
        type:String,
        enum:['pending','success']
    },
    
    
        
    

})
const Order=model("Order",orderSchema)
module.exports=Order