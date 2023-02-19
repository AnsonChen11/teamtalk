const PORT = 5000;
const app = require("./middleware/app");
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, { debug: true });
const { v4: uuidV4 } = require("uuid");
let drawings = [];
let undoArray = [];

app.use("/peerjs", peerServer);

io.on("connection", socket => {
    socket.on("joinRoom", (roomId, userId, username) => {
        console.log(userId, username, "joined room", roomId)
        socket.join(roomId);

        // Wait for 1 second before notifying other users of new user's connection
        setTimeout(()=>{
            socket.broadcast.to(roomId).emit("userConnected", userId, username);
            console.log("userConnected event emitted", userId);
        }, 1000);
        

        socket.on("disconnect", () => {
            socket.leave(roomId);

             // Wait for 1 second before notifying other users of user's disconnection
            setTimeout(() => {
                socket.broadcast.to(roomId).emit("userDisconnected", userId);
                console.log("userDisconnected event emitted", userId);
            }, 1000);
        });

        socket.on("chatMessage", message => {
            io.to(roomId).emit("createMessage", message, socket.id, username);
            console.log(socket.id)
        });

        socket.on("finishedScreenStream", () => {
            socket.broadcast.to(roomId).emit("removeScreenStream");
            console.log("removeScreenStream event emitted")
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
            socket.broadcast.emit("draw", data);
        });

        // socket.on("input", (data) => {
        //     console.log(data)
        //     socket.broadcast.emit("input", data);
        //     console.log("emit input, data)")
        // });
        socket.on("updateDrawings", data => {
            drawings = data;
            io.emit("updateDrawings", drawings);
        });

        socket.on("updateUndoArray", data => {
            undoArray = data;
            io.emit("updateUndoArray", undoArray);
        });
        // socket.on("undo", () => {
        //     io.emit("undo");
        // });

        // socket.on("redo", () => {
        //     io.emit("redo");
        // });
    })
});

app.post("/newMeeting", (req, res) => {
    const roomId = uuidV4();
    res.redirect(`/room/${roomId}`);
});

server.listen(PORT, () => {
    console.log(`Express is listening on localhost:${PORT}`)
})
