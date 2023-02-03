
/*-------------------------------socket連線到伺服器----------------------------------------------*/
const socket = io.connect("/", {secure: true});
// const socket = io("/");
console.log("connect to socket")
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const constraints = { 
    video: true, audio: true
};
myVideo.muted = true;

// let myPeer = new Peer({
//     path: "/peerjs",
//     host: "/",
//     port: "5000",
//     debug: 3
// });

/*-------------------------------初始化peer連線----------------------------------------------*/
let myPeer = new Peer({
    secure: true
});
console.log("connect to peer")
let myVideoStream;
let roomId;
let roomIdUrl = window.location.pathname;
const peers = {}
/*-------------------------------peer打開連線----------------------------------------------*/
myPeer.on("open", userId => { //myPeer物件成功連接到伺服器時觸發，並會從伺服器端獲取一個唯一的 ID
    roomId = roomIdUrl.match(/([^/]+)$/)[0];
    socket.emit("joinRoom", roomId, userId);
});
    
/*-------------------------------利用getUserMedia獲得使用者的音視訊串流----------------------------------------------*/
navigator
    .mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream);
        console.log("獲得stream授權")
        /*-------------------------------監聽是否有新成員收到連接請求，若有責會發出"call"事件，並回答通話(call.answer)----------------------------------------------*/
        myPeer.on("call", call => { //其他 myPeer物件向該myPeer發出呼叫時觸發。呼叫時，其他myPeer物件會建立一個call物件
            console.log('someone call me');
            if(call.metadata.type === "screen-sharing"){ //此為分享畫面的串流，做特殊處理
                const video = document.createElement("video");
                video.classList = "screenVideo";
                call.answer(stream);
                call.on("stream", (shareScreenStream) => { //註冊stream事件，當對方連接到Peer物件時並回答呼叫，對方會發送自己的媒體流，此時觸發stream事件
                    addVideoStream(video, shareScreenStream) //加入其他使用者的stream
                    console.log("加入分享畫面")
                })
            }
            if(call.metadata.type === "join-room"){ //此為加入房間的串流，做一般處理
                const video = document.createElement("video");
                call.answer(stream); //其他使用者發送自己的媒體流
                call.on("stream", (userVideoStream) => { //註冊stream事件，當對方連接到Peer物件時並回答呼叫，對方會發送自己的媒體流，此時觸發stream事件
                    addVideoStream(video, userVideoStream) //加入其他使用者的stream
                    console.log("加入一般視訊媒體")
                })
            }
        })
        /*-------------------------------監聽使用者連線----------------------------------------------*/
        socket.on("userConnected", (userId) => {
            connectToNewUser(userId, stream);
        })
    })
    .catch(error => {
        console.log("Error accessing media devices.", error)
    })

/*-------------------------------加入音視訊顯示於畫面上----------------------------------------------*/
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


/*-------------------------------建立peer.connect到新成員的peer----------------------------------------------*/
function connectToNewUser(userId, stream){
    console.log('I call someone' + userId);
    const call = myPeer.call(userId, stream, {metadata: {type: "join-room"}}); //加入type判斷是屬於哪種類型的媒體串流
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
/*-------------------------------監聽使用者離線----------------------------------------------*/
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

/*-------------------------------控制按鈕----------------------------------------------*/
const videoRecord = document.getElementById("video__record");
const videoRecordResume = document.getElementById("video__record__resume");
const videoRecordPause = document.getElementById("video__record__pause");
const videoRecordStop = document.getElementById("video__record__stop");
const audioMute = document.getElementById("video__mute");
const videoStop = document.getElementById("video__stop");
const shareScreen = document.getElementById("video__shareScreen");
const chatToggle = document.getElementById("video__chat");
const disconnect = document.getElementById("video__disconnect");
const sectionChat = document.getElementById("section__chat");
const sectionVideo = document.querySelector(".section__video");
const controlsVideo = document.querySelector(".controls__video");



/*-------------------------------控制音訊開關----------------------------------------------*/
audioMute.addEventListener("click", () => {
    const audioTrack = myVideoStream.getAudioTracks()[0]; 
    const audioIcon = document.querySelector(".fa-microphone")
    const audioSlashIcon = document.querySelector(".fa-microphone-slash")
    if(audioTrack.enabled === true){
        audioTrack.enabled = false;
        audioMute.style.backgroundColor = "rgb(192, 13, 13)";
        audioIcon.style.display = "none";
        audioSlashIcon.style.display = "block";
    }
    else{
        audioTrack.enabled = true;
        audioMute.style.backgroundColor = "rgb(82, 83, 83)";
        audioIcon.style.display = "block";
        audioSlashIcon.style.display = "none";
    }
})
/*-------------------------------控制視訊開關----------------------------------------------*/
videoStop.addEventListener("click", () => {
    const videoTrack = myVideoStream.getVideoTracks()[0]; 
    const videoIcon = document.querySelector(".fa-video")
    const videoSlashIcon = document.querySelector(".fa-video-slash")
    if(videoTrack.enabled === true){
        videoTrack.enabled = false;
        videoStop.style.backgroundColor = "rgb(192, 13, 13)";
        videoIcon.style.display = "none";
        videoSlashIcon.style.display = "block";
    }
    else{
        videoTrack.enabled = true;
        videoStop.style.backgroundColor = "rgb(82, 83, 83)";
        videoIcon.style.display = "block";
        videoSlashIcon.style.display = "none";
    }
})
/*-------------------------------分享螢幕畫面----------------------------------------------*/
shareScreen.addEventListener("click", () => {
    try{
        navigator
            .mediaDevices
            .getDisplayMedia()
            .then(screenStream => {
                const video = document.createElement("video");
                video.classList = "screenVideo";
                addVideoStream(video, screenStream);
                shareScreen.style.backgroundColor = "rgb(58, 173, 102)";
                shareScreen.disabled = true;
                const connectedPeers = Object.keys(myPeer.connections);

                if(connectedPeers.length > 0){
                    shareScreenToPeers(screenStream, connectedPeers)
                }
                
                screenStream.getVideoTracks()[0].addEventListener("ended", () => {
                    socket.emit("finishedScreenStream", video);
                    console.log("發送finishedScreenStream事件", )
                    shareScreen.disabled = false;
                    shareScreen.style.backgroundColor = "rgb(82, 83, 83)";
                    video.remove();
                    console.log("結束分享螢幕");
                });
            });
    } 
    catch(error){
        console.error(`Error: ${error}`);
    }
});

function shareScreenToPeers(screenStream, connectedPeers){
    connectedPeers.forEach(peerId => {
        myPeer.call(peerId, screenStream, { metadata: { type: "screen-sharing" } }); //加入type判斷是屬於哪種類型的媒體串流
        console.log("通知所有使用者")
    });
};

socket.on("removeScreenStream", (video) => {
    console.log(video)
    const screenVideo = document.querySelector(".screenVideo")
    screenVideo.remove();
    console.log("移除新的video")
})


/*-------------------------------聊天室----------------------------------------------*/
chatToggle.addEventListener("click", () => {
    if(sectionChat.style.display === "none") {
        sectionChat.style.display = "block";
        sectionVideo.style.width = "75%";
        controlsVideo.style.width = "75%";
        sectionChat.style.width = "25%";
    }
    else{
        sectionChat.style.display = "none";
        sectionVideo.style.width = "100%";
        controlsVideo.style.width = "100%";
    }
});

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

/*-------------------------------螢幕錄影----------------------------------------------*/
videoRecord.addEventListener("click", async() => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        displaySurface: "screen" 
    });

    const options = {
        mimeType: "video/webm; codecs=vp9",
    };

    mediaRecorder = new MediaRecorder(screenStream, options);
    console.log(mediaRecorder)
    console.log(mediaRecorder.state)
    const chunks = [];
    videoRecord.style.display = "none";
    videoRecordPause.style.display = "block";
    videoRecordStop.style.display = "block";
    videoRecordController(mediaRecorder)
    mediaRecorder.start(1000);
    mediaRecorder.addEventListener("dataavailable", (event) => {
        chunks.push(event.data);
        console.log(chunks);
    });

    videoRecordStop.addEventListener("click", () => {
        console.log("停止錄製")
        mediaRecorder.stop();
        const recordedBlob = new Blob(chunks, { type: "video/webm; codecs=vp9" });
        const recordedUrl = URL.createObjectURL(recordedBlob);
        const a = document.createElement("a");
        let fileName = "teamtalk_recording_" + Date.now() + ".webm"
        a.href = recordedUrl;
        a.download = fileName;
        a.click();
        videoRecord.style.display = "block";
        videoRecordPause.style.display = "none";
        videoRecordStop.style.display = "none";
        videoRecordPause.innerHTML = '<i class="fa-solid fa-pause"></i><div>Pause</div>'
    });
})

function videoRecordController(mediaRecorder){
    videoRecordPause.addEventListener("click", () => {
        if(mediaRecorder.state === "recording"){
            mediaRecorder.pause();
            videoRecordPause.innerHTML = '<i class="fa-solid fa-play"></i><div>Resume</div>'
            console.log("暫停錄製")
        }
        else if(mediaRecorder.state === "paused"){
            mediaRecorder.resume();
            videoRecordPause.innerHTML = '<i class="fa-solid fa-pause"></i><div>Pause</div>'
            console.log("正在錄製")
        }
    });
}

/*-------------------------------結束通話----------------------------------------------*/
disconnect.addEventListener("click", () => {
    console.log("Disconnect")
    window.location.href = "/"
})