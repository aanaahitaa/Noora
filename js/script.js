/* =====================================================
   NOORA INVITATION
   script.js
===================================================== */



document.addEventListener(
"DOMContentLoaded",
()=>{



/* =========================
   PERSONAL GUEST NAME
========================= */


const params = new URLSearchParams(
window.location.search
);


const guest =
params.get("guest");



const introName =
document.getElementById(
"introName"
);



if(
guest &&
introName
){

introName.innerHTML =
`تقدیم با عشق به <strong>${guest}</strong>`;


}







/* =========================
   ENVELOPE OPEN
========================= */


const envelope =
document.getElementById(
"envelope"
);



const seal =
document.getElementById(
"seal"
);



if(envelope){


envelope.addEventListener(
"click",
()=>{


envelope.classList.toggle(
"open"
);



if(seal){

seal.style.transform =
"translate(-50%,-50%) scale(.9)";

setTimeout(()=>{

seal.style.transform =
"translate(-50%,-50%) scale(1)";


},500);


}


}

);


}









/* =========================
   RANDOM SPARKLES
========================= */


const sparkleContainer =
document.querySelector(
".sparkles"
);



function createSparkles(){


if(!sparkleContainer)
return;



for(
let i=0;
i<45;
i++
){


const star =
document.createElement(
"span"
);


star.innerHTML =
"✦";



star.style.position =
"absolute";



star.style.left =
Math.random()*100+"%";



star.style.top =
Math.random()*100+"%";



star.style.fontSize =
(
Math.random()*15+8
)+"px";



star.style.color =
"#d8b56a";



star.style.opacity =
Math.random();



star.style.animation =
`floatingStar ${Math.random()*4+3}s infinite ease-in-out`;



sparkleContainer.appendChild(
star
);


}



}



createSparkles();










/* =========================
   SCROLL REVEAL
========================= */


const sections =
document.querySelectorAll(
".reveal"
);



const observer =
new IntersectionObserver(
(entries)=>{


entries.forEach(
(entry)=>{


if(
entry.isIntersecting
){


entry.target.classList.add(
"visible"
);


}


}

);


},
{
threshold:.15
}
);



sections.forEach(
(section)=>{


section.classList.add(
"hidden"
);


observer.observe(
section
);


}
);









/* =========================
   COUNTDOWN
========================= */


/*

تاریخ جشن:
پنج شنبه 9 مهر

فعلا نمونه:

سال را بعداً تغییر می‌دهیم

*/




const targetDate =
new Date(
"2026-10-01T18:00:00"
);




function updateCountdown(){



const now =
new Date();



const distance =
targetDate - now;




if(distance <=0)
return;



const days =
Math.floor(
distance /
(1000*60*60*24)
);



const hours =
Math.floor(
(distance %
(1000*60*60*24))
/
(1000*60*60)
);



const minutes =
Math.floor(
(distance %
(1000*60*60))
/
(1000*60)
);



const seconds =
Math.floor(
(distance %
(1000*60))
/
1000
);




const ids = {


days,
hours,
minutes,
seconds

};



Object.keys(ids)
.forEach(
(id)=>{


const el =
document.getElementById(
id
);



if(el){

el.innerText =
String(ids[id])
.padStart(
2,
"0"
);

}



});


}




updateCountdown();


setInterval(
updateCountdown,
1000
);









/* =========================
   ADD CSS ANIMATION
========================= */


const style =
document.createElement(
"style"
);


style.innerHTML = `


.hidden{

opacity:0;

transform:
translateY(40px);

transition:
1s ease;

}


.visible{

opacity:1;

transform:
translateY(0);

}




@keyframes floatingStar{


0%,100%{

transform:
translateY(0)
rotate(0deg);

}


50%{

transform:
translateY(-20px)
rotate(180deg);

}


}



`;



document.head.appendChild(
style
);



});
