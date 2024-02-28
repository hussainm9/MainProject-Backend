const { validationResult } = require('express-validator')
const User = require('../models/users-model')
const _ = require('lodash')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const usersCtlr = {}
const nodemailer = require('nodemailer')
//register

usersCtlr.register = async (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  const body = _.pick(req.body, ['username', 'email', 'password', 'mobile', 'role'])
  console.log(body, 'body of user');
  try {
    const user = new User(body)
    const salt = await bcrypt.genSalt()
    const encryptedPassword = await bcrypt.hash(user.password, salt)
    user.password = encryptedPassword

    const userCount = await User.countDocuments()

    if (userCount == 0) {
      return user.role == 'admin'
    }
    const savedUser = await user.save()

    return res.json(savedUser)



  } catch (e) {
    res.status(500).json(e)


  }
}
//login
usersCtlr.login = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  const body = _.pick(req.body, ['email', 'password'])

  try {

    const user = await User.findOne({ email: body.email })

    if (!user) {
      const errors = { msg: 'invalid email' }

      return res.status(404).json({ errors: [errors] })
    }
    const result = await bcrypt.compare(body.password, user.password)

    if (!result) {
      //console.log('user');
      const errors = { msg: 'invalid email/password' }
      return res.status(404).json({ errors: [errors] })
    }
    console.log(user._id, 'id');
    const tokenData = {
      id: user._id,
      role: user.role
    }
    const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '7d' })
    // console.log(token);
    return res.json({ token: token })
  } catch (e) {
    console.log('Error', e);
    res.status(500).json(e)
  }


}
//profile
usersCtlr.profile = async (req, res) => {

  try {
    const user = await User.findById(req.user.id)
    res.status(200).json(user)
  } catch (e) {
    res.status(500).json(e)
  }
}
//forgot Password
usersCtlr.forgotPassword = async (req, res) => {
  const email = req.body.email;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1d',
    });

    // Create a transporter with SMTP options
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
      to: user.email, // Change to user.email if you want to send it to the user's email
      subject: 'Resofy (Reset Password Link)',
      text: `Click the following link to reset your password: http://localhost:3000/resetPassword/${user._id}/${token}`,
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
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ... (other imports)

usersCtlr.resetPassword = async (req, res) => {
  const password = req.body.password;
  const { id, token } = req.params;

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Generate a salt and hash the new password
    const salt = await bcrypt.genSalt();
    const encryptedPassword = await bcrypt.hash(password, salt);

    // Update the user's password in the database
    await User.findByIdAndUpdate(id, { password: encryptedPassword });

    res.status(200).json({ status: 'success', message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'error', message: 'Token has expired' });
    }
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
usersCtlr.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, mobile } = req.body;
  const Id = req.params.userId;

  try {
    const data = await User.findOneAndUpdate(
      { _id: Id },
      { $set: { username, mobile } },
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
}


module.exports = usersCtlr

