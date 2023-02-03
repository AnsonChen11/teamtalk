require("dotenv").config();
const express = require("express");
const path = require("path");
const hbs = require("hbs");
const cors = require("cors");
const session = require("express-session");
const flash = require("connect-flash");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const { connectToMongoDB } = require("../utils/db.js")
const roomRoutes = require("../routes/roomRoutes");
const authRoutes = require("../routes/authRoutes");

const app = express();

app.engine("html", hbs.__express);
app.set("view engine", "html");
app.set("views", path.join(__dirname, "../application", "views"));
app.use(express.static(path.join(__dirname, "../application")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", roomRoutes);
app.use("/", authRoutes);

connectToMongoDB();

app.get("/", (req, res) => {
    res.render("index");
})

module.exports = app;


// app.set('trust proxy', 1)
// app.use(session({
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true,
//   // cookie: { secure: true }
// }))

// app.use(flash());

// const saltRounds = 10;   //  設置 hash 的複雜度
// bcrypt.hash(password, saltRounds, function(err, hash) {
//     if (err) {
//         req.flash('errorMessage', err.toString());
//         return res.redirect('back');
//     }
//     userModel.add({       // 將註冊的帳號密碼傳給 Model
//         nickname,
//         username,
//         password: hash      // 寫進去的密碼就會是 hash 過後的密碼，而不是原來的 password 明碼 
//     })
// })

// bcrypt.compare(password, hash, function(err, result){
//     // 如果 result 為 true 代表匹配結果為正確
//     if (err || !res){
//         req.flash('errorMessage', err.toString());
//         return res.redirect('back');
//     }
//     req.session.username = username
//     res.redirect('/')
// });