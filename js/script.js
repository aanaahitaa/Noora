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
// RSVP + GUEST LINK
// =========================
const RSVP_ENDPOINT=window.NOORA_CONFIG.GOOGLE_APPS_SCRIPT_URL;
let attendance="yes";
let guestCount=1;

const params=new URLSearchParams(window.location.search);
const guestName=(params.get("guest")||params.get("name")||"").trim();
const guestId=(params.get("id")||params.get("g")||"").trim();
const maxGuests=Math.max(1,Math.min(5,Number(params.get("max")||1)));

const attendanceOptions=document.querySelectorAll(".attendance-option");
const guestCountButtons=document.querySelectorAll(".guest-count-btn");
const guestCountWrap=document.getElementById("guestCountWrap");
const rsvpForm=document.querySelector(".rsvp-form");
const rsvpSubmit=document.getElementById("rsvpSubmit");
const rsvpFeedback=document.getElementById("rsvpFeedback");
const rsvpButtonHTML='<span>✦</span> ثبت حضور <span>✦</span>';
const declinedButtonHTML='<span>✦</span> ثبت پاسخ <span>✦</span>';

guestCountButtons.forEach(button=>{
  const count=Number(button.dataset.count);
  button.hidden=count>maxGuests;
  button.addEventListener("click",()=>{
    guestCount=count;
    guestCountButtons.forEach(item=>item.classList.toggle("is-selected",item===button));
  });
});

attendanceOptions.forEach(button=>{
  button.addEventListener("click",()=>{
    attendance=button.dataset.attendance;
    attendanceOptions.forEach(item=>item.classList.toggle("is-selected",item===button));
    rsvpForm.classList.toggle("is-declined",attendance==="no");
    rsvpSubmit.innerHTML=attendance==="yes"?rsvpButtonHTML:declinedButtonHTML;
  });
});

function submitToGoogleSheet(payload){
  if(RSVP_ENDPOINT.includes("PASTE_")) return false;

  let iframe=document.getElementById("rsvpSubmitFrame");
  if(!iframe){
    iframe=document.createElement("iframe");
    iframe.name="rsvpSubmitFrame";
    iframe.id="rsvpSubmitFrame";
    iframe.hidden=true;
    document.body.appendChild(iframe);
  }

  let form=document.getElementById("rsvpSubmitForm");
  if(!form){
    form=document.createElement("form");
    form.id="rsvpSubmitForm";
    form.method="POST";
    form.target="rsvpSubmitFrame";
    form.style.display="none";
    document.body.appendChild(form);
  }

  form.action=RSVP_ENDPOINT;
  form.innerHTML="";
  Object.entries(payload).forEach(([key,value])=>{
    const input=document.createElement("input");
    input.type="hidden";
    input.name=key;
    input.value=value==null?"":value;
    form.appendChild(input);
  });
  form.submit();
  return true;
}

rsvpSubmit.addEventListener("click",()=>{
  if(!guestId){
    rsvpFeedback.textContent="این لینک مهمان معتبر نیست. لطفاً از لینک اختصاصی دعوت‌نامه وارد شوید.";
    return;
  }

  if(!guestName){
    rsvpFeedback.textContent="نام مهمان این لینک مشخص نشده است.";
    return;
  }

  const message=document.getElementById("guestMessage").value.trim();
  const payload={
    action:"rsvp",
    guestId:guestId,
    attendance:attendance,
    guestCount:attendance==="yes"?guestCount:0,
    message:message,
    userAgent:navigator.userAgent
  };

  if(!submitToGoogleSheet(payload)){
    rsvpFeedback.textContent="اتصال Google Sheets هنوز فعال نشده است.";
    return;
  }

  if(attendance==="yes"){
    rsvpFeedback.textContent=`ممنون ${guestName} جان؛ حضور شما برای ${persianNumber(guestCount)} نفر ثبت شد ❤️`;
  }else{
    rsvpFeedback.textContent=`ممنون ${guestName} جان؛ پاسخ شما ثبت شد 🌷`;
  }
});

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

const greetingText=musicGreeting.querySelector(".greeting-text");
greetingText.textContent=guestName ? `${guestName} عزیز` : "مهمان عزیز";

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
musicGate.addEventListener("click",enterInvitation);

function toggleMusic(){if(playing){music.pause();playing=false;}else playMusic();}
