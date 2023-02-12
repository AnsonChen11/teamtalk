const jwt = require("jsonwebtoken");
const User = require("../models/userModel")
const dotenv = require("dotenv");
dotenv.config();

const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    if(!token){
        console.log("驗證失敗")
        return res.status(401).send({ message: "Access denied. No token provided." });
    }

    try{
        const decoded = jwt.verify(token, process.env.secret_key);
        // const id = decoded.id;
        // const username = decoded.username;
        // const email = decoded.email;
        // // req.user = decoded;

        // res.send({ 
        //     message: "Valid successfully.",
        //     id: id,
        //     username: username,
        //     email: email
        // });
        req.user = decoded;
        next();
    }
    catch(err){
        res.status(400).send({ message: "Invalid token." });
    }
};

const getUserInformation = (req, res) => {
    try{
        const user = req.user;
        res.send({ 
            message: "Valid successfully.",
            id: user.id,
            username: user.username,
            email: user.email
        });
    }
    catch(err){
        res.status(500).send({ message: err })
    }
}

const editAccountUsername = async (req, res) => {
    try{
        const user = req.user;
        const newUsername = req.body.newUsername;
        console.log(newUsername)
        User.findByIdAndUpdate(user.id, { $set: { username: newUsername, updatedAt: Date.now() } }, { new: true }, (err, updatedUser) => {
            if(err){
                console.log(err)
                return res.status(500).send(err);
            }
            const updateToken = signToken(updatedUser);
            console.log("Token updated successfully");
            res.status(200).send({ message: "Updated successfully", updateToken });
        });
    } 
    catch(err){
        console.log("出事2", err)
        res.status(500).send({ message: err })
    }
};

const logoutAccount = async (req, res) => {
    try{
        req.session.destroy(err => {
            if(err){
                res.status(500).send({ message: err });
            } 
            else{
                res.status(200).send({ message: "Logout successfully." });
            }
        });
    } 
    catch(err){
        res.status(500).send({ message: err })
    }
};

const signToken = (user) => {
    return jwt.sign({
        id: user._id,
        username: user.username,
        email: user.email,
     }, process.env.secret_key, {
        expiresIn: "7d"
    });
};

module.exports = { 
    authenticateUser,
    getUserInformation,
    logoutAccount,
    editAccountUsername
}