require('dotenv').config() //dotenv 是將 .env 文件中的環境參數加載到 process.env。這個檔要建立在最外層資料夾，在其他文件中先引入 require('dotenv').config() 後只要再呼叫 PROCESS.ENV.[變數名稱] 
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const path = require('path')


const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: 'http://localhost:3000' })) //app.use(cors()) //app.use(cors({ origin: '*' }))
app.use(fileUpload({
    useTempFiles: true
}))

//connected MongoDB
mongoose.connect(process.env.MONGODB_URL, () => console.log("Succeed to connected to MongoDB "))

// Routes
app.use('/user', require('./routes/userRouter'))
app.use('/api', require('./routes/categoryRouter'))
app.use('/api', require('./routes/upload'))
app.use('/api', require('./routes/productRouter'))
app.use('/api', require('./routes/paymentRouter'))



//http://localhost:5000/
app.get('/', (req, res) => {
    res.json({ message: "welcome my BackEnd platform...." })
})

const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log("Sever is running on Port....", port)
})

/*
app.get('/', function (req, res) {
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.end('hello world');
});
*/