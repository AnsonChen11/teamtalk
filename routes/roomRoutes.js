const express = require("express");
const roomController = require("../controllers/roomController");
const router = express.Router();

router.get("/room/:room", roomController.getRoom);

module.exports = router;