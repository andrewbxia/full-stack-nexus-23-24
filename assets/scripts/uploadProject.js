import { updateProjects, deleteFormUserChange } from "./projects.js";
let messageText, submitForm, deleteForm;

async function setUploadStatus(status){
    const {message, error} = status;
    messageText.innerText = message;
    if(message === "ERROR"){
        messageText.innerHTML += `<p class="warning-text">${error}</p>`;
    }
    await updateProjects(true).then( () => {
        submitForm.style.visibility = "visible";
    });
}

async function submitProject(event){
    event.preventDefault();
    submitForm.style.visibility = "hidden";
    messageText.innerText = "Uploading...";

    const formData = new FormData(this);
    console.log(formData);
    try{
        const response = await fetch(BASE_URL + "/projects/upload", {
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
        }).then((response) => {
            return response.json();
        //     const reader = response.body.getReader();
        //     return new ReadableStream({
        //         start(controller) {
        //             return pump();
        //             function pump(){
        //                 return reader.read().then(({done, value}) => {
        //                     if(done){
        //                         controller.close();
        //                         return;
        //                     }
        //                     controller.enqueue(value);
        //                     return pump();
        //                 });
        //             }
        //         }
        //     });
        // }).then(stream => new Response(stream).blob()).then(async (dataStream) => {
        //     setUploadStatus(await dataStream.json());
        });

        await setUploadStatus(response);
        
    }
    catch(err){
        await setUploadStatus({message: "ERROR", error: err.message});
    }
        
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