const Payment = require('../models/payment-model');
const User = require('../models/users-model');

const stripe = require("stripe")("sk_test_51Okol7SGpEFD34rofB87qyX2Loqq8l4PQF1MnJXBfEQcP4LkyezSTPZLjrlDkdRUQ0ckNI3W29p3WZtkvVWTGssw00RrY9IVRh");

const paymentCtrl = {};

paymentCtrl.checkout = async (req, res) => {
    const {booking,menus,totalAmount}  = req.body; 
    console.log(booking,'booking8');
    console.log(menus,'booking8');
    console.log(req.user,'id')
    const user=await User.findById({_id:req.user.id})
    console.log(user,'u')

    const menuTotalAmount = menus.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);

    // Calculate the total amount including table amount
    const totalAmountWithTable = menuTotalAmount + totalAmount;

    const lineItems = menus.map(item => ({
        price_data: {
            currency: "inr",
            product_data: {
                name: item.name, // Use item name for product name
            },
            unit_amount:totalAmountWithTable*100, // Convert price to integer amount in cents
        },
        quantity: item.quantity
    }));

    
    


    const customer = await stripe.customers.create({
        name: user.username,
        address: {
            line1: 'India',
            postal_code: '403001',
            city: 'Miramar',
            state: 'GA',
            country: 'US', 
        },
    })

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: "payment",
            success_url: "http://localhost:3000/success", // Replace with your success URL
            cancel_url: "http://localhost:3000/failure", // Replace with your failure URL
            customer : customer.id
            
        });

        const payment = new Payment({
            amount:totalAmount, // Use totalAmount
            paymentType: "online",
            userId: req.user.id,
            // restaurantId: data.restaurantId,
            // bookingId: data.bookingId,
            paymentDate: new Date(),
            transactionId: session.id,
           
        });
        await payment.save();

        res.json({ id: session.id ,url:session.url}); // Send successful response with session id
    } catch (error) {
        console.error("Error during checkout:", error);
        res.status(500).json({ error: "An error occurred during checkout." });
    }
};

paymentCtrl.updatePayment = async (req, res) => {
    const { transactionId } = req.body; // Extract transactionId from the request body
    try {
        const payment = await Payment.findOneAndUpdate({ transactionId: transactionId }, { status: "success" });
        res.status(200).json(payment);
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

paymentCtrl.details = async (req, res) => {
    const { userId, restaurantId } = req.params; // Extract userId and restaurantId from request parameters

    try {
        const payment = await Payment.findOne({ userId: userId, restaurantId: restaurantId, status: "success" });
        if (!payment) {
            return res.status(200).json({});
        }
        res.status(200).json(payment);
    } catch (error) {
        console.error("Error fetching payment details:", error);
        res.status(500).json({ error: "An error occurred while fetching payment details." });
    }
};

module.exports = paymentCtrl;
