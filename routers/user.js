const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')

//upload user profile
const upload = multer({
    dest: 'avatars',
    limits:{
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('please upload an image'))
        }
        cb(undefined, true)
    }
    
})
router.post('/users/me/avatar',upload.single('avatar'),(req,res)=>{
    res.send()
},(error , req , res , next)=>{
    res.status(400).send({error:error.message})
})




//create user
router.post('/User', async(req,res)=>{
    const user = new User(req.body)
    try{
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
})




//login user
router.post('/User/login', async(req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    }catch(e){
        res.status(400).send(e)

    }

})



//logout user
router.post('/User/logout', auth , async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !==req.token
        })
        await req.user.save()
        res.send()
    }catch (e) {
        res.status(500).send()
    }
})



//logout all users
router.post('/User/logoutAll', auth , async (req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send
    }catch (e) {
        res.status(500).send()
    }
    
})



//get all users
router.get('/Users', auth, async (req,res) => {
    try{
        const users = await User.find({})
     //   const token = await User.generateAuthToken()
        res.send(users)
    }catch (e) {
        res.status(400).send(e)
    }
    
})


//get my profile
router.get('/Users/me', auth , (req,res)=>{
    res.send(req.user)
})



//get user by Id
router.get('/User/:id' , async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        const token = await user.generateAuthToken()
        res.send({user , token})

    }catch(e){
        res.status(400).send(e)
    }
 
})



//update user
router.patch('/users/me',auth, async(req,res)=>{
    const updates = Object.keys(req.body);
    // console.log('update',  update)
    const allowedUpdates = ['name' , 'email','password']
    const isValidOperation = updates.every((update)=>allowedUpdates.includes(update)) 
    
    if(!isValidOperation){
      return res.status(400).send({error : 'invalid update'})
    }
    try{
      console.log('updates', updates)
       updates.forEach((update) => req.user[update] = req.body[update])
      await req.user.save()
      //const user =await User.findByIdAndUpdate(req.params.id , req.body ,{ new : true ,runValidators : true})
      
      res.send(req.user)

    }catch(e){
      res.status(400).send(e)

    }
  })


//delete user
  router.delete('/users/me',auth, async(req , res)=>{
    try{

     await req.user.remove()
      res.send(req.user)

    }catch(e){
      res.status(500).send()

    }
  })

module.exports = router