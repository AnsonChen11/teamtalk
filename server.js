const PORT = 5000
const app = require("./middleware/app");
const http = require("http")
const server = http.createServer(app)
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true 
});
const { v4: uuidV4 } = require("uuid")


app.use("/peerjs", peerServer);

io.on("connection", socket => {
    socket.on("joinRoom", (roomId, userId, username) => {
        console.log(userId, username, "加入房間", roomId)
        socket.join(roomId);
        setTimeout(()=>{
            socket.broadcast.to(roomId).emit("userConnected", userId);
        }, 1000);
        console.log("userConnected事件", userId)

        socket.on("disconnect", () => {
            socket.leave(roomId);
            setTimeout(() => {
                socket.broadcast.to(roomId).emit("userDisconnected", userId);
            }, 1000)
            console.log("userDisconnected事件", userId)
        });

        socket.on("chatMessage", (message) => {
            io.to(roomId).emit("createMessage", message, socket.id, username);
            console.log(socket.id)
        });

        socket.on("finishedScreenStream", (screenStream) => {
            socket.broadcast.to(roomId).emit("removeScreenStream", screenStream);
            console.log("發送removeScreenStream事件", screenStream)
        });

        socket.on("audioStatus", (id, audioStatus) => {
            socket.broadcast.to(roomId).emit("audioStatusControl", id, audioStatus);
        });
    })
});

app.post("/newMeeting", (req, res) => {
    const roomId = uuidV4();
    res.redirect(`/room/${roomId}`);
});

server.listen(PORT, () => {
    console.log(`Express is listening on localhost:${PORT}`)
})
