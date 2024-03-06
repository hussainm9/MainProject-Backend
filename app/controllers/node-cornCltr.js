const cron = require("node-cron");
const Booking = require('../models/booking-model');

// Define the cron job to run every five minutes
cron.schedule("*/5 * * * *", async () => {
    try {
        // Find all bookings where status is false
        const bookingsToCancel = await Booking.find({ status: false });
        console.log(bookingsToCancel.at,'cancledata')

        // Delete each booking
        for (const booking of bookingsToCancel) {
            await Booking.findByIdAndDelete(booking._id);
        }

        console.log("Cancelled bookings:", bookingsToCancel.length);
    } catch (error) {
        console.error("Error cancelling bookings:", error);
    }
});
