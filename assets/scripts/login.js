//client side code for login page

async function loginUser(event){
    event.preventDefault();
    const username = document.getElementById("username").value;
    const Knumber = document.getElementById("Knumber").value;
    const password = document.getElementById("password").value;
    const data = {
        username: username,
        Knumber: Knumber,
        password: password,
    };
    console.log(data);
    let response = await fetch("../login/loginUser", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(data),
    });
    
    response = await response.json();
    alert(response.message);

    const responseMessage = document.getElementById("response-message");
    //oh boy
    console.log(responseMessage);
    switch(response.message){
        case "SUCCESSFULLOGIN":
            username.value = "";
            Knumber.value = "";
            password.value = "";
            responseMessage.innerText = `successfully 🪵'd in as "${response.username}"! hang tight while you are being redirected.`;
            break;
        case "UNSUCCESSFULLOGIN":
            password.value = "";
            responseMessage.innerText = `incorrect password or K-number for "${username}"! if you feel like this is uhoh-spaghettios, contact andrew directly to change it (spaghettios included 🍝🍝🍝).`;
            break;
        case "USERNOTFOUND":
            username.value = "";
            Knumber.value = "";
            responseMessage.innerText = `user "${username}" not found! either you have not registered or your registration is still pending or you miscapitalized something; this is case sensitive! meanwhile, want some spaghettios? 🍝🍝🍝`;
            break;
        case "UNDEFINEDCREDENTIALS":
            responseMessage.innerText = "please enter a username and K-number and password! stop sending emptee requests to the server!! >:(";
            break;
        case "ERROR":
            responseMessage.innerText = "something uhoh spaghettio occurred on the server! please try again and spam andrew to fix it if it does not resolve";
            break;
        case "UNKNOWNSERVERRESPONSE":
            responseMessage.innerText = "an unknown server response was recieved from the server, so try again. in the meanwhile, have some spaghettios 🍝🍝🍝";
            break;
        default:
            responseMessage.innerText = "an unknown error occurred. please contact andrew to fix it it does not resolve. in the meanwhile, have some spaghettios 🍝🍝🍝";
    }
    
    responseMessage.innerText += `\nserver response: ${response.message}\n`;
    //alert(response.message);
    document.getElementById("input-section").firstChild.replaceWith(responseMessage);
    return response;
}



document.addEventListener("DOMContentLoaded", async () => {

    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", async(event) => {
        await loginUser(event).then((response) => {
            console.log(response.username);
            console.log(response.password);
            if(response.message === "SUCCESSFULLOGIN"){
                setTimeout(() => {
                    window.location.replace("/");
                }, 1000);
            }
        });
    });
    console.log("loginjs loaded");
});

