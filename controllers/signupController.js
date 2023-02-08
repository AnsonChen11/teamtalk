const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const User = require("../models/userModel")

const getSignupPage = (req, res) => {
    try{
        res.render("signup.html")
    }
    catch(err){
        console.error(err);
    }
};



const signupAccount = async (req, res) => {
    const { username, email, password } = req.body;
    const checkEmailExist = await User.findOne({ email });
    if(checkEmailExist){
        res.status(400).send({ message: "Email already exists" });
        return
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({
        username,
        email,
        password: hashedPassword
    });
    try{
        const savedUser = await newUser.save();
        // res.send(savedUser)
        res.status(200).send({ message: "Signup successfully" });;
    }
    catch(err){
        console.error(err);
        res.status(500).send(err);
    }
}

module.exports = { 
    getSignupPage,
    signupAccount,
}

