authenticationForIndex();
const loginBtn = document.querySelector(".loginBtn");
const signupBtn = document.querySelector(".signupBtn");
const launchMeeting = document.getElementById("launchMeeting");
const inputRoomCode = document.getElementById("inputRoomCode");
const joinBtn = document.getElementById("joinButton");
const accountBtn = document.querySelector(".accountBtn");
const accountBtnImg = document.querySelector(".accountBtnImg");
const accountDropdown = document.querySelector(".account__dropdown");
const accountHostMeeting = document.querySelector(".account__hostMeeting");
const accountLogout = document.querySelector(".account__logout");
const accountProfileEdit = document.querySelector(".account__profile");
const accountProfileUsername = document.querySelector(".account__profile__username");
const accountProfileEmail = document.querySelector(".account__profile__email");
const accountEditSection = document.querySelector(".account__edit");
const accountEditClose = document.querySelector(".account__edit__close");
const usernameEditName = document.querySelector(".username__edit__name");
const usernameEditIcon = document.querySelector(".username__edit__icon");
const usernameEditOptions = document.querySelector(".username__edit__options");
const usernameEditInput = document.querySelector(".username__edit__input");
const usernameEditCheck = document.querySelector(".username__edit__check");
const usernameEditCancel = document.querySelector(".username__edit__cancel");
const profilePic = document.querySelector(".profile_pic")
const profilePictureEditRemove = document.querySelector(".profilePicture__edit__remove")
const profilePictureEditCancel = document.querySelector(".profilePicture__edit__cancel")
const overlay = document.querySelector(".overlay");

let username;
let email;
/*----------------------------------check user login or not----------------------------------*/
async function authenticationForIndex(){
    let token = getCookie("token"); 
    if(!token){
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
			    return
		    }
            return response.json()
        })
        .then(data => {
            console.log(data)
            loginBtn.style = "display: none";
            signupBtn.style = "display: none";
            accountBtn.style = "display:flex";
            accountProfileUsername.textContent = data.username;
            accountProfileEmail.textContent = data.email;
            accountBtn.textContent = data.username[0].toUpperCase()
            usernameEditName.textContent = data.username;
            username = data.username;
            email = data.email;
            profilePic.src = data.pictureUrl
            declineProfilePic(data.pictureUrl)
        })
    }
    catch(error){
		return
    }
}

/*----------------------------------nav bar addEventListener event----------------------------------*/
signupBtn.addEventListener("click", () => {
    window.location.href = "/users/signup";
})

loginBtn.addEventListener("click", () => {
    window.location.href = "/users/login";
})

document.addEventListener("click", function (event) {
    if(!accountDropdown.contains(event.target) && event.target !== accountBtn){
        accountDropdown.style.display = "none";
    };
});

accountBtn.addEventListener("click", () => {
    if(accountDropdown.style.display === "none"){
        accountDropdown.style.display = "block";
    } 
    else{
        accountDropdown.style.display = "none";
    }
})

accountLogout.addEventListener("click", () => {
    userLogout();
})

/*----------------------------------dropdown addEventListener event----------------------------------*/

accountProfileEdit.addEventListener("click", () => {
    if(accountEditSection.style.display === "none"){
        accountEditSection.style.display = "block";
        overlay.style.display = "block";
        accountDropdown.style.display = "none";
    };
});

accountHostMeeting.addEventListener("click", () => {
    createRoom()
})

/*---------------------------------- profile edit section addEventListener event----------------------------------*/
accountEditClose.addEventListener("click", () => {
    accountEditSection.style.display = "none";
    overlay.style.display = "none";   
    if(usernameEditOptions.style.display = "block"){
        usernameEditName.textContent = username;
        usernameEditName.style.display = "block";
        usernameEditInput.style.display = "none";
        usernameEditIcon.style.display = "block";
        usernameEditOptions.style.display = "none";
    } 
});

document.addEventListener("click", function (event) {
    if(event.target === overlay){
        accountEditSection.style.display = "none";
        overlay.style.display = "none";
        if(usernameEditOptions.style.display = "block"){
            usernameEditName.textContent = username;
            usernameEditName.style.display = "block";
            usernameEditInput.style.display = "none";
            usernameEditIcon.style.display = "block";
            usernameEditOptions.style.display = "none";
        };
    };
});

/*----------------------------------edit profile username addEventListener event----------------------------------*/
usernameEditIcon.addEventListener("click", () => {
    usernameEditIcon.style.display = "none";
    usernameEditOptions.style.display = "flex";
    usernameEditName.style.display = "none";
    usernameEditInput.style.display = "block";
    usernameEditInput.value = usernameEditName.textContent;
    usernameEditInput.focus();
});

usernameEditCancel.addEventListener("click", () => {
    usernameEditName.textContent = username;
    usernameEditName.style.display = "block";
    usernameEditInput.style.display = "none";
    usernameEditIcon.style.display = "block";
    usernameEditOptions.style.display = "none";
});

usernameEditCheck.addEventListener("click", () => {
    let newUsername = usernameEditInput.value;
    if(newUsername === ""){
        alert("Edit username can not be blank")
    }
    else if(newUsername === username){
        alert("Edit username is as same as username")
    }
    else if(newUsername !== "" || newUsername !== username){
        editUsername(newUsername);
    }
});

async function editUsername(newUsername){
    let token = getCookie("token"); 
    if(!token){
        return
    }
    try{
        await fetch("/users/auth", {
            method: "PUT",
			headers: {
                "Content-Type": "application/json",
				"Authorization": `Bearer ${token}`
			},
            body: JSON.stringify({ newUsername })
        })
        .then(response => {
            if(!response.ok){
			    return
		    }
            return response.json()
        })
        .then(data => {
            const updateToken  = data.updateToken;
            document.cookie = `token=${updateToken}`;
            location.reload();
        })
    }
    catch(error){
		return
    }
}
/*----------------------------------edit profile picture addEventListener event----------------------------------*/
const fileUploader = document.querySelector("#file-uploader")
fileUploader.addEventListener("change", (e) => {
    let file = e.target.files[0];
    if(file){
       profilePic.src = URL.createObjectURL(file)
    }
    const formData = new FormData();
    formData.append("file", file);
    upload(formData)
});
function declineProfilePic(data){
    profilePictureEditRemove.addEventListener("click", () => {
        profilePictureEditRemove.style.display = "none";
        profilePictureEditCancel.style.display = "flex";
    
        profilePictureEditCancel.addEventListener("click", () => {
            profilePictureEditRemove.style.display = "flex";
            profilePictureEditCancel.style.display = "none";
            profilePic.src = data
        })
        let file = createDefaultPictureBlob(usernameEditName.textContent);
        profilePic.src = URL.createObjectURL(file);
        const formData = new FormData();
        formData.append("file", file);
        upload(formData)
    })
}


function upload(formData){
    const profilePictureEditChange = document.querySelector(".profilePicture__edit__change");
    profilePictureEditChange.addEventListener("click", (e) => {
        let token = getCookie("token"); 
        if(!token){
            return
        }
        fetch("/users/auth", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData,
        })
        .then(response => response.json())
        .then(data => {
                console.log(data)
                if(data.message === "ok"){
                    alert("Upload successfully")
                    // profilePic.src = data.updatedPictureUrl
                    location.reload()
                }
        })
        .catch(error => {
                console.log("error", error)
        })
    })
}


function createDefaultPictureBlob(username){
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");

    // 產生隨機背景顏色
    const setBackgroundColor  = () => {
        let h = Math.floor(Math.random() * 360);
        let s = Math.floor(Math.random() * 50) + 50; // 產生 50% ~ 100% 的飽和度
        let l = Math.floor(Math.random() * 25) + 25; // 產生 25% ~ 50% 的亮度
        let backgroundColor =  `hsl(${h}, ${s}%, ${l}%)`
        return backgroundColor
    };

    ctx.fillStyle = setBackgroundColor();
    ctx.fillRect(0, 0, 600, 400);

    // 文字
    ctx.font = "288px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText(username[0].toUpperCase(), 300, 310);

    const defaultPictureData  = canvas.toDataURL();
    const byteString = atob(defaultPictureData.split(",")[1]);
    const mimeString = defaultPictureData.split(",")[0].split(":")[1].split(";")[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        intArray[i] = byteString.charCodeAt(i);
    }
    console.log(defaultPictureData);
    // return (defaultPictureData)
    return new Blob([arrayBuffer], { type: mimeString });
}
/*----------------------------------launch and join meeting addEventListener event----------------------------------*/
launchMeeting.addEventListener("click", () => {
    createRoom()
});

async function createRoom(){
    try{
        await fetch("/room", {
            method: "POST",
            body: JSON.stringify({ username: username, email: email }),
			headers: { "Content-Type": "application/json" }
        })
        .then(response => {
            if(!response.ok){
			    return
		    }
            return response.json()
        })
        .then(data => {
            roomId = data.roomId
            window.location.href = `/room/${roomId}`;
        })
    }
    catch(err){
        console.log(err);
    }
}

async function joinRoomByCode(roomCode){
    try{
        fetch(`/room/${roomCode}`,{ 
            method: "GET",
            headers: { "Accept": "application/json" } 
        })
        .then(response => {
            if(!response.ok){
                alert("Couldn't find the room");
                return
		    }
            else{
                window.location.href = `/room/${roomCode}`
            }
        })
    }
    catch(err){
        console.log(err);
    }
};

inputRoomCode.addEventListener("keydown", (e) => {
    roomCode = inputRoomCode.value
    if(e.key === "Enter" && roomCode !== "" ){
        joinRoomByCode(roomCode)
    }
});

joinBtn.addEventListener("click", () => {
    roomCode = inputRoomCode.value
    joinRoomByCode(roomCode)
});
        // window.location.href = response.url;


inputRoomCode.addEventListener("focus", () => {
    joinBtn.style.display = "flex";
});

// 當 input 框 blur 時，檢查是否有輸入文字，若沒有則隱藏 Join 按鈕
inputRoomCode.addEventListener("blur", () => {
    if(!inputRoomCode.value.trim()){
        joinBtn.style.display = "none";
    }
});
// 監聽 input 框的鍵盤事件，每次輸入都檢查是否要顯示 Join 按鈕
inputRoomCode.addEventListener("keyup", () => {
    if(inputRoomCode.value.trim()){
        joinBtn.style.display = "flex";
        joinBtn.style.color = "#1a73e8";
    }
    else{
        joinBtn.style.display = "none";
        // joinBtn.style.color = "rgb(34, 34, 115)";
    }
});
inputRoomCode.addEventListener("input", (e) => {
    if (e.target.value.trim() !== ""){
        joinBtn.style.opacity = "1";
        joinBtn.style.cursor = "pointer";
        joinBtn.style.pointerEvents = "auto";
        
    } 
    else{
        joinBtn.style.opacity = "0.3";
        joinBtn.style.cursor = "default";
        joinBtn.style.pointerEvents = "none";
    }
});
/*----------------------------------user logout----------------------------------*/
function userLogout(){
    const headers = {
        "Content-Type": "application/json"
    }
    fetch("/users/logout", {
        method: "DELETE",
        headers: headers,
    })
    .then(response => response.json())
    .then(data => {
        if(data){
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            location.reload()
        }
    })
}

function getCookie(key) {
	let value = "; " + document.cookie;
	let parts = value.split("; " + key + "=");
	if(parts.length === 2){
		return parts.pop().split(";").shift();
	}
}