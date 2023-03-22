const dotenv = require("dotenv");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
dotenv.config();
const mongoURI = process.env.mongoDB_uri;

const DBConnectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};


// const connectToMongoDB  = () =>{
//     mongoose.connect(
//         mongoURI,
//         DBConnectOptions
//     )
//     .then(() => console.log("MongoDB Connected."))
//     .catch((err) => console.log(err));
// };
const connectToMongoDB = async() => {
    try{
      await mongoose.connect(mongoURI, DBConnectOptions);
      return "MongoDB Connected.";
    } 
    catch (err){
      return err;
    }
};

module.exports = { connectToMongoDB };