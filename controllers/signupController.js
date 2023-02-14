const mongoose = require("mongoose");
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
        res.status(400).send({ message: "Email already exists" });
        return
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const defaultPictureFileName = username + email
    const defaultPictureBuffer = convertToBuffer(defaultPictureData)
    const newUser = new User({
        username,
        email,
        password: hashedPassword,
        pictureFileName: defaultPictureFileName
    });
    try{
        const savedUser = await newUser.save();
        // res.send(savedUser)
        uploadDefaultPicture(defaultPictureFileName, defaultPictureBuffer);
        res.status(200).send({ message: "Signup successfully" });
    }
    catch(err){
        console.error(err);
        res.status(500).send(err);
    }
}

function convertToBuffer(defaultPictureData){
    const base64Data = defaultPictureData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    return buffer
}

function uploadDefaultPicture(defaultPictureFileName, defaultPictureBuffer){
    const params = {
        Bucket: process.env.aws_bucket_name, // 相簿位子
        Key: defaultPictureFileName, // 你希望儲存在 S3 上的檔案名稱
        Body: defaultPictureBuffer, // 檔案
        ContentType: "image/jpeg" // 副檔名
    };
    //將圖檔上傳至S3
    s3.upload(params, (err, data) => {
        if(err){
            return res.status(500).send(err);
        }
        // console.log(`File uploaded successfully. ${data.Location}`);
    })
}

module.exports = { 
    getSignupPage,
    signupAccount,
}

