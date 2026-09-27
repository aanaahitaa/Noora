// =========================
// REVEAL ANIMATION
// =========================
const observer = new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting) entry.target.classList.add("show");});},{threshold:0.15});
document.querySelectorAll(".reveal").forEach(section=>observer.observe(section));

// =========================
// COUNTDOWN
// =========================
const targetDate = new Date("2026-10-01T18:00:00");
const dayEl=document.getElementById("day"),hourEl=document.getElementById("hour"),minuteEl=document.getElementById("minute"),secondEl=document.getElementById("second");
function persianNumber(num){return String(num).padStart(2,"0").replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d]);}
function updateCountdown(){const distance=targetDate-new Date();if(distance<=0)return;dayEl.innerHTML=persianNumber(Math.floor(distance/86400000));hourEl.innerHTML=persianNumber(Math.floor(distance/3600000)%24);minuteEl.innerHTML=persianNumber(Math.floor(distance/60000)%60);secondEl.innerHTML=persianNumber(Math.floor(distance/1000)%60);}
setInterval(updateCountdown,1000);updateCountdown();

// =========================
// RSVP
// =========================
let attendance="yes";
let guestCount=2;
const attendanceOptions=document.querySelectorAll(".attendance-option");
const guestCountButtons=document.querySelectorAll(".guest-count-btn");
const guestCountWrap=document.getElementById("guestCountWrap");
const rsvpForm=document.querySelector(".rsvp-form");
const rsvpSubmit=document.getElementById("rsvpSubmit");
const rsvpFeedback=document.getElementById("rsvpFeedback");

attendanceOptions.forEach(button=>{
  button.addEventListener("click",()=>{
    attendance=button.dataset.attendance;
    attendanceOptions.forEach(item=>item.classList.toggle("is-selected",item===button));
    rsvpForm.classList.toggle("is-declined",attendance==="no");
    rsvpSubmit.textContent=attendance==="yes"?"ثبت حضور ✨":"ثبت پاسخ ✨";
  });
});

guestCountButtons.forEach(button=>{
  button.addEventListener("click",()=>{
    guestCount=Number(button.dataset.count);
    guestCountButtons.forEach(item=>item.classList.toggle("is-selected",item===button));
  });
});

rsvpSubmit.addEventListener("click",()=>{
  const name=document.getElementById("guestName").value.trim();
  if(!name){
    rsvpFeedback.textContent="لطفاً نام مهمان را وارد کنید 🌸";
    document.getElementById("guestName").focus();
    return;
  }
  const message=document.getElementById("guestMessage").value.trim();
  if(attendance==="yes"){
    rsvpFeedback.textContent=`ممنون ${name} جان؛ حضور شما برای ${persianNumber(guestCount)} نفر ثبت شد ❤️`;
  }else{
    rsvpFeedback.textContent=`ممنون ${name} جان؛ پاسخ شما ثبت شد 🌷`;
  }
  console.log({name,attendance,guestCount,message});
});

// =========================
// MUSIC
// =========================
const music=document.getElementById("music");
let playing=false;
music.volume=0.35;
function playMusic(){music.play().then(()=>{playing=true;}).catch(()=>{});}
setTimeout(playMusic,2000);
document.addEventListener("click",()=>{if(!playing)playMusic();},{once:true});
document.addEventListener("touchstart",()=>{if(!playing)playMusic();},{once:true});
function toggleMusic(){if(playing){music.pause();playing=false;}else playMusic();}
