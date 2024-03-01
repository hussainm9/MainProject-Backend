const Table = require('../models/table-model');
const { validationResult } = require('express-validator');
const _ = require('lodash');
const uploadOnCloudinary = require('../utils/cloudinary');
const Restaurant = require('../models/restaurant-model');

const tableCltr = {};

tableCltr.create = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const body = req.body;
        const restaurant_Id = req.params.restaurantId;
        console.log(restaurant_Id);
        const existingRestaurant = await Restaurant.findById(restaurant_Id);

        if (!existingRestaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        body.restaurantId = restaurant_Id;
        console.log(req.files);
        const imageOnResponse = await uploadOnCloudinary(req.files['image'][0].path);
        if (!imageOnResponse) {
            return res.status(500).json({ error: 'Error in uploading image to Cloudinary' });
        }
        body.image = imageOnResponse.url;

        const table = new Table(body);
        await table.save();
        console.log(table);

        res.status(201).json(table);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

tableCltr.getRestaurantTables = async (req, res) => {
    try {
        const restaurant_id = req.params.restaurantId;
        const getTables = await Table.find({ restaurantId: restaurant_id });
        if (getTables.length === 0) {
            return res.status(404).json({ error: 'Tables not found' });
        }
        res.json(getTables);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

tableCltr.getTables = async (req, res) => {
    try {
        let getTables = await Table.find().sort({ price: 1 });
       
        if (getTables.length === 0) {
            return res.status(404).json({ error: 'Tables not found' });
        }

        const restaurants = await Restaurant.find();
        restaurants.forEach(async (restaurant) => {
            const restaurantTables = await Table.find({ restaurantId: restaurant._id });
            getTables = getTables.concat(restaurantTables);
        });

        res.json(getTables);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

tableCltr.getOne = async (req, res) => {
    const tableId = req.params.tableId;
    try {
        const getTable = await Table.findOne({ _id: tableId });
        if (!getTable) {
            return res.status(404).json({ error: 'Table not found' });
        }
        res.json(getTable);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

tableCltr.updateOne = async (req, res) => {
    const restaurantId = req.params.restaurantId;
    const tableId = req.params.tableId;
    const body = _.pick(req.body, ['noOfSeats', 'advanceAmount']);

    try {
        const table = await Table.findOneAndUpdate(
            { restaurantId: restaurantId, _id: tableId },
            { $set: body },
            { new: true }
        );

        if (!table) {
            return res.status(404).json({ error: 'Table not found' });
        }

        res.json(table);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

tableCltr.deleteOne = async (req, res) => {
    const tableId = req.params.tableId;
    const restaurantId = req.params.restaurantId;
    try {
        const table = await Table.findOneAndDelete({ _id: tableId, restaurantId: restaurantId });
        if (!table) {
            return res.status(404).json({ errors: 'Table not found' });
        }
        res.json(table);
    } catch (error) {
        console.error(error);
        res.status(500).json({ errors: 'Internal server error' });
    }
};

module.exports = tableCltr;
