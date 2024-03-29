const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.secret_key;
const bcrypt = require("bcrypt");
const User = require("../models/userModel")

const getLoginPage = (req, res) => {
    try{
        res.render("login.html")
    }
    catch(err){
        console.error(err);
    }
};


const loginAccount = async (req, res) => {
    try{
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if(!user){
            res.status(400).send({ 
                error: true,
                message: "Email not found."
             });
            return;
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if(!isPasswordMatch){
            res.status(400).send({ 
                error: true,
                message: "Password is incorrect."
            });
            return;
        }
        const token = jwt.sign({ id: user._id, username: user.username, email: user.email }, SECRET_KEY, { expiresIn: "7d" })
        req.session.user = user;
        res.status(200).send({ 
            ok: true,
            token: token 
        });
    }
    catch(err){
        console.error(err);
        res.status(500).send({ 
            error: true, 
            message: "Internal Server Error." + err
        });
    }
}

module.exports = { 
    getLoginPage,
    loginAccount,
}

