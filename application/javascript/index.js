const launchMeeting = document.getElementById("launchMeeting")
const inputRoomCode = document.getElementById("inputRoomCode")
const loginBtn = document.querySelector(".loginBtn")


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

loginBtn.addEventListener("click", () => {
    window.location.href = "/auth";
})