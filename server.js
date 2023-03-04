const PORT = 5000;
const Room = require("./models/roomModel")
const app = require("./middleware/app");
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, { debug: true });
// const rooms = {};
// let drawings = [];
// let undoArray = [];

app.use("/peerjs", peerServer);

io.on("connection", socket => {
    socket.on("joinRoom", (roomId, userId, username, isAudioMuted, isVideoStopped, pictureUrl) => {
        // if(!rooms[roomId]){ // 如果該房間還不存在，就創建一個新的房間
        //     rooms[roomId] = {
        //         host: socket.id,
        //         sockets: [socket.id],
        //     };
        // }
        // else{
        //     rooms[roomId].sockets.push(socket.id);
        // }
        console.log(userId, username, "joined room", roomId, "isAudioMuted", isAudioMuted, "isVideoStopped", isVideoStopped)
        socket.join(roomId);
        // Wait for 1 second before notifying other users of new user's connection
        setTimeout(()=>{
            socket.broadcast.to(roomId).emit("userConnected", userId, username, isAudioMuted, isVideoStopped, pictureUrl);
            console.log("userConnected event emitted", userId, isAudioMuted, isVideoStopped, pictureUrl);
        }, 1000);
        

        socket.on("disconnect", () => {
            socket.leave(roomId);
            // Wait for 1 second before notifying other users of user's disconnection
            setTimeout(() => {
                socket.broadcast.to(roomId).emit("userDisconnected", userId);
                console.log("userDisconnected event emitted", userId);
            }, 1000);
            // const roomId = socket.roomId;
            // if(roomId && rooms[roomId]){
            //     const index = rooms[roomId].sockets.indexOf(socket.id);
            //     if(index !== -1){ //-1表示socket.id 在房間中不存在
            //         rooms[roomId].sockets.splice(index, 1);
            //         setTimeout(() => {
            //             socket.broadcast.to(roomId).emit("userDisconnected", userId);
            //             console.log("userDisconnected event emitted", userId);
            //         }, 1000);
            //         // 如果該使用者是 host，則刪除整個房間
            //         if(socket.id === rooms[roomId].host){
            //             delete rooms[roomId];
            //             console.log("55行", rooms)
            //             deleteRoom(roomId)
            //         }
            //         socket.leave(roomId);
            //     }
            // }
        });

        socket.on("chatMessage", (username, message) => {
            io.to(roomId).emit("createMessage", message, socket.id, username);
            console.log(socket.id)
        });

        socket.on("finishedScreenStream", () => {
            socket.broadcast.to(roomId).emit("removeScreenStream");
            console.log("removeScreenStream event emitted")
        });

        socket.on("audioStatus", (id, audioStatus) => {
            socket.broadcast.to(roomId).emit("audioStatusControl", id, audioStatus);
            console.log("audioStatus", id, audioStatus)
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

        // socket.on("updateDrawings", data => {
        //     drawings = data;
        //     io.emit("updateDrawings", drawings);
        // });
        
        socket.on("clearCanvas", (data) => {
            socket.broadcast.to(roomId).emit("updateCanvas", {canvasId: data.canvasId}); // 向房間中所有的 client 發送 "updateCanvas" 事件
        });
        // socket.on("input", (data) => {
        //     console.log(data)
        //     socket.broadcast.emit("input", data);
        //     console.log("emit input, data)")
        // });

        // socket.on("updateUndoArray", data => {
        //     undoArray = data;
        //     io.emit("updateUndoArray", undoArray);
        // });
        // socket.on("undo", () => {
        //     io.emit("undo");
        // });

        // socket.on("redo", () => {
        //     io.emit("redo");
        // });
    })
});

// const deleteRoom = async (roomId) => {
//     try{
//         await Room.findOneAndDelete({ roomId: roomId });
//         console.log(`Room ${roomId} is deleted from the database.`);
//     } 
//     catch(err){
//         console.error(err);
//     }
// };
// app.post("/newMeeting", (req, res) => {
//     const uuidString = uuidV4()
//     const roomId = uuidString.substring(0, 13);
//     res.redirect(`/room/${roomId}`);
// });

server.listen(PORT, () => {
    console.log(`Express is listening on localhost:${PORT}`)
})
