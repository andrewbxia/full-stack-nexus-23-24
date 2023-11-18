//client side code for register page

async function loginUser(event){
    event.preventDefault();
    const responseText = document.getElementById("server-response");
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    let data = {
        username: username.value,
        password: password.value,
    };
    data = JSON.stringify(data);
    
    let response = await fetch("../registerUser", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: data,
    });
    response = await response.json();
    console.log(response);
    
    
    if(response.message === "USERREGISTERED"){
        responseText.innerText = `Registration for ${username.value} successful! Please give andrew some time to stop procrastinating and approve your account. (he wont stop)`;
        username.value = "";
        password.value = "";
    }
    else if(response.message === "USERALREADYEXISTS"){
        responseText.innerText = "This person has already registered. If this is not you, please contact andrew for this uh-oh momento.";
    }
    else if(response.message === "USERREGISTERFAILED"){
        responseText.innerText = "registration failed for some reason: " + response.error;
    }
    else if(response.message === "UNDEFINEDCREDENTIALS"){
        responseText.innerText = "Please enter a username and password! Stop sending empty requests >:((";
    }
    else if(response.message === "ERROR"){
        responseText.innerText = "Error ocurred. Error memento: " + response.error;
    }
    else{
        responseText.innerText = "unknown server response😅. Try again!";
    }
    
    alert(response.message);
    return response;
}



document.addEventListener("DOMContentLoaded", function() {

    const registerForm = document.getElementById("register-form");

    registerForm.addEventListener("submit", async(event) => {
        await loginUser(event).then((response) => {
            
        });
    });
    console.log("registerjs loaded");
});

