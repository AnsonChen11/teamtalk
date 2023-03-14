require("dotenv").config();
const express = require("express");
const path = require("path");
const hbs = require("hbs");
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const { connectToMongoDB } = require("../utils/db.js")
const roomRoutes = require("../routes/roomRoutes");
const authRoutes = require("../routes/authRoutes");
const dotenv = require("dotenv");
const app = express();
dotenv.config();

app.engine("html", hbs.__express);
app.set("view engine", "html");
app.set("views", path.join(__dirname, "../application", "views"));
app.use(express.static(path.join(__dirname, "../application")));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.session_serect, // 用來加密 session ID 的字串
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use("/", roomRoutes);
app.use("/", authRoutes);

connectToMongoDB();

app.get("/", (req, res) => {
    res.render("index");
})

module.exports = app;