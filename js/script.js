/* =====================================================
   NOORA PRINCESS INVITATION
   script.js
===================================================== */



document.addEventListener(
"DOMContentLoaded",
function(){



/* =================================
   PERSONAL GUEST NAME
================================= */


const params =
new URLSearchParams(
window.location.search
);



const guest =
params.get("guest");



const guestName =
document.getElementById(
"guestName"
);



if(
guest &&
guestName
){

guestName.innerHTML =
`برای ${guest} عزیز ✨`;

}








/* =================================
   ENVELOPE OPEN
================================= */


const envelope =
document.getElementById(
"envelope"
);



if(envelope){


envelope.addEventListener(
"click",
function(){


envelope.classList.toggle(
"open"
);



}

);


}









/* =================================
   CREATE SPARKLES
================================= */


const starsLayer =
document.querySelector(
".stars-layer"
);



function createStars(){


if(!starsLayer)
return;



for(
let i=0;
i<45;
i++
){


const star =
document.createElement(
"div"
);



star.className =
"star";


star.innerHTML =
"✦";



star.style.left =
Math.random()*100+"%";



star.style.top =
Math.random()*100+"%";



star.style.fontSize =
(
Math.random()*15+8
)+"px";



star.style.animationDelay =
(
Math.random()*3
)+"s";



starsLayer.appendChild(
star
);


}


}



createStars();









/* =================================
   SCROLL REVEAL
================================= */



const revealItems =
document.querySelectorAll(
".reveal"
);



const revealObserver =
new IntersectionObserver(
function(entries){


entries.forEach(
entry=>{


if(
entry.isIntersecting
){


entry.target.classList.add(
"show"
);


}


}

);


},
{

threshold:.15

}

);



revealItems.forEach(
item=>{


revealObserver.observe(
item
);


}

);









/* =================================
   COUNTDOWN
================================= */


/*

زمان فعلی جشن:
پنجشنبه ۹ مهر ساعت ۱۸

بعداً فقط این تاریخ را عوض می‌کنیم.

*/




const eventDate =
new Date(
"2026-10-01T18:00:00"
);





function updateCountdown(){



const now =
new Date();



const distance =
eventDate - now;



if(distance < 0)
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





const values={


days,

hours,

minutes,

seconds


};





Object.keys(values)
.forEach(
function(key){


const element =
document.getElementById(
key
);



if(element){

element.innerText =
String(values[key])
.padStart(
2,
"0"
);

}



}

);


}





updateCountdown();


setInterval(
updateCountdown,
1000
);







});
