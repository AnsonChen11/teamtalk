const participationNum = document.querySelector(".participationNum")

function updateParticipationNum(updateNum){
    participationNum.textContent = updateNum
}

export default {
    updateParticipationNum,
}