const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    if(!token){
        console.log("驗證失敗")
        return res.status(401).send({ message: "Access denied. No token provided." });
    }

    try{
        const decoded = jwt.verify(token, process.env.secret_key);
        const id = decoded.id;
        const username = decoded.username;
        const email = decoded.email;
        // req.user = decoded;

        res.send({ 
            message: "Valid successfully.",
            id: id,
            username: username,
            email: email
        });
        next();
    }
    catch(err){
        res.status(400).send({ message: "Invalid token." });
    }
};

const logoutAccount = async (req, res) => {
    try{
        req.session.destroy(err => {
            if(err){
                res.status(500).send({ message: err });
            } 
            else{
                res.status(200).send({ message: "Logout successfully." });
            }
        });
    } 
    catch(err){
        res.status(500).send({ message: err })
    }
};

module.exports = { 
    authenticateUser,
    logoutAccount
}