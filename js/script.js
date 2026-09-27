// =========================
// Scroll Reveal
// =========================


const observer = new IntersectionObserver(

(entries)=>{


entries.forEach(entry=>{


if(entry.isIntersecting){

entry.target.classList.add("show");

}


});


},

{
threshold:0.15
}


);



document
.querySelectorAll(".reveal")
.forEach(item=>{

observer.observe(item);

});





// =========================
// Countdown
// =========================



const targetDate =
new Date("2026-10-01T18:00:00");



const day =
document.getElementById("day");


const hour =
document.getElementById("hour");


const minute =
document.getElementById("minute");


const second =
document.getElementById("second");





function persianNumber(number){


return String(number)

.padStart(2,"0")

.replace(
/\d/g,
d=>"۰۱۲۳۴۵۶۷۸۹"[d]
);


}






function updateCountdown(){


const now =
new Date();


const distance =
targetDate - now;



if(distance <=0){

return;

}




const days =
Math.floor(distance / 86400000);



const hours =
Math.floor(distance / 3600000)%24;



const minutes =
Math.floor(distance /60000)%60;



const seconds =
Math.floor(distance /1000)%60;




day.innerHTML =
persianNumber(days);



hour.innerHTML =
persianNumber(hours);



minute.innerHTML =
persianNumber(minutes);



second.innerHTML =
persianNumber(seconds);



}



setInterval(updateCountdown,1000);

updateCountdown();






// =========================
// Music
// =========================



const music =
document.getElementById("music");



let playing=false;



music.volume = 0.35;





// تلاش برای شروع بعد از اولین تعامل

document.addEventListener(
"click",
startMusic,
{
once:true
}
);



document.addEventListener(
"touchstart",
startMusic,
{
once:true
}
);






function startMusic(){


music.play()

.then(()=>{

playing=true;


})

.catch(()=>{


console.log(
"Browser blocked autoplay"
);


});


}







function toggleMusic(){



if(!playing){


music.play();


playing=true;



}

else{


music.pause();


playing=false;



}



}
