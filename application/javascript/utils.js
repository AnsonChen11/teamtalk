/*-------------------------------驗證使用者----------------------------------------------*/
const authenticateAndGetData = async() => {
    const token = getCookie("token"); // 取得cookie中的token
    if(!token){
		alert("請先登入")
        window.location.href = "/";
        return
    }
    try{
		const response = await fetch("/users/auth", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if(!response.ok){
            alert("請先登入")
            window.location.href = "/";
            return;
        }
        
        const data = await response.json();
        const { username, pictureUrl } = data;
        return { username, pictureUrl };
        
    }
    catch(error){
		alert("請先登入")
        window.location.href = "/";
    }
}


function getCookie(key) {
	let value = "; " + document.cookie;
	let parts = value.split("; " + key + "=");
	if(parts.length === 2){
		return parts.pop().split(";").shift();
	}
}

export default {
    authenticateAndGetData,
}