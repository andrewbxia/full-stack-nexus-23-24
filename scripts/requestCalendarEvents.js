import { buildCalendar } from "./buildCalendar.js";
import { changeDayHighlight } from "./handleButtons.js";
import { doneRequestingDataListener } from "./hoverTooltips.js";


const loginButton = document.getElementById("login-button");
const resetDisplayButton = document.getElementById("reset-displayed-data");
const requestForm = document.getElementById("see-data");
const displayDataHtml = document.getElementById("see-form-data");
const updataDataButton = document.getElementById("update-data");
export let eventData;//eventData.events contains the calendar data!!!

const doneRequestingData = new Event("DoneRequestingData");

function displayData(data) {
  console.log("displaying data");
  displayDataHtml.innerHTML = "";

  data.events.forEach(event => {
    let displayElement = document.createElement("div");
    displayElement.className = "displayed-data";
    displayElement.innerText += " | ";
    for (const key in event) {
      if (event[key] === null) {
        displayElement.innerHTML += `${key}: <strong>${event[key]}</strong> | `;
      } else {
        displayElement.innerText += `${key}: ${event[key]} | `;
      }
    }
    
    displayDataHtml.appendChild(displayElement);
  });

  resetDisplayButton.style.display = "inline";
  console.log("successfully displayed data");
}

export async function requestData(blockDisplay = true) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: BASE_URL + "/calendar/readResponse",
      type: "POST",
      success: function(data) {
        if (blockDisplay) {
          console.log(data);
        }
        resolve(data);
      },
      error: function(jqXHR, textStatus, err) {
        console.error(err);
        reject(err);
      }
    });
  });
}
eventData = await requestData();
export function getMonthData(dateString) {
  try {
    //const arr = eventData;

      const monthData = $.grep(eventData.events, function (item) {
      const yearMonth = item.date.slice(0, 7);
      const yearMonthWanted = dateString.slice(0, 7);

      return yearMonth === yearMonthWanted;
    });
/*
    for (const item of monthData) {
      console.log("arr" + item.date);
    }*/
    
    return monthData;
  } catch (err) {
    console.error("Error: " + err);
    throw err; // rethrow the error to handle it elsewhere.
  }
}
export function addToEventData(val){
  eventData.events.push(val);
  //changeDayHighlight();
}

$(document).ready(async () => {
  // Wait for the requestData to complete before setting up event listeners
  await requestData().then((data) => {
    eventData = data;

    updataDataButton.addEventListener("click", async (event) => {
      event.preventDefault();
      eventData = await requestData();
      doneRequestingDataListener.dispatchEvent(doneRequestingData);
    });

    requestForm.addEventListener("submit", (event) => {
      event.preventDefault();
      displayData(eventData);
      changeDayHighlight();
    });

    resetDisplayButton.addEventListener("click", (event) => {
      event.preventDefault();
      displayDataHtml.innerHTML = "";
      resetDisplayButton.style.display = "none";
    });
    loginButton.addEventListener("SubmitEvent", (data) => {
      eventData += data.data;
    });
    
  }).catch(error => {
    console.error(error);
  }).then(() => {
    doneRequestingDataListener.dispatchEvent(doneRequestingData);
  });
  
});