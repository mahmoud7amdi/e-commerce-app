const mongoose = require('mongoose')
const bcrypt   = require('bcrypt')
const jwt      = require('jsonwebtoken')
require('dotenv').config()
const userSchema = new mongoose.Schema({
    name: {
        type: String ,
        required: true

    },
    email: {
        type: String ,
        unique: true,
        required: true

    },
    password: {
        type: String ,
        required: true

    },
    phone: {
        type: String ,
        required: true

    },
    isAdmin: {
        type: Boolean ,
        default: false
    },
    street: {
        type: String,
        default: ''

    },
    apartment: {
        type: String,
        default: ''

    },
    zip: {
        type: String,
        default: ''

    },
    city: {
        type: String,
        default: ''

    },
    country: {
        type: String,
        default: ''
    },
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }],
    
},

{
    timestamps: true

})

userSchema.methods.generateAuthToken = async function() {
    const user = this 
    const token = jwt.sign({ _id : user._id.toString() },process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
    
}


userSchema.statics.findByCredentials = async(email, password)=>{
    const user = await User.findOne({ email })
    if (!user){
        throw new Error('unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('unable to login')
    }
    return user


}


userSchema.pre('save', async function (next) {
    const user = this 
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password , 8)

    }

    next()
    
})

const User = mongoose.model('User',userSchema)
module.exports = User