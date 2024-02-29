const Table = require('../models/table-model');
const { validationResult } = require('express-validator');
const _ = require('lodash');
const Restaurant = require('../models/restaurant-model')

const tableCltr = {};

tableCltr.create = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

       // const body = _.pick(req.body,['tableNumber','noOfSeats','isAvaliable','advanceAmount','image'])
        const body  = req.body
        const restaurant_Id = req.params.restaurantId
        console.log(restaurant_Id)
        const exsistingRestaurant = await Restaurant.findById(restaurant_Id)
        if(!exsistingRestaurant){
           return res.status(404).json({error:'restaurant not found'})
        }
        body.restaurantId = restaurant_Id
        console.log(req.files);
        body.image=req.files['image'][0].filename


        //body.isAvalible = true
        console.log(body);

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
        let sortBy = req.query.sortBy || 'asc'; // Default sorting order is ascending
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10; // Default page size is 10

        // Calculate skip value for pagination
        const skip = (page - 1) * pageSize;

        let query = Table.find({ restaurantId: restaurant_id });

        // Validate sortBy parameter
        if (sortBy !== 'asc' && sortBy !== 'desc') {
            return res.status(400).json({ error: 'Invalid sortBy parameter. Use "asc" or "desc"' });
        }

        // Apply sorting based on the sortBy parameter
        if (sortBy === 'asc') {
            query = query.sort({ advanceAmount: 1 }); // Sort by price in ascending order
        } else {
            query = query.sort({ advanceAmount: -1 }); // Sort by price in descending order
        }

        // Apply pagination
        const getTables = await query.skip(skip).limit(pageSize);

        if (getTables.length === 0) {
            return res.status(404).json({ error: 'Tables not found' });
        }

        res.json(getTables);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




tableCltr.getTables = async (req, res) => {
    try {
        let getTables = await Table.find(); 
        if (getTables.length === 0) {
            return res.status(404).json({ error: 'tables not found' });
        }

        const restaurants = await Restaurant.find();
        restaurants.forEach(async (restaurant) => {
            const restaurantTables = await Table.find({ restaurantId: restaurant._id });
            getTables = getTables.concat(restaurantTables);
        });

        res.json(getTables);

    } catch (error) {
        res.status(500).json({ error: 'internal server error' });
    }
}
tableCltr.getOne = async(req,res)=>{
    const tableId = req.params.tableId
    try{
        const getTable = await Table.findOne({_id:tableId})
        if(getTable.length===0){
            return res.status(404).json({error:'table not found'})
        }
        res.json(getTable)

        
    }catch(error){
        res.status(500).json({error:'internal server error'})
    }

}
tableCltr.updateOne = async (req, res) => {
    const restaurantId = req.params.restaurantId;
    const tableId = req.params.tableId;

    // Pick only 'noOfSeats' and 'advanceAmount' from the request body
    const body = _.pick(req.body, ['noOfSeats', 'advanceAmount']);

    try {
        // Retrieve and update the table, excluding the 'tableNumber'
        const table = await Table.findOneAndUpdate(
            { restaurantId: restaurantId, _id: tableId },
            { $set: body }, // Use $set to update only specified fields
            { new: true }
        );

        if (!table) {
            return res.status(404).json({ error: 'Table not found' });
        }

        res.json(table);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
tableCltr.deleteOne = async(req,res)=>{
    const tableId = req.params.tableId
    const restaurantId = req.params.restaurantId
    try{
        const table = await Table.findOneAndDelete({_id:tableId,restaurantId:restaurantId})
        if(!table){
           return res.status(404).json({errors:'table not found'})
        }
        res.json(table)

    }catch(e){
        console.log(e);
        res.status(500).json({errors:'internal server error'})
    }

}


module.exports = tableCltr;
