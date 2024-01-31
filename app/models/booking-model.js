const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const bookingSchema = new Schema({
    tableId: {
        type: [Schema.Types.ObjectId],  
        ref: 'Table'
    },
    restaurantId: {
        type: Schema.Types.ObjectId,  
        ref: 'Res'
    },
    userId: {
        type: Schema.Types.ObjectId,  
        ref: 'User'
    },
    startDateTime: {
        type: Date
    },
    endDateTime: {
        type: Date
    },
    noOfPeople: Number
},{timestamps:true});

const Booking = model('Booking', bookingSchema);

module.exports = Booking;
