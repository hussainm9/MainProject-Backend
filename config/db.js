const mongoose = require('mongoose')
const configDB = async()=>{
    try{
        const db = await mongoose.connect(process.env.MONGO)
        console.log('server is connected to db');

    }
    catch(err){
        console.log('err connecting to db',err)
    }


}
module.exports = {
    configDB
}