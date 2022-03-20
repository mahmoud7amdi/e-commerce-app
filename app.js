const express = require('express')
require('./db/mongoose')
const app = express()
require('dotenv').config()
const port = process.env.PORT
const morgan = require('morgan')



const productsRouter = require('./routers/products')
const categoryRouter = require('./routers/categories')
const userRouter     = require('./routers/user')
const orderRouter    = require('./routers/orders')


app.use(express.json())
app.use(morgan('tiny'))
app.use(productsRouter) 
app.use(categoryRouter)
app.use(userRouter)
app.use(orderRouter)


app.listen(port, ()=>{
    console.log('server is running up in port',port)
})