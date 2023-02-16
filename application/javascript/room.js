/*-------------------------------驗證使用者----------------------------------------------*/
let username = authentication().username
let pictureUrl = authentication().pictureUrl
/*-------------------------------socket連線到伺服器----------------------------------------------*/
const socket = io.connect("/", {secure: true});
/*-------------------------------初始化peer連線----------------------------------------------*/
const myPeer = new Peer({ secure: true, }); // debug: 3
const peers = {}
/*-------------------------------初始化peer連線----------------------------------------------*/
let roomId;
let roomIdUrl = window.location.pathname;
let myStream
let myUserId
// let videoCount = 0;
const videoContainer = document.querySelector(".video__container");
const constraints = { video: true, audio: true };

/*-------------------------------peer打開連線----------------------------------------------*/
//local端成功連接到peer伺服器時觸發，並會回傳一個唯一的ID
myPeer.on("open", userId => { 
    console.log("myUserId", userId)
    myUserId = userId
    const video = createUserSections(userId, username)
    roomId = roomIdUrl.match(/([^/]+)$/)[0];
    socket.emit("joinRoom", roomId, userId);
    console.log("emit joinRoom", roomId, userId)
    getUserMedia(video)
    console.log(username)
    console.log(pictureUrl)
});

function createUserSections(userId, username){
    const html = `
    <div class="userSection" id="${userId}">
        <div class="video-grid">
            <video id="${userId}-video"></video>
        </div>
        <div class="profile_pic_grid" style="display: none;">
            <div class="profile_pic_container">
                <img class="profile_pic" src="${pictureUrl}">
            </div>
        </div>
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
    </div>
    `
    videoContainer.insertAdjacentHTML("beforeend", html)
    const video = document.getElementById(`${userId}-video`);
    return video
}

function getUserMedia(video){
    try{
        navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            myStream = stream
            addVideoStream(video, stream)
        })
    }
    catch(error){
        console.log("Error getUserMedia.", error)
    }
}

/*-------------------------------加入音視訊顯示於畫面上----------------------------------------------*/
function addVideoStream(video, stream){
    try{
        video.srcObject = stream;
        video.addEventListener("loadedmetadata", () => {
            video.play()
        })
        // videoCount++;
        updateGridTemplate();
    }
    catch(error){
        console.log("Error adding video.", error)
    }
}

/*--------------------------監聽是否有新成員收到連接請求，若有責會發出"call"事件，並回答通話(call.answer)-----------------------------*/
//(remote視角)其他 myPeer物件向該myPeer發出呼叫時觸發。呼叫時，其他myPeer物件會建立一個call物件
myPeer.on("call", call => { 
    console.log("someone call me", call.peer);
    //此為分享畫面的串流，做特殊處理
    if(call.metadata.type === "screen-sharing"){ 
        // const { username } = call.metadata;
        const { screenSharingVideo } = createScreenSharingSection(username)
        call.answer(myStream);
        //註冊stream事件，當對方連接到Peer物件時並回答呼叫，對方會發送自己的媒體流，此時觸發stream事件
        call.on("stream", (shareScreenStream) => { 
            //加入其他使用者的stream
            addVideoStream(screenSharingVideo, shareScreenStream) 
            console.log("加入分享畫面")
        })
    }
    //此為加入房間的串流，做一般處理
    if(call.metadata.type === "join-room"){ 
        //其他使用者回覆自己的媒體流
        console.log(call)
        const { username } = call.metadata; // Extract userId and username from metadata
        const userId = call.peer
        call.answer(myStream); //回覆remote的自己stream
        let count = 0;
        //註冊stream事件，當對方連接到Peer物件時並回答呼叫，對方會發送自己的媒體流，此時觸發stream事件
        call.on("stream", (remoteStream) => { //其他端收到後回覆該端的stream
            count = count + 1;
            if(count == 2){
                return
            }
            else{
                //加入remote視角的remote(其他使用者)的stream
                const video = createUserSections(userId, username);
                addVideoStream(video, remoteStream);
            }
        })
    }
})
/*-------------------------------(local)監聽使用者連線----------------------------------------------*/
socket.on("userConnected", (userId, username) => {
    const call = myPeer.call(userId, myStream, {metadata: {type: "join-room", username: username}}); //remoteId, localStream to sent to remote
    console.log(myStream)
    let count = 0;
    call.on("stream", (remoteStream) => { //remoteId received and sent remoteStream to local
        count = count + 1;
        if(count == 2){
            return
        } 
        else {
            console.log("收到對方接受回傳stream ", remoteStream)
            const video = createUserSections(userId, username)
            addVideoStream(video, remoteStream)
        }
    });

    call.on("close", (call) => { 
        console.log("close on stream")
    });
    peers[userId] = call
    console.log(peers)
});

/*-------------------------------釘選畫面及圖示----------------------------------------------*/
document.addEventListener("click", (e) => {
    const thumbtack = e.target.closest(".video-grid__thumbtack")
    if(thumbtack){
        const userId = thumbtack.parentNode.id
        const userSections = document.querySelectorAll(".userSection")
        if(thumbtack.style.color !== "rgb(44, 128, 212)"){
            userSections.forEach((userSection) => {
                if(userSection.id === userId){
                  userSection.style.display = "block"
                  thumbtack.style.color = "rgb(44, 128, 212)"
                  updateGridTemplate()
                } 
                else{
                  userSection.style.display = "none"
                  updateGridTemplate()
                }
            })
        }
        else{
            userSections.forEach((userSection) => {
                userSection.style.display = "block"
                thumbtack.style.color = ""
                updateGridTemplate()
            })
        }

    }
});

/*-------------------------------畫面呈現grid網格----------------------------------------------*/
function updateGridTemplate(){
    let invisibleCount = 0
    const userSections = document.querySelectorAll(".userSection")
    userSections.forEach(userSection => {
        if (userSection.style.display === "none") {
            invisibleCount++;
        }
    });
    videoCount = userSections.length - invisibleCount
    console.log(videoCount)
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

/*-------------------------------監聽使用者離線----------------------------------------------*/
socket.on("userDisconnected", (userId) => {
    try{
        console.log(peers[userId])
        if (peers[userId]) peers[userId].close() //關閉對該使用者的連接
        console.log("斷開連線")
        const userSection = document.getElementById(userId);
        const video = document.getElementById(userId + "-video");
        console.log(userSection)
        console.log(video)
        if (userSection) userSection.remove();
        if (video) video.remove();
        // videoCount--;
        updateGridTemplate();
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
    const myUserSection = document.getElementById(`${myUserId}`);
    const controlsVideo = document.querySelector(".controls__video");
    const audioTrack = myStream.getAudioTracks()[0]; 
    const myAudioIcon = myUserSection.querySelector(".fa-microphone")
    const myAudioSlashIcon = myUserSection.querySelector(".fa-microphone-slash")
    const audioIcon = controlsVideo.querySelector(".fa-microphone")
    const audioSlashIcon = controlsVideo.querySelector(".fa-microphone-slash")
    if(audioTrack.enabled === true){
        audioTrack.enabled = false;
        audioMute.style.backgroundColor = "rgb(192, 13, 13)";
        myAudioIcon.style.display = "none";
        audioIcon.style.display = "none";
        myAudioSlashIcon.style.display = "block";
        audioSlashIcon.style.display = "block";
        socket.emit("audioStatus", myUserId, {muted: true})
    }
    else{
        audioTrack.enabled = true;
        audioMute.style.backgroundColor = "rgb(82, 83, 83)";
        myAudioIcon.style.display = "block";
        audioIcon.style.display = "block";
        myAudioSlashIcon.style.display = "none";
        audioSlashIcon.style.display = "none";
        socket.emit("audioStatus", myUserId, {muted: false});
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
    const myUserSection = document.getElementById(`${myUserId}`);
    const profilePicGrid = myUserSection.querySelector(".profile_pic_grid")
    const profileUrl = myUserSection.querySelector(".profile_pic").src
    const videoTrack = myStream.getVideoTracks()[0]; 
    const videoIcon = document.querySelector(".fa-video")
    const videoSlashIcon = document.querySelector(".fa-video-slash")
    if(videoTrack.enabled === true){
        videoTrack.enabled = false;
        videoStop.style.backgroundColor = "rgb(192, 13, 13)";
        videoIcon.style.display = "none";
        videoSlashIcon.style.display = "block";
        profilePicGrid.style.display = "flex";
        // videoTrack.stop();
        socket.emit("videoStop", myUserId, profileUrl)
    }
    else{
        videoTrack.enabled = true;
        videoStop.style.backgroundColor = "rgb(82, 83, 83)";
        videoIcon.style.display = "block";
        videoSlashIcon.style.display = "none";
        const myVideo = document.getElementById(`${myUserId}-video`);
        console.log(myVideo);
        getUserMedia(myVideo);
        profilePicGrid.style.display = "none";
        socket.emit("videoOpen", myUserId)
    }
})

socket.on("videoStopControl", (id, profileUrl) => {
    console.log(id, profileUrl)
    const remoteUserSection = document.getElementById(id);
    const remoteProfilePicGrid = remoteUserSection.querySelector(".profile_pic_grid")
    const remoteProfile_pic = remoteUserSection.querySelector(".profile_pic")
    remoteProfile_pic.src = profileUrl
    remoteProfilePicGrid.style.display = "flex";
});

socket.on("videoOpenControl", (id) => {
    const remoteUserSection = document.getElementById(id);
    const remoteProfilePicGrid = remoteUserSection.querySelector(".profile_pic_grid");
    // const remoteVideo = document.getElementById(`${id}-video`);
    // addVideoStream(remoteVideo, remoteStream);
    remoteProfilePicGrid.style.display = "none";
});
/*-------------------------------分享螢幕畫面----------------------------------------------*/
let isScreenSharing = false;
let screenSharingStream;
let screenVideo;
let screenSection;
shareScreen.addEventListener("click", () => {
        try{
            if(!isScreenSharing){
                navigator.mediaDevices.getDisplayMedia()
                .then(stream => {
                    screenSharingStream = stream;
                    isScreenSharing  = true;
                    const { screenSharingVideo, screenSharingSection } = createScreenSharingSection();
                    screenVideo = screenSharingVideo
                    screenSection = screenSharingSection
                    addVideoStream(screenSharingVideo, screenSharingStream);
                    shareScreen.style.backgroundColor = "rgb(58, 173, 102)";
                    const connectedPeers = Object.keys(myPeer.connections);
                    console.log(connectedPeers);
                    if(connectedPeers.length > 0){
                        shareScreenToPeers(screenSharingStream, connectedPeers);
                    }
                    //分享者結束分享畫面
                    screenSharingStream.getVideoTracks()[0].addEventListener("ended", () => {
                        closeScreenStream(screenSharingVideo, screenSharingSection);
                    });
                });
            }
            else{
                //再次點擊結束分享
                screenSharingStream.getVideoTracks()[0].stop();
                screenSharingStream = null;
                closeScreenStream(screenVideo, screenSection)
            }
        }    
        catch(error){
            console.error(`Error: ${error}`);
        }
});

function createScreenSharingSection(){
    const screenSharingSectionHtml = `
    <div class="screenSharingSection userSection">
        <div class="video-grid">
            <video class="screenSharingVideo"></video>
        </div>
        <div class="video-grid__thumbtack">
            <i class="fa-solid fa-thumbtack"></i>
        </div>
        <div class="pinnedUsername">
            <div>${username}'s screen</div>
        </div>
    </div>
    `
    videoContainer.insertAdjacentHTML("beforeend", screenSharingSectionHtml)
    const screenSharingVideo = document.querySelector(".screenSharingVideo");
    const screenSharingSection = document.querySelector(".screenSharingSection")
    return {screenSharingVideo, screenSharingSection}
}

function shareScreenToPeers(screenStream, connectedPeers){
    connectedPeers.forEach(peerId => {
        myPeer.call(peerId, screenStream, { metadata: { type: "screen-sharing" } }); 
        console.log("通知所有使用者開始分享畫面")
    });
};


function closeScreenStream(screenSharingVideo, screenSharingSection){
    socket.emit("finishedScreenStream");
    shareScreen.style.backgroundColor = "rgb(82, 83, 83)";
    screenSharingVideo.remove();
    screenSharingSection.remove()
    // videoCount--;
    isScreenSharing = false;
    const userSections = document.querySelectorAll(".userSection");
    userSections.forEach(userSection => {
        const thumbtackInGrid = userSection.querySelector(".video-grid__thumbtack");
        if(thumbtackInGrid.style.color !== "rgb(44, 128, 212)"){
            screenSharingSection.style.display = "block";
            updateGridTemplate();
        }
    });
}

socket.on("removeScreenStream", () => {
    const screenSharingVideo = document.querySelector(".screenSharingVideo")
    const screenSharingSection = document.querySelector(".screenSharingSection")
    screenSharingVideo.remove();
    screenSharingSection .remove()
    // videoCount--;
    const userSections = document.querySelectorAll(".userSection");
    userSections.forEach(userSection => {
        const thumbtackInGrid = userSection.querySelector(".video-grid__thumbtack");
        if(thumbtackInGrid.style.color !== "rgb(44, 128, 212)"){
            userSection.style.display = "block";
            updateGridTemplate()
        }
    });
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

/*-------------------------------螢幕錄影----------------------------------------------*/
videoRecord.addEventListener("click", async() => {
    const screenRecordStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, displaySurface: "screen" });
    const options = { mimeType: "video/webm; codecs=vp9",};

    mediaRecorder = new MediaRecorder(screenRecordStream, options);
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

    //點擊結束共用螢幕(預設)
    screenRecordStream.getVideoTracks()[0].addEventListener("ended", () => {
        videoRecordStopAndDownload(chunks);
        videoRecord.style.display = "block";
        videoRecordPause.style.display = "none";
        videoRecordStop.style.display = "none";
        videoRecordPause.innerHTML = '<i class="fa-solid fa-pause"></i><div>Pause</div>'
    });

    //點擊停止錄影
    videoRecordStop.addEventListener("click", () => {
        videoRecordStopAndDownload(chunks);
        console.log(screenRecordStream.getTracks())
        screenRecordStream.getTracks().forEach(function(track) {
            track.stop();
        });
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

function videoRecordStopAndDownload(chunks){
    console.log("停止錄製")
    mediaRecorder.stop();
    const recordedBlob = new Blob(chunks, { type: "video/webm; codecs=vp9" });
    const recordedUrl = URL.createObjectURL(recordedBlob);
    const a = document.createElement("a");
    let fileName = "TeamTalk_recording_" + Date.now() + ".webm"
    a.href = recordedUrl;
    a.download = fileName;
    a.click();
}
/*-------------------------------結束通話----------------------------------------------*/
disconnect.addEventListener("click", () => {
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
            pictureUrl = data.pictureUrl;
            return { username, pictureUrl }
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