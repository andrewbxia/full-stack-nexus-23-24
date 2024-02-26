import {presentations, loadPresentations} from "./presentations.js";
const responseMessages = document.getElementById("response-messages");
const actions = ["upload", "insert", "delete", "update"];
console.log("admin");

actions.forEach((action) => {
    console.log(action);
    document.getElementById(action).addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = new FormData(event.target);
        console.log(form);
        try {
            const response = {
                method: "POST",
                mode: "cors",
                cache: "no-cache",
                credentials: "include",
                redirect: "follow",
                referrerPolicy: "no-referrer",
                body: form,
            }
            if (action === "delete") {
                response.headers = {
                    "Content-Type": "application/json"
                };
                //convert formdata obj to regular json
                const formDataObj = {};
                for (let pair of form.entries()) {
                    formDataObj[pair[0]] = pair[1]; 
                }
                response.body = JSON.stringify(formDataObj);
            }

        
            let serverresponse = "0sdf";
            await fetch(BASE_URL + `/presentations/${action}`, response)
                .then(async (res) => updateResponseText(await res.json()));
        }
        catch (err) {
            console.log(err);
            updateResponseText({message: "ERROR", error: err.message})
        }
        loadPresentations();
    });
});

function updateResponseText(response){ //response is json obj
    console.log(response);
    console.log(response.message);
    const responseMessage = document.createElement("p");
    if(response.message !== "ERROR"){
        responseMessage.innerText = response.message;
    }
    else{
        responseMessage.innerText = response.error;
    }
    responseMessages.appendChild(responseMessage);
    responseMessages.appendChild(document.createElement("br"));
}