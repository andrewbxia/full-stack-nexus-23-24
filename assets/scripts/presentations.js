const presentationBody = document.getElementById("presentation-body");
export let presentations;
export async function loadPresentations() {
    presentationBody.innerHTML = "";
    presentations = await fetch(BASE_URL + "/presentations/getPresentations").then((response) => response.json());

    console.log("loading presentations ");
    for (const presentation of presentations) {
        console.log(presentation.title);
        const presentationCard = document.createElement("a");
        presentationCard.href = BASE_URL + "/presentations/" + presentation.id;

        const title = document.createElement("h2");
        title.innerText = presentation.title + " - Week " + presentation.id;

        const description = document.createElement("ul");
        const descriptionItem = document.createElement("li");
        descriptionItem.innerText = presentation.description;

        description.appendChild(descriptionItem);
        presentationCard.appendChild(title);
        presentationCard.appendChild(description);

        presentationBody.appendChild(presentationCard);
    }
}

const headerBars = document.getElementById("header-bars");
const footerBars = document.getElementById("footer-bars");
const headerHeight = 20;
let header_bar_height = headerHeight;
let footer_bar_height = headerHeight;

// silly ah openai inspired header and footer designs

while(header_bar_height > 0){
    const headerBar = document.createElement("div");
    headerBar.classList.add("header-bar");
    headerBar.style.height = (headerHeight - header_bar_height) + "px";
    headerBar.style.marginTop = header_bar_height + "px";
    headerBars.appendChild(headerBar);
    header_bar_height = header_bar_height > 10 ? header_bar_height / 2 : header_bar_height - 1;
}

while(footer_bar_height > 0){
    const footerBar = document.createElement("div");
    footerBar.classList.add("footer-bar");
    footerBar.style.height = footer_bar_height + "px";
    footerBar.style.marginTop = (headerHeight - footer_bar_height) + "px";
    footerBars.appendChild(footerBar);
    footer_bar_height = footer_bar_height <= 10 ? footer_bar_height / 2 : footer_bar_height - 1;
}

loadPresentations();