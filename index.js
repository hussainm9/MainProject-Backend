const express = require('express')
const app = express()
const port = 3786

require('dotenv').config()
app.use(express.json())
//db
const {configDB} = require('./config/db')
configDB()
//middlewares
 const {authenticateUser,authorizedUser}=require('./app/middlewares/authenticateUser')


//cors
const cors = require('cors')
app.use(cors())
//validations
const {checkSchema} = require('express-validator')
const {userRegisterSchema,userLoginSchema} = require('./app/validations/usersSchema')
//controllers
const usersCltr = require('./app/controllers/usersCtlr')
//apis
//user
app.post('/api/register',checkSchema(userRegisterSchema),usersCltr.register)
app.post('/api/login',checkSchema(userLoginSchema),usersCltr.login)
app.get('/api/user/profile',authenticateUser,usersCltr.profile)
//forgotPassword
app.post('/api/user/forgotPassword',usersCltr.forgotPassword)
app.post('/api/resetPassword/:id/:token',usersCltr.resetPassword)





app.listen(port,()=>{
    console.log('server is running',port);
})

