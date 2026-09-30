// =========================
// REVEAL ANIMATION
// =========================
const observer=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add("show");});},{threshold:0.15});
document.querySelectorAll(".reveal").forEach(section=>observer.observe(section));

// =========================
// COUNTDOWN
// =========================
const targetDate=new Date("2026-10-08T19:00:00");
const dayEl=document.getElementById("day"),hourEl=document.getElementById("hour"),minuteEl=document.getElementById("minute"),secondEl=document.getElementById("second");
function persianNumber(num){return String(num).padStart(2,"0").replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d]);}
function updateCountdown(){const distance=targetDate-new Date();if(distance<=0)return;dayEl.textContent=persianNumber(Math.floor(distance/86400000));hourEl.textContent=persianNumber(Math.floor(distance/3600000)%24);minuteEl.textContent=persianNumber(Math.floor(distance/60000)%60);secondEl.textContent=persianNumber(Math.floor(distance/1000)%60);}
setInterval(updateCountdown,1000);updateCountdown();

// =========================
// RSVP + GUEST LINK
// =========================
const RSVP_ENDPOINT=window.NOORA_CONFIG.API_BASE_URL;
let attendance="yes";
const params=new URLSearchParams(window.location.search);
let guestName=(params.get("guest")||params.get("name")||window.__NOORA_GUEST_NAME||"").trim();
let guestId=(params.get("id")||params.get("g")||"").trim();
const attendanceOptions=document.querySelectorAll(".attendance-option");
const rsvpForm=document.querySelector(".rsvp-form");
const rsvpSubmit=document.getElementById("rsvpSubmit");
const rsvpFeedback=document.getElementById("rsvpFeedback");
const rsvpToast=document.getElementById("rsvpToast");
const rsvpToastBackdrop=document.getElementById("rsvpToastBackdrop");
const guestNameModal=document.getElementById("guestNameModal"),guestNameModalInput=document.getElementById("guestNameModalInput"),guestNameModalError=document.getElementById("guestNameModalError"),guestNameModalConfirm=document.getElementById("guestNameModalConfirm"),guestNameModalSkip=document.getElementById("guestNameModalSkip");
let toastTimer=null;
const rsvpButtonHTML='<span>✦</span> ثبت حضور <span>✦</span>';
const declinedButtonHTML='<span>✦</span> ثبت پاسخ <span>✦</span>';

attendanceOptions.forEach(button=>{button.addEventListener("click",()=>{attendance=button.dataset.attendance;attendanceOptions.forEach(item=>item.classList.toggle("is-selected",item===button));rsvpForm.classList.toggle("is-declined",attendance==="no");rsvpSubmit.innerHTML=attendance==="yes"?rsvpButtonHTML:declinedButtonHTML;});});
function showRsvpToast(message){if(!rsvpToast)return;clearTimeout(toastTimer);rsvpToast.textContent=message;rsvpToast.classList.remove("show");if(rsvpToastBackdrop)rsvpToastBackdrop.classList.remove("show");void rsvpToast.offsetWidth;rsvpToast.classList.add("show");if(rsvpToastBackdrop)rsvpToastBackdrop.classList.add("show");toastTimer=setTimeout(()=>{rsvpToast.classList.remove("show");if(rsvpToastBackdrop)rsvpToastBackdrop.classList.remove("show");},5000);}
function hideRsvpToast(){clearTimeout(toastTimer);if(rsvpToast)rsvpToast.classList.remove("show");if(rsvpToastBackdrop)rsvpToastBackdrop.classList.remove("show");}
if(rsvpToastBackdrop)rsvpToastBackdrop.addEventListener("click",hideRsvpToast);
async function submitRsvp(payload){
  if(!RSVP_ENDPOINT) return {ok:false,error:"api_not_configured"};
  try{
    const response=await fetch(RSVP_ENDPOINT,{
      method:"POST",
      headers:{
        "Content-Type":"application/x-www-form-urlencoded;charset=UTF-8",
        "Accept":"application/json"
      },
      body:new URLSearchParams(payload).toString(),
      cache:"no-store"
    });
    if(!response.ok) return {ok:false,error:"http_"+response.status};
    const data=await response.json();
    return data&&data.ok?data:{ok:false,error:(data&&data.error)||"rsvp_failed"};
  }catch(error){
    console.warn("Noora RSVP error:",error);
    return {ok:false,error:error&&error.message?error.message:"network_error"};
  }
}
function showGuestNameModal(){if(!guestNameModal)return Promise.resolve(null);guestNameModalInput.value="";guestNameModalError.hidden=true;guestNameModal.classList.add("show");setTimeout(()=>guestNameModalInput.focus(),120);return new Promise(resolve=>{const finish=name=>{guestNameModal.classList.remove("show");guestNameModalConfirm.onclick=null;guestNameModalSkip.onclick=null;guestNameModalInput.onkeydown=null;resolve(name)};guestNameModalConfirm.onclick=()=>{const name=guestNameModalInput.value.trim();if(!name){guestNameModalError.textContent="لطفاً نام و نام خانوادگی خودتان را وارد کنید.";guestNameModalError.hidden=false;guestNameModalInput.focus();return}finish(name)};guestNameModalSkip.onclick=()=>finish(null);guestNameModalInput.onkeydown=e=>{if(e.key==="Enter")guestNameModalConfirm.click()}})}
function refreshGuestIdentity(name){guestName=String(name||"").trim();updateGuestNameEverywhere(guestName);updateGuestMeta(guestName);document.body.classList.remove("guest-loading")}
rsvpSubmit.addEventListener("click",async()=>{if(!guestId)guestId="REC-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,7).toUpperCase();if(!guestName)guestName=await showGuestNameModal();if(!guestName)return;refreshGuestIdentity(guestName);const message=document.getElementById("guestMessage").value.trim();const payload={action:"rsvp",guestId:guestId,guestName:guestName,invitationUrl:window.location.href,attendance:attendance,message:message,userAgent:navigator.userAgent};const saved=await submitRsvp(payload);
if(!saved.ok){
  rsvpFeedback.textContent="ثبت پاسخ انجام نشد. لطفاً دوباره تلاش کنید.";
  console.warn("Noora RSVP save failed:",saved.error);
  return;
}
rsvpFeedback.textContent="";
if(attendance==="yes")showRsvpToast(`سپاس ${guestName} عزیز؛ حضور شما ثبت شد`);
else showRsvpToast(`سپاس ${guestName} عزیز؛ پاسخ شما ثبت شد`);});
 
// =========================
// PERSONALIZED ENVELOPE + MUSIC
// =========================
const music=document.getElementById("music"),musicGate=document.getElementById("musicGate"),musicEnter=document.getElementById("musicEnter"),musicGreeting=document.getElementById("musicGreeting"),envelopeScene=document.getElementById("envelopeScene"),musicBtn=document.getElementById("musicBtn");
document.body.classList.toggle("guest-loading",!guestName&&!!guestId);

let playing=false;
let musicPlayCount=0;
let autoMusicActive=false;
let invitationOpening=false;

if(music){
  music.loop=false;
  music.preload="auto";
  music.volume=0.35;

  music.addEventListener("play",()=>{
    playing=true;
    if(musicBtn)musicBtn.setAttribute("aria-label","توقف موسیقی");
  });

  music.addEventListener("pause",()=>{
    playing=false;
    if(musicBtn)musicBtn.setAttribute("aria-label","پخش موسیقی");
  });

  music.addEventListener("ended",()=>{
    if(!autoMusicActive)return;

    musicPlayCount++;

    if(musicPlayCount>=2){
      autoMusicActive=false;
      playing=false;
      music.pause();
      music.currentTime=0;
      return;
    }

    // دور دوم را بلافاصله بعد از پایان دور اول شروع کن.
    music.currentTime=0;
    music.play().catch(error=>{
      console.warn("Noora second music playback:",error);
      autoMusicActive=false;
      playing=false;
    });
  });
}

function updateGuestNameEverywhere(name){
  const displayName=String(name||"").trim();
  document.querySelectorAll("[data-guest-name], .greeting-text").forEach(el=>{
    el.textContent=displayName?displayName+" عزیز":"مهمان عزیز";
  });
}
updateGuestNameEverywhere(guestName);

const greetingText=musicGreeting.querySelector(".greeting-text");

function updateGuestMeta(name){
  if(!name)return;
  const title=`${name} عزیز؛ دعوت‌نامه تولد نورا جان`;
  const description=`${name} عزیز، با دلِ خوش از شما دعوت می‌کنیم تا در جشن یک‌سالگی نورا جان در کنار ما باشید.`;
  document.title=title;
  const setMeta=(selector,content)=>{
    const el=document.querySelector(selector);
    if(el)el.setAttribute("content",content);
  };
  setMeta("meta[name=\"description\"]",description);
  setMeta("meta[property=\"og:title\"]",title);
  setMeta("meta[property=\"og:description\"]",description);
  setMeta("meta[name=\"twitter:title\"]",title);
  setMeta("meta[name=\"twitter:description\"]",description);
}
updateGuestMeta(guestName);

async function loadGuestName(){
  if(guestName||!guestId){
    document.body.classList.remove("guest-loading");
    scheduleAutoEnterInvitation();
    return;
  }
  const apiBase=(window.NOORA_CONFIG&&window.NOORA_CONFIG.API_BASE_URL)||"";
  if(!apiBase){
    document.body.classList.remove("guest-loading");
    scheduleAutoEnterInvitation();
    return;
  }
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),10000);
  try{
    const url=new URL(apiBase);
    url.searchParams.set("action","get_guest");
    url.searchParams.set("guestId",guestId);
    const response=await fetch(url.toString(),{
      cache:"default",
      signal:controller.signal,
      headers:{"Accept":"application/json"}
    });
    if(!response.ok)throw new Error("http_"+response.status);
    const data=await response.json();
    if(data&&data.ok&&data.guest){
      guestName=String(data.guest.name||"").trim();
      updateGuestNameEverywhere(guestName);
      updateGuestMeta(guestName);
    }
  }catch(error){
    console.warn("Noora guest lookup:",error);
  }finally{
    clearTimeout(timer);
    document.body.classList.remove("guest-loading");
    scheduleAutoEnterInvitation();
  }
}

let autoEnterTimer=null;
let autoEnterScheduled=false;
function scheduleAutoEnterInvitation(){
  if(autoEnterScheduled||invitationOpening)return;
  autoEnterScheduled=true;
  autoEnterTimer=setTimeout(()=>{
    autoEnterTimer=null;
    if(invitationOpening||!musicGate||musicGate.classList.contains("is-hidden")){
      autoEnterScheduled=false;
      return;
    }
    // باز شدن خودکار؛ اگر مرورگر autoplay را اجازه بدهد، موسیقی هم همین‌جا شروع می‌شود.
    safeEnterInvitation();
  },2000);
}

loadGuestName();

function playMusic(){
  if(!music)return Promise.resolve(false);

  // مهم: load() را اینجا صدا نمی‌زنیم؛ play() باید مستقیماً در همان
  // user gesture اجرا شود تا autoplay policy موبایل آن را مسدود نکند.
  return music.play().then(()=>{
    playing=true;
    return true;
  }).catch(error=>{
    console.warn("Noora music playback:",error);
    playing=false;
    return false;
  });
}

async function enterInvitation(){
  window.scrollTo(0,0);
  document.documentElement.scrollTop=0;
  document.body.scrollTop=0;

  if(envelopeScene.classList.contains("is-opening"))return;

  envelopeScene.classList.add("is-opening");
  musicGate.classList.add("is-leaving");

  // این اولین پخش از دو پخش خودکار است.
  musicPlayCount=0;
  autoMusicActive=true;
  if(music){
    music.loop=false;
    music.currentTime=0;
  }

  // play() عمداً قبل از هر await/timeout و داخل زنجیره‌ی gesture اجرا می‌شود.
  playMusic();

  await new Promise(resolve=>setTimeout(resolve,1900));
  musicGate.classList.add("is-hidden");
  document.body.classList.add("music-started");
}

async function safeEnterInvitation(event){
  if(event){
    event.preventDefault();
    event.stopPropagation();
  }
  if(invitationOpening)return;

  invitationOpening=true;
  try{
    await enterInvitation();
  }catch(error){
    console.error("Noora invitation open error:",error);
    musicGate.classList.remove("is-leaving");
    envelopeScene.classList.remove("is-opening");
    invitationOpening=false;
  }
}

// فقط یک listener برای gesture باز کردن کارت؛
// حذف listenerهای تکراری باعث می‌شود روی موبایل چند بار enterInvitation اجرا نشود.
if(musicGate)musicGate.addEventListener("pointerup",safeEnterInvitation,{passive:false});

// اگر کاربر بدون لمس صفحه شروع به اسکرول/gesture کرد، دوباره پخش موسیقی را امتحان کن.
// خود scroll در همه مرورگرها user activation محسوب نمی‌شود، اما این retry در مرورگرهایی
// که gesture را پذیرفته‌اند می‌تواند موسیقی را همان لحظه راه بیندازد.
let musicInteractionRetried=false;
function retryMusicFromInteraction(){
  if(musicInteractionRetried||!music||!music.paused||!musicGate)return;
  musicInteractionRetried=true;
  playMusic().then(ok=>{
    if(!ok)musicInteractionRetried=false;
  });
}
window.addEventListener("scroll",retryMusicFromInteraction,{passive:true});
window.addEventListener("touchstart",retryMusicFromInteraction,{passive:true});
window.addEventListener("pointerdown",retryMusicFromInteraction,{passive:true});
window.addEventListener("wheel",retryMusicFromInteraction,{passive:true});

function toggleMusic(){
  if(!music)return;

  if(!music.paused){
    // کنترل دستی کاربر، چرخه‌ی خودکار دو-بار-پخش را متوقف می‌کند.
    autoMusicActive=false;
    music.pause();
    return;
  }

  // پخش دستی مستقل از محدودیت دو بار پخش خودکار است.
  autoMusicActive=false;
  musicPlayCount=0;
  music.loop=true;

  if(music.currentTime>=music.duration||Number.isNaN(music.currentTime)){
    music.currentTime=0;
  }

  playMusic();
}
