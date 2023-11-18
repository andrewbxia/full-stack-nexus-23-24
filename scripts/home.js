let time;
const serverTime = document.getElementById("server-time"), starttime = document.getElementById("server-start").dataset.starttime;
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nav-button").forEach((element) => {
        element.addEventListener("click", (event) => {
            console.log("clikc");
            window.location.href = `${element.dataset.info}/`
        });
    });
    periodic();
});


function periodic(){
    serverTime.innerText = ((Date.now() - starttime) / 3600000).toFixed(4);
    setTimeout(periodic, Math.random() * 1500);//hehehe
}