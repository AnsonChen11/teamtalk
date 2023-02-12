authenticationForIndex();
const loginBtn = document.querySelector(".loginBtn");
const signupBtn = document.querySelector(".signupBtn");
const launchMeeting = document.getElementById("launchMeeting");
const inputRoomCode = document.getElementById("inputRoomCode");
const accountBtn = document.querySelector(".accountBtn");
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
const overlay = document.querySelector(".overlay");

let username;
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
            loginBtn.style = "display: none";
            signupBtn.style = "display: none";
            accountBtn.style = "display:flex";
            accountProfileUsername.textContent = data.username;
            accountProfileEmail.textContent = data.email;
            accountBtn.textContent = data.username[0].toUpperCase()
            usernameEditName.textContent = data.username;
            username = data.username;
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
    fetch("/newMeeting", { method: "POST" })
    .then(response => {
        window.location.href = response.url;
    });
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

/*----------------------------------launch and join meeting addEventListener event----------------------------------*/
launchMeeting.addEventListener("click", () => {
    fetch("/newMeeting", { method: "POST" })
    .then(response => {
        window.location.href = response.url;
    });
})

// inputRoomCode.addEventListener("keydown", (e) => {
//     console.log(inputRoomCode.value)
//     if(e.key === "Enter" && inputRoomCode.value == 123){
//         window.location.href = "/123"
//     };
// });

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