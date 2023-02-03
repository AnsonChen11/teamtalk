exports.getRoom = (req, res) => {
    try{
        res.render("room.html", { roomId: req.params.room });
    }
    catch(err){
        console.error(err);
    }
};