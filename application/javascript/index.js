const socket = io("/");
console.log("connect to socket")
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const constraints = { 
    video: true, audio: true
};
myVideo.muted = true;

let myPeer = new Peer({
    path: "/peerjs",
    host: "/",
    port: "5000",
    debug: 3
});
console.log("connect to peer")
let myVideoStream;
let roomId;
let roomIdUrl = window.location.pathname;
const peers = {}

myPeer.on("open", userId => { //myPeer物件成功連接到伺服器時觸發，並會從伺服器端獲取一個唯一的 ID
    roomId = roomIdUrl.match(/([^/]+)$/)[0];
    socket.emit("joinRoom", roomId, userId);
});
    
//瀏覽器使用 getUserMedia API 獲取使用者的視訊和音訊流
navigator
    .mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream);
        console.log("獲得stream授權")
        //新成員收到連接請求後，會發出 "call" 事件，並回答通話
        myPeer.on("call", call => { //其他 myPeer物件向該myPeer發出呼叫時觸發。呼叫時，其他myPeer物件會建立一個call物件
            console.log('someone call me');
            call.answer(stream); //其他使用者發送自己的媒體流
            console.log('call and answer');
            const video = document.createElement("video");
            call.on("stream", (userVideoStream) => { //註冊stream事件，當對方連接到Peer物件時並回答呼叫，對方會發送自己的媒體流，此時觸發stream事件
                addVideoStream(video, userVideoStream) //加入其他使用者的stream
                console.log("加入新媒體")
            })
        })
        socket.on("userConnected", (userId) => {
            console.log("user-connected", userId)
            connectToNewUser(userId, stream);
        })
    })
    .catch(error => {
        console.log("Error accessing media devices.", error)
    })


function addVideoStream(video, userVideoStream){
    try{
        video.srcObject = userVideoStream;
        video.controls = false;
        video.playsinline = true;
        video.addEventListener("loadedmetadata", () => {
            video.play()
        })
        videoGrid.append(video)
    }
    catch(error){
        console.log("Error adding video.", error)
    }
}


//建立一個 myPeer.connect 到新成員的 myPeer。
function connectToNewUser(userId, stream){
    console.log('I call someone' + userId);
    const call = myPeer.call(userId, stream); 
    console.log(call)
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        console.log("收到對方接受回傳stream ")
        addVideoStream(video, userVideoStream)
    })

    call.on("close", () => { //執行完peers[userId].close()才會移除使用者video
        console.log("close on stream")
        video.remove()
    })
    peers[userId] = call
    console.log(peers, userId, call)
}

socket.on("userDisconnected", (userId) => {
    try{
        console.log(peers[userId])
        if (peers[userId]) peers[userId].close() //關閉對該使用者的連接
        console.log("斷開連線")
    }
    catch(e){
        console.log('[error]','leave room :', e);
        socket.emit('error','couldnt perform requested action');
    }
})

const audioMute = document.getElementById("video__mute");
const videoStop = document.getElementById("video__stop");
const chatToggle = document.getElementById("video__chat");
const sectionChat = document.getElementById("section__chat");
const sectionVideo = document.querySelector(".section__video");
const controlsVideo = document.querySelector(".controls__video");

chatToggle.addEventListener("click", () => {
    if(sectionChat.style.display === "none") {
        sectionChat.style.display = "block";
        sectionVideo.style.width = "75%";
        controlsVideo.style.width = "75%";
        sectionChat.style.width = "25%";
    }else{
        sectionChat.style.display = "none";
        sectionVideo.style.width = "100%";
        controlsVideo.style.width = "100%";
    }
});

audioMute.addEventListener("click", () => {
    const AudioTrack = myVideoStream.getAudioTracks()[0]; 
    if(AudioTrack.enabled === true){
        AudioTrack.enabled = false;
        audioMute.style.backgroundColor = "rgb(192, 13, 13)";
    }
    else{
        AudioTrack.enabled = true;
        audioMute.style.backgroundColor = "rgb(82, 83, 83)";
    }
})

videoStop.addEventListener("click", () => {
    const videoTrack = myVideoStream.getVideoTracks()[0]; 
    if(videoTrack.enabled === true){
        videoTrack.enabled = false;
        videoStop.style.backgroundColor = "rgb(192, 13, 13)";
    }
    else{
        videoTrack.enabled = true;
        videoStop.style.backgroundColor = "rgb(82, 83, 83)";
    }
})


const chatInput = document.getElementById("chat__input");
chatInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && chatInput.value.length !== 0){
        socket.emit("chatMessage", chatInput.value);
        chatInput.value = "";
    };
});

const messagesBorder = document.querySelector(".messagesBorder");
socket.on("createMessage", (message, userId) => {
    messagesBorder.innerHTML = messagesBorder.innerHTML + `<div class="messages"><li class="user">${userId}</li><li class="message">${message}</li></div>`;
});