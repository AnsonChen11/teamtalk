const Room = require("../models/roomModel")
const { v4: uuidV4 } = require("uuid");

const enterRoom = async (req, res) => {
    const roomId = req.params.room
    const checkRoomExist = await Room.findOne({ roomId });
    try{
        if(!checkRoomExist){
            res.status(400).send({ 
                error: true,
                message: "Couldn't find the room" });
            return
        }
        else{
            res.render("room.html", { roomId: roomId });
        }
    }
    catch(err){
        console.error(err);
        res.status(500).send({ 
            error: true,
            message: "Internal Server Error." +err
        });
    }
};

const launchRoom = async (req, res) => {
    const uuidString = uuidV4()
    const roomId = uuidString.substring(0, 13);
    const { username, email } = req.body;
    const newRoom = new Room({
        roomId,
        hostName: username,
        hostEmail: email
    });
    try{
        const savedRoom = await newRoom.save();
        res.send({
            ok: true,
            roomId: roomId,
            hostName: username,
            hostEmail: email
          });
    }
    catch(err){
        console.error(err);
        res.status(500).send({ 
            error: true,
            message: "Internal Server Error." +err
        });
    };
};

const deleteRoom = async (req, res) => {
    const roomId = req.params.room
    try{
        await Room.findOneAndDelete({ roomId: roomId });
        res.send({ message: "Room deleted" });
    } 
    catch(err){
        console.error(err);
        res.status(500).send({ message: "Internal server error" });
    }
};

module.exports = { 
    enterRoom,
    launchRoom,
    deleteRoom,
}