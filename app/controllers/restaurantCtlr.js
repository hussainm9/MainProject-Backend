const _ = require('lodash');
const { validationResult } = require('express-validator');
const Restaurant = require('../models/restaurant-model');
const User = require('../models/users-model');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer')

const restaurantCtlr = {};

restaurantCtlr.register = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }

    try {
        //const body = _.pick(req.body, ['name', 'address', 'description', 'gstNo', 'licenseNumber']);
        const restaurant = new Restaurant(req.body);
        restaurant.ownerId = req.user.id;
        restaurant.restaurantEmail = req.user.email;
        //restaurant.image1 = req.files['image'][0].filename;
        //restaurant.image2 = req.files['image'][1].filename
        //restaurant.image = req.files['image'].map(file => file.filename);
        const imageFilenames = req.files['image'].map(file => file.filename);
        restaurant.image = imageFilenames.join(', '); 

        restaurant.licenseNumber = req.files['licenseNumber'][0].filename;

        await restaurant.save();
        const restaurantData=restaurant.populate({path:"ownerId",select:"_id username email"})

        res.status(201).json(restaurantData);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

restaurantCtlr.getAll=async(req,res)=>{
    try{
        const getAll=await Restaurant.find()
        res.status(200).json(getAll)

    }catch(e){
        res.status(500).json(e)
    }
}

restaurantCtlr.updateRestaurant = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, address, description } = req.body;
    const Id = req.params.id;

    try {
        const data = await Restaurant.findOneAndUpdate(
            { _id: Id },
            { $set: { name,address,description } },
            { new: true }
        );

        if (!data) {
            return res.status(404).json({ error: 'Record not found' });
        }

        res.status(200).json(data);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

restaurantCtlr.updatePassword = async (req, res) => {
    const body = _.pick(req.body, ['oldPassword', 'newPassword']);
    const restaurantId = req.params.restaurantId;

    const restaurant = await Restaurant.findOne({ _id: restaurantId });

    if (!restaurant) {
        return res.status(404).json({ errors: 'Restaurant not found' });
    }

    const ownerId = restaurant.ownerId;
    const user = await User.findOne({ _id: ownerId });

    if (!user) {
        return res.status(404).json({ errors: 'User not found' });
    }

    try {
        const compare = await bcrypt.compare(body.oldPassword, user.password);

        if (!compare) {
            return res.status(400).json({ errors: 'Wrong password' });
        }

        const salt = await bcrypt.genSalt();
        const encryptedPassword = await bcrypt.hash(body.newPassword, salt);

        const updatedUser = await User.findOneAndUpdate(
            { _id: user._id },
            { $set: { password: encryptedPassword } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(500).json({ errors: 'Failed to update user password' });
        }

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ errors: 'Internal Server Error' });
    }
};

restaurantCtlr.newlyRegistered = async (req, res) => {
    try {
        const newlyRegistered = await Restaurant.find({ status: 'pending' });
        if (newlyRegistered.length === 0) {
            return res.status(404).json({ error: 'restaurants not found' });
        }
        res.json(newlyRegistered);
    } catch (e) {
        console.log(e);
        res.status(500).json({ errors: 'internal server error' });
    }
};
restaurantCtlr.approved = async (req, res) => {
    try {
        const approved = await Restaurant.find({ status: 'approved' });
        if (approved.length === 0) {
            return res.status(404).json({ error: 'restaurants not found' });
        }
        res.json(approved);
    } catch (e) {
        console.log(e);
        res.status(500).json({ errors: 'internal server error' });
    }
};
restaurantCtlr.rejected = async (req, res) => {
    try {
        const rejected = await Restaurant.find({ status: 'rejected' });
        if (rejected.length === 0) {
            return res.status(404).json({ error: 'restaurants not found' });
        }
        res.json(rejected);
    } catch (e) {
        console.log(e);
        res.status(500).json({ errors: 'internal server error' });
    }
}

restaurantCtlr.approvedRestaurant = async (req, res) => {
    const restaurantId = req.params.restaurantId;
    const { newStatus } = req.body;
    try {
        const approved = await Restaurant.findByIdAndUpdate(
            restaurantId,
            { status: newStatus },
            { new: true }
        );
        if (!approved) {
            return res.status(404).json({ error: 'restaurants not updated' });
        }
        if(approved.status == 'approved'){

            console.log(approved,'successfully approved');
           return res.json(approved);
        }
        if(approved.status == 'rejected'){

            
            const rejectedReason = {
                gstNo:`please provide valid gst number-${approved.gstNo}`,
                licenseNumber:`please provide valid license number`
            }
            const restaurant = await Restaurant.findOne({_id:approved._id})
            //console.log(restaurant);
            const user = await User.findOne({_id:restaurant.ownerId})
            //console.log(user);
                  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASSWORD,
          
        },
      });
  
      
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: user.email, 
        subject: 'Resofy - Restaurant Rejected',
        text:`Rejected Reasons:
        GST Number: ${rejectedReason.gstNo}
        License Number: ${rejectedReason.licenseNumber}`,
      }
  
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

        
    } catch (e) {
        console.log(e);
        res.status(500).json({ errors: 'internal server error' });
    }
}




module.exports = restaurantCtlr;
