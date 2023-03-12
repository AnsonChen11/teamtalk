/*----------------------------------check user login or not----------------------------------*/
async function authenticationForIndex(){
    const token = getCookie("token");
    const tokenLoginWithGoogle = getCookie("tokenLoginWithGoogle"); 
    const tokenLoginWithFacebook = getCookie("tokenLoginWithFacebook"); 
    if(!token && !tokenLoginWithGoogle && !tokenLoginWithFacebook){
        return
    }
    if(token){
        try{
            const response = await fetch("/users/auth", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            if(!response.ok){
                    return
                }
            const data = await response.json();
            return data;
        }
        catch(error){
            return
        }
    }
    if(tokenLoginWithGoogle){
        try{
            const response = await fetch("/users/auth/google", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${tokenLoginWithGoogle}`
                }
            })
            if(!response.ok){
                    return
                }
            const data = await response.json();
            return data;
        }
        catch(error){
            return
        }
    }
    if(tokenLoginWithFacebook){
        try{
            const response = await fetch("/users/auth/facebook", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${tokenLoginWithFacebook}`
                }
            })
            if(!response.ok){
                    return
                }
            const data = await response.json();
            return data;
        }
        catch(error){
            return
        }
    }
}

/*-------------------------------驗證使用者----------------------------------------------*/
async function authenticateAndGetData(){
    const token = getCookie("token");
    const tokenLoginWithGoogle = getCookie("tokenLoginWithGoogle"); 
    const tokenLoginWithFacebook = getCookie("tokenLoginWithFacebook"); 
    if(!token && !tokenLoginWithGoogle && !tokenLoginWithFacebook){
		alert("請先登入")
        window.location.href = "/";
        return
    }
    if(token){
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
    if(tokenLoginWithGoogle){
        try{
            const response = await fetch("/users/auth/google", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${tokenLoginWithGoogle}`
                }
            })
            if(!response.ok){
                    return
                }
            const data = await response.json();
            const { username, pictureUrl } = data;
            return { username, pictureUrl };
        }
        catch(error){
            return
        }
    }
    if(tokenLoginWithFacebook){
        try{
            const response = await fetch("/users/auth/facebook", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${tokenLoginWithFacebook}`
                }
            })
            if(!response.ok){
                    return
                }
            const data = await response.json();
            const { username, pictureUrl } = data;
            return { username, pictureUrl };
        }
        catch(error){
            return
        }
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
    authenticationForIndex,
    authenticateAndGetData,
    getCookie,
}