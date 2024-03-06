const Order = require('../models/order-model');
const User =require('../models/users-model')
const Booking = require('../models/booking-model');
const Payment = require('../models/payment-model');
const Table = require('../models/table-model');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const _ = require('lodash');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Kolkata');
const schedule = require('node-schedule');

const orderController = {};

orderController.create = async (req, res) => {
    const user = await User.findById(req.user.id);
    const userEmail = user.email;

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;

        const latestBooking = await Booking.findOne({ userId }).sort({ createdAt: -1 }).limit(1);
        if (!latestBooking) {
            return res.status(400).json({ error: 'No booking found for the user' });
        }

        const payment = await Payment.findOne({ bookingId: latestBooking._id });
        if (!payment) {
            return res.status(400).json({ error: 'No payment found for the latest booking' });
        }

        const { tableId, restaurantId, createdAt, _id } = latestBooking;

        const orderDate = createdAt.toISOString().substr(0, 10);

        const order = new Order({
            tableId,
            restaurantId,
            userId: payment.userId,
            bookingId: _id,
            orderDate,
            amount: payment.amount,
            paymentType: payment.paymentType,
            transactionId: payment.transactionId
        });

        // Populate the necessary fields
        

        await order.save();
        console.log(order, 'order');

        // Send confirmation email
        sendConfirmationEmail(order, userEmail);

        

        res.status(201).json(order); // Return the newly created order
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'An error occurred while creating order' });
    }
};



// orderController.getOrder = async (order, res) => {
//     try {
//         const populatedOrder = await order.populate('restaurantId', 'name')
//             .populate({
//                 path: 'bookingId',
//                 select: 'startDateTime endDateTime',
//                 model: 'Booking'
//             })
//             .populate({
//                 path: 'tableId',
//                 select: 'tableNumber',
//                 model: 'Table'
//             }).execPopulate();

//         if (!populatedOrder) {
//             return res.status(404).json({ error: 'Order not found' });
//         }

//         console.log('Order:', populatedOrder);
//         res.status(200).json(populatedOrder);
//     } catch (error) {
//         console.error('Error fetching order:', error);
//         res.status(500).json({ error: 'An error occurred while fetching order' });
//     }
// };






orderController.getOrders = async (req, res) => {
    const userId = req.params.userId;
    try {
        const order = await Order.find({ userId: userId }).populate('restaurantId', 'name').populate({
            path: 'bookingId',
            select: 'startDateTime endDateTime',
            model: 'Booking'
        }).populate({path:'tableId',select:'tableNumber',model:'Table'})

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'An error occurred while fetching order' });
    }
};

const sendConfirmationEmail = async (order,email) => {
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to:email,
        subject: "ORDER CONFIRMATION",
        text: `Your order with has been confirmed.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending confirmation email:', error);
        } else {
            console.log('Confirmation email sent successfully');
        }
    });
};

const updateTableAvailability = async (bookingId) => {
    try {
        const booking = await Booking.findById(bookingId);
        if (booking && !booking.status) {
            const tableId = booking.tableId;
            await Table.findByIdAndUpdate(tableId, { isAvailable: true }, { new: true });
        }
    } catch (error) {
        console.error('Error updating table availability:', error);
    }
    return false;
};

const cronJob = schedule.scheduleJob('*/5 * * * *', async function () {
    try {
        const bookings = await Booking.find({ status: false });
        for (const booking of bookings) {
            updateTableAvailability(booking._id);
        }
    } catch (error) {
        console.error('Error checking booking status:', error);
    }
});

orderController.cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const bookingId = order.bookingId;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const startDateTimeIST = moment.tz(booking.startDateTime, 'Asia/Kolkata');
        const currentTimeIST = moment().tz('Asia/Kolkata');

        const halfHourBeforeStartIST = startDateTimeIST.clone().subtract(30, 'minutes');

        if (
            currentTimeIST.isSameOrBefore(startDateTimeIST) &&
            currentTimeIST.isBefore(halfHourBeforeStartIST)
        ) {
            const endDateTime = moment.tz(booking.endDateTime, 'Asia/Kolkata');
            const jobEndTime = new Date(endDateTime);
            const jobEnd = schedule.scheduleJob(jobEndTime, async function () {
                try {
                    await updateTableAvailability(bookingId);
                } catch (error) {
                    console.error('Error updating table availability:', error);
                }
            });

            order.status = 'Cancelled';
            await order.save();

            booking.status = false;
            await booking.save();

            res.status(200).json({ message: 'Order canceled successfully' });
        } else {
            return res.status(400).json({ error: 'Order cannot be canceled at this time' });
        }
    } catch (error) {
        console.error('Error canceling order:', error);
        res.status(500).json({ error: 'An error occurred while canceling order' });
    }
};

module.exports = orderController;

