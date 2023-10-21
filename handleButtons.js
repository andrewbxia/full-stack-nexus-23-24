import { createCalendarBlank, buildCalendar } from "./buildCalendar.js"
import { doneRequestingDataListener } from "./hoverTooltips.js";

export async function changeDayHighlight(){
    const currDate = new Date();

    var newDate = new Date(document.getElementById("date").value);
    newDate.setDate(newDate.getDate() + 1);

    let monthOffset = newDate.getMonth() - currDate.getMonth();
    monthOffset += (newDate.getFullYear() - currDate.getFullYear()) * 12;

    buildCalendar(monthOffset);
    
    document.getElementById(`day-${newDate.getDate()}`).style.backgroundColor = "lightgreen";
}

doneRequestingDataListener.addEventListener("DoneRequestingData", () => {
    //createCalendarBlank();
    console.log("current date: " + (new Date().getDate() + 1));
    changeDayHighlight();
    const startTimeButton = document.getElementById("date");
    startTimeButton.addEventListener("change", changeDayHighlight);
});