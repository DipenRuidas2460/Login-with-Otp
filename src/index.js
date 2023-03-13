const express = require('express')
const mongoose = require('mongoose')
const router = require('./routers/routes')
require('dotenv').config()

const app = express()

app.use(express.json())

const url = process.env.MONGO_URL

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

    .then(() => { console.log("Connected to MongoDB Sucessfully!") })
    .catch((err) => console.log(err))

app.use(express.static("public"))
app.use('/', router)
const port = (process.env.PORT)

app.listen(port, () => {
    console.log(`Express App Running On Port: ${port}`);
})
