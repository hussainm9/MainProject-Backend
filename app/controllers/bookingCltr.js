const Booking = require('../models/booking-model')
const Table = require('../models/table-model')
const _ = require('lodash')
const schedule = require('node-schedule')
const bookingCltr = {}
const Restaurant = require('../models/restaurant-model')


bookingCltr.create = async (req, res) => {
  const { userId, restaurantId } = req.params;
  const { tableId } = req.params; // Assuming tableId is passed in the URL parameters

  console.log('userId', userId, 'restaurantId', restaurantId, 'tableId', tableId);

  try {
    // Check if the table exists
    const table = await Table.findById(tableId);

    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    if (table.isAvaliable == false) {
      return res.status(409).json({
        error: 'Table already booked. Choose another table or time slot.'
      });
    }

    // Calculate endDateTime (startDateTime + 2 hours)
   // const startDateTime = new Date(req.body.startDateTime);
    //const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours
    // Update table availability to false


    const bookingData = _.pick(req.body,['noOfPeople'])
    bookingData.restaurantId = restaurantId
    bookingData.userId = userId
    bookingData.tableId = [tableId]
    
    const booking = new Booking(bookingData);
    const savedBooking = await booking.save();
    await Table.findByIdAndUpdate(tableId, { isAvaliable: false }, { new: true });

   // await Table.findByIdAndUpdate(tableId,{isAvaliable:false},{new:body})
    // Calculate endDateTime (startDateTime + 2 hours)
const startDateTime = new Date(savedBooking.createdAt);
const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours

// Update endDateTime in the saved booking
savedBooking.startDateTime = startDateTime.toISOString();
savedBooking.endDateTime = endDateTime.toISOString();


    // Mark the booked table as unavailable
  
    try {
        // Schedule a job to make the table available after 2 hours
        const job = schedule.scheduleJob(new Date(Date.now() + 20000), async function() {
            try {
                 await Table.findByIdAndUpdate(tableId, { isAvaliable: true },{new:true});
                // console.log('Table will be available after 2 hours');
                console.log('successful');
            } catch (error) {
                console.error('Error updating table availability:', error);
            }
        });
        console.log('Job scheduled successfully'); // Add this line to check if job scheduling is successful
    } catch (error) {
        console.error('Error scheduling job:', error);
    }
    

    res.json(savedBooking);
  } catch (e) {
    console.log(e);
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