window.addEventListener("beforeunload", (event) => {
    event.preventDefault();
    event.returnValue = '';
    $.ajax({
        url: "calendar/logUser",
        type: "POST"
    });
    
});