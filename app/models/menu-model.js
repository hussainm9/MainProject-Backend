const mongoose = require('mongoose')
const { Schema, model } = mongoose

const menuSchema = new Schema({
    category: Array,
    name: String,
    price: Number,
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant'
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    image: String,
    isVeg: String,
    servingSize: Number


})
const Menu = model('Menu', menuSchema)
module.exports = Menu