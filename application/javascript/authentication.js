const url = window.location.pathname;
if(url !== "/"){
	authentication()
}
// if(url === "/"){
// 	authenticationForIndex()
// }
// else{
// 	authentication()
// }

async function authentication(){
    let token = getCookie("token"); // 取得cookie中的token
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
		}
		console.log("驗證成功")
    }
    catch(error){
		alert("請先登入")
        window.location.href = "/";
    }
}

async function authenticationForIndex(){
	console.log("開始驗證")
    let token = getCookie("token"); 
    if(!token){
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
			return
		}
		else{
			return true;
		}
    }
    catch(error){
		return
    }
}

function getCookie(key) {
	let value = "; " + document.cookie;
	let parts = value.split("; " + key + "=");
	if(parts.length === 2){
		return parts.pop().split(";").shift();
	}
}