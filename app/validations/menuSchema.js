const Restaurant=require('../models/restaurant-model')
const menuValidationSchema=({
    category:{
        notEmpty:{
            errorMessage:'category is required'
        },
        custom:{
            options:async (value)=>{
                const cate=await Restaurant.findOne({cate:value})
                if(!cate){
                    return true
                    
                }else{
                    res.status(400).json({error:'category is already taken'})
                }


            }

            
        }
    },
    name:{
        notEmpty:{
            errorMessage:'name is required'
        },
        custom:{
            options:async (value)=>{
                const name=await Restaurant.findOne({name:value})
                if(!name){
                    return true
                    
                }else{
                    res.status(400).json({error:'category is already taken'})
                }


            }

            
        }
    },
    price:{
        notEmpty:{
            errorMessage:'price is required'
        },
        isNumeric:{
            errorMessage:'should be a number'
        }
    },
    
    isVeg:{
        notEmpty:{
            errorMessage:'this field is required'
        }
    },
    servingSize:{
        notEmpty:{
            errorMessage:'this field is required'
        },
        isNumeric:{
            errorMessage:'should be a number'
        }
    },
    

})
module.exports={
    menuValidation:menuValidationSchema
}