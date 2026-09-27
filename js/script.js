// =========================
// REVEAL ANIMATION
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
.forEach(section=>{

observer.observe(section);

});






// =========================
// COUNTDOWN
// =========================


const targetDate = new Date(
"2026-10-01T18:00:00"
);



const dayEl =
document.getElementById("day");


const hourEl =
document.getElementById("hour");


const minuteEl =
document.getElementById("minute");


const secondEl =
document.getElementById("second");





function persianNumber(num){

return String(num)
.padStart(2,"0")
.replace(
/\d/g,
d=>"۰۱۲۳۴۵۶۷۸۹"[d]
);

}




function updateCountdown(){


const now = new Date();


const distance =
targetDate - now;



if(distance <= 0){

return;

}



const days =
Math.floor(distance / 86400000);



const hours =
Math.floor(distance / 3600000)%24;



const minutes =
Math.floor(distance / 60000)%60;



const seconds =
Math.floor(distance / 1000)%60;




dayEl.innerHTML =
persianNumber(days);



hourEl.innerHTML =
persianNumber(hours);



minuteEl.innerHTML =
persianNumber(minutes);



secondEl.innerHTML =
persianNumber(seconds);



}



setInterval(updateCountdown,1000);

updateCountdown();







// =========================
// MUSIC
// =========================


const music =
document.getElementById("music");


let playing=false;


music.volume = 0.35;





function playMusic(){


music.play()

.then(()=>{

playing=true;

console.log("Music started");

})


.catch(()=>{

console.log(
"Autoplay blocked by browser"
);

});

}





// تلاش بعد از ۲ ثانیه


setTimeout(()=>{


playMusic();


},2000);







// اگر مرورگر بلاک کرد
// اولین تعامل کاربر فعالش می‌کند


document.addEventListener(

"click",

()=>{


if(!playing){

playMusic();

}


},

{
once:true
}

);




document.addEventListener(

"touchstart",

()=>{


if(!playing){

playMusic();

}


},

{
once:true
}

);






function toggleMusic(){


if(playing){


music.pause();


playing=false;



}

else{


playMusic();


}



}
