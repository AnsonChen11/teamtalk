const express = require("express")
const path = require("path");
const hbs = require("hbs");
const http = require("http")
const PORT = 5000
const app = express()
const server = http.createServer(app)
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true 
});
const { v4: uuidV4 } = require("uuid")


app.use("/peerjs", peerServer);

io.on("connection", socket => {
    socket.on("joinRoom", (roomId, userId) => {
        console.log(roomId, userId)
        socket.join(roomId);
        setTimeout(()=>{
            socket.broadcast.to(roomId).emit("userConnected", userId);
        }, 1000)
        console.log("userConnected事件", userId)
        
        socket.on("sendMessage", (message) => {
            socket.broadcast.to(roomId).emit("createMessage", message, userId);
            console.log("createMessage事件", message, userId)
        })

        socket.on("disconnect", () => {
            socket.leave(roomId);
            setTimeout(()=>{
                socket.broadcast.to(roomId).emit("userDisconnected", userId);
            }, 1000)
            console.log("userDisconnected事件", userId)
        })

        socket.on("chatMessage", (message) => {
            console.log("收到訊息")
            socket.broadcast.to(roomId).emit("createMessage", message, userId);
            console.log("createMessage事件", message, userId)
        })
    })
});


//設定模板引擎
app.engine("html", hbs.__express)
//設定模板位置
app.set("views", path.join(__dirname, "application", "views"))
//設定靜態檔位置
app.use(express.static(path.join(__dirname, "application")))
//使用.render回傳html位置
app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})
app.get("/:room" , (req, res) => {
    res.render("index.html", { roomId: req.params.room })
});
app.set("view engine", "hbs")

server.listen(PORT, () => {
    console.log(`Express is listening on localhost:${PORT}`)
})