const Payment = require('../models/payment-model');
const orderController=require('../controllers/orderCltr')
const User = require('../models/users-model');
const Booking=require('../models/booking-model')
const nodemailer = require('nodemailer')
const stripe = require("stripe")("sk_test_51Okol7SGpEFD34rofB87qyX2Loqq8l4PQF1MnJXBfEQcP4LkyezSTPZLjrlDkdRUQ0ckNI3W29p3WZtkvVWTGssw00RrY9IVRh");

const paymentCtrl = {};

paymentCtrl.checkout = async (req, res) => {
    const { booking } = req.body; 
    console.log(booking,'working')
   
    
    console.log(req.user, 'id');
    const user = await User.findById(req.user.id);
    console.log(user, 'user');

    const customer = await stripe.customers.create({
        name: user.username,
        address: {
            line1: 'India',
            postal_code: '403001',
            city: 'Miramar',
            state: 'GA',
            country: 'US', 
        },
    });

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: "Total Amount",
                    },
                    unit_amount: booking.totalAmount * 100,
                },
                quantity: 1,
            }],
            mode: "payment",
            success_url: "http://localhost:3000/my-orders",
            cancel_url: "http://localhost:3000/failure",
            customer: customer.id,
        });

        const payment = new Payment({
            amount: booking.totalAmount,
            paymentType: "online",
            userId: req.user.id,
            paymentDate: new Date(),
            bookingId:booking._id,
            restaurantId:booking.restaurantId,
            transactionId: session.id,
        });
        await payment.save();

        res.json({ id: session.id ,url: session.url });
    } catch (error) {
        console.error("Error during checkout:", error);
        res.status(500).json({ error: "An error occurred during checkout." });
    }
}

paymentCtrl.updatePayment = async (req, res) => {
    const { transactionId } = req.body; // Extract transactionId from the request body
    console.log(transactionId, 'id8')
    try {
        const payment = await Payment.findOneAndUpdate({ transactionId: transactionId }, { status: "successfull" }, { new: true });

        if (payment && payment.status === 'successfull') {
            console.log("2")
            const booking = await Booking.findOneAndUpdate({ _id: payment.bookingId }, { status: true }, { new: true })
            console.log(booking._id, "id")

            console.log(req.user, 'p')
            const user = await User.findById(req.user.id)
            console.log(user, 'userp')
            
            await orderController.create(req,res)
        } else {
            if (!payment) return res.status(404).json("Cannot find the Payment Info")
        }

    } catch (error) {
        console.error("Error updating payment status:", error);
        res.status(500).json({ error: "An error occurred while updating payment status." });
    }
};


paymentCtrl.deletePayment = async (req, res) => {
    const { id } = req.params; // Extract id from request parameters
    try {
        const payment = await Payment.findOneAndDelete({ transactionId: id });
        res.status(200).json(payment);
    } catch (error) {
        console.error("Error deleting payment:", error);
        res.status(500).json({ error: "An error occurred while deleting payment." });
    }
};



module.exports = paymentCtrl;
