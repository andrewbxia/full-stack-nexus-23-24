async function loginUser(event){
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("../login")
}



document.addEventListener("DOMContentLoaded", function() {

    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", loginUser);
    console.log("loginjs loaded");
});

