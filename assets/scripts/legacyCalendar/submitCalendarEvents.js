import { buildCalendar } from "./buildCalendar.js";
import { changeDayHighlight } from "./handleButtons.js";
import { addToEventData } from "./requestCalendarEvents.js";

export var submitEvent;

function resetDataValues(){
  //$("#username").val("");
  $("#title").val("");
  $("#description").val("");
  
  const tzDate =  new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000)
  const currDate = tzDate.toISOString().slice(0, 10);
  const currTime = tzDate.toISOString().slice(11,16);

  $("#date").val($("#date").val() || currDate);
  $("#timestart").val(currTime);
  console.log("Current set time: " + currTime);
}

function logSubmit(event){

  event.preventDefault();
  //alert to other files
  
  //alert(`Form Submitted! Timestamp: ${event.timeStamp}`);
  const user = $("#username").val();
  const title = $("#title").val();
  const description = $("#description").val() || "None";
  const date = $("#date").val();
  const start = $("#timestart").val();
  const end = $("#timeend").val() || start;
  console.log(end);

  const eventPostData = {
    user: user,
    title: title,
    description: description,
    date: date,
    starttime: start,
    endtime: end
  }
  console.log(eventPostData);

  
  $.ajax({
    url: BASE_URL + "/legacy-calendar/handleResponse",
    type: "POST",
    
    data: eventPostData,  
    success: function(res){/*
      submitEvent = new CustomEvent("SubmitEvent", {//dispatches to login-button
        data: eventPostData,
      });
      document.getElementById("login-button").dispatchEvent(new CustomEvent("SubmitEvent", {//dispatches to login-button
        data: eventPostData,
      }));
*/
      resetDataValues();
      addToEventData(eventPostData);
      console.log(res);
      alert("successful");
      changeDayHighlight();
    

      
    },
    error: function(err) {
      console.error(err);
      alert("error uhhh");
    }
  });
/*
  request.done((req, res) => {

  });*/
}


const form = document.getElementById("login-form");

$(document).ready(() => {
  resetDataValues();
})
form.addEventListener("submit", logSubmit);
  