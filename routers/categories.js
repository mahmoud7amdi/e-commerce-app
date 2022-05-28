const Category = require('../models/category')
const express = require('express')
const router = express.Router()



router.post(`/Category`, async(req,res)=>{
    let category= new Category(req.body)
    try{
        await category.save()
        res.send(category)
    }catch (e){
        res.status(400).send(e)
    }

})



router.get(`/Category`, async(req,res)=>{
    const categoryList = await Category.find()
    if(!categoryList){
    res.status(500).json({success:false})
    }
    res.send(categoryList)
})




router.get(`/Category/:id`,async(req,res)=>{
    try{
        const category = await Category.findById(req.params.id)
        res.send(category)
    }catch (e) {
        res.status(500).send(e)
    }
})



router.put('/Category/:id',async(req,res)=>{
    const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name ,
            icon: req.body.icon ,
            color: req.body.color
        },
        {new: true}
        
        )
    if(updatedCategory)
       return res.status(200).send('category Updated')
    
    res.send(category)
})





router.delete('/Category/:id',async(req,res)=>{
    try{
        const removedCategory = await Category.findByIdAndDelete(req.params.id)
        await category.save()
        res.send(removedCategory)
    }catch (e) {
        res.status(400).send(e)
    }
    
})

module.exports = router