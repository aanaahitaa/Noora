document.addEventListener(
"DOMContentLoaded",
()=>{


/* =========================
   CREATE STARS
========================= */


const layer =
document.querySelector(".stars-layer");


for(let i=0;i<35;i++){


const star =
document.createElement("div");


star.className="star";


star.innerHTML="✦";


star.style.left=
Math.random()*100+"%";


star.style.top=
Math.random()*100+"%";


star.style.fontSize=
(8+Math.random()*18)+"px";


star.style.animationDelay=
Math.random()*3+"s";


layer.appendChild(star);


}





/* =========================
   REVEAL
========================= */


const sections =
document.querySelectorAll(".reveal");


const observer =
new IntersectionObserver(
entries=>{


entries.forEach(
entry=>{


if(entry.isIntersecting){

entry.target.classList.add(
"visible"
);

}


}

)


},
{
threshold:.15
}
);



sections.forEach(
section=>
observer.observe(section)
);









/* =========================
   COUNTDOWN
========================= */


const target =
new Date(
"2026-10-01T18:00:00"
);



function persianNumber(num){

return String(num)
.padStart(2,"0")
.replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d]);

}




function countdown(){


const now=new Date();


const diff =
target-now;



if(diff<0)return;



let days =
Math.floor(
diff/(1000*60*60*24)
);



let hours =
Math.floor(
diff%(1000*60*60*24)/
(1000*60*60)
);



let minutes =
Math.floor(
diff%(1000*60*60)/
(1000*60)
);



let seconds =
Math.floor(
diff%(1000*60)/
1000
);




document.getElementById("days").innerText=
persianNumber(days);


document.getElementById("hours").innerText=
persianNumber(hours);


document.getElementById("minutes").innerText=
persianNumber(minutes);


document.getElementById("seconds").innerText=
persianNumber(seconds);



}


countdown();

setInterval(
countdown,
1000
);










/* =========================
   MUSIC
========================= */


const music =
document.getElementById("bgMusic");


const btn =
document.getElementById("musicToggle");


let playing=false;



btn.addEventListener(
"click",
()=>{


if(!playing){


music.play();


btn.innerHTML="🔊";


playing=true;


}

else{


music.pause();


btn.innerHTML="🎵";


playing=false;


}


});




});
