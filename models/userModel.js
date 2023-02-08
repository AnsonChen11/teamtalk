const mongoose = require("mongoose");
const emailValidator = require("../validators/emailValidator");
// const passwordValidator = require("../validators/passwordValidator");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: emailValidator
        }
    },
    password: {
        type: String,
        required: true,
        // validate: {
        //     validator: passwordValidator
        // }
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("user", UserSchema);