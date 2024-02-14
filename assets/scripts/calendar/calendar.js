const calendarTable = document.getElementById("calendar");
const dateField = document.getElementById("date");
const displayedDate = document.getElementById("input-month-year");
export const calendarRows = document.querySelectorAll(".calendar-row");
let eventData = await fetch(BASE_URL + "/calendar/events").then(response => response.json());

export function getEventData(){
    return eventData;
}

export async function updateEventData(){
    eventData = await fetch(BASE_URL + "/calendar/events").then(response => response.json());
    console.log("event data updated");
}

function setEvents(monthOffset){
    //get events for current selected month
    const date = new Date();
    date.setMonth(date.getMonth() + monthOffset);
    const firstDayDate = new Date(date.getFullYear(), date.getMonth(), 1);

    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    eventData.forEach(event => {
        const eventDate = new Date(event.date + "T00:00:00");
        const datePos = eventDate.getDate() + firstDayDate.getDay() - 1;
        if(eventDate.getFullYear() === year && eventDate.getMonth() === month){

            let eventCellText = "";

            if(!document.querySelector(`#day-${eventDate.getDate()} > .eventText`)){
                const eventTextDiv = document.createElement("div");
                eventTextDiv.className = "eventText";
                document.getElementById(`day-${eventDate.getDate()}`).appendChild(eventTextDiv);
                document.getElementById(`day-${eventDate.getDate()}`).style.backgroundColor = "rgb(23, 235, 147)";
            }
            else{
                eventCellText += `--------------------
                `
            }

            const eventTextElement = document.createElement("p");
            

            eventCellText += `
            -- ${event.title} --
            Location: ${event.location}
            Description: ${event.description}
            `;

            if(event.starttime === event.endtime){
                eventCellText += `
                Time: ${event.starttime}
                `;
            }else{
                eventCellText += `
                Start Time: ${event.starttime}
                End Time: ${event.endtime}
                `;
            }
            
            eventTextElement.innerText = eventCellText;
            document.querySelector(`#day-${eventDate.getDate()} > .eventText`).appendChild(eventTextElement);
        }

    });
}


export function buildCalendar(monthOffset){
    calendarRows.forEach(row => {
        row.innerHTML = "";
        for(let i = 0; i < 7; i++){
            const day = document.createElement("td");
            row.appendChild(day);
        }
    });

    const date = new Date();
    date.setMonth(date.getMonth() + monthOffset);


    const firstDayDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOffset = firstDayDate.getDay();
    const numDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    // console.log(numDays);
    
    for(let i = dayOffset; i < dayOffset + numDays; i++){
        const dayNumber = i - dayOffset + 1;
        const weekElement = calendarRows[Math.floor(i / 7)];
        const dayElement = weekElement.cells[i % 7];
        const dayNumberElement = document.createElement("p");

        dayNumberElement.className = "calendar-day-number";
        dayNumberElement.innerText = dayNumber;
        dayElement.setAttribute("id", `day-${dayNumber}`);
        dayElement.appendChild(dayNumberElement);
    }

    setEvents(monthOffset);
    console.log("build done");

}

export function getMonthOffset(){
    const dateInput = new Date(dateField.value + "T00:00:00");
    const currDate = new Date();
    return dateInput.getMonth() - currDate.getMonth() + (dateInput.getFullYear() - currDate.getFullYear()) * 12;
}

export function changeDayHighlight(){
    const dateInput = new Date(dateField.value + "T00:00:00");
    buildCalendar(getMonthOffset());

    const firstDayDate = new Date(dateInput.getFullYear(), dateInput.getMonth(), 1);
    const inputDay = firstDayDate.getDay() + dateInput.getDate() - 1;
    const dayElement = calendarRows[Math.floor(inputDay / 7)].cells[inputDay % 7];

    dayElement.style.backgroundColor = dayElement.style.backgroundColor === "rgb(23, 235, 147)" ? "rgb(138, 167, 255)" : "lightgreen";
}

function changeDisplayedDate(){
    const dateInput = new Date(dateField.value + "T00:00:00");
    const month = dateInput.getMonth() + 1;
    const year = dateInput.getFullYear();
    displayedDate.innerText = `${month}/${year}`;
}

function nextMeeting(){
    const eventDataCopy = getEventData();



    if(eventDataCopy.length === 0){
        document.getElementById('next-meeting-date').innerHTML = "Next Meeting/Event: N/A";
    }
    else{
        eventDataCopy.sort((a, b) => (a.date > b.date) ? 1 : -1);
        const currDate = new Date().toISOString().split('T')[0];
        console.log(currDate);

        let eventDate = 0//first query in eventData


        

        while(eventDate < eventDataCopy.length - 1 && currDate > eventDataCopy[eventDate].date){
            eventDate++;
        }

        let warningText;

        if(currDate === eventDataCopy[eventDate].date){
            warningText = "Today's Meeting/Event: " + eventDataCopy[eventDate].date + " ( TODAY!! )";
        }
        else if(currDate < eventDataCopy[eventDate].date){
            warningText = "Next Meeting/Event: " + eventDataCopy[eventDate].date;
        }
        else{
            warningText = "Next Meeting/Event: N/A";
        }
        document.getElementById('next-meeting-date').innerHTML = warningText;

        if(currDate <= eventDataCopy[eventDate].date){

            const eventLink = document.createElement('a');
            eventLink.href = BASE_URL + "/calendar/event/" + eventDataCopy[eventDate].id;
            eventLink.innerText = "Click here to view event details!!";
            document.getElementById('next-meeting-date').parentElement.appendChild(eventLink);
        }
    }
}

dateField.value = new Date().toISOString().split('T')[0];
dateField.addEventListener("change", changeDayHighlight);
dateField.addEventListener("change", changeDisplayedDate);

nextMeeting();
buildCalendar(0);
changeDayHighlight();
changeDisplayedDate();
