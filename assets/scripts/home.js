let time;
const serverTime = document.getElementById("server-time"), starttimems = document.getElementById("server-start").dataset.starttimems;
document.addEventListener("DOMContentLoaded", () => {
    // document.querySelectorAll(".nav-button").forEach((element) => {
    //     element.addEventListener("click", (event) => {
    //         console.log("clikc");
    //         window.location.href = `${element.dataset.info}/`
    //     });
    // });
    periodic();
});

function periodic(){
    serverTime.innerText = ((Date.now() - starttimems) / 3600000).toFixed(4);
    setTimeout(periodic, Math.random() * 1500);//hehehe
}
document.getElementById('dropdown-button').addEventListener('click', function() {
    var dropdownMenu = document.getElementById('dropdownMenu');
    if (dropdownMenu.style.display === 'none') {
        dropdownMenu.style.display = 'block';
    } else {
        dropdownMenu.style.display = 'none';
    }
});