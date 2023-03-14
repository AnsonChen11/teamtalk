const PORT = 5000;
const app = require("./middleware/app");
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, { debug: true });

app.use("/peerjs", peerServer);

io.on("connection", socket => {
    socket.on("joinRoom", (roomId, userId, username, isAudioMuted, isVideoStopped, pictureUrl) => {
        console.log(userId, username, "joined room", roomId, "isAudioMuted", isAudioMuted, "isVideoStopped", isVideoStopped)
        socket.join(roomId);
        // Wait for 1 second before notifying other users of new user's connection
        setTimeout(()=>{
            socket.broadcast.to(roomId).emit("userConnected", userId, username, isAudioMuted, isVideoStopped, pictureUrl);
        }, 1000);
        

        socket.on("disconnect", () => {
            socket.leave(roomId);
            // Wait for 1 second before notifying other users of user's disconnection
            setTimeout(() => {
                socket.broadcast.to(roomId).emit("userDisconnected", userId);
            }, 1000);
        });

        socket.on("chatMessage", (username, message) => {
            io.to(roomId).emit("createMessage", message, socket.id, username);
        });

        socket.on("finishedScreenStream", () => {
            socket.broadcast.to(roomId).emit("removeScreenStream");
        });

        socket.on("audioStatus", (id, audioStatus) => {
            socket.broadcast.to(roomId).emit("audioStatusControl", id, audioStatus);
        });

        socket.on("videoStop", (id, profileUrl) => {
            socket.broadcast.to(roomId).emit("videoStopControl", id, profileUrl);
        })

        socket.on("videoOpen", (id) => {
            socket.broadcast.to(roomId).emit("videoOpenControl", id);
        })

        socket.on("draw", (data) => {
            socket.broadcast.emit("drawToRemote", data);
        });
        
        socket.on("clearCanvas", (data) => {
            socket.broadcast.to(roomId).emit("updateCanvas", {canvasId: data.canvasId});
        });
    })
});

server.listen(PORT, () => {
    console.log(`Express is listening on localhost:${PORT}`)
})
