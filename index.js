const express = require('express')
const app = express()
const port = 3786
//multer
const multer = require('multer')
const path = require('path')

require('dotenv').config()
app.use(express.json())
//db
const {configDB} = require('./config/db')
configDB()
//middlewares
 const {authenticateUser,authorizedUser}=require('./app/middlewares/authenticateUser')
 //multer
const staticpath = path.join(__dirname , "./upload")
app.use("./upload",express.static(staticpath))
console.log(staticpath)


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'upload/images')
    },
    filename: function (req, file, cb) {
      
      cb(null, Date.now() + file.originalname)
    }
  })
  
  const upload = multer({ storage: storage })
  const multipleuploads = upload.fields([{name : "image",maxCount : 4},{name:"licenseNumber",maxCount:1}])



//cors
const cors = require('cors')
app.use(cors())
//validations
const {checkSchema} = require('express-validator')
const {userRegisterSchema,userLoginSchema} = require('./app/validations/usersSchema')
const {restaurantPasswordSchema,restaurantSchema,restaurantUpdateSchema} = require('./app/validations/restaurantSchema')
const {menuValidation}=require('./app/validations/menuSchema')
const {reviewSchema}=require('./app/validations/reviewSchema')
const {tableSchema} = require('./app/validations/tableSchema')
//controllers
const usersCltr = require('./app/controllers/usersCtlr')
const restaurantCtlr = require('./app/controllers/restaurantCtlr')
const menuCtrl=require('./app/controllers/menuCtrl')
const reviewCltr=require('./app/controllers/reviewCtrl')
const tableCltr = require('./app/controllers/tableCltr')

//apis
//user
app.post('/api/register',checkSchema(userRegisterSchema),usersCltr.register)
app.post('/api/login',checkSchema(userLoginSchema),usersCltr.login)
app.get('/api/user/profile',authenticateUser,usersCltr.profile)
//forgotPassword
app.post('/api/user/forgotPassword',usersCltr.forgotPassword)
app.post('/api/resetPassword/:id/:token',usersCltr.resetPassword)
//restaurant
app.post('/api/restaurantRegister', authenticateUser, authorizedUser(['restaurantOwner']),checkSchema(restaurantSchema),multipleuploads, restaurantCtlr.register);
app.put('/api/restaurants/:restaurantId/updatePassword',authenticateUser,authorizedUser(['restaurantOwner']),checkSchema(restaurantPasswordSchema),restaurantCtlr.updatePassword)
app.put('/api/restaurantOwner/:id',authenticateUser,authorizedUser(['restaurantOwner']),checkSchema(restaurantUpdateSchema),restaurantCtlr.updateRestaurant)
//admin
app.get('/api/newly-registered',authenticateUser,authorizedUser(['admin']),restaurantCtlr.newlyRegistered)
app.get('/api/approved',authenticateUser,authorizedUser(['admin']),restaurantCtlr.approved)
app.get('/api/rejected',authenticateUser,authorizedUser(['admin']),restaurantCtlr.rejected)

app.put('/api/approved-restaurant/:restaurantId',authenticateUser,authorizedUser(['admin']),restaurantCtlr.approvedRestaurant)

//Menu
app.post('/api/restarunt/:restaurantId/menu',authenticateUser,authorizedUser(['restaurantOwner']),multipleuploads,checkSchema(menuValidation),menuCtrl.create)
app.get('/api/:restaurantId/getOne',authenticateUser,menuCtrl.getOne)
app.put('/api/restarunt/:restaruntId/:menuId/update',authenticateUser,authorizedUser(['restaurantOwner']),multipleuploads,menuCtrl.update)
app.delete('/api/:restaurantId/:menuId/delete',authenticateUser,authorizedUser(['restaurantOwner']),menuCtrl.delete)
//Review
app.post('/api/:restaurantId/review',authenticateUser,checkSchema(reviewSchema),reviewCltr.create)
app.put('/api/:restaurantId/:reviewId/update',authenticateUser,checkSchema(reviewSchema),reviewCltr.update)
app.get('/api/:restaurantId/getAll',authenticateUser,reviewCltr.getAll)
//table
app.post('/api/restaurants/:restaurantId/createTable',authenticateUser,authorizedUser(['restaurantOwner']),multipleuploads,checkSchema(tableSchema),tableCltr.create)
app.get('/api/restaurants/:restaurantId/getTables',authenticateUser,tableCltr.getRestaurantTables)
app.get('/api/restaurants/getTables',authenticateUser,tableCltr.getTables)
app.put('/api/restaurants/:restaurantId/:tableId',authenticateUser,authorizedUser(['restaurantOwner']),checkSchema(tableSchema),tableCltr.updateOne)
app.delete('/api/restaurants/:restaurantId/:tableId',authenticateUser,authorizedUser(['restaurantOwner']),tableCltr.deleteOne)





app.listen(port,()=>{
    console.log('server is running',port);
})
