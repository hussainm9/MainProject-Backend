const Booking = require('../models/booking-model')
const Table = require('../models/table-model')
const _ = require('lodash')
const schedule = require('node-schedule')
const bookingCltr = {}
const Restaurant = require('../models/restaurant-model')


bookingCltr.create = async (req, res) => {
    const {userId, restaurantId, tableId } = req.params;
    console.log(userId,'idtable')
    console.log(restaurantId,'idtable')
    console.log(tableId,'idtable')
    

    try {
        // Check if the table exists
        const table = await Table.findById(tableId);

        if (!table) {
            return res.status(404).json({ error: 'Table not found' });
        }

        // Check if the table is already booked for the requested time slot
        const { startDateTime, endDateTime } = req.body;
        const existingBooking = await Booking.findOne({
            tableId,
            $or: [
                {
                    $and: [
                        { startDateTime: { $lte: startDateTime } },
                        { endDateTime: { $gte: startDateTime } }
                    ]
                },
                {
                    $and: [
                        { startDateTime: { $lte: endDateTime } },
                        { endDateTime: { $gte: endDateTime } }
                    ]
                }
            ]
        });

        if (existingBooking) {
            return res.status(409).json({
                error: 'Table already booked for this time slot. Choose another time slot.'
            });
        }

        // Extract booking data from request body
        const bookingData = _.pick(req.body, ['noOfPeople', 'menuItems', 'startDateTime', 'endDateTime', 'totalAmount']);

        // Set additional fields
        bookingData.restaurantId = restaurantId;
        bookingData.userId = userId;
        bookingData.tableId = [tableId];

        // Create new Booking instance
        const booking = new Booking(bookingData);

        // Save booking to database
        const savedBooking = await booking.save();

        // Schedule job to update table availability
        const bookingStartDateTime = new Date(savedBooking.startDateTime);
        const bookingEndDateTime = new Date(savedBooking.endDateTime);
        const halfHourBeforeStart = new Date(bookingStartDateTime.getTime() - 0.5 * 60 * 60 * 1000);
        const halfHourAfterEnd = new Date(bookingEndDateTime.getTime() + 0.5 * 60 * 60 * 1000);

        const jobBeforeStart = schedule.scheduleJob(halfHourBeforeStart, async function() {
            try {
                await Table.findByIdAndUpdate(tableId, { isAvailable: false }, { new: true });
                console.log('Table availability set to false');
            } catch (error) {
                console.error('Error updating table availability:', error);
            }
        });

        const jobAfterEnd = schedule.scheduleJob(halfHourAfterEnd, async function() {
            try {
                await Table.findByIdAndUpdate(tableId, { isAvailable: true }, { new: true });
                console.log('Table availability set to true');
            } catch (error) {
                console.error('Error updating table availability:', error);
            }
        });

        console.log('Jobs scheduled successfully');

        // Send response
        res.json(savedBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



bookingCltr.getUserBookings = async (req, res) => {
    const userId = req.params.userId;
    try {
        const userBookings = await Booking.find({ userId: userId });
        
        if (!userBookings || userBookings.length === 0) {
            return res.status(404).json({ error: 'User bookings not found' });
        }

        res.json(userBookings);
    } catch (e) {
        console.error(e, 'error in catch');
        res.status(500).json({ error: 'Internal server error' });
    }
}

bookingCltr.getOne = async (req, res) => {
    const bookingId = req.params.bookingId;
    const userId = req.user.id;
    const userType = req.user.role;
    //console.log(userId,'userId',userType,'userType');

    try {
        const booking = await Booking.findOne({ _id: bookingId });
        if(!booking){
            return res.status(404).json({error:'booking not found'})
            
        }
        //console.log(userId == booking.userId);
        if (userType === 'guest' && userId == booking.userId) {
            return res.json(booking);
        }
        const restaurant = await Restaurant.findOne({ ownerId: userId });
        if(restaurant._id.toString() == booking.restaurantId.toString()){
            return res.json(booking)
        }
    } catch (e) {
        console.error(e, 'error in catch');
        res.status(500).json({ error: 'Internal server error' });
    }
};
bookingCltr.getRestaurantBookings = async(req,res)=>{
    const restaurantId = req.params.restaurantId
    try{
    const restaurantBookings = await Booking.find({restaurantId:restaurantId})
    if(restaurantBookings.length==0){
        return res.stauts(404).json({error:'restaurantBookings are not found'})

    }
    res.json(restaurantBookings)
    }catch(e){
        console.log(e);
        res.status(500).json({error:'internal server error'})
    }



}
bookingCltr.getAll = async (req, res) => {
    try {
        const allBookings = await Booking.find();

        if (allBookings.length === 0) {
            return res.status(404).json({ errors: 'No bookings found' });
        }

        res.json(allBookings);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
};



module.exports = bookingCltr;

// const bookingData = {
    //   startDateTime,
    //   endDateTime,
    //   noOfPeople: req.body.noOfPeople,
    //   tableIds: [tableId], // Store tableId in an array
    //   userId,
    //   restaurantId,
    // };
   // bookingCltr.getOne(
        // console.log(restaurant._id,'restaurantId');
        // console.log(booking.restaurantId,'booking');
        // if(userType == 'restaurantOwner' && restaurant._id == booking.restaurantId){
        //     return res.json(booking)
        // }
        //         console.log(typeof restaurant._id, restaurant._id);
        // console.log(typeof booking.restaurantId, booking.restaurantId);
        
        // console.log(restaurant._id === booking.restaurantId);//why showing false..???
        
        // if (!booking) {
        //     return res.status(404).json({ error: 'Booking not found' });
        //  }else{
        //     res.json(booking)
        // }
        
        // console.log(restaurant.ownerId);
        
        
        // if (userType === 'restaurantOwner' && restaurant._id === booking.restaurantId) {
        //     return res.json(booking);
        // } else {
        //     return res.status(403).json({ error: 'Forbidden' });
        // }
        
     //   )