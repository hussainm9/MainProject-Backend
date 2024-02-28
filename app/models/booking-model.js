const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const bookingSchema = new Schema({
    noOfPeople: Number,
    menuItems: [
        {
            menuId: {
                type: Schema.Types.ObjectId,
                ref: "Menu"
            },
            quantity: Number,
            notes: String
        }
    ],
    status:{
        type:String,
        default:'pending',
        enum:['pending','approved','rejected']

    },
    tableId: {
        type: [Schema.Types.ObjectId],  
        ref: 'Table'
    },
    restaurantId: {
        type: Schema.Types.ObjectId,  
        ref: 'res'
    },
    userId: {
        type: Schema.Types.ObjectId,  
        ref: 'User'
    },
    startDateTime: {
        type: String
    },
    endDateTime: {
        type: String
    },
    totalhours:{
        type:Number
    },
    totalAmount:{
        type:Number
    }
    
},{timestamps:true});

const Booking = model('Booking', bookingSchema);

module.exports = Booking;