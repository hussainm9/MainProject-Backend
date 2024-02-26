const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const tableSchema = new Schema({
    tableNumber: Number,
    noOfSeats: Number,
    image: String,
    isAvaliable: {
        type: Boolean
    }, 
    advanceAmount: Number, 
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        
    }
});

const Table = model('Table', tableSchema);
module.exports = Table;
