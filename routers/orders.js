const Order = require('../models/order')
const express = require('express')
const router = express.Router()
const OrderItem = require('../models/order-Item')

router.post('/Order', async (req,res)=>{
    const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) =>{
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

         await newOrderItem.save()
         return newOrderItem._id
    }))

    const orderItemResolved = await orderItemsIds;
    const totalPrices = await Promise.all(orderItemResolved.map(async (orderItemsId)=>{
        const orderItem = await OrderItem.findById(orderItemsId).populate('product', 'price')
        const totalPrice = orderItem.product.price * orderItem.quantity
        return totalPrice
    }))
    const totalPrice = totalPrices.reduce((a,b)=>a+b , 0)
    console.log(totalPrices)


   // console.log(orderItemResolved)
    const order = new Order({
            orderItems: orderItemResolved,
            shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,
            status: req.body.status,
            totalPrice:totalPrice,
            user: req.body.user
        })
    
    try{
        await order.save()
        res.status(201).send(order)
        
    }catch (e) {
        res.status(400).send(e)
    }
})
// router.post('/Order', async(req,res)=>{
//     const order = new Order(req.body)
//     try{
//         await order.save()
//         res.status(201).send(order)
//     }catch (e) {
//         res.status(400).send(e)
//     }
// })


router.get('/Order',async(req,res)=>{
    try{
        const orderList = await Order.find().populate('user').sort({'dateOrdered': -1})
        res.send(orderList)
    }catch(e){
        res.status(400).send(e)
    }
})

// router.get(`/Order/:id`, async  (req,res)=>{
    
//         const order = await Order.findById(req.params.id)
//         .populate('user','name')
//         .populate({ path: 'orderItems', populate:'Product' })    
      
       
//         if(!order){
//             throw new Error
        
//         }
//         res.send(order)
// })
router.get(`/Order/:id`, async (req, res) =>{
    const order = await Order.findById(req.params.id)
    .populate('user')
    .populate({ 
        path: 'orderItems', populate: {
            path :'product', populate:'category'} 
        });

    if(!order) {
        res.status(500).json({success: false})
    } 
    res.send(order);
    console.log(order)
    
})
router.get('/get/totalSales',async(req,res)=>{
    const totalSales = await Order.aggregate([
        {$group: {_id:null ,totalsales : {$sum: 'totalPrice'}}}
    ])
    if(!totalSales){
        return res.status(400).send('the order sales cannot be aggregate')
    }
    res.send({totalsales:totalSales})
})
// router.get('/get/count', async(req,res)=>{
//     const orderCount = await Order.countDocuments((count)=> count)
    
//     if(!orderCount){
//         res.status(500).json({success:false})
//     }
//     res.send({
//         orderCount : orderCount
//     })
// })

router.get('/get/userorders/:userid',async(req,res)=>{
    const userOrderList = await Order.find({user: req.params.userid}).populate({ 
        path: 'orderItems', populate: {
            path :'product', populate:'category'} 
        }).sort({'dateOrdered': -1});
    
    
    if(!userOrderList){
        res.status(500).json({success:false})
    }
    res.send(userOrderList)
})


router.put('/Order/:id',async(req,res)=>{
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status:req.body.status
           
        },
        {new: true}
        
        )
    if(!order)
       return res.status(400).send('the order cannot be  Updated')
    
    res.send(order)
})

router.delete('/Order/:id',(req,res)=>{
   Order.findByIdAndDelete(req.params.id).then(async order =>{
        if(order) {
            await order.orderItems.map( async orderItem =>{
                await OrderItem.findByIdAndDelete(orderItem)
            })
            return res.status(200).json({success:true , message:'the order is deleted'})
    }else{
        return res.status(400).json({success:false , message:'the order not found'})
    }
}).catch(err=>{
    return res.status(500).json({success:false,error:err})

})
})
module.exports = router