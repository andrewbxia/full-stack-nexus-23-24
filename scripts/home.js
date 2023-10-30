document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nav-button").forEach((element) => {
        element.addEventListener("click", (event) => {
            console.log("clikc");
            window.location.href = `${element.dataset.info}/`
        });
    });
});