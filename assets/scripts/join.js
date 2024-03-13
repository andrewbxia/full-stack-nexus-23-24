const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            console.log("intersecting")
            entry.target.classList.add("fade-in");
        }
        else{
            entry.target.classList.remove("fade-in");
        }
    });
});

const bulletPoints = document.querySelectorAll("li");
// const bulletULists = document.querySelectorAll("ul");
// const bulletOLists = document.querySelectorAll("ol");


// bulletULists.forEach((list) => {
//     console.log(list);
//     observer.observe(list);
// });

// bulletOLists.forEach((list) => {
//     console.log(list);
//     observer.observe(list);
// });

bulletPoints.forEach((bullet) => {
    console.log(bullet);
    observer.observe(bullet);
});
