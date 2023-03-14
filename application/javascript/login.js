import promptMessage from "./promptMessage.js";

const loginEmail = document.getElementById("login_email");
const loginPassword = document.getElementById("login_password");
const loginBtn = document.querySelector(".loginBtn");
const linkToSignupPage = document.querySelector(".linkToSignupPage");
const loginWithGoogleBtn = document.querySelector(".loginWithGoogleBtn")
const loginWithFacebookBtn = document.querySelector(".loginWithFacebookBtn")

loginEmail.addEventListener("input", toggleLoginBtn);
loginPassword.addEventListener("input", toggleLoginBtn);

loginEmail.addEventListener("input", checkEmailInputIsValid);
loginPassword.addEventListener("input", checkPasswordInputIsValid);

linkToSignupPage.addEventListener("click", () => {
    window.location.href = "/users/signup";
})

/*----------------------------------controlling submit button open or not ----------------------------------*/
window.onload = function(){
    if(loginEmail.value === "" || loginPassword.value === ""){
        loginBtn.style.opacity = "0.3";
        loginBtn.style.cursor = "default";
        loginBtn.style.pointerEvents = "none";
    }
    else{
        loginBtn.style.opacity = "1";
        loginBtn.style.cursor = "pointer";
        loginBtn.style.pointerEvents = "auto";
    };
};

function toggleLoginBtn(){
    if(checkEmailInputIsValid() === true && checkPasswordInputIsValid() === true){
        loginBtn.style.opacity = "1";
        loginBtn.style.cursor = "pointer";
        loginBtn.style.pointerEvents = "auto";
    }
    else{
        loginBtn.style.opacity = "0.3";
        loginBtn.style.cursor = "default";
        loginBtn.style.pointerEvents = "none";
    };
};

/*----------------------------------hint of check input value valid----------------------------------*/
function checkEmailInputIsValid(){
    if(loginEmail.value === ""){
        loginEmail.style.borderColor = "rgb(147, 182, 247)";
    } 
    else if(!checkEmailRex(loginEmail.value)){
        loginEmail.style.borderColor  = "rgb(247, 147, 147)";
    }
    else{
        loginEmail.style.borderColor = "rgb(104, 201, 104)";
        return true;
    };
};

function checkPasswordInputIsValid(){
    if(loginPassword.value === ""){
        loginPassword.style.borderColor = "rgb(147, 182, 247)";
    } 
    else if(!checkPasswordRex(loginPassword.value)){
        loginPassword.style.borderColor  = "rgb(247, 147, 147)";
    }
    else{
        loginPassword.style.borderColor = "rgb(104, 201, 104)";
        return true;
    };
};

/*----------------------------------check input value match Rex----------------------------------*/
function checkEmailRex(email){
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!regex.test(email)){
      return false;
    }
    return true;
};

function checkPasswordRex(password){
    const regex = /^[a-zA-Z0-9_]+$/;
    if (!regex.test(password)){
      return false;
    }
    if (password.length < 6 || password.length > 20){
      return false;
    }
    return true;
};

/*----------------------------------submit user's input to server----------------------------------*/
loginBtn.addEventListener("click", async() => {
    const headers = {
        "Content-Type": "application/json"
    };
    const body = {
        "email": loginEmail.value,
        "password": loginPassword.value
    };
    try{
        const response = await fetch("/users/login", {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body)
        })
        const data = await response.json();
            if(data.error){
                promptMessage.errorMessage(data.message)
                return
            }
            else if(data.ok){
                promptMessage.successMessage("Login successfully")
                const token = data.token
                const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
                document.cookie = `token = ${token}; expires = ${expires}; path=/`
                window.location.href = "/";
            }
            else{
                console.log("Error message:", data)
            };
    }
    catch(err){
        console.error(err);
    };
});

/*----------------------------------login with google----------------------------------*/
loginWithGoogleBtn.addEventListener("click", () => {
    window.location.href= "/auth/google"
});
/*----------------------------------login with facebook----------------------------------*/
loginWithFacebookBtn.addEventListener("click", () => {
    window.location.href= "/auth/facebook"
});