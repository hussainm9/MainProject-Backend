const mongoose = require('mongoose')
const configDB = async()=>{
    try{
        const db = await mongoose.connect('mongodb+srv://shaikrahid2001:resofy@project.hayhuty.mongodb.net/?retryWrites=true&w=majority')
        console.log('server is connected to db');

    }
    catch(err){
        console.log('err connecting to db',err)
    }


}
module.exports = {
    configDB
}