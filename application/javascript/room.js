import auth from "./auth.js";
import whiteboardController from "./whiteboardController.js";
import participation from "./participation.js"
/*-------------------------------變數及狀態管理----------------------------------------------*/
export const socket = io.connect("/", {secure: true});
const myPeer = new Peer({ secure: true, }); // debug: 3
const peers = {}
/*-------------------------------join before the meet----------------------------------------------*/
const videoContainer = document.querySelector(".video__container");
const constraints = { video: true, audio: true };
const premeetingLoading = document.querySelector(".premeeting__loading")
const meetingLoading = document.querySelector(".meeting__loading")
const preMeetingAudioBtn = document.querySelector(".premeeting__options__audio")
const preMeetingVideoBtn = document.querySelector(".premeeting__options__video")
const preMeetingJoinBtn = document.querySelector(".premeeting__options__join")
const preMeetingExitBtn = document.querySelector(".premeeting__options__exit")
const microphone = preMeetingAudioBtn.querySelector(".fa-microphone-lines");
const microphoneSlash = preMeetingAudioBtn.querySelector(".fa-microphone-lines-slash");
const audioText = preMeetingAudioBtn.querySelector(".audioText");
const videoCamera = preMeetingVideoBtn.querySelector(".videoCamera");
const videoCameraSlash = preMeetingVideoBtn.querySelector(".videoCameraSlash");
const videoText = preMeetingVideoBtn.querySelector(".videoText");
const beforeJoinTheMeet = document.querySelector(".beforeJoinTheMeet")
const premeetingProfileSection = document.querySelector(".premeeting__profile__section");
const premeetingProfilePic = document.querySelector(".premeeting__profile_pic");
const controlsVideo = document.querySelector(".controls__video");
const audioIcon = controlsVideo.querySelector(".fa-microphone")
const audioSlashIcon = controlsVideo.querySelector(".fa-microphone-slash")
preMeetingAudioBtn.disabled = true;
preMeetingVideoBtn.disabled = true;
preMeetingJoinBtn.disabled = true;
let roomId;
let roomIdUrl = window.location.pathname;
let myStream;
let myUserId;
let isInRoom = false;
let myUsername;
let myPictureUrl;
let myAudioIsMuted = false;
let myVideoIsStopped = false;

prepareMeeting()

async function prepareMeeting(){
    const authData = await auth.authenticateAndGetData();
    const preMeetingVideo = document.getElementById("premeeting__video");
    myUsername = authData.username;
    myPictureUrl = authData.pictureUrl;
    premeetingProfilePic.src = myPictureUrl;
    myStream = await getUserMedia(preMeetingVideo)
    preMeetingAudioBtn.disabled = false;
    preMeetingVideoBtn.disabled = false;
    preMeetingJoinBtn.disabled = false;
    premeetingLoading.style.display = "none";
    return myStream;
}


preMeetingAudioBtn.addEventListener("click", () => {
    microphone.style.display = microphone.style.display === "none" ? "" : "none";
    audioText.textContent = microphone.style.display === "none" ? "Mute" : "Audio";
    microphoneSlash.style.display = microphoneSlash.style.display === "none" ? "" : "none";
    preMeetingAudioBtn.style.backgroundColor = microphone.style.display === "none" ? "#db3636" : "#252525";
    preMeetingAudioBtn.style.border = microphone.style.display === "none" ? "none" : "";
    toggleAudio()
});

preMeetingVideoBtn.addEventListener("click", () => {
    videoCamera.style.display = videoCamera.style.display === "none" ? "" : "none";
    videoText.textContent = videoCamera.style.display === "none" ? "Stop Video" : "Video";
    videoCameraSlash.style.display = videoCameraSlash.style.display === "none" ? "" : "none";
    preMeetingVideoBtn.style.backgroundColor = videoCamera.style.display === "none" ? "#db3636" : "#252525";
    preMeetingVideoBtn.style.border = videoCamera.style.display === "none" ? "none" : "";
    premeetingProfileSection.style.display = videoCamera.style.display === "none" ? "" : "none";
    toggleVideo()
});

preMeetingJoinBtn.addEventListener("click", () => {
    beforeJoinTheMeet.style.display = "none";
    sectionVideo.style.display = "block";
    joinRoom()
})

preMeetingExitBtn.addEventListener("click", () =>{
    window.location.href = "/"
})

function toggleAudio() {
    const audioTracks = myStream.getAudioTracks();
    if (audioTracks.length === 0) {
        return;
    }
    const isMuted = !audioTracks[0].enabled;
    audioTracks.forEach(track => {
        track.enabled = isMuted;
    });
    myAudioIsMuted = !isMuted
}

function toggleVideo() {
    const videoTracks = myStream.getVideoTracks();
    if (videoTracks.length === 0) {
        return;
    }
    const isStoppedVideo = !videoTracks[0].enabled;
    videoTracks.forEach(track => {
        track.enabled = isStoppedVideo;
    });
    myVideoIsStopped = !isStoppedVideo
}
/*-------------------------------取得媒體資源----------------------------------------------*/
async function getUserMedia(video){
    try{
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        // myStream = stream;
        addVideoStream(video, stream);
        return stream
    }
    catch(error){
        console.log("Error getUserMedia.", error)
    }
}

/*-------------------------------加入音視訊顯示於畫面上----------------------------------------------*/
async function addVideoStream(video, stream){
    try{
        if(stream){
            video.srcObject = stream;
        } 
        else{
            video.srcObject = myStream;
        }
        video.play();
        updateGridTemplate();
    }
    catch(error){
        console.log("Error adding video.", error);
        throw error;
    }
}
/*-------------------------------加入房間----------------------------------------------*/
let participationNum = 0;
const roomCode = document.querySelector(".roomCode")
async function joinRoom(){
    const myStream = await prepareMeeting();
    isInRoom = true;
    const video = await createUserSections(myUserId, "You", myPictureUrl);
    createParticipationSection(myUserId, "You", myPictureUrl)
    await addVideoStream(video, myStream);
    meetingLoading.style.display = "none";
    socket.emit("joinRoom", roomId, myUserId, myUsername, myAudioIsMuted, myVideoIsStopped, myPictureUrl);
    const myUserSection = document.getElementById(`${myUserId}`);
    const myAudioIcon = myUserSection.querySelector(".fa-microphone");
    const myAudioSlashIcon = myUserSection.querySelector(".fa-microphone-slash");
    const profilePicGrid = myUserSection.querySelector(".profile_pic_grid");
    const videoIcon = document.querySelector(".videoIcon")
    const videoSlashIcon = document.querySelector(".videoSlashIcon")
    const myParticipationBorder = document.getElementById(`${myUserId}-participation`);
    const myParticipationAudioIcon = myParticipationBorder.querySelector(".fa-microphone");
    const myParticipationAudioSlashIcon = myParticipationBorder.querySelector(".fa-microphone-slash");
    const myParticipationVideoIcon = myParticipationBorder.querySelector(".fa-video")
    const myParticipationVideoSlashIcon = myParticipationBorder.querySelector(".fa-video-slash")
    
    roomCode.textContent = `Room Code | ${roomId}`
    if(myAudioIsMuted){
        const audioTrack = myStream.getAudioTracks()[0]; 
        audioTrack.enabled = false;
        audioMute.style.backgroundColor = "rgb(192, 13, 13)";
        myAudioIcon.style.display = "none";
        myAudioSlashIcon.style.display = "block";
        audioIcon.style.display = "none";
        audioSlashIcon.style.display = "block";
        myParticipationAudioIcon.style.display = "none";
        myParticipationAudioSlashIcon.style.display = "block";
    }
    if(myVideoIsStopped){
        const videoTrack = myStream.getVideoTracks()[0]; 
        videoTrack.enabled = false;
        videoStop.style.backgroundColor = "rgb(192, 13, 13)";
        videoIcon.style.display = "none";
        videoSlashIcon.style.display = "block";
        profilePicGrid.style.display = "flex";
        myParticipationVideoIcon.style.display = "none";
        myParticipationVideoSlashIcon.style.display = "block";
    }
    participationNum++
    participation.updateParticipationNum(participationNum)
    whiteboardController.initWhiteboard(myUserId);
};
/*-------------------------------peer打開連線----------------------------------------------*/
//local端成功連接到peer伺服器時觸發，並會回傳一個唯一的ID
myPeer.on("open", userId => {
    myUserId = userId
    roomId = roomIdUrl.match(/([^/]+)$/)[0];
});

function createUserSections(userId, username, pictureUrl){
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

/*--------------------------監聽是否有新成員收到連接請求，若有責會發出"call"事件，並回答通話(call.answer)-----------------------------*/
//(remote視角)其他 myPeer物件向該myPeer發出呼叫時觸發。呼叫時，其他myPeer物件會建立一個call物件
myPeer.on("call", call => { 
    const { username, pictureUrl } = call.metadata; // Extract userId and username from metadata
    const userId = call.peer
    //此為分享畫面的串流，做特殊處理
    if(call.metadata.type === "screen-sharing"){
        const { screenSharingVideo } = createScreenSharingSection(`${username}'s`)
        call.answer(myStream);
        //註冊stream事件，當對方連接到Peer物件時並回答呼叫，對方會發送自己的媒體流，此時觸發stream事件
        call.on("stream", (shareScreenStream) => { 
            //其他使用者加入分享畫面者的stream
            addVideoStream(screenSharingVideo, shareScreenStream)
        })
    };
    //此為加入房間的串流，做一般處理
    if(call.metadata.type === "join-room"){ 
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
                const video = createUserSections(userId, username, pictureUrl)
                createParticipationSection(userId, username, pictureUrl)
                const userSection = document.getElementById(`${userId}`);
                const audioIcon = userSection.querySelector(".fa-microphone")
                const audioSlashIcon = userSection.querySelector(".fa-microphone-slash")
                const profilePicGrid = userSection.querySelector(".profile_pic_grid")
                const participationBorder = document.getElementById(`${userId}-participation`);
                const participationAudioIcon = participationBorder.querySelector(".fa-microphone");
                const participationAudioSlashIcon = participationBorder.querySelector(".fa-microphone-slash");
                const participationVideoIcon = participationBorder.querySelector(".fa-video")
                const participationVideoSlashIcon = participationBorder.querySelector(".fa-video-slash")
                if(call.metadata.mediaStatus.isAudioMuted){
                    audioIcon.style.display = "none";
                    audioSlashIcon.style.display = "block";
                    participationAudioIcon.style.display = "none";
                    participationAudioSlashIcon.style.display = "block";
                }
                if(call.metadata.mediaStatus.isVideoStopped){
                    profilePicGrid.style.display = "flex"
                    participationVideoIcon.style.display = "none"
                    participationVideoSlashIcon.style.display = "block";
                }
                addVideoStream(video, remoteStream);
                participationNum++
                participation.updateParticipationNum(participationNum)
            }
        })
    }
})
/*-------------------------------(local)監聽使用者連線----------------------------------------------*/
socket.on("userConnected", (userId, username, isAudioMuted, isVideoStopped, pictureUrl) => {
    const call = myPeer.call(
        userId, //remoteId
        myStream, //localStream, sent to remote
        {metadata: //localData
            {
                type: "join-room",
                username: myUsername,
                pictureUrl: myPictureUrl,
                mediaStatus: {
                    isAudioMuted: myAudioIsMuted, 
                    isVideoStopped: myVideoIsStopped
                }
            }
        }
    ); 
    let count = 0;
    call.on("stream", (remoteStream) => { //remoteId received and sent remoteStream to local
        count = count + 1;
        if(count == 2){
            return
        } 
        else {
            //將遠端的資料及視訊加入到本地
            const video = createUserSections(userId, username, pictureUrl)
            createParticipationSection(userId, username, pictureUrl)
            const userSection = document.getElementById(`${userId}`);
            const audioIcon = userSection.querySelector(".fa-microphone")
            const audioSlashIcon = userSection.querySelector(".fa-microphone-slash")
            const profilePicGrid = userSection.querySelector(".profile_pic_grid")
            const participationBorder = document.getElementById(`${userId}-participation`);
            const participationAudioIcon = participationBorder.querySelector(".fa-microphone");
            const participationAudioSlashIcon = participationBorder.querySelector(".fa-microphone-slash");
            const participationVideoIcon = participationBorder.querySelector(".fa-video")
            const participationVideoSlashIcon = participationBorder.querySelector(".fa-video-slash")
            if(isAudioMuted){
                audioIcon.style.display = "none";
                audioSlashIcon.style.display = "block";
                participationAudioIcon.style.display = "none";
                participationAudioSlashIcon.style.display = "block";
            }
            if(isVideoStopped){
                profilePicGrid.style.display = "flex";
                participationVideoIcon.style.display = "none";
                participationVideoSlashIcon.style.display = "block";
            }
            addVideoStream(video, remoteStream)
            participationNum++
            participation.updateParticipationNum(participationNum)
        }
    });

    call.on("close", (call) => { 
        console.log("close on stream")
    });
    peers[userId] = call
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
                  userSection.style.display = ""
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
                userSection.style.display = ""
                thumbtack.style.color = ""
                updateGridTemplate()
            })
        }
    }
});

/*-------------------------------畫面呈現grid網格----------------------------------------------*/
function updateGridTemplate(){
    if(!isInRoom) return
    let invisibleCount = 0
    let videoCount = 0
    const userSections = document.querySelectorAll(".userSection")
    userSections.forEach(userSection => {
        if (userSection.style.display === "none") {
            invisibleCount++;
        }
    });
    videoCount = userSections.length - invisibleCount
    let columns = Math.ceil(Math.sqrt(videoCount));
    let rows = Math.ceil(videoCount / columns);
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
        if (peers[userId]) peers[userId].close()
        const userSection = document.getElementById(userId);
        const video = document.getElementById(userId + "-video");
        const participationBorder = document.getElementById(`${userId}-participation`);
        if(userSection) userSection.remove();
        if(video) video.remove();
        if(participationBorder) participationBorder.remove();
        updateGridTemplate();
        participationNum--
        participation.updateParticipationNum(participationNum)
    }
    catch(e){
        socket.emit("error", "couldn't perform requested action");
    }
})

/*-------------------------------控制按鈕----------------------------------------------*/
const videoRecord = document.getElementById("video__record");
// const videoRecordResume = document.getElementById("video__record__resume");
const videoRecordPause = document.getElementById("video__record__pause");
const videoRecordStop = document.getElementById("video__record__stop");
const audioMute = document.getElementById("video__mute");
const videoStop = document.getElementById("video__stop");
const shareScreen = document.getElementById("video__shareScreen");
const chatToggle = document.getElementById("video__chat");
const disconnect = document.getElementById("video__disconnect");
const sectionChat = document.getElementById("section__chat");
const participationToggle = document.getElementById("participation__btn");
const sectionParticipation = document.getElementById("section__participation");
const sectionVideo = document.querySelector(".section__video");
const whiteboardBtn = document.getElementById("whiteboard__btn");
const chatCloseBtn = document.querySelector(".chat__close");
const participationCloseBtn = document.querySelector(".participation__close");
/*-------------------------------控制音訊開關----------------------------------------------*/
audioMute.addEventListener("click", () => {
    const myUserSection = document.getElementById(`${myUserId}`);
    const audioTrack = myStream.getAudioTracks()[0]; 
    const myAudioIcon = myUserSection.querySelector(".fa-microphone")
    const myAudioSlashIcon = myUserSection.querySelector(".fa-microphone-slash")

    const myParticipationBorder = document.getElementById(`${myUserId}-participation`);
    const myParticipationAudioIcon = myParticipationBorder.querySelector(".fa-microphone");
    const myParticipationAudioSlashIcon = myParticipationBorder.querySelector(".fa-microphone-slash");
    if(audioTrack.enabled === true){
        audioTrack.enabled = false;
        myAudioIsMuted = true
        audioMute.style.backgroundColor = "rgb(192, 13, 13)";
        audioIcon.style.display = "none";
        audioSlashIcon.style.display = "block";
        myAudioIcon.style.display = "none";
        myAudioSlashIcon.style.display = "block";
        myParticipationAudioIcon.style.display = "none";
        myParticipationAudioSlashIcon.style.display = "block";
        socket.emit("audioStatus", myUserId, {muted: true})
    }
    else{
        audioTrack.enabled = true;
        myAudioIsMuted = false
        audioMute.style.backgroundColor = "rgb(82, 83, 83)";
        audioIcon.style.display = "block";
        audioSlashIcon.style.display = "none";
        myAudioIcon.style.display = "block";
        myAudioSlashIcon.style.display = "none";
        myParticipationAudioIcon.style.display = "block";
        myParticipationAudioSlashIcon.style.display = "none";
        socket.emit("audioStatus", myUserId, {muted: false});
    }
});

socket.on("audioStatusControl", (id, audioStatus) => {
    const remoteId = document.getElementById(id);
    const remoteAudioIcon = remoteId.querySelector(".fa-microphone");
    const remoteAudioSlashIcon = remoteId.querySelector(".fa-microphone-slash");
    const remoteParticipationBorder = document.getElementById(`${id}-participation`);
    const remoteParticipationAudioIcon = remoteParticipationBorder.querySelector(".fa-microphone");
    const remoteParticipationAudioSlashIcon = remoteParticipationBorder.querySelector(".fa-microphone-slash");
    if(audioStatus.muted === true){
        remoteAudioIcon.style.display = "none";
        remoteAudioSlashIcon.style.display = "block";
        remoteParticipationAudioIcon.style.display = "none";
        remoteParticipationAudioSlashIcon.style.display = "block";
    }
    else {
        remoteAudioIcon.style.display = "block";
        remoteAudioSlashIcon.style.display = "none";
        remoteParticipationAudioIcon.style.display = "block";
        remoteParticipationAudioSlashIcon.style.display = "none";
    }
});

/*-------------------------------控制視訊開關----------------------------------------------*/
videoStop.addEventListener("click", () => {
    const myUserSection = document.getElementById(`${myUserId}`);
    const profilePicGrid = myUserSection.querySelector(".profile_pic_grid")
    const profileUrl = myUserSection.querySelector(".profile_pic").src
    const videoTrack = myStream.getVideoTracks()[0]; 
    const videoIcon = document.querySelector(".videoIcon")
    const videoSlashIcon = document.querySelector(".videoSlashIcon")
    const myParticipationBorder = document.getElementById(`${myUserId}-participation`);
    const myParticipationVideoIcon = myParticipationBorder.querySelector(".fa-video")
    const myParticipationVideoSlashIcon = myParticipationBorder.querySelector(".fa-video-slash")
    if(videoTrack.enabled === true){
        videoTrack.enabled = false;
        myVideoIsStopped = true
        videoStop.style.backgroundColor = "rgb(192, 13, 13)";
        videoIcon.style.display = "none";
        videoSlashIcon.style.display = "block";
        profilePicGrid.style.display = "flex";
        myParticipationVideoIcon.style.display = "none";
        myParticipationVideoSlashIcon.style.display = "block";
        socket.emit("videoStop", myUserId, profileUrl)
    }
    else{
        videoTrack.enabled = true;
        myVideoIsStopped = false
        videoStop.style.backgroundColor = "rgb(82, 83, 83)";
        videoIcon.style.display = "block";
        videoSlashIcon.style.display = "none";
        myParticipationVideoIcon.style.display = "block";
        myParticipationVideoSlashIcon.style.display = "none";
        const myVideo = document.getElementById(`${myUserId}-video`);
        getUserMedia(myVideo);
        setTimeout(() =>{
            profilePicGrid.style.display = "none";
        }, 500);
        socket.emit("videoOpen", myUserId)
    }
})

socket.on("videoStopControl", (id, profileUrl) => {
    const remoteUserSection = document.getElementById(id);
    const remoteProfilePicGrid = remoteUserSection.querySelector(".profile_pic_grid");
    const remoteProfile_pic = remoteUserSection.querySelector(".profile_pic");
    const remoteParticipationBorder = document.getElementById(`${id}-participation`);
    const remoteParticipationVideoIcon = remoteParticipationBorder.querySelector(".fa-video");
    const remoteParticipationVideoSlashIcon = remoteParticipationBorder.querySelector(".fa-video-slash");
    remoteProfile_pic.src = profileUrl
    remoteProfilePicGrid.style.display = "flex";
    remoteParticipationVideoIcon.style.display = "none";
    remoteParticipationVideoSlashIcon.style.display = "block";
});

socket.on("videoOpenControl", (id) => {
    const remoteUserSection = document.getElementById(id);
    const remoteProfilePicGrid = remoteUserSection.querySelector(".profile_pic_grid");
    const remoteParticipationBorder = document.getElementById(`${id}-participation`);
    const remoteParticipationVideoIcon = remoteParticipationBorder.querySelector(".fa-video");
    const remoteParticipationVideoSlashIcon = remoteParticipationBorder.querySelector(".fa-video-slash");
    remoteProfilePicGrid.style.display = "none";
    remoteParticipationVideoIcon.style.display = "block";
    remoteParticipationVideoSlashIcon.style.display = "none";
});
/*-------------------------------分享螢幕畫面----------------------------------------------*/
let isScreenSharing = false;
let screenSharingStream;
let screenVideo;
let screenSection;
shareScreen.addEventListener("click", async() => {
        try{
            if(!isScreenSharing){
                const stream = await navigator.mediaDevices.getDisplayMedia();
                screenSharingStream = stream;
                isScreenSharing  = true;
                const { screenSharingVideo, screenSharingSection } = createScreenSharingSection("Your");
                screenVideo = screenSharingVideo
                screenSection = screenSharingSection
                addVideoStream(screenSharingVideo, screenSharingStream);
                shareScreen.style.backgroundColor = "rgb(58, 173, 102)";
                const connectedPeers = Object.keys(myPeer.connections);
                if(connectedPeers.length > 0){
                    shareScreenToPeers(screenSharingStream, connectedPeers);
                }
                
                screenSharingStream.getVideoTracks()[0].addEventListener("ended", () => {
                    closeScreenStream(screenSharingVideo, screenSharingSection);
                });
            }
            else{
                //再次點擊結束分享
                screenSharingStream.getVideoTracks()[0].stop();
                screenSharingStream = null;
                closeScreenStream(screenVideo, screenSection);
            }
        }    
        catch(error){
            console.error(`Error: ${error}`);
        }
});

function createScreenSharingSection(username){
    const screenSharingSectionHtml = `
    <div class="screenSharingSection userSection">
        <div class="video-grid">
            <video class="screenSharingVideo"></video>
        </div>
        <div class="video-grid__thumbtack">
            <i class="fa-solid fa-thumbtack"></i>
        </div>
        <div class="pinnedUsername">
            <div>${username} screen</div>
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
    });
};


function closeScreenStream(screenSharingVideo, screenSharingSection){
    socket.emit("finishedScreenStream");
    shareScreen.style.backgroundColor = "rgb(82, 83, 83)";
    screenSharingVideo.remove();
    screenSharingSection.remove()
    isScreenSharing = false;
    const userSections = document.querySelectorAll(".userSection");
    userSections.forEach(userSection => {
        const thumbtackInGrid = userSection.querySelector(".video-grid__thumbtack");
        if(thumbtackInGrid.style.color !== "rgb(44, 128, 212)"){
            screenSharingSection.style.display = "";
            updateGridTemplate();
        }
    });
}

socket.on("removeScreenStream", () => {
    const screenSharingVideo = document.querySelector(".screenSharingVideo")
    const screenSharingSection = document.querySelector(".screenSharingSection")
    screenSharingVideo.remove();
    screenSharingSection.remove();
    const userSections = document.querySelectorAll(".userSection");
    userSections.forEach(userSection => {
        const thumbtackInGrid = userSection.querySelector(".video-grid__thumbtack");
        if(thumbtackInGrid.style.color !== "rgb(44, 128, 212)"){
            userSection.style.display = "";
            updateGridTemplate()
        }
    });
})

/*-------------------------------聊天室----------------------------------------------*/
chatToggle.addEventListener("click", () => {
    if(sectionChat.classList.contains("show")){
        sectionChat.classList.remove("show");
        sectionChat.classList.add("hide");
        sectionVideo.style.width = "100%"
        roomCode.style.display = "block";
    } 
    else{
        sectionChat.classList.remove("hide");
        sectionChat.classList.add("show");
        sectionChat.style.display = "block";
        sectionVideo.style.width = "80%"
        roomCode.style.display = "none";
        if(sectionParticipation.classList.contains("show")){
            sectionParticipation.classList.remove("show");
            sectionParticipation.classList.add("hide");
            
        } 
    }
});
chatCloseBtn.addEventListener("click", () => {
    sectionChat.classList.remove("show");
    sectionChat.classList.add("hide");
    sectionVideo.style.width = "100%"
    roomCode.style.display = "block";
});

const chatInput = document.getElementById("chat__input");
chatInput.addEventListener("keydown", (e) => {
    if(chatInput.value.trim() === ""){
        return;
    }
    if(e.key === "Enter" && chatInput.value.length !== 0 && chatInput.value !== ""){
        socket.emit("chatMessage", myUsername, chatInput.value);
        chatInput.value = "";
    };
});

const sendMessage = document.querySelector(".sendMessage");
sendMessage.addEventListener("click", () => {
    if(chatInput.value.trim() === ""){
        return;
    }
    if(chatInput.value.length !== 0){
        socket.emit("chatMessage", myUsername, chatInput.value);
        chatInput.value = "";
    };
})

const chatWindow = document.querySelector(".chat__window");
const messagesBorder = document.querySelector(".messagesBorder");
let lastUserId = "";
let usernameDisplay;
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
    messagesBorder.insertAdjacentHTML('beforeend', `
    <div class="messages" ${messagePosition}>
        <li class="messageUser" ${usernameDisplay}>${username}</li>
        <li class="message" style="background-color:${myUsernameColor};">
            <div class="messageTime" ${messageTimePosition}>${time}</div>
                ${message}
        </li>
    </div>`
    );
    chatWindow.scrollTop = chatWindow.scrollHeight;
});

/*-------------------------------participation---------------------------------------------*/
const participationWindow = document.querySelector(".participation__window")
participationToggle.addEventListener("click", () => {
    if(sectionParticipation.classList.contains("show")) {
        sectionParticipation.classList.remove("show");
        sectionParticipation.classList.add("hide");
        sectionVideo.style.width = "100%"
        roomCode.style.display = "block";
    } else {
        sectionParticipation.classList.remove("hide");
        sectionParticipation.classList.add("show");
        sectionParticipation.style.display = "block";
        sectionVideo.style.width = "80%"
        roomCode.style.display = "none";
        if(sectionChat.classList.contains("show")){
            sectionChat.classList.remove("show");
            sectionChat.classList.add("hide");
        } 
    }
});

participationCloseBtn.addEventListener("click", () => {
    sectionParticipation.classList.remove("show");
    sectionParticipation.classList.add("hide");
    sectionVideo.style.width = "100%"
    roomCode.style.display = "block";
});

function createParticipationSection(userId, username, pictureUrl){
    const participationHTML = `
        <ul class="participationBorder" id="${userId}-participation">
            <li class="participation">
                <div class="participation_profile">
                    <div class="participation__pic__container">
                        <img src=${pictureUrl}>
                    </div>
                    <div class="participation__username">${username}</div>
                </div>
                <div class="participation__media">
                    <div class="participation__media__icon"><i class="fa-solid fa-microphone" style="font-size: 16px;"></i><i class="fa-solid fa-microphone-slash fa-participation" style="display:none; font-size: 16px;"></i></div>
                    <div class="participation__media__icon"><i class="fa-solid fa-video fa-participation" style="font-size: 16px;"></i><i class="fa-solid fa-video-slash videoSlashIcon fa-participation" style="display:none; font-size: 16px;"></i></div>
                </div> 
            </li>
        </ul>
    `
    participationWindow.insertAdjacentHTML("beforeend", participationHTML)
}

/*-------------------------------螢幕錄影----------------------------------------------*/
videoRecord.addEventListener("click", async() => {
    const screenRecordStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, displaySurface: "screen" });
    const options = { mimeType: "video/webm; codecs=vp9",};

    const mediaRecorder = new MediaRecorder(screenRecordStream, options);
    const chunks = [];
    videoRecord.style.display = "none";
    videoRecordPause.style.display = "block";
    videoRecordStop.style.display = "block";
    videoRecordController(mediaRecorder)
    mediaRecorder.start(1000);
    mediaRecorder.addEventListener("dataavailable", (event) => {
        chunks.push(event.data);
    });

    //點擊結束共用螢幕(預設)
    screenRecordStream.getVideoTracks()[0].addEventListener("ended", () => {
        videoRecordStopAndDownload(chunks, mediaRecorder);
        videoRecord.style.display = "block";
        videoRecordPause.style.display = "none";
        videoRecordStop.style.display = "none";
        videoRecordPause.innerHTML = '<i class="fa-solid fa-pause"></i><div>Pause</div>'
    });

    //點擊停止錄影
    videoRecordStop.addEventListener("click", () => {
        videoRecordStopAndDownload(chunks, mediaRecorder);
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
        }
        else if(mediaRecorder.state === "paused"){
            mediaRecorder.resume();
            videoRecordPause.innerHTML = '<i class="fa-solid fa-pause"></i><div>Pause</div>'
        }
    });
}

function videoRecordStopAndDownload(chunks, mediaRecorder){
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

/*-------------------------------白板開關----------------------------------------------*/
const whiteboard = document.getElementById("whiteboard");
whiteboardBtn.addEventListener("click", () => {
    if(whiteboard.classList.contains("show")){
        whiteboard.classList.add("hide");
        whiteboard.classList.remove("show");
    }
    else{
        whiteboard.classList.add("show");
        whiteboard.classList.remove("hide");
    }
})