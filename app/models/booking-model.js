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
    tableId: {
        type: Schema.Types.ObjectId,  
        ref: 'Table' // Corrected reference name
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
    },
    status:{
        type:Boolean,
        default:false
    }
    
    
},{timestamps:true});

const Booking = model('Booking', bookingSchema);

module.exports = Booking;