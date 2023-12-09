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
    
    let response = await fetch("../register/registerUser", {
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
           
    switch(response.message){
        case "USERREGISTERED":
            responseText.innerText = `Registration for ${username.value} successful! Please give andrew some time to stop procrastinating and approve your account. (he wont stop)`;
            username.value = "";
            password.value = "";
            break;
        case "USERALREADYEXISTS":
            responseText.innerText = "This person has already registered. If this is not you, please contact andrew for this uh-oh momento.";
            break;
        case "USERALREADYAPPROVED":
            responseText.innerHTML = "This person has already registered and has been approved. Please log in <a href='../login'>here</a>!";
            break;
        case "USERREJECTED":
            responseText.innerText = "This person has already registered and has been rejected from approval. If this is not you or you thinkies this is an error, please contact andrew for this REALLY uh-oh momento.";
            break;
        case "USERREGISTERFAILED":
            responseText.innerText = "registration failed for some reason: " + response.error;
            break;
        case "UNDEFINEDCREDENTIALS":
            responseText.innerText = "Please enter a username and password! Stop sending empty requests >:((";
            break;
        case "ERROR":
            responseText.innerText = "Error ocurred. Error memento: " + response.error;
            break;
        default: 
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

