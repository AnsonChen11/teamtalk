authenticationForIndex();
const loginBtn = document.querySelector(".loginBtn");
const signupBtn = document.querySelector(".signupBtn");
const launchMeeting = document.getElementById("launchMeeting");
const inputRoomCode = document.getElementById("inputRoomCode");
const accountBtn = document.querySelector(".accountBtn");
const accountDropdown = document.querySelector(".account__dropdown");
const accountHostMeeting = document.querySelector(".account__hostMeeting");
const accountLogout = document.querySelector(".account__logout");
const accountProfileUsername = document.querySelector(".account__profile__username");
const accountProfileEmail = document.querySelector(".account__profile__email");
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
        })
    }
    catch(error){
		return
    }
}

/*----------------------------------addEventListener event----------------------------------*/
signupBtn.addEventListener("click", () => {
    window.location.href = "/users/signup";
})

loginBtn.addEventListener("click", () => {
    window.location.href = "/users/login";
})

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

accountBtn.addEventListener("click", () => {
    if(accountDropdown.style.display === "none"){
        accountDropdown.style.display = "block";
    } 
    else{
        accountDropdown.style.display = "none";
    }
})

document.addEventListener("click", function (event) {
    if(!accountDropdown.contains(event.target) && event.target !== accountBtn){
        accountDropdown.style.display = "none";
    }
});

accountHostMeeting.addEventListener("click", () => {
    fetch("/newMeeting", { method: "POST" })
    .then(response => {
        window.location.href = response.url;
    });
})

accountLogout.addEventListener("click", () => {
    userLogout();
})

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