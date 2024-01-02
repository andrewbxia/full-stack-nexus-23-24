import { buildCalendar, calendarRows, updateEventData, getMonthOffset, changeDayHighlight } from "./calendar.js";
const submitForm = document.getElementById("submit-form");



async function submitEvent(event){
    event.preventDefault();
    
    const formData = new FormData(submitForm);
    const url = BASE_URL + "/calendar/submitEvent";

    let dataJSON = {};
    for (const [key, value]  of formData.entries()) {
        dataJSON[key] = value;
    }
    const dataJSONString = JSON.stringify(dataJSON);


    const eventResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: dataJSONString,
    });

    const response = await eventResponse.json();


    if(response.message !== "ERROR"){
        await updateEventData();
        buildCalendar(getMonthOffset());
        changeDayHighlight();
        console.log(response.message);
        alert('Response: ' + response.message);
    }
    else{
        // Handle any errors
        alert("error: " + response.error);
        console.error('Error: ' + response.error);
    }
}


submitForm.addEventListener("submit", submitEvent);
