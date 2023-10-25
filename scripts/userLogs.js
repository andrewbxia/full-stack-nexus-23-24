window.addEventListener("beforeunload", (event) => {
    event.preventDefault();
    event.returnValue = '';
    $.ajax({
        url: "/logUser",
        type: "POST"
    });
    
});