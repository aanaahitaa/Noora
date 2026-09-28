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
const RSVP_ENDPOINT=window.NOORA_CONFIG.GOOGLE_APPS_SCRIPT_URL;
let attendance="yes";
let guestCount=1;
const params=new URLSearchParams(window.location.search);
let guestName=(params.get("guest")||params.get("name")||"").trim();
const guestId=(params.get("id")||params.get("g")||"").trim();
const maxGuests=7;
const attendanceOptions=document.querySelectorAll(".attendance-option");
const guestCountButtons=document.querySelectorAll(".guest-count-btn");
const guestCountWrap=document.getElementById("guestCountWrap");
const rsvpForm=document.querySelector(".rsvp-form");
const rsvpSubmit=document.getElementById("rsvpSubmit");
const rsvpFeedback=document.getElementById("rsvpFeedback");
const rsvpToast=document.getElementById("rsvpToast");
const rsvpToastBackdrop=document.getElementById("rsvpToastBackdrop");
const guestNameModal=document.getElementById("guestNameModal"),guestNameModalInput=document.getElementById("guestNameModalInput"),guestNameModalError=document.getElementById("guestNameModalError"),guestNameModalConfirm=document.getElementById("guestNameModalConfirm"),guestNameModalSkip=document.getElementById("guestNameModalSkip");
let toastTimer=null;
const rsvpButtonHTML='<span>✦</span> ثبت حضور <span>✦</span>';
const declinedButtonHTML='<span>✦</span> ثبت پاسخ <span>✦</span>';

guestCountButtons.forEach(button=>{const count=Number(button.dataset.count);button.hidden=count>maxGuests;button.addEventListener("click",()=>{guestCount=count;guestCountButtons.forEach(item=>item.classList.toggle("is-selected",item===button));});});
attendanceOptions.forEach(button=>{button.addEventListener("click",()=>{attendance=button.dataset.attendance;attendanceOptions.forEach(item=>item.classList.toggle("is-selected",item===button));rsvpForm.classList.toggle("is-declined",attendance==="no");rsvpSubmit.innerHTML=attendance==="yes"?rsvpButtonHTML:declinedButtonHTML;});});
function showRsvpToast(message){if(!rsvpToast)return;clearTimeout(toastTimer);rsvpToast.textContent=message;rsvpToast.classList.remove("show");if(rsvpToastBackdrop)rsvpToastBackdrop.classList.remove("show");void rsvpToast.offsetWidth;rsvpToast.classList.add("show");if(rsvpToastBackdrop)rsvpToastBackdrop.classList.add("show");toastTimer=setTimeout(()=>{rsvpToast.classList.remove("show");if(rsvpToastBackdrop)rsvpToastBackdrop.classList.remove("show");},5000);}
function submitToGoogleSheet(payload){if(RSVP_ENDPOINT.includes("PASTE_"))return false;let iframe=document.getElementById("rsvpSubmitFrame");if(!iframe){iframe=document.createElement("iframe");iframe.name="rsvpSubmitFrame";iframe.id="rsvpSubmitFrame";iframe.hidden=true;document.body.appendChild(iframe);}let form=document.getElementById("rsvpSubmitForm");if(!form){form=document.createElement("form");form.id="rsvpSubmitForm";form.method="POST";form.target="rsvpSubmitFrame";form.style.display="none";document.body.appendChild(form);}form.action=RSVP_ENDPOINT;form.innerHTML="";Object.entries(payload).forEach(([key,value])=>{const input=document.createElement("input");input.type="hidden";input.name=key;input.value=value==null?"":value;form.appendChild(input);});form.submit();return true;}
function showGuestNameModal(){if(!guestNameModal)return Promise.resolve("");guestNameModalInput.value="";guestNameModalError.hidden=true;guestNameModal.classList.add("show");setTimeout(()=>guestNameModalInput.focus(),120);return new Promise(resolve=>{const finish=name=>{guestNameModal.classList.remove("show");guestNameModalConfirm.onclick=null;guestNameModalSkip.onclick=null;guestNameModalInput.onkeydown=null;resolve(name)};guestNameModalConfirm.onclick=()=>{const name=guestNameModalInput.value.trim();if(!name){guestNameModalError.textContent="لطفاً نام خودتان را وارد کنید.";guestNameModalError.hidden=false;guestNameModalInput.focus();return}finish(name)};guestNameModalSkip.onclick=()=>finish("مهمان ناشناس");guestNameModalInput.onkeydown=e=>{if(e.key==="Enter")guestNameModalConfirm.click()}})}
function refreshGuestIdentity(name){guestName=String(name||"").trim();updateGuestNameEverywhere(guestName);updateGuestMeta(guestName);document.body.classList.remove("guest-loading")}
rsvpSubmit.addEventListener("click",async()=>{if(!guestId){rsvpFeedback.textContent="این لینک مهمان معتبر نیست. لطفاً از لینک اختصاصی دعوت‌نامه وارد شوید.";return}if(!guestName)guestName=await showGuestNameModal();if(!guestName)return;refreshGuestIdentity(guestName);const message=document.getElementById("guestMessage").value.trim();const payload={action:"rsvp",guestId:guestId,guestName:guestName,invitationUrl:window.location.href,attendance:attendance,guestCount:attendance==="yes"?guestCount:0,message:message,userAgent:navigator.userAgent};if(!submitToGoogleSheet(payload)){rsvpFeedback.textContent="اتصال Google Sheets هنوز فعال نشده است.";return}rsvpFeedback.textContent="";if(attendance==="yes")showRsvpToast(`ممنون ${guestName} جان؛ حضور شما برای ${persianNumber(guestCount)} نفر ثبت شد ❤️`);else showRsvpToast(`ممنون ${guestName} جان؛ پاسخ شما ثبت شد`)});

// =========================
// PERSONALIZED ENVELOPE + MUSIC
// =========================
const music=document.getElementById("music"),musicGate=document.getElementById("musicGate"),musicEnter=document.getElementById("musicEnter"),musicGreeting=document.getElementById("musicGreeting"),envelopeScene=document.getElementById("envelopeScene");
document.body.classList.toggle("guest-loading",!guestName&&!!guestId);
let playing=false;let musicPlayCount=0;music.loop=false;music.volume=0.35;music.addEventListener("ended",()=>{musicPlayCount++;if(musicPlayCount>=2){music.pause();music.currentTime=0;playing=false;return;}music.currentTime=0;music.play().then(()=>{playing=true;}).catch(()=>{playing=false;});});
function updateGuestNameEverywhere(name){
  const displayName=String(name||"").trim();
  document.querySelectorAll("[data-guest-name], .greeting-text").forEach(el=>{
    el.textContent=displayName?displayName+" عزیز":"مهمان عزیز";
  });
}
updateGuestNameEverywhere(guestName);
const greetingText=musicGreeting.querySelector(".greeting-text");
function updateGuestMeta(name){if(!name)return;const title=`${name} عزیز؛ دعوت‌نامه تولد نورا جان`;const description=`${name} عزیز، با دلِ خوش از شما دعوت می‌کنیم تا در جشن یک‌سالگی نورا جان در کنار ما باشید.`;document.title=title;const setMeta=(selector,content)=>{const el=document.querySelector(selector);if(el)el.setAttribute("content",content)};setMeta("meta[name=\"description\"]",description);setMeta("meta[property=\"og:title\"]",title);setMeta("meta[property=\"og:description\"]",description);setMeta("meta[name=\"twitter:title\"]",title);setMeta("meta[name=\"twitter:description\"]",description);}
updateGuestMeta(guestName);
function loadGuestName(){if(guestName||!guestId||!RSVP_ENDPOINT||RSVP_ENDPOINT.includes("PASTE_")){document.body.classList.remove("guest-loading");return;}const callback="nooraGuest_"+Date.now();let settled=false;const finish=()=>{if(settled)return;settled=true;document.body.classList.remove("guest-loading");delete window[callback];const old=document.getElementById(callback);if(old)old.remove();};window[callback]=(data)=>{if(data&&data.ok&&data.guest){guestName=String(data.guest.name||"").trim();updateGuestNameEverywhere(guestName);updateGuestMeta(guestName);}finish();};const s=document.createElement("script");s.id=callback;s.src=RSVP_ENDPOINT+"?action=get_guest&guestId="+encodeURIComponent(guestId)+"&callback="+callback+"&t="+Date.now();s.onerror=finish;document.body.appendChild(s);setTimeout(finish,3000);}
loadGuestName();
function playMusic(){return music.play().then(()=>{playing=true;return true;}).catch(()=>{playing=false;return false;});}
async function enterInvitation(){
  window.scrollTo(0,0);
  document.documentElement.scrollTop=0;
  document.body.scrollTop=0;if(envelopeScene.classList.contains("is-opening"))return;envelopeScene.classList.add("is-opening");musicGate.classList.add("is-leaving");musicPlayCount=0;await playMusic();await new Promise(resolve=>setTimeout(resolve,1900));musicGate.classList.add("is-hidden");document.body.classList.add("music-started");}
musicEnter.addEventListener("click",enterInvitation);document.querySelector(".envelope-scene").addEventListener("click",enterInvitation);musicGate.addEventListener("click",enterInvitation);
function toggleMusic(){if(playing){music.pause();playing=false;return;}if(musicPlayCount>=2&&music.currentTime===0)musicPlayCount=0;playMusic();}
