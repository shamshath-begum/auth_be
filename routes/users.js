var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const { dbUrl } = require("../config/dbConfig");
const { UserModel } = require("../schema/userschema.js");
const {
  hashPassword,
  hashCompare,
  createToken,
  decodeToken,
  validate,
} = require("../config/auth");
// const {MailService}=require('./../service/mailservice');

const jwt = require("jsonwebtoken");

mongoose.set("strictQuery", true);
mongoose.connect(dbUrl);
router.post("/signup", async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email });
    console.log(user)
    if (!user) {
      req.body.password = await hashPassword(req.body.password);
      let doc = new UserModel(req.body);
      console.log(doc)
      await doc.save();
      res.status(201).send({
        message: "User Created successfully",
      });
    } else {
      res.status(400).send({ message: "User already exists" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error", error });
  }
});

router.post("/login-user", async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email });
    console.log(user);
    if (user) {
      if (await hashCompare(req.body.password, user.password)) {
        let token = createToken({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        });
        console.log(token);

        res
          .status(200)
          .send({ meassage: "Login Successful", token, role: user.role });
        // res.status(200).send({firstName:user.firstName,lastName:user.lastName,email:user.email,role:user.role,tokens:token})
        // user.save()
      } else {
        res.status(400).send({ message: "Invalid credentials" });
      }
    } else {
      res.send({ message: "Email doesnot exists" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error", error });
  }
});






module.exports = router;