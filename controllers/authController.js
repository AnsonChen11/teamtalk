const jwt = require("jsonwebtoken");
const User = require("../models/userModel")
const dotenv = require("dotenv");
dotenv.config();
const AWS = require("aws-sdk");
const s3 = new AWS.S3({
    accessKeyId: process.env.aws_access_key,
    secretAccessKey: process.env.aws_secret_access_key
});


const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    if(!token){
        return res.status(401).send({ message: "Access denied. No token provided." });
    }

    try{
        const decoded = jwt.verify(token, process.env.secret_key);
        req.user = decoded;
        next();
    }
    catch(err){
        res.status(403).send({ message: "Invalid token." });
    }
};

const getUserInformation = (req, res) => {
    try{
        const user = req.user;
        User.findOne({_id: user.id}, { username: 1, email: 1, pictureFileName: 1 }, { new: true }, (err, userInformation) => {
            if(err){
                console.log(err)
                return res.status(500).send(err);
            }
            const params = {
                Bucket: process.env.aws_bucket_name,
                Key: userInformation.pictureFileName
            };
            s3.getObject(params, (err, data) => {
                if(err){
                    console.log(err);
                    return res.status(500).send({ message: err });
                }
                let url = `https://d32zqk6sk572zp.cloudfront.net/${userInformation.pictureFileName}`
                res.send({ 
                    message: "Valid and get account data successfully.",
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    pictureUrl: url
                });
            });
        })
    }
    catch(err){
        res.status(500).send({ message: err })
    }
}

const getUserInformationFromGoogle = (req, res) => {
    try{
        const user = req.user;
        res.send({ 
            message: "Valid and get account data successfully.",
            id: user.id,
            username: user.username,
            email: user.email,
            pictureUrl: user.picture,
        });
    }
    catch(err){
        res.status(500).send({ message: err })
    }
}

const getUserInformationFromFacebook = (req, res) => {
    try{
        const user = req.user;
        res.send({ 
            message: "Valid and get account data successfully.",
            id: user.id,
            username: user.username,
            email: user.email,
            pictureUrl: user.picture,
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
        User.findByIdAndUpdate(user.id, { $set: { username: newUsername, updatedAt: Date.now() } }, { new: true }, (err, updatedUser) => {
            if(err){
                console.log(err)
                return res.status(500).send(err);
            }
            const updateToken = signToken(updatedUser);
            res.status(200).send({ message: "Updated successfully", updateToken });
        });
    } 
    catch(err){
        console.log(err)
        res.status(500).send({ message: err })
    }
};

const uploadAccountPicture = async (req, res) => {
    try{
        const user = req.user;
        const file = req.file;
        const fileName = Date.now() + '_' + user.id + '_' + file.originalname;
        const fileContent = file.buffer;
        const params = {
            Bucket: process.env.aws_bucket_name,
            Key: fileName,
            Body: fileContent,
            ContentType: file.mimetype
        };
        
        s3.upload(params, (err, data) => {
            if(err){
                return res.status(500).send(err);
            }
        })

        User.findByIdAndUpdate(user.id, { $set: { pictureFileName: fileName, updatedAt: Date.now() } }, { new: true }, (err, updatedPicture) => {
            if(err){
                console.log(err)
                return res.status(500).send(err);
            }
            res.json({ message: "ok", updatedPicture });
        });
        
    } 
    catch(err){
        console.log(err)
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

const googleCallback = async (req, res) => {
    try{
        req.session.user = req.user;
        const tokenLoginWithGoogle = jwt.sign({
            id: req.user.id,
            username: req.user.displayName,
            email: req.user.emails[0].value,
            picture: req.user.photos[0].value,
        }, process.env.secret_key, { expiresIn: "7d" });
        res.cookie("tokenLoginWithGoogle", tokenLoginWithGoogle, { maxAge: 604800000 });
        res.redirect("/");
    } 
    catch(err){
        res.status(500).send({ message: err })
    }
};

const facebookCallback = async (req, res) => {
    try{
        req.session.user = req.user;
        let email = req.user.emails
        if(!email){
            email = "Email not found"
        }
        else{
            email = req.user.emails[0].value
        }
        const tokenLoginWithFacebook = jwt.sign({
            id: req.user.id,
            username: req.user.displayName,
            email: email,
            picture: req.user.photos[0].value,
        }, process.env.secret_key, { expiresIn: "7d" });
        res.cookie("tokenLoginWithFacebook", tokenLoginWithFacebook, { maxAge: 604800000 });
        res.redirect("/");
    } 
    catch(err){
        res.status(500).send({ message: err })
    }
};

module.exports = { 
    authenticateUser,
    getUserInformation,
    getUserInformationFromGoogle,
    getUserInformationFromFacebook,
    logoutAccount,
    editAccountUsername,
    uploadAccountPicture,
    googleCallback,
    facebookCallback,
}