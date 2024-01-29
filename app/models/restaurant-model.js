const mongoose=require('mongoose')
const {Schema,model}=mongoose

const resSchema=new Schema({
    name:String,
   address:{
        street:String,
        area:String,
        city:String,
        district:String,
        state:String,
        pincode:Number
    },
    description:String,
    gstNo:String,
    licenseNumber:String,
    image:String,
    timings: [{
        dayOfWeek: {
            type: String,
            //enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        
        },
        openingTime: {
            type: String,
        
        },
        closingTime: {
            type: String,
        
        }
    }],
  


    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    status:{
        type:String,
        default:'pending'
    }


},{timestamps:true})
const Restaurant=model('res',resSchema)
module.exports=Restaurant









// const mongoose=require('mongoose')
// const {Schema,model}=mongoose

// const resSchema=new Schema({
//     name:String,
//     address:{
//         street:String,
//         area:String,
//         city:String,
//         state:String,
//         pincode:Number
//     },
//     description:String,
//     gstNo:String,
//     licenseNumber:String,
//     image:String,

//     ownerId: {
//         type: Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     status:{
//         type:String,
//         default:'pending'
//     }


// },{timestamps:true})
// const Restaurant=model('Res',resSchema)
// module.exports=Restaurant