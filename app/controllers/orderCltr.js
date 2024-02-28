const Order =require('../models/order-model')
const {validationResult}=require('express-validator')
const _=require('lodash')
const orderCltr={}


orderCltr.order=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const body=_.pick(req.body,(['orderDate','amount','status']))
    const order=new Order(body)
    try{
        order.userId=req.user.id
        order.tableId=req.params.tableId
        order.restaurantId=req.params.restaurantId
        order.menuId=req.params.menuId
        await order.save()
        res.status(201).json(order)
    }
    catch(e){
        res.status(500).json(e.message)
    }

}
orderCltr.delete=async(req,res)=>{
    const userId=req.user.id
    const orderId=req.params.orderId
    try{
        const user=await Order.findOne({userId:userId})
        if(!user){
            return res.status(400).json({error:'you dont have orders'})
        }
        const deleteOrder=await Order.findOneAndDelete({_id:orderId})
        res.status(200).json(deleteOrder)
        

    }
    catch(e){
        res.status(500).json(e)
    }
}
module.exports=orderCltr