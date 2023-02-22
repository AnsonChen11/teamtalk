const express = require("express");
const roomController = require("../controllers/roomController");
const router = express.Router();

router
    .get("/room/:room", roomController.enterRoom)
    .post("/room", roomController.launchRoom)
    .delete("/room", roomController.deleteRoom);

module.exports = router;