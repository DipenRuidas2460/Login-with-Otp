const bcrypt = require("bcrypt");
const _ = require("lodash");
const axios = require("axios");
const otpGenerator = require("otp-generator");

const { User } = require("../models/userModel");
const { Otp } = require("../models/otpModel");

require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceId = process.env.TWILIO_SERVICE_ID;

const client = require("twilio")(accountSid, authToken);

const signUp = async (req, res) => {
  try {
    const number = req.body.number;

    const user = await User.findOne({
      number: number,
    });

    if (user) return res.status(409).send("User Already Registered!");

    const OTP = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    console.log(OTP);

    const obj = {
      number: number,
      otp: OTP,
    };

    const salt = await bcrypt.genSalt(10);
    obj.otp = await bcrypt.hash(obj.otp, salt);

    const result = await Otp.create(obj);
    return res
      .status(201)
      .send({ status: true, message: "Otp Send Successfully!", Otp: result });
  } catch (err) {
    return res.status(500).send({ status: false, Error: err.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const number = req.body.number;
    const otpHolder = await Otp.find({ number: number });

    if (otpHolder.length === 0)
      return res.status(400).send("You used an expired otp!");
    const rightOtpFind = otpHolder[otpHolder.length - 1];
    const validUser = await bcrypt.compare(req.body.otp, rightOtpFind.otp);

    if (rightOtpFind.number === number && validUser) {
      const user = new User(_.pick(req.body, ["number"]));
      const token = user.generateJWT();
      const result = await user.save();
      const otpDelete = await Otp.deleteMany({
        number: rightOtpFind.number,
      });

      return res
        .status(200)
        .send({
          status: true,
          message: "User Registered Successfully!",
          token: token,
          data: result,
        });
    } else {
      return res.status(400).send("Your Otp was Wrong");
    }
  } catch (err) {
    return res.status(500).send({ status: false, Error: err.message });
  }
};

const login = (req, res) => {
  client.verify.v2
    .services(serviceId)
    .verifications.create({
      to: `+91${req.body.number}`,
      channel: "sms",
    })
    .then((data) => {
      return res
        .status(200)
        .send({
          status: true,
          message: "Otp Will be sent to your mobile number!",
          Data: data
        });
    })
    .catch((err) => {
      return res
        .status(400)
        .send({
          status: false,
          message: "User Creadentials not matched",
          Error: err.message
        });
    });
};

const verifyCode = (req, res) => {
  client.verify.v2
    .services(serviceId)
    .verificationChecks.create({
      to: `+91${req.body.number}`,
      code: req.body.otp,
    })
    .then((data) => {
      const user = new User(_.pick(req.body, ["number"]));
      const token = user.generateJWT();
      user.save();
      return res
        .status(200)
        .send({
          status: true,
          message: "User LoggedIn Successfully!",
          token: token,
          twiloData: data
        });
    })
    .catch((err) => {
      return res
        .status(400)
        .send({
          status: false,
          message: "User Creadentials not matched",
          Error: err.message,
        });
    });
};

module.exports = { signUp, verifyOtp, login, verifyCode };