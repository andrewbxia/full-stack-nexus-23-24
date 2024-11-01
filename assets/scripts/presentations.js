const presentationBody = document.getElementById("presentation-body");
const nonmemberWarningCard = document.getElementById("non-member-warning");
let warningCardAnimation;
const lpStyles = document.getElementById("lp-styles");
const timeoutlimit = 0.1;
let presentationCards, randomTimeout, randomTimeoutIndex, focusIndex;
const glowHTML = `
        .bg-purple-light {
            animation: glow-pres 1.5s ease forwards;
        }
    `;

export let presentations;


function animateLightPurple(){

    lpStyles.innerHTML = `
        .bg-purple-light {
            background-color: rgb(173, 143, 255);
        }
    `;
    setTimeout(() => {
    lpStyles.innerHTML = glowHTML;
    }, timeoutlimit);
}

function animateAllAfter(presCardsIndex){
    presentationCards[presCardsIndex].classList.remove("animate-before");
    presentationCards[presCardsIndex].classList.add("animate-after");
}

// function animateAllAfterSpecific(index){
//     presentationCards[index].classList.remove("animate-before");
//     presentationCards[index].classList.add("animate-after");
// }

function animateSpecific(index){
    const randomPresentation = presentationCards[index];
    randomPresentation.classList.remove("animate-after");
    randomPresentation.classList.add("animate-before");
    animateLightPurple();

    // setTimeout(() => animateAllAfter(index), 150);
}

function animateAllRandom(){
    // if(randomTimeout){
    //     clearTimeout(randomTimeout);
    //     animateAllAfter(randomTimeoutIndex);
    // }
    randomTimeoutIndex = Math.floor(Math.random() * presentationCards.length);
    const randomPresentation = presentationCards[randomTimeoutIndex];
    randomPresentation.classList.remove("animate-after");
    randomPresentation.classList.add("animate-before");
    animateLightPurple();

    /*randomTimeout = */setTimeout(() => animateAllAfter(randomTimeoutIndex), 180);
    setTimeout(animateAllRandom, Math.random() * 1500 + 1000);
}

export async function loadPresentations() {
    presentationBody.innerHTML = "";
    if(!funny)
        presentations = await fetch(BASE_URL + "/presentations/getPresentations").then((response) => response.json());
    else{
        presentations = [];
        for(let i = 0; i < 300; i++){
            presentations.push({
                title: "~~~~",
                id: i,
                description: "~~~~~~",

            });
        }
    }
    console.log("loading presentations ");

    
    if(presentations.length === 0){
        for(const text of ["No presentations yet!", "Add a presentation to get rid of this! :)"]){
            const presentationCard = document.createElement("a");
            const title = document.createElement("h2");
            title.innerText = text;
            presentationCard.appendChild(title);
            presentationBody.appendChild(presentationCard);

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
        }
    }

    for (const presentation of presentations) {
        console.log(presentation.title);
        const presentationCard = document.createElement("a");
        presentationCard.classList.add("presentation-card");
        presentationCard.setAttribute('draggable', false);
        presentationCard.dataset.index = presentation.id - 1;
        presentationCard.href = BASE_URL + "/presentations/" + presentation.id;
        if(funny) presentationCard.href = "javascript:void(0);";

        const title = document.createElement("h2");
        title.innerText = presentation.title + " - Week " + presentation.id;

        const description = document.createElement("ul");
        const descriptionItem = document.createElement("li");
        descriptionItem.innerText = presentation.description;

        description.appendChild(descriptionItem);
        presentationCard.appendChild(title);
        presentationCard.appendChild(description);

        presentationCard.addEventListener("mouseenter", (event) => {
            console.log("hover");
            presentationCard.classList.remove("animate-after");
            presentationCard.classList.add("animate-before");
            animateLightPurple();
        });
        presentationCard.addEventListener("mouseleave", (event) => {
            console.log("mouseleave");
            setTimeout(() => {
                
                presentationCard.classList.add("animate-after");
                presentationCard.classList.remove("animate-before");
            }, funny ? 150 : 30);
        });
        
        // presentationCard.addEventListener("focus", (event) => {
        //     console.log("focus");
        //     animateSpecific(event.target.dataset.index);
        //     setTimeout(() => {
        //         animateAllAfter(event.target.dataset.index);
        //     }, 150);
        
        // });

        // presentationCard.addEventListener("blur", (event) => {
        //     console.log("focusout");
        //     animateAllAfter(event.target.dataset.index);
        // });

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
    footer_bar_height = footer_bar_height > 10 ? footer_bar_height / 2 : footer_bar_height - 1;
}

nonmemberWarningCard.addEventListener("animationend", (event) => {
    console.log("animation end");
    nonmemberWarningCard.style.display = "none";
    nonmemberWarningCard.style.animation = "";
});



await loadPresentations().then(() => {
    animateAllRandom();
    document.querySelectorAll(".presentation-card").forEach((element) => {
        // console.log(element);
        element.addEventListener("click", (event) => {
            event.preventDefault();
            if(username){
                window.location.href = event.target.closest("a").href;
            }
            else{
                if(funny) return;
                console.log("not logged in")
                nonmemberWarningCard.style.display = "block";
                nonmemberWarningCard.style.animation = "";
                setTimeout(() => {
                    nonmemberWarningCard.style.animation = "notify 5s ease-in forwards";
                }, 1);
                // nonmemberWarningCard.style.animation = "notify 3.5s ease-in forwards";
            }
        });
    });
});