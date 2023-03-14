const bcrypt = require("bcrypt");
const saltRounds = 10;
const User = require("../models/userModel")
const dotenv = require("dotenv");
dotenv.config();
const AWS = require("aws-sdk");
const s3 = new AWS.S3({
    accessKeyId: process.env.aws_access_key,
    secretAccessKey: process.env.aws_secret_access_key
});

const getSignupPage = (req, res) => {
    try{
        res.render("signup.html")
    }
    catch(err){
        console.error(err);
    }
};



const signupAccount = async (req, res) => {
    const { username, email, password, defaultPictureData } = req.body;
    const checkEmailExist = await User.findOne({ email });
    if(checkEmailExist){
        res.status(400).send({ 
            error: true,
            message: "Email is already taken or the registration information is incorrect."
        });
        return
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const defaultPictureFileName = username + email + Date.now()
    const defaultPictureBuffer = convertToBuffer(defaultPictureData)
    const newUser = new User({
        username,
        email,
        password: hashedPassword,
        pictureFileName: defaultPictureFileName
    });
    try{
        const savedUser = await newUser.save();
        uploadDefaultPicture(defaultPictureFileName, defaultPictureBuffer);
        res.status(200).send({ 
            ok: true,
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

function convertToBuffer(defaultPictureData){
    const base64Data = defaultPictureData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    return buffer
}

function uploadDefaultPicture(defaultPictureFileName, defaultPictureBuffer){
    const params = {
        Bucket: process.env.aws_bucket_name,
        Key: defaultPictureFileName,
        Body: defaultPictureBuffer,
        ContentType: "image/jpeg"
    };

    s3.upload(params, (err, data) => {
        if(err){
            return res.status(500).send({ 
                error: true, 
                message: "Internal Server Error." + err
            });
        }
    })
}

module.exports = { 
    getSignupPage,
    signupAccount,
}

