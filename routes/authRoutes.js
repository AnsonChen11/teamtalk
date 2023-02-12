const express = require("express");
const authController = require("../controllers/authController");
const loginController = require("../controllers/loginController");
const signupController = require("../controllers/signupController");
const router = express.Router();

router
    .get("/users/auth", authController.authenticateUser, authController.getUserInformation)
    .put("/users/auth", authController.authenticateUser, authController.editAccountUsername)
    .get("/users/login", loginController.getLoginPage)
    .post("/users/login", loginController.loginAccount)
    .get("/users/signup", signupController.getSignupPage)
    .post("/users/signup", signupController.signupAccount)
    .delete("/users/logout", authController.logoutAccount)
    
module.exports = router;