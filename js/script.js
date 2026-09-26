
// ===============================
// ENVELOPE OPENING
// ===============================


const envelopeScreen = document.getElementById("envelopeScreen");
const envelopeWrapper = document.getElementById("openEnvelope");
const mainCard = document.getElementById("mainCard");



envelopeWrapper.addEventListener("click", () => {


    envelopeWrapper.classList.add("open");


    setTimeout(() => {


        envelopeScreen.style.display = "none";


        mainCard.classList.remove("hidden");


        window.scrollTo({

            top:0,

            behavior:"smooth"

        });


    },1200);



});







// ===============================
// GUEST NAME
// ===============================


// فعلاً دستی
// بعداً از لینک مثل:
// noora.com/?guest=مهناز
// دریافت می‌کنیم


const guestName = "مهمان عزیز";


document.getElementById("introName").innerText = guestName;









// ===============================
// COUNTDOWN
// ===============================


// تاریخ جشن
// پنجشنبه 9 مهر ساعت 18


const eventDate = new Date(
    "2026-10-01T18:00:00"
);



function updateCountdown(){


    const now = new Date();


    const difference =
    eventDate - now;



    if(difference <=0){

        return;

    }




    const days =
    Math.floor(
        difference /
        (1000*60*60*24)
    );



    const hours =
    Math.floor(
        (difference /
        (1000*60*60))
        %24
    );



    const minutes =
    Math.floor(
        (difference /
        (1000*60))
        %60
    );



    const seconds =
    Math.floor(
        (difference /
        1000)
        %60
    );




    document.getElementById("days").innerText =
    days;



    document.getElementById("hours").innerText =
    hours;



    document.getElementById("minutes").innerText =
    minutes;



    document.getElementById("seconds").innerText =
    seconds;



}




updateCountdown();


setInterval(
    updateCountdown,
    1000
);








// ===============================
// SCROLL REVEAL
// ===============================


const sections =
document.querySelectorAll(".section");



const observer =
new IntersectionObserver(
(entries)=>{


entries.forEach(entry=>{


if(entry.isIntersecting){


entry.target.classList.add("show");


}


});


},
{

threshold:.15

}

);




sections.forEach(section=>{


observer.observe(section);


});
