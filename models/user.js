const mongoose = require("mongoose");
const { emailValidator } = require("../validators");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 16
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: emailValidator
        }
    }
});

module.exports = mongoose.model("user", userSchema);