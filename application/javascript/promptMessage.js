function successMessage(message){
    const messageElement = document.createElement("div");
    messageElement.classList = "promptMessage success"
    messageElement.innerText = "SUCCESS: " + message;

    document.body.appendChild(messageElement);

    requestAnimationFrame(() => {
        messageElement.classList.add("show");
    });
    setTimeout(() => {
        messageElement.classList.remove("show");
        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 300)
    }, 2500);
}

function errorMessage(message){
    const messageElement = document.createElement("div");
    messageElement.classList = "promptMessage error"
    messageElement.innerText = "ERROR: " + message;

    document.body.appendChild(messageElement);

    requestAnimationFrame(() => {
        messageElement.classList.add("show");
    });
    setTimeout(() => {
        messageElement.classList.remove("show");
        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 300)
    }, 2500);
}

function warningMessage(message){
    const messageElement = document.createElement("div");
    messageElement.classList = "promptMessage warning"
    messageElement.innerText = "WARNING: " + message;

    document.body.appendChild(messageElement);

    requestAnimationFrame(() => {
        messageElement.classList.add("show");
    });
    setTimeout(() => {
        messageElement.classList.remove("show");
        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 300)
    }, 2500);
}


export default {
    successMessage,
    errorMessage,
    warningMessage,
}