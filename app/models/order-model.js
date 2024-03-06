const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const orderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    tableId: {
        type: Schema.Types.ObjectId,
        ref: "Table"
    },
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: "res"
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    bookingId:{
        type:Schema.Types.ObjectId,
        ref:'Booking'
    },
    amount: Number,
    transactionId:String,// Changed to 'paymentId' for consistency
    status: {
        type: String,
        default :'Confirm',
        enum: ['Confirm', 'Cancelled']
    }
});

const Order = model("Order", orderSchema);

module.exports = Order;
