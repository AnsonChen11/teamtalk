import promptMessage from "./promptMessage.js";

const signupUsername = document.getElementById("signup_username");
const signupEmail = document.getElementById("signup_email");
const signupPassword = document.getElementById("signup_password");
const createAccount = document.querySelector(".createAccount");
const passwordHint = document.querySelector(".hint");
const linkToLoginPage = document.querySelector(".linkToLoginPage");

signupUsername.addEventListener("input", toggleCreateAccount);
signupEmail.addEventListener("input", toggleCreateAccount);
signupPassword.addEventListener("input", toggleCreateAccount);

signupUsername.addEventListener("input", checkUsernameInputIsValid);
signupEmail.addEventListener("input", checkEmailInputIsValid);
signupPassword.addEventListener("input", checkPasswordInputIsValid);

linkToLoginPage.addEventListener("click", () => {
    window.location.href = "/users/login";
})

/*----------------------------------controlling submit button open or not ----------------------------------*/
window.onload = function(){
    if(signupUsername.value === "" || signupEmail.value === "" || signupPassword.value === ""){
        createAccount.style.opacity = "0.3";
        createAccount.style.cursor = "default";
        createAccount.style.pointerEvents = "none";
    }
    else{
        createAccount.style.opacity = "1";
        createAccount.style.cursor = "pointer";
        createAccount.style.pointerEvents = "auto";
    };
};

function toggleCreateAccount(){
    if(checkUsernameInputIsValid() === true && checkEmailInputIsValid() === true && checkPasswordInputIsValid() === true){
        createAccount.style.opacity = "1";
        createAccount.style.cursor = "pointer";
        createAccount.style.pointerEvents = "auto";
    }
    else{
        createAccount.style.opacity = "0.3";
        createAccount.style.cursor = "default";
        createAccount.style.pointerEvents = "none";
    };
};

/*----------------------------------hint of check input value valid----------------------------------*/
function checkUsernameInputIsValid(){
    if(signupUsername.value === ""){
        signupUsername.style.borderColor = "rgb(147, 182, 247)";
    } 
    else if(!checkUsernameRex(signupUsername.value)){
        signupUsername.style.borderColor  = "rgb(247, 147, 147)";
    }
    else{
        signupUsername.style.borderColor = "rgb(104, 201, 104)";
        return true;
    };
};

function checkEmailInputIsValid(){
    if(signupEmail.value === ""){
        signupEmail.style.borderColor = "rgb(147, 182, 247)";
    } 
    else if(!checkEmailRex(signupEmail.value)){
        signupEmail.style.borderColor  = "rgb(247, 147, 147)";
    }
    else{
        signupEmail.style.borderColor = "rgb(104, 201, 104)";
        return true;
    };
};

function checkPasswordInputIsValid(){
    if(signupPassword.value === ""){
        signupPassword.style.borderColor = "rgb(147, 182, 247)";
        passwordHint.style.display = "none";
    } 
    else if(!checkPasswordRex(signupPassword.value)){
        signupPassword.style.borderColor  = "rgb(247, 147, 147)";
        passwordHint.style.display = "block";
    }
    else{
        signupPassword.style.borderColor = "rgb(104, 201, 104)";
        passwordHint.style.display = "none";
        return true;
    };
};

/*----------------------------------check input value match Rex----------------------------------*/
function checkUsernameRex(username){
    const regex = /^[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFFa-zA-Z0-9]+$/;
    if (!regex.test(username)){
      return false;
    }
    return true;
};

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
createAccount.addEventListener("click", async() => {
    const headers = {
        "Content-Type": "application/json"
    };
    const body = {
        "username": signupUsername.value,
        "email": signupEmail.value,
        "password": signupPassword.value,
        "defaultPictureData": createDefaultPictureData(signupUsername.value)
    };
    try{
        const response = await fetch("/users/signup", {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body)
        });
        const data = await response.json();
        
        if(data.error){
            promptMessage.warningMessage("Email is already taken.");
            return
        }
    
        else if(data.ok){
            promptMessage.successMessage("Signup successfully. Please login to start.");
            window.location.href = "/users/login";
        }
        else{
            console.log("Error message:", data);
        }
    }
    catch(err){
        console.error(err);
    };
});

/*--------------------Canvas API to generate avatar--------------------*/
function createDefaultPictureData(username){
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");

    const setBackgroundColor  = () => {
        let h = Math.floor(Math.random() * 360);
        let s = Math.floor(Math.random() * 50) + 50; // 產生 50% ~ 100% 的飽和度
        let l = Math.floor(Math.random() * 25) + 25; // 產生 25% ~ 50% 的亮度
        let backgroundColor =  `hsl(${h}, ${s}%, ${l}%)`
        return backgroundColor
    };

    ctx.fillStyle = setBackgroundColor();
    ctx.fillRect(0, 0, 600, 400);
    ctx.font = "48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText(username[0].toUpperCase(), 300, 220);

    const defaultPictureData  = canvas.toDataURL();
    return defaultPictureData 
}