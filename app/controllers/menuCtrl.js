const _=require('lodash')
const {validationResult}=require('express-validator')
const Menu=require('../models/menu-model')
const menuCtrl={}

menuCtrl.create=async(req,res)=>{
    const error=validationResult(req)
    if(!error.isEmpty()){
        return res.status(400).json(error.array())
    }
    const body=_.pick(req.body,['category','name','price','image','isVeg','servingSize','quantity'])
    const menu=new Menu(body)
    menu.ownerId=req.user.id
    console.log(req.files)
    menu.image=req.files['image'][0].filename
    console.log(menu)
    try{
        
        menu.restaurantId =req.params.restaurantId
        await menu.save()
        res.status(200).json(menu)

    }
    catch(e){
        res.status(500).json(e)
    }
     

}

menuCtrl.getOne = async (req, res) => {
    const restaurantId = req.params.restaurantId;
    const sortBy = req.query.sortBy || 'asc'; // Default sorting order is ascending
    try {
        let menuItems;
        if (sortBy === 'asc') {
            menuItems = await Menu.find({ restaurantId: restaurantId }).sort({ price: 1 });
        } else if (sortBy === 'desc') {
            menuItems = await Menu.find({ restaurantId: restaurantId }).sort({ price: -1 });
        } else {
            return res.status(400).json({ error: 'Invalid sortBy parameter. Use "asc" or "desc".' });
        }
        console.log(menuItems);
        res.status(200).json(menuItems);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
}
menuCtrl.update=async(req,res)=>{
    const error=validationResult(req)
    if(!error.isEmpty()){
        return res.status(400).json(error.array())
    }
    const ownerId=req.user.id
    const body=_.pick(req.body,(['price','image','servingSize']))
    body.image=req.files['image'][0].filename
    console.log(body)
       
    try{
        const user=await Menu.findOne({ownerId:ownerId})
        
        if(!user){
            return res.status(403).json({error:'you are not have acess to update'})
        }
        const updatedMenu=await Menu.findOneAndUpdate({ _id: req.params.menuId, restaurantId: req.params.restaruntId },body,{new:true})
        await updatedMenu.save()
        console.log(updatedMenu)
        res.status(200).json(updatedMenu)
    }catch(e){
        res.status(500).json(e)

    }
    

}
menuCtrl.delete=async(req,res)=>{
    const menuId=req.params.menuId
    try{
        const deleteMenu=await Menu.findOneAndDelete({_id:menuId})
        
        res.status(200).json(deleteMenu)

    }catch(e){
        res.status(500).json(e)
    }
}
module.exports=menuCtrl