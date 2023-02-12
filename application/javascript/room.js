let username = authentication()
/*-------------------------------socket連線到伺服器----------------------------------------------*/
const socket = io.connect("/", {secure: true});
// const socket = io("/");
const videoContainer = document.querySelector(".video__container");
let videoCount = 0;
const myVideo = document.createElement("video");
const myVideoGrid = document.createElement("div")
const constraints = { 
    video: true, audio: true
};
myVideo.muted = true;
// let myPeer = new Peer({ path: "/peerjs", host: "/",  port: "5000", debug: 3 });

/*-------------------------------初始化peer連線----------------------------------------------*/
let myPeer = new Peer({
    secure: true,
    // debug: 3
});
console.log("connect to peer")
let myVideoStream;
let roomId;
let roomIdUrl = window.location.pathname;
const peers = {}
/*-------------------------------peer打開連線----------------------------------------------*/

//myPeer物件成功連接到伺服器時觸發，並會從伺服器端獲取一個唯一的 ID
myPeer.on("open", userId => { 
    roomId = roomIdUrl.match(/([^/]+)$/)[0];
    console.log(username)
    console.log(userId)
    myVideoGrid.id = userId
    myVideoGrid.classList.add("self")
    createPinIcon(myVideoGrid)
    socket.emit("joinRoom", roomId, userId, username);
});
    
/*-------------------------------利用getUserMedia獲得使用者的音視訊串流----------------------------------------------*/
navigator
    .mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
        myVideoStream = stream;
        addVideoStream(myVideoGrid, myVideo, stream);
        console.log("獲得stream授權")
        /*-------------------------------監聽是否有新成員收到連接請求，若有責會發出"call"事件，並回答通話(call.answer)----------------------------------------------*/
        //(其他使用者端)其他 myPeer物件向該myPeer發出呼叫時觸發。呼叫時，其他myPeer物件會建立一個call物件
        myPeer.on("call", call => { 
            console.log("someone call me");
            console.log(call.peer)
            //此為分享畫面的串流，做特殊處理
            if(call.metadata.type === "screen-sharing"){ 
                const videoGrid = document.createElement("div")
                const video = document.createElement("video");
                videoGrid.id = call.peer
                createPinIcon(videoGrid)
                video.classList = "screenVideo";
                videoGrid.classList.add("screenVideoGrid")
                call.answer(stream);
                //註冊stream事件，當對方連接到Peer物件時並回答呼叫，對方會發送自己的媒體流，此時觸發stream事件
                call.on("stream", (shareScreenStream) => { 
                    //加入其他使用者的stream
                    addVideoStream(videoGrid, video, shareScreenStream) 
                    console.log("加入分享畫面")
                })
            }
            //此為加入房間的串流，做一般處理
            if(call.metadata.type === "join-room"){ 
                const videoGrid = document.createElement("div")
                const video = document.createElement("video");
                videoGrid.id = call.peer
                createPinIcon(videoGrid)
                //其他使用者發送自己的媒體流
                call.answer(stream); 
                let count = 0;
                //註冊stream事件，當對方連接到Peer物件時並回答呼叫，對方會發送自己的媒體流，此時觸發stream事件
                call.on("stream", (userVideoStream) => { 
                    count = count + 1;
                    if(count == 2){
                        return
                    }
                    else{
                        //加入其他使用者的stream
                        addVideoStream(videoGrid, video, userVideoStream) 
                        console.log("加入一般視訊媒體")
                    }
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
function addVideoStream(videoGrid, video, userVideoStream){
    try{
        videoGrid.className = "video-grid"
        video.srcObject = userVideoStream;
        video.controls = false;
        video.playsinline = true;
        video.autoplay = true;
        video.muted = true;
        video.addEventListener("loadedmetadata", () => {
            video.play()
        })
        videoGrid.appendChild(video)
        videoContainer.appendChild(videoGrid)
        console.log("加入媒體串流")
        videoCount++;
        console.log(videoCount)
        updateGridTemplate();

    }
    catch(error){
        console.log("Error adding video.", error)
    }
}

/*-------------------------------釘選畫面及圖示----------------------------------------------*/
const thumbtacks = document.querySelectorAll(".video-grid__thumbtack");
document.addEventListener("click", (e) => {
    thumbtacksController(e)
});

function thumbtacksController(e){
    const thumbtack = e.target.closest(".video-grid__thumbtack");
    const videoGrids = document.querySelectorAll(".video-grid");
    if (thumbtack){
        if(thumbtack.style.color === "rgb(44, 128, 212)"){ //取消釘選
            videoGrids.forEach(videoGrid => {
                const thumbtackInGrid = videoGrid.querySelector(".video-grid__thumbtack");
                if(thumbtackInGrid.style.color !== "rgb(44, 128, 212)"){
                    videoGrid.style.display = "block";
                    updateGridTemplate()
                    console.log("其他畫面出現")
                }
                // else{
                //     videoGrid.style.display = "none";
                //     console.log("釘選")
                // }
            })
            thumbtack.style.color = "";
            thumbtack.classList.remove("pinned");
            updateGridTemplate()
            console.log("釘選畫面解除")
        } 
        else{//釘選畫面
            thumbtack.style.color = "rgb(44, 128, 212)";
            thumbtack.classList.add("pinned");
            videoGrids.forEach(videoGrid => {
                const thumbtackInGrid = videoGrid.querySelector(".video-grid__thumbtack");
                if(thumbtackInGrid.style.color === "rgb(44, 128, 212)"){
                    videoGrid.style.display = "block";
                    updateGridTemplate()
                    console.log("釘選畫面開始")
                }
                else{
                    videoGrid.style.display = "none";
                    updateGridTemplate()
                    console.log("其他畫面隱藏")
                }
            })
            
        }
    }
}

function createPinIcon(videoGrid){
    console.log(username)
    videoGrid.insertAdjacentHTML("beforeend", `
    <div class="video-grid__thumbtack">
        <i class="fa-solid fa-thumbtack"></i>
    </div>
    <div class="video-grid__microphone">
        <i class="fa-solid fa-microphone"></i>
        <i class="fa-solid fa-microphone-slash" style="display: none;"></i>
    </div>
    <div class="pinnedUsername">
        <div>${username}</div>
    </div>
    `);
}



/*-------------------------------畫面呈現grid網格----------------------------------------------*/
function updateGridTemplate(){
    let columns = Math.ceil(Math.sqrt(videoCount));
    let rows = Math.ceil(videoCount / columns);
    console.log("columns", columns, "rows", rows)
    let template = "";
    let pinnedVideo = document.querySelector(".pinned");
    if(pinnedVideo){
        videoContainer.style.gridTemplateColumns = "1fr";
        videoContainer.style.gridTemplateRows = "1fr";
    }
    else{
        for (let i = 0; i < columns; i++) {
            template += "1fr ";
        }
        videoContainer.style.gridTemplateColumns = template;
        template = "";
        
        for (let i = 0; i < rows; i++) {
            template += "1fr ";
        }
        videoContainer.style.gridTemplateRows = template;
    }
    if(videoCount === 1){
        videoContainer.style.width = "70%";
        videoContainer.style.height = "85%";
    } 
    else if(videoCount === 2){
        videoContainer.style.width = "85%";
    } 
    else if(videoCount >= 3){
        videoContainer.style.width = "95%";
        videoContainer.style.height = "95%";
    } 
    else{
        videoContainer.style.width = "95%";
    }
}
/*-------------------------------建立peer.connect到新成員的peer----------------------------------------------*/
function connectToNewUser(userId, stream){
    console.log('I call someone     ' + userId);
    //加入type判斷是屬於哪種類型的媒體串流
    const call = myPeer.call(userId, stream, {metadata: {type: "join-room"}}); 
    console.log(call)
    const videoGrid = document.createElement("div")
    const video = document.createElement("video");
    videoGrid.id = userId
    createPinIcon(videoGrid)
    let count = 0;
    call.on("stream", (userVideoStream) => {
        count = count + 1;
        if(count == 2){
            return
        } 
        else {
            console.log("收到對方接受回傳stream ")
            addVideoStream(videoGrid, video, userVideoStream)
        }
    })

    call.on("close", () => { 
        //執行完peers[userId].close()才會移除使用者video
        console.log("close on stream")
        video.remove();
        videoGrid.remove()
        videoCount--;
        updateGridTemplate()
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
    const self = document.querySelector(".self");
    const id = self.getAttribute("id");
    const controlsVideo = document.querySelector(".controls__video");
    const audioTrack = myVideoStream.getAudioTracks()[0]; 
    const selfAudioIcon = self.querySelector(".fa-microphone")
    const selfAudioSlashIcon = self.querySelector(".fa-microphone-slash")
    const audioIcon = controlsVideo.querySelector(".fa-microphone")
    const audioSlashIcon = controlsVideo.querySelector(".fa-microphone-slash")
    if(audioTrack.enabled === true){
        audioTrack.enabled = false;
        audioMute.style.backgroundColor = "rgb(192, 13, 13)";
        selfAudioIcon.style.display = "none";
        audioIcon.style.display = "none";
        selfAudioSlashIcon.style.display = "block";
        audioSlashIcon.style.display = "block";
        socket.emit("audioStatus", id, {muted: true})
    }
    else{
        audioTrack.enabled = true;
        audioMute.style.backgroundColor = "rgb(82, 83, 83)";
        selfAudioIcon.style.display = "block";
        audioIcon.style.display = "block";
        selfAudioSlashIcon.style.display = "none";
        audioSlashIcon.style.display = "none";
        socket.emit("audioStatus", id, {muted: false});
    }
});

socket.on("audioStatusControl", (id, audioStatus) => {
    const remoteId = document.getElementById(id);

    const remoteAudioIcon = remoteId.querySelector(".fa-microphone");
    const remoteAudioSlashIcon = remoteId.querySelector(".fa-microphone-slash");
    if(audioStatus.muted === true){
        remoteAudioIcon.style.display = "none";
        remoteAudioSlashIcon.style.display = "block";
    }
    else {
        remoteAudioIcon.style.display = "block";
        remoteAudioSlashIcon.style.display = "none";
    }
});

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
                const videoGrid = document.createElement("div")
                video.classList = "screenVideo";
                createPinIcon(videoGrid)
                addVideoStream(videoGrid, video, screenStream);
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
                    videoGrid.remove()
                    videoCount--;
                    console.log("結束分享螢幕");
                    const videoGrids = document.querySelectorAll(".video-grid");
                    videoGrids.forEach(videoGrid => {
                        const thumbtackInGrid = videoGrid.querySelector(".video-grid__thumbtack");
                        if(thumbtackInGrid.style.color !== "rgb(44, 128, 212)"){
                            videoGrid.style.display = "block";
                            updateGridTemplate()
                            console.log("其他畫面出現")
                            console.log("更新grid畫面");
                        }
                    });
                });
            });
    } 
    catch(error){
        console.error(`Error: ${error}`);
    }
});

function shareScreenToPeers(screenStream, connectedPeers){
    connectedPeers.forEach(peerId => {
        //加入type判斷是屬於哪種類型的媒體串流
        myPeer.call(peerId, screenStream, { metadata: { type: "screen-sharing" } }); 
        console.log("通知所有使用者開始分享畫面")
    });
};


socket.on("removeScreenStream", (video) => {
    console.log(video)
    const screenVideo = document.querySelector(".screenVideo")
    const screenVideoGrid = document.querySelector(".screenVideoGrid")
    screenVideo.remove();
    screenVideoGrid.remove()
    videoCount--;
    const videoGrids = document.querySelectorAll(".video-grid");
    videoGrids.forEach(videoGrid => {
        const thumbtackInGrid = videoGrid.querySelector(".video-grid__thumbtack");
        if(thumbtackInGrid.style.color !== "rgb(44, 128, 212)"){
            videoGrid.style.display = "block";
            updateGridTemplate()
            console.log("其他畫面出現")
            console.log("更新grid畫面");
        }
    });
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
const messageTime = document.querySelectorAll(".messageTime");
let lastUserId = "";
socket.on("createMessage", (message, userId, username) => {
    const myUsernameColor = socket.id === userId ? "#00b028" : "#0372c9";
    const messagePosition = socket.id === userId ? 'style="display: flex; flex-direction: column; align-items: flex-end;"'  : "";
    const messageTimePosition = socket.id === userId ? "" : 'style="left: 105%;"'
    const time = new Date().toLocaleTimeString("en-US", {hour12: true, hour: "2-digit", minute:"2-digit"});
    if(socket.id === userId){
        usernameDisplay = 'style="display: none;"'
        lastUserId = userId;
    }
    else{
        if(userId !== lastUserId){
            usernameDisplay = "";
        } 
        else{
            usernameDisplay = 'style="display: none;"';
        }
        lastUserId = userId;
    }
    messagesBorder.innerHTML = messagesBorder.innerHTML + `
        <div class="messages" ${messagePosition}>
            <li class="messageUser" ${usernameDisplay}>${username}</li>
            <li class="message" style="background-color:${myUsernameColor};"><div class="messageTime" ${messageTimePosition}>${time}</div>${message}</li>
            
        </div>`;
});

// const messagesBorder = document.querySelector(".messagesBorder");
// socket.on("createMessage", (message, userId, username) => {
//     const myUsernameColor = socket.id === userId ? "#00b028" : "#0372c9";
//     const messagePosition = socket.id === userId ? 'style="display: flex; flex-direction: column; align-items: flex-end;"'  : "";
//     const usernameDisplay = socket.id === userId ? 'style="display: none;"'  : "";
//     const time = new Date().toLocaleTimeString("en-US", {hour12: true, hour: "2-digit", minute:"2-digit"});
//     messagesBorder.innerHTML = messagesBorder.innerHTML + `
//         <div class="messages" ${messagePosition}>
//             <li class="messageUser" ${usernameDisplay}>${username}</li>
//             <li class="message" style="background-color:${myUsernameColor};">${message} <li class="messageTime">${time}</li></li>
           
//         </div>`;
// });

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
        let fileName = "TeamTalk_recording_" + Date.now() + ".webm"
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

/*-------------------------------驗證使用者----------------------------------------------*/
async function authentication(){
    let token = getCookie("token"); // 取得cookie中的token
    if(!token){
		alert("請先登入")
        window.location.href = "/";
        return
    }
    try{
		await fetch("/users/auth", {
            method: "GET",
			headers: {
				"Authorization": `Bearer ${token}`
			}
        })
        .then(response => {
            if(!response.ok){
			    alert("請先登入")
			    window.location.href = "/";
		    }
            return response.json()
        })
        .then(data => {
            username = data.username;
            return username
            // accountProfileEmail.textContent = data.email;
            // accountBtn.textContent = data.username[0].toUpperCase()
        })
    }
    catch(error){
		alert("請先登入")
        window.location.href = "/";
    }
}

function getCookie(key) {
	let value = "; " + document.cookie;
	let parts = value.split("; " + key + "=");
	if(parts.length === 2){
		return parts.pop().split(";").shift();
	}
}
  