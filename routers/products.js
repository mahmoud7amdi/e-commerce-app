const express = require('express')
const Category = require('../models/category')
const router = express.Router()
const mongoose = require('mongoose')
const Product = require('../models/product')



router.post(`/api/Product`, async(req,res)=>{
    const category = await Category.findById(req.body.category)
    if(!category) return res.status(400).send('invalid category')
    const product = new Product(req.body)
    try{
        await product.save()
        res.send(product)
    }catch (e) {
        res.status(400).send(e)
    }
})



router.get(`/Product`, async(req,res)=>{
    let filter = {}
    if(req.query.categories)
    {
        filter = {category: req.query.categories.split(',')}
    }
    try{
        const productList = await Product.find(filter).populate('category')
        res.send(productList)
    }catch (e) {
        res.status(400).send(e)
    }
   
})




router.get('/Product/:id',async(req,res)=>{
    
    const product = await Product.findById(req.params.id).populate('category')
    if(!product){
        res.status(500).json({success:false})
    }
    res.send(product)
})





router.put('/Product/:id' ,async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('invalid  prodcut id')
    }
    const category = await Category.findById(req.body.category)
    if(!category) return res.status(400).send('invalid category')

    const product = await Product.findByIdAndUpdate(req.params.id,req.body,{new:true})
    if(!product)
    return res.status(500).send('the product is updated')
    res.send(product)
})





router.delete('/Product/:id',async(req,res)=>{
    const product = await Product.findByIdAndRemove(req.params.id)
    if(!product){
    return res.status(500).send('cannot found product')
}else{
    return res.status(200).send('product removed')
}

})

module.exports = router