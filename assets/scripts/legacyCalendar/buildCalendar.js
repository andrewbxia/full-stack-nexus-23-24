import { getMonthData } from "./requestCalendarEvents.js";
import { doneRequestingDataListener } from "./hoverTooltips.js";
import { buildTooltips } from "./hoverTooltips.js";

const calendar = document.getElementById("calendar");
var offsetMonth = 0;
//row-n

export function createCalendarBlank(){
    const rows = 6, days = 7;
    for(let row = 1; row <= rows; row++){
        document.getElementById(`row-${row}`).innerHTML = "";
        //document.getElementById(`row-${row}`).style.removeProperty(width);
        //document.getElementById(`row-${row}`).style.removeProperty(height);
    }
    for(let row = 1; row <= rows; row++){

        for(let day = 0; day < days; day++){
            const dayElement = document.createElement("td");
            dayElement.className = "calendar-day-number";
            dayElement.innerText = "";

            document.getElementById(`row-${row}`).appendChild(dayElement);

        }
    }
}

export function buildCalendar(offset){
    createCalendarBlank();
    const date = new Date();
    console.log("offset" + offset);
    date.setMonth(date.getMonth() + offset);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const dayOffset = firstDay.getDay() - 1;//i starts at one

    console.log(firstDay.getDate());
    console.log(lastDay.getDate());

    const dateString = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 10);

    for(let day = firstDay.getDate(); day <= lastDay.getDate(); day++){
        const week = Math.floor((day + dayOffset) / 7) + 1;
        const dayOfWeek = (day + dayOffset) % 7;

        //console.log(`Week ${week}: Day ${dayOfWeek + 1}`);
        const p = document.createElement("p");
        p.innerText = day;

        document.getElementById(`row-${week}`).cells[dayOfWeek].appendChild(p);
        //document.getElementById(`row-${week}`).cells[dayOfWeek].style.className += `day-${day}`;
       //add classes
        $(`#row-${week}`).find("td").eq(dayOfWeek).attr("id", `day-${day}`);
        const eventContainer = document.createElement("div");
        eventContainer.className = "eventContainer";
        eventContainer.id = `eventContainer-${day}`;

        document.getElementById(`day-${day}`).prepend(eventContainer);

    }

    const currMonthData = getMonthData(dateString);
    $.each(currMonthData, (index, item) => {
        //console.log(item);
        var eventDay = item.date.slice(8, 10);
        if(eventDay[0] === "0")
            eventDay = eventDay.slice(1);

        //console.log(`#day-${eventDay}`)
        const eventDayElement = document.getElementById(`day-${eventDay}`).querySelector(".eventContainer");
        const spanEvent = document.createElement("div");
        spanEvent.className = "eventItem";
        var spanEventData = "";

        spanEventData += `
        User: ${item.user}
        Title: ${item.title}
        Description: ${item.description}
        `


        if(item.starttime == item.endtime){
            spanEventData += `
            Time: ${item.starttime}
            `
        }
        else{
            spanEventData += `
            Start Time: ${item.starttime}
            End Time:  ${item.endtime}
            `
        }

        spanEventData += "----\n";
        //console.log(spanEventData);

        spanEvent.innerText = spanEventData;
        //spanEvent.style.height = "100%";
        eventDayElement.appendChild(spanEvent);
    });
    buildTooltips();
    console.log(date.getMonth());
}

doneRequestingDataListener.addEventListener("DoneRequestingData", () => {
    createCalendarBlank();
    buildCalendar(0);

    console.log("calendar build finished");
});
