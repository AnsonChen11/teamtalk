const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
    },
    hostName: {
        type: String,
        required: true,
    },
    hostEmail: {
        type: String,
        required: true,
    },
    createdDate: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("room", RoomSchema);