const express = require("express");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const passport = require("passport");
const authController = require("../controllers/authController");
const loginController = require("../controllers/loginController");
const signupController = require("../controllers/signupController");
const router = express.Router();

require("../middleware/passport");

router
    .get("/users/auth", authController.authenticateUser, authController.getUserInformation)
    .get("/users/auth/google", authController.authenticateUser, authController.getUserInformationFromGoogle)
    .get("/users/auth/facebook", authController.authenticateUser, authController.getUserInformationFromFacebook)
    .put("/users/auth", authController.authenticateUser, authController.editAccountUsername)
    .post("/users/auth", authController.authenticateUser, upload.single("file"), authController.uploadAccountPicture)
    .get("/users/login", loginController.getLoginPage)
    .post("/users/login", loginController.loginAccount)
    .get("/users/signup", signupController.getSignupPage)
    .post("/users/signup", signupController.signupAccount)
    .delete("/users/logout", authController.logoutAccount)
    .get("/auth/google", passport.authenticate("google", {prompt: "select_account"}))
    .get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/users/login" }), authController.googleCallback)
    .get("/auth/facebook", passport.authenticate("facebook"))
    .get("/auth/facebook/callback",passport.authenticate("facebook", { failureRedirect: "/login" }), authController.facebookCallback)
module.exports = router;