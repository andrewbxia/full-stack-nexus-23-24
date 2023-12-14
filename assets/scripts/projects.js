console.log(BASE_URL);
console.log(username);
let files;

let projTrack, projectList, userTitleWidth, pastScrollTime = Date.now(), pastScrollStart = Date.now();
const userProjectMap = new Map();
//deleteForm given by uploadProject.js

function calcOffset(element, scroll = false){

    let posX, prevX, deltaX, existingMargin, scrollMultiplier;
    if(!scroll){
        posX = element.dataset.posX;
        prevX = element.dataset.prevX;
        deltaX = posX - prevX;
        existingMargin = parseFloat(element.dataset.prevMargin);
        scrollMultiplier = 1;
    }
    else{
        deltaX = -event.deltaX;
        existingMargin = parseFloat(window.getComputedStyle(element).marginLeft);
        scrollMultiplier = 3;
    }

    const multi = element.dataset.multi;
    const width = parseFloat(window.getComputedStyle(element).width);
    let upper = window.innerWidth - 300;
    const lower = userTitleWidth - width;
    if(upper - lower < width){/*in case someone has a lot of projects*/
        upper = lower + width;
    }
    let offset = scrollMultiplier * deltaX * multi + existingMargin;
    offset = Math.max(offset, userTitleWidth - width);
    offset = Math.min(offset, upper);
    return offset;
}

function setMaxWidthTitle(){
    console.log("change");
    let maxWidthTitle = 0;
    document.querySelectorAll(".user-title").forEach((element) => {
        element.style.minWidth = "unset";
        maxWidthTitle = Math.max(maxWidthTitle, element.offsetWidth);
    });
    document.querySelectorAll(".user-title").forEach((element) => {
        element.style.minWidth = maxWidthTitle + "px";
        element.style.maxWidth = maxWidthTitle + "px";//needed as gets affected by panning
    });
    
    
    projTrack.forEach((element) => {
        element.dataset.pressed = Date.now();
        let existingMargin = parseInt(window.getComputedStyle(element).marginLeft);
        const width = parseInt(window.getComputedStyle(element).width);
        const lower = userTitleWidth - width;
        let upper = window.innerWidth - 300;
        if(upper - lower < width){/*in case someone has a lot of projects*/
            upper = lower + width;
        }
        existingMargin = Math.max(existingMargin, lower);
        existingMargin = Math.min(existingMargin, upper);
        //offset = Math.min(offset, Math.max(upper, )/*in case someone has a lot of projects*/);
        element.animate({
            marginLeft: `${existingMargin}px`,
        }, {duration: 500, fill: "forwards"});
    });
}

function handleMouseClick(event){
    console.log(event.type)
    projTrack.forEach((element) => {
        if(event.type !== "touchstart"){
            element.dataset.posX = event.clientX;
            element.dataset.prevX = element.dataset.posX;
        }
        else{
            element.dataset.posX = event.touches[0].clientX;
            element.dataset.prevX = element.dataset.posX;
        }
        element.dataset.prevMargin = window.getComputedStyle(element).marginLeft;
        element.dataset.multi = Math.random() + 1;
    });
}

function handleMouseMove(event){
    projTrack.forEach((element) => {
        if(element.dataset.prevX === "0" || Date.now() - (element.dataset.pressed) < 90){return;}
        // element.href = "";
        document.body.style.cursor = "grabbing";
        console.log(event.type);
        element.dataset.pressed = Date.now();
        if(event.type !== "touchmove"){
            element.dataset.posX = event.clientX;
        }
        else{
            element.dataset.posX = event.touches[0].clientX;
        }
        const offset = calcOffset(element);
        element.animate({
            marginLeft: `${offset}px`,
        }, {duration: 1000, fill: "forwards", easing: "ease"});
    });
}

function handleMouseOut(event){
    projTrack.forEach((element) => {
        // element.href = element.dataset.url;
        if(element.dataset.prevX === "0"){return;}
        if(event.type !== "touchend"){
            element.dataset.posX = event.clientX;
            const offset = calcOffset(element);
            element.animate({
                marginLeft: `${offset}px`,
            }, {duration: 1500, fill: "forwards", easing: "ease-in-out"});
        }
        document.body.style.cursor = "default";
        console.log(event.type);
        element.dataset.prevX = 0;
    });
}

function handleScrollOn(event){
    console.log("scrollon");
    projTrack.forEach((element) => {
        element.dataset.prevMargin = window.getComputedStyle(element).marginLeft;
        element.dataset.multi = Math.random() + 1.0;
    });
}

function handleScrollEvent(event){
    if(Date.now() - pastScrollTime < 100){event.preventDefault(); return;}
    if(event.deltaX === 0){
        projTrack.forEach((element) => {
            element.dataset.prevMargin = window.getComputedStyle(element).marginLeft;
            element.dataset.multi = Math.random() + 1.0;
        });
        return;
    }
    else{
        event.preventDefault();
        if(Date.now() - pastScrollStart > 400 || projTrack[0].dataset.prevDelta > 0 !== event.deltaX > 0){
            handleScrollOn(event);
        }
        pastScrollStart = Date.now();
    }

    pastScrollTime = Date.now();
    console.log("scroll");

    projTrack.forEach((element) => {
        const offset = calcOffset(element, true);
        element.dataset.prevDelta = event.deltaX;
        element.animate({
            marginLeft: `${offset}px`,
        }, {duration: 100, fill: "forwards", easing: "linear"});
    });

}



export async function updateProjects(reloadProjects){
    console.log("requesting...");
    files = await fetch("../projects/getProjects", {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
    }).then((response) => {
        return response.json();
    });
    if(reloadProjects){
        await buildProjects();
    }
}

function populateDeleteForms(){
    const deleteFormUser = document.getElementById("delete-form-user");
    deleteFormUser.innerHTML = "";
    let users;

    if(permissions !== "admin"){
        users = [username];
    }
    else{
        users = [...userProjectMap.keys()]
    }
    for(const user of users){
        const userOption = document.createElement("option");
        userOption.value = user;
        userOption.innerText = user;
        deleteFormUser.appendChild(userOption);
    }
}

export function deleteFormUserChange(event){
    console.log("change");
    const deleteFormProject = document.getElementById("delete-form-project");
    deleteFormProject.innerHTML = "";
    const user = event ? event.target.value : username;
    for(const project of userProjectMap.get(user)){
        console.log(project);
        const projectOption = document.createElement("option");
        projectOption.value = project;
        projectOption.innerText = project;
        deleteFormProject.appendChild(projectOption);
    }
}

async function buildProjects(event){
    //remove event listeners
    projectList.forEach((element) => {
        element.removeEventListener("mousedown", handleMouseClick); 
        element.removeEventListener("touchstart", handleMouseClick);
        element.removeEventListener("wheel", handleScrollEvent);
    });

    const projectContainer = document.getElementById("projects-container");
    projectContainer.innerHTML = "";
    userProjectMap.clear();

    for (const user in files.projects){
        const userProjectContainer = document.createElement("div");
        const frameContainer = document.createElement("div");
        const userTitle = document.createElement("h3");
        
        userProjectMap.set(user, []);
        userProjectContainer.classList.add("user-projects-container");
        userProjectContainer.setAttribute("data-user", user);
        frameContainer.classList.add("frame-container");

        frameContainer.dataset.prevX = 0;
        frameContainer.dataset.posX = 0;
        frameContainer.dataset.prevMargin = 0;
        frameContainer.dataset.multi = 1.0;
        frameContainer.dataset.pressed = Date.now();
        frameContainer.dataset.prevDelta = 0;

        if(user === username){
            userTitle.setAttribute("id", "user-project");
        }
        userTitle.classList.add("user-title");
        userTitle.innerHTML = user;
        userProjectContainer.appendChild(userTitle);
        let numberProjects = 0;

        for(const project in files.projects[user]){
        /*  iframe preview stuffies
            let projectFrame = document.createElement("iframe");
            projectFrame.classList.add("project-frame");
            projectFrame.setAttribute("display", "inline-block");
           //console.log("http://localhost:3000/projects/Andrew%20Xia/crjhorchestra-main/index.html")
            projectFrame.src = `${BASE_URL}/projects/${user}/${project}/` + await fetch(`projects/${user}/${project}/homePath.txt`, {method: "GET"}).then((response) => {
                return response.text();
            });
            projectFrame.setAttribute("data-project", project);
        */
            userProjectMap.get(user).push(project);
            numberProjects++;
            const projectFrame = document.createElement("a");
            const projectFrameText = document.createElement("span");
            const downloadButton = document.createElement("a");

            projectFrameText.innerText = project;
            projectFrame.appendChild(projectFrameText);
            projectFrame.href = `${BASE_URL}/projects/${user}/${project}/`;
            projectFrame.classList.add("project-frame");
            projectFrame.setAttribute("draggable", "false");
            projectFrame.setAttribute("data-url", `${BASE_URL}/projects/${user}/${project}/` + await fetch(`${BASE_URL}/projects/${user}/${project}/homePath.txt`, {method: "GET"}).then((response) => {
                return response.text();
            }));

            downloadButton.innerHTML = `<img src="assets/buttons/download.svg" draggable="false">`;
            downloadButton.classList.add("download-project-button");
            downloadButton.href = `${BASE_URL}/projects/download/?user=${user}&project=${project}/`;
            downloadButton.download = `${BASE_URL}/projects/download/?user=${user}&project=${project}/`;

            const projectFrameImg = document.createElement("img");

            projectFrameImg.src = `${BASE_URL}/projects/${user}/${project}/preview.png`;
            projectFrameImg.setAttribute("draggable", "false");
            
            projectFrame.appendChild(downloadButton);
            projectFrame.appendChild(projectFrameImg);
            frameContainer.appendChild(projectFrame);

            userProjectContainer.appendChild(frameContainer);
        }
        userProjectContainer.dataset.numberProjects = numberProjects;
        if(user === username){
            projectContainer.prepend(userProjectContainer);
        }
        else{
            projectContainer.appendChild(userProjectContainer); 
        }
    }
    if(!userProjectMap.has(username)){
        userProjectMap.set(username, ["no projects yet!"]);
    }
    projectList = document.querySelectorAll(".user-projects-container");
    projTrack = document.querySelectorAll(".frame-container");
    projectList.forEach((element) => {
        element.addEventListener("mousedown", handleMouseClick); 
        element.addEventListener("touchstart", handleMouseClick);
        element.addEventListener("wheel", handleScrollEvent);
    });

    if(username)deleteFormUserChange();
    setMaxWidthTitle();
    userTitleWidth = parseInt(window.getComputedStyle(document.querySelector(".user-title")).width);
    console.log("build finish");
}
function handleResize(event){
    setMaxWidthTitle();
}


document.addEventListener("DOMContentLoaded", async() => {
    //redundancy
    
    projectList = document.querySelectorAll(".user-projects-container");
    projTrack = document.querySelectorAll(".frame-container");
    userTitleWidth = 0;

    await updateProjects(true);
    // await buildProjects();
    console.log(files);
    
    if(username){
        const deleteFormUser = document.getElementById("delete-form-user");
        populateDeleteForms();
        deleteFormUserChange();
        deleteFormUser.addEventListener("change", deleteFormUserChange);
    }

    window.addEventListener("resize", handleResize);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseOut);
    window.addEventListener("touchend", handleMouseOut);
});