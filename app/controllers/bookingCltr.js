const Booking = require('../models/booking-model')
const Table = require('../models/table-model')
const _ = require('lodash')
const schedule = require('node-schedule')
const bookingCltr = {}
const Restaurant = require('../models/restaurant-model')
const nodemailer = require('nodemailer')


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
        const bookingData = _.pick(req.body, ['noOfPeople', 'menuItems', 'startDateTime', 'endDateTime', 'totalAmount','orderDate']);

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
        const restaurantBookings = await Booking.find({ restaurantId: restaurantId,status:'pending' }).populate(['userId', 'tableId','restaurantId']);
    if(restaurantBookings.length==0){
        return res.status(404).json({error:'restaurantBookings are not found'})

    }
    res.json(restaurantBookings)
    }catch(e){
        console.log(e);
        res.status(500).json({error:'internal server error'})
    }

}
bookingCltr.approved = async (req, res) => {
    try {
        const restaurantId = req.params.restaurantId
        const approved = await Booking.find({ status: 'approved', restaurantId: restaurantId }).populate(['userId', 'tableId', 'restaurantId']);
        if (approved.length === 0) {
            return res.status(404).json({ error: 'restaurants not found' });
        }
        res.json(approved);
    } catch (e) {
        console.log(e);
        res.status(500).json({ errors: 'internal server error' });
    }
};
bookingCltr.rejected = async (req, res) => {
    try {
        const restaurantId = req.params.restaurantId
        const rejected = await Booking.find({ status: 'rejected', restaurantId: restaurantId }).populate(['userId', 'tableId', 'restaurantId']);
        if (rejected.length === 0) {
            return res.status(404).json({ error: 'bookings not found' });
        }
        res.json(rejected);
    } catch (e) {
        console.log(e);
        res.status(500).json({ errors: 'internal server error' });
    }
};
bookingCltr.updateRestaurant =  async(req,res)=>{
    const bookingId = req.params.bookingId
    console.log(bookingId);
    const {newStatus} = req.body
    console.log(newStatus);
    try{
        const updateBooking = await Booking.findOneAndUpdate(
            {_id:bookingId},
            {status:newStatus},
            {new:true}).populate(['restaurantId','tableId','userId'])
            if (!updateBooking) {
                return res.status(404).json({ error: 'Booking not found' });
            }
            if(updateBooking.status == 'approved'){

                // Create a transporter with SMTP options
                const latitude = updateBooking.restaurantId.geo.lat
                const longitude = updateBooking.restaurantId.geo.lon
const transporter = nodemailer.createTransport({
service: 'gmail',
auth: {
user: process.env.GMAIL_USER,
pass: process.env.GMAIL_PASSWORD,
// Use an "App Password" generated in your Gmail account settings
},
});

// Define email options
const mailOptions = {
    from: process.env.GMAIL_USER,
    to: `mehamoodm9@gmail.com`, // Change to user.email if you want to send it to the user's email
    subject: 'Booking - Confirmed',
    text: `Dear Customer,

We're pleased to inform you that your booking request has been confirmed. Below are the details of your booking:

Restaurant Name: ${updateBooking.restaurantId.name}
Table Number: ${updateBooking.tableId[0].tableNumber}
Start Time: ${new Date(updateBooking.startDateTime).toLocaleString()}
End Time: ${new Date(updateBooking.endDateTime).toLocaleString()}
Location:  https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}

If you have any questions or need further assistance, please feel free to contact us.

We look forward to serving you!

Best regards,
Your Booking Service Team`,
};


// Send email
transporter.sendMail(mailOptions, (error, info) => {
if (error) {
console.error(error);
return res.status(500).json({ error: 'Error sending email' });
} else {
console.log('Email sent successfully');
return res.status(200).json({ status: 'Email sent successfully' });
}
});
            }
            if (updateBooking.status === 'rejected') {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.GMAIL_USER,
                        pass: process.env.GMAIL_PASSWORD,
                    },
                });
            
                // Define email options
                const mailOptions = {
                    from: process.env.GMAIL_USER,
                    to: `mehamoodm9@gmail.com`, // Change to user.email if you want to send it to the user's email
                    subject: 'Booking - Rejected',
                    text: `Dear Customer,
            
            We regret to inform you that your booking request has been rejected due to the following reason:
            
            Rejected Reason: The requested table is unavailable at the specified time.
            
            If you have any questions or would like to inquire about alternative booking options, please don't hesitate to contact us.
            
            We apologize for any inconvenience this may have caused and appreciate your understanding.
            
            Best regards,
            Your Booking Service Team`,
                };
            
                // Send email
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error(error);
                        return res.status(500).json({ error: 'Error sending email' });
                    } else {
                        console.log('Email sent successfully');
                        return res.status(200).json({ status: 'Email sent successfully' });
                    }
                });
            }
            
            
    }catch(e){
        console.log(e,'err in handling booking');
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



// const Booking = require('../models/booking-model')
// const Table = require('../models/table-model')
// const _ = require('lodash')
// const schedule = require('node-schedule')
// const bookingCltr = {}
// const Restaurant = require('../models/restaurant-model')


// bookingCltr.create = async (req, res) => {
//   const { userId, restaurantId } = req.params;
//   const { tableId } = req.params; // Assuming tableId is passed in the URL parameters

//   console.log('userId', userId, 'restaurantId', restaurantId, 'tableId', tableId);

//   try {
//     // Check if the table exists
//     const table = await Table.findById(tableId);

//     if (!table) {
//       return res.status(404).json({ error: 'Table not found' });
//     }

//     if (table.isAvaliable == false) {
//       return res.status(409).json({
//         error: 'Table already booked. Choose another table or time slot.'
//       });
//     }

//     // Calculate endDateTime (startDateTime + 2 hours)
//    // const startDateTime = new Date(req.body.startDateTime);
//     //const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours
//     // Update table availability to false


//     const bookingData = _.pick(req.body,['noOfPeople'])
//     bookingData.restaurantId = restaurantId
//     bookingData.userId = userId
//     bookingData.tableId = [tableId]
    
//     const booking = new Booking(bookingData);
//     const savedBooking = await booking.save();
//     await Table.findByIdAndUpdate(tableId, { isAvaliable: false }, { new: true });

//    // await Table.findByIdAndUpdate(tableId,{isAvaliable:false},{new:body})
//     // Calculate endDateTime (startDateTime + 2 hours)
// const startDateTime = new Date(savedBooking.createdAt);
// const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours

// // Update endDateTime in the saved booking
// savedBooking.startDateTime = startDateTime.toISOString();
// savedBooking.endDateTime = endDateTime.toISOString();


//     // Mark the booked table as unavailable
  
//     try {
//         // Schedule a job to make the table available after 2 hours
//         const job = schedule.scheduleJob(new Date(Date.now() + 20000), async function() {
//             try {
//                  await Table.findByIdAndUpdate(tableId, { isAvaliable: true },{new:true});
//                 // console.log('Table will be available after 2 hours');
//                 console.log('successful');
//             } catch (error) {
//                 console.error('Error updating table availability:', error);
//             }
//         });
//         console.log('Job scheduled successfully'); // Add this line to check if job scheduling is successful
//     } catch (error) {
//         console.error('Error scheduling job:', error);
//     }
    

//     res.json(savedBooking);
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };
// bookingCltr.getUserBookings = async (req, res) => {
//     const userId = req.params.userId;
//     try {
//         const userBookings = await Booking.find({ userId: userId });
        
//         if (!userBookings || userBookings.length === 0) {
//             return res.status(404).json({ error: 'User bookings not found' });
//         }

//         res.json(userBookings);
//     } catch (e) {
//         console.error(e, 'error in catch');
//         res.status(500).json({ error: 'Internal server error' });
//     }
// }

// bookingCltr.getOne = async (req, res) => {
//     const bookingId = req.params.bookingId;
//     const userId = req.user.id;
//     const userType = req.user.role;
//     //console.log(userId,'userId',userType,'userType');

//     try {
//         const booking = await Booking.findOne({ _id: bookingId });
//         if(!booking){
//             return res.status(404).json({error:'booking not found'})
            
//         }
//         //console.log(userId == booking.userId);
//         if (userType === 'guest' && userId == booking.userId) {
//             return res.json(booking);
//         }
//         const restaurant = await Restaurant.findOne({ ownerId: userId });
//         if(restaurant._id.toString() == booking.restaurantId.toString()){
//             return res.json(booking)
//         }
//     } catch (e) {
//         console.error(e, 'error in catch');
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };
// bookingCltr.getRestaurantBookings = async(req,res)=>{
//     const restaurantId = req.params.restaurantId
//     try{
//     const restaurantBookings = await Booking.find({restaurantId:restaurantId})
//     if(restaurantBookings.length==0){
//         return res.stauts(404).json({error:'restaurantBookings are not found'})

//     }
//     res.json(restaurantBookings)
//     }catch(e){
//         console.log(e);
//         res.status(500).json({error:'internal server error'})
//     }



// }
// bookingCltr.getAll = async (req, res) => {
//     try {
//         const allBookings = await Booking.find();

//         if (allBookings.length === 0) {
//             return res.status(404).json({ errors: 'No bookings found' });
//         }

//         res.json(allBookings);
//     } catch (e) {
//         console.error(e);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };



// module.exports = bookingCltr;

// // const bookingData = {
//     //   startDateTime,
//     //   endDateTime,
//     //   noOfPeople: req.body.noOfPeople,
//     //   tableIds: [tableId], // Store tableId in an array
//     //   userId,
//     //   restaurantId,
//     // };
//    // bookingCltr.getOne(
//         // console.log(restaurant._id,'restaurantId');
//         // console.log(booking.restaurantId,'booking');
//         // if(userType == 'restaurantOwner' && restaurant._id == booking.restaurantId){
//         //     return res.json(booking)
//         // }
//         //         console.log(typeof restaurant._id, restaurant._id);
//         // console.log(typeof booking.restaurantId, booking.restaurantId);
        
//         // console.log(restaurant._id === booking.restaurantId);//why showing false..???
        
//         // if (!booking) {
//         //     return res.status(404).json({ error: 'Booking not found' });
//         //  }else{
//         //     res.json(booking)
//         // }
        
//         // console.log(restaurant.ownerId);
        
        
//         // if (userType === 'restaurantOwner' && restaurant._id === booking.restaurantId) {
//         //     return res.json(booking);
//         // } else {
//         //     return res.status(403).json({ error: 'Forbidden' });
//         // }
        
//      //   )