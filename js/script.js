// =========================
// REVEAL ANIMATION
// =========================
const observer=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add("show");});},{threshold:0.15});
document.querySelectorAll(".reveal").forEach(section=>observer.observe(section));

// =========================
// COUNTDOWN
// =========================
const targetDate=new Date("2026-10-01T18:00:00");
const dayEl=document.getElementById("day"),hourEl=document.getElementById("hour"),minuteEl=document.getElementById("minute"),secondEl=document.getElementById("second");
function persianNumber(num){return String(num).padStart(2,"0").replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d]);}
function updateCountdown(){const distance=targetDate-new Date();if(distance<=0)return;dayEl.textContent=persianNumber(Math.floor(distance/86400000));hourEl.textContent=persianNumber(Math.floor(distance/3600000)%24);minuteEl.textContent=persianNumber(Math.floor(distance/60000)%60);secondEl.textContent=persianNumber(Math.floor(distance/1000)%60);}
setInterval(updateCountdown,1000);updateCountdown();

// =========================
// RSVP
// =========================
let attendance="yes";
let guestCount=1;
const attendanceOptions=document.querySelectorAll(".attendance-option");
const guestCountButtons=document.querySelectorAll(".guest-count-btn");
const guestCountWrap=document.getElementById("guestCountWrap");
const rsvpForm=document.querySelector(".rsvp-form");
const rsvpSubmit=document.getElementById("rsvpSubmit");
const rsvpFeedback=document.getElementById("rsvpFeedback");
const rsvpButtonHTML='<span>✦</span> ثبت حضور <span>✦</span>';
const declinedButtonHTML='<span>✦</span> ثبت پاسخ <span>✦</span>';
attendanceOptions.forEach(button=>{button.addEventListener("click",()=>{attendance=button.dataset.attendance;attendanceOptions.forEach(item=>item.classList.toggle("is-selected",item===button));rsvpForm.classList.toggle("is-declined",attendance==="no");rsvpSubmit.innerHTML=attendance==="yes"?rsvpButtonHTML:declinedButtonHTML;});});
guestCountButtons.forEach(button=>{button.addEventListener("click",()=>{guestCount=Number(button.dataset.count);guestCountButtons.forEach(item=>item.classList.toggle("is-selected",item===button));});});
rsvpSubmit.addEventListener("click",()=>{const name=document.getElementById("guestName").value.trim();if(!name){rsvpFeedback.textContent="لطفاً نام مهمان را وارد کنید 🌸";document.getElementById("guestName").focus();return;}const message=document.getElementById("guestMessage").value.trim();if(attendance==="yes")rsvpFeedback.textContent=`ممنون ${name} جان؛ حضور شما برای ${persianNumber(guestCount)} نفر ثبت شد ❤️`;else rsvpFeedback.textContent=`ممنون ${name} جان؛ پاسخ شما ثبت شد 🌷`;console.log({name,attendance,guestCount,message});});

// =========================
// PERSONALIZED ENVELOPE + MUSIC
// =========================
const music=document.getElementById("music");
const musicGate=document.getElementById("musicGate");
const musicEnter=document.getElementById("musicEnter");
const musicGreeting=document.getElementById("musicGreeting");
const envelopeScene=document.getElementById("envelopeScene");
let playing=false;
music.volume=0.35;

const params=new URLSearchParams(window.location.search);
const guestName=(params.get("guest")||params.get("name")||"").trim();
const guestId=(params.get("id")||params.get("g")||guestName||"unknown").trim();
const greetingText=musicGreeting.querySelector(".greeting-text"); greetingText.textContent=guestName ? `${guestName} عزیز` : "مهمان عزیز";

function playMusic(){return music.play().then(()=>{playing=true;}).catch(()=>{playing=false;});}

async function enterInvitation(){
  if(envelopeScene.classList.contains("is-opening"))return;
  envelopeScene.classList.add("is-opening");
  musicGate.classList.add("is-leaving");
  await playMusic();
  await new Promise(resolve=>setTimeout(resolve,850));
  musicGate.classList.add("is-hidden");
  document.body.classList.add("music-started");
}

musicEnter.addEventListener("click",enterInvitation);
document.querySelector(".envelope-scene").addEventListener("click",enterInvitation);

function toggleMusic(){if(playing){music.pause();playing=false;}else playMusic();}
