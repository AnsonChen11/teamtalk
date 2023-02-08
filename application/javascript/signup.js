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
    // console.log(location.search)
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
createAccount.addEventListener("click", () => {
    const headers = {
        "Content-Type": "application/json"
    };
    const body = {
        "username": signupUsername.value,
        "email": signupEmail.value,
        "password": signupPassword.value
    };
    fetch("/users/signup", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        if(data.message === "Email already exists"){
            alert("Email already exists")
            return
        }

        else if(data.message === "Signup successfully"){
            alert("Signup successfully Please login")
            window.location.href = "/login";
        }
        else{
            alert("Error message:", data)
        }
    })
    .catch(err => {
        console.error(err);
    })
})


// else if(!checkUsername(name)){
//     createErrorMessage("姓名不得輸入特殊符號", "signin")
//     return
// }
// else if(!checkEmail(email)){
//     createErrorMessage("email格式錯誤", "signin")
//     return
// }
// else if(!checkPassword(password)){
//     createErrorMessage("密碼格式錯誤", "signin")
//     return
// }

// /*--------------------function of create error message--------------------*/
// function createErrorMessage(errorMessage, condition){
//     if(condition == "signin"){
//         const signinCard = document.querySelector(".signinCard");
//         const signinCardDiv = document.createElement("div");
//         signinCardDiv.className = "loginErrorMessage";
//         signinCardDiv.textContent = errorMessage;
//         signinCard.insertBefore(signinCardDiv, changeToLogin);
//     }
//     if(condition == "login"){
//         const loginCard = document.querySelector(".loginCard");
//         const loginCardDiv = document.createElement("div");
//         loginCardDiv.className = "loginErrorMessage";
//         loginCardDiv.textContent = errorMessage;
//         loginCard.insertBefore(loginCardDiv, changeToSignin);
//     }
// }