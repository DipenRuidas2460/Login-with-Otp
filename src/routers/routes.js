const express = require('express');

const router = express.Router()

const {signUp, verifyOtp, login, verifyCode} = require("../controllers/userController")

router.post("/signUp", signUp);
router.post("/signUp/verifyOtp", verifyOtp);

router.post("/login", login)
router.post("/verify", verifyCode)

router.get("/", (req, res)=>{
    res.sendFile(__dirname + ".../public/index.html")
})

module.exports = router