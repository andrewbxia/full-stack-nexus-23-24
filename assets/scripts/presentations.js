const presentationBody = document.getElementById("presentation-body");
const lpStyles = document.getElementById("lp-styles");
let presentationCards, randomTimeout, randomTimeoutIndex;
export let presentations;

function animateLightPurple(){
    // if(!lpStyles.innerHTML){
    //     lpStyles.innerHTML = `
    //     .bg-purple-light {
    //         animation: glow-pres-b 1.5s ease forwards;
    //     }
    //     `;
    // }
    // else{
        
    // }
    lpStyles.innerHTML = `
        .bg-purple-light {
            background-color: rgb(173, 143, 255);
        }
    `;
    setTimeout(() => {
        lpStyles.innerHTML = `
            .bg-purple-light {
                animation: glow-pres 1.5s ease forwards;
            }
        `;
    }, 0);
}

function animateAllRandomAfter(presCardsIndex){
    presentationCards[presCardsIndex].classList.remove("animate-before");
    presentationCards[presCardsIndex].classList.add("animate-after");
}

function animateAllRandom(){
    console.log("animate all random");
    if(randomTimeout){
        clearTimeout(randomTimeout);
        animateAllRandomAfter(randomTimeoutIndex);
    }
    randomTimeoutIndex = Math.floor(Math.random() * presentationCards.length);

    const randomPresentation = presentationCards[randomTimeoutIndex];
    randomPresentation.classList.remove("animate-after");
    randomPresentation.classList.add("animate-before");
    animateLightPurple();

    randomTimeout = setTimeout(() => animateAllRandomAfter(randomTimeoutIndex), 150);
    setTimeout(animateAllRandom, Math.random() * 1500 + 700);
}

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

        presentationCard.addEventListener("mouseenter", (event) => {
            console.log("hover");
            presentationCard.classList.remove("animate-after");
            presentationCard.classList.add("animate-before");
            animateLightPurple();
        });
        presentationCard.addEventListener("mouseleave", (event) => {
            console.log("mouseleave");
            presentationCard.classList.remove("animate-before");
            presentationCard.classList.add("animate-after");
        });

        description.appendChild(descriptionItem);
        presentationCard.appendChild(title);
        presentationCard.appendChild(description);

        presentationBody.appendChild(presentationCard);
    }
    presentationCards = document.querySelectorAll("#presentation-body a");
}

const headerBars = document.getElementById("header-bars");
const footerBars = document.getElementById("footer-bars");
const headerHeight = 20;
let header_bar_height = headerHeight;
let footer_bar_height = headerHeight;
const mod = 3;
let randomMod = Math.floor(Math.random() * mod);
// silly ah openai inspired header and footer designs

while(header_bar_height > 0){
    const headerBar = document.createElement("div");
    headerBar.classList.add("bg-purple" + (header_bar_height % mod === randomMod ? "-light" : "-dark"));
    headerBar.style.height = (headerHeight - header_bar_height) + "px";
    headerBar.style.marginTop = header_bar_height + "px";
    headerBars.appendChild(headerBar);
    header_bar_height = header_bar_height > 10 ? header_bar_height / 2 : header_bar_height - 1;
}

randomMod = Math.floor(Math.random() * 3);

while(footer_bar_height > 0){
    const footerBar = document.createElement("div");
    footerBar.classList.add("bg-purple" + (footer_bar_height % mod === randomMod ? "-light" : "-dark"));
    footerBar.style.height = footer_bar_height + "px";
    footerBar.style.marginTop = (headerHeight - footer_bar_height) + "px";
    footerBar.classList.add("animate-after");
    footerBars.appendChild(footerBar);
    footer_bar_height = footer_bar_height <= 10 ? footer_bar_height / 2 : footer_bar_height - 1;
}

await loadPresentations().then(() => {
    animateAllRandom();
});