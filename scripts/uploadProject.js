import { updateProjects, deleteFormUserChange } from "./projects.js";
let messageText, submitForm, deleteForm;
async function submitProject(event){
    event.preventDefault();
    submitForm.style.visibility = "hidden";
    messageText.innerText = "Uploading...";
    const formData = new FormData(this);
    
    //hoiw would i get this value from the form on the serverside?
    //answer here: https://stackoverflow.com/questions/15772394/how-to-upload-display-and-save-images-using-node-js-and-express
    //
    //
    console.log(formData);
    //console.log(data);
    await fetch(BASE_URL + "/projects/upload", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "include",
        // headers: {
        //     "Content-Type": "multipart/form-data",
        // },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: formData,
    }).then(async (response) => {
        console.log("response");
        return await response.json();
    }).then(async (data) => {
        messageText.innerText = data.message;
        if(data.message === "ERROR"){
            messageText.innerHTML += `<p class="warning-text">${data.error}</p>`;
        }
        await updateProjects(true);
        submitForm.style.visibility = "visible";
    });
}

async function deleteProject(event){
    event.preventDefault();

    const formData = {
        project: deleteForm.project.value,
        user: deleteForm.user.value
    };
    console.log(formData);

    deleteForm.style.visibility = "hidden";
    messageText.innerText = "awaiting deletion...";

    await fetch(BASE_URL + "/projects/delete", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "include",
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(formData),
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(async (response) => {
        console.log("response");
        return await response.json();
    }).then(async (data) => {
        messageText.innerText = data.message;
        if(data.message === "ERROR"){
            messageText.innerHTML += `<p class="warning-text">${data.error}</p>`;
        }
        await updateProjects(true);
        deleteForm.style.visibility = "visible";
    });
}


document.addEventListener("DOMContentLoaded", () => {
    submitForm = document.getElementById("upload-form");
    deleteForm = document.getElementById("delete-form");
    messageText = document.getElementById("message-text");

    submitForm.addEventListener("submit", submitProject);
    deleteForm.addEventListener("submit", (event) => {
        deleteProject(event);
        deleteFormUserChange();
    });
});