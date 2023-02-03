console.log("456")
exports.getAuth = (req, res) => {
    try{
        res.render("auth.html")
    }
    catch(err){
        console.error(err);
    }
};