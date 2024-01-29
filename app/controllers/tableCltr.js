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
        const exsistingRestaurant = await Restaurant.findById(restaurant_Id)
        if(!exsistingRestaurant){
           return res.status(404).json({error:'restaurant not foung'})
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
tableCltr.getRestaurantTables = async(req,res)=>{
    try{
        const restaurant_id = req.params.restaurantId
        const getTables = await Table.find({restaurantId:restaurant_id})
        if(getTables.length===0){
            return res.status(404).json({error:'tables not found'})
        }
        res.json(getTables)

    }catch(error){
        res.status(500).json({error:'internal server error'})
    }

}
tableCltr.getTables = async(req,res)=>{
    try{
       
        const getTables = await Table.find()
        if(getTables.length===0){
            return res.status(404).json({error:'tables not found'})
        }
        res.json(getTables)

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
