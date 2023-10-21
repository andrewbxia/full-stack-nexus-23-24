import { getMonthData } from "./requestCalendarEvents.js";
export const doneRequestingDataListener = document.getElementById("calendar");


function buildTooltip(query){
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.innerText = query.innerText;
    query.parentNode.prepend(tooltip);
}

export function buildTooltips(){
    //const eventData = getMonthData();
    const events = document.querySelectorAll(".eventContainer");
    events.forEach(event => {
        if(event.innerHTML){
            if(event.innerHTML){
                buildTooltip(event);
            }
        }
    });
}
function removeTooltips(){
const events = document.querySelectorAll(".eventContainer");
    events.forEach(cell => {
        if(cell.innerHTML){
            console.error("yay");
        }
    });
}
/*
doneRequestingDataListener.addEventListener("DoneRequestingData", () => {
    console.error("dd");
    buildTooltips();
});
*/