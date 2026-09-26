/* =====================================================
   NOORA INVITATION
===================================================== */


/* =====================================================
   GUESTS
===================================================== */

const guests = {

  anna: "آنا جان",

  mahsa: "مهسا جان",

  mahdi: "مهدی جان",

  "family-ahmadi":
    "خانواده احمدی عزیز",

  "family-shirajpour":
    "خانواده شیرج‌پور عزیز"

};


/* =====================================================
   GET GUEST FROM URL
===================================================== */

const params =
  new URLSearchParams(
    window.location.search
  );


const guestId =
  params.get("guest");


const currentGuest =
  guests[guestId] ||
  "مهمان عزیز";


/* =====================================================
   SET GUEST NAME
===================================================== */

const introName =
  document.getElementById(
    "introName"
  );


const guestName =
  document.getElementById(
    "guestName"
  );


if (introName) {

  introName.textContent =
    currentGuest;

}


if (guestName) {

  guestName.textContent =
    currentGuest;

}


/* =====================================================
   ELEMENTS
===================================================== */

const intro =
  document.getElementById(
    "intro"
  );


const invitation =
  document.getElementById(
    "invitation"
  );


const envelopeButton =
  document.getElementById(
    "envelopeButton"
  );


const envelope =
  document.querySelector(
    ".envelope"
  );


/* =====================================================
   OPEN INVITATION
===================================================== */

let invitationOpened = false;


envelopeButton.addEventListener(
  "click",
  () => {

    if (invitationOpened) {
      return;
    }


    invitationOpened = true;


    envelope.classList.add(
      "open"
    );


    playMusic();


    setTimeout(
      () => {

        intro.classList.add(
          "is-hidden"
        );


        invitation.classList.add(
          "is-visible"
        );


        document.body.classList.add(
          "invitation-open"
        );


        setTimeout(
          () => {

            intro.style.display =
              "none";

          },
          1200
        );

      },
      1400
    );

  }
);


/* =====================================================
   MUSIC
===================================================== */

const music =
  document.getElementById(
    "birthdayMusic"
  );


const musicButton =
  document.getElementById(
    "musicButton"
  );


let musicPlaying = false;


function playMusic() {

  if (!music) {
    return;
  }


  music
    .play()
    .then(() => {

      musicPlaying = true;

      musicButton.classList.add(
        "is-playing"
      );

    })
    .catch(() => {

      musicPlaying = false;

    });

}


musicButton.addEventListener(
  "click",
  () => {

    if (!music) {
      return;
    }


    if (musicPlaying) {

      music.pause();

      musicPlaying = false;

      musicButton.classList.remove(
        "is-playing"
      );

    }

    else {

      music
        .play()
        .then(() => {

          musicPlaying = true;

          musicButton.classList.add(
            "is-playing"
          );

        });

    }

  }
);


/* =====================================================
   COUNTDOWN
===================================================== */

const eventDate =
  new Date(
    "2026-10-01T18:00:00+03:30"
  );


const daysElement =
  document.getElementById(
    "days"
  );


const hoursElement =
  document.getElementById(
    "hours"
  );


const minutesElement =
  document.getElementById(
    "minutes"
  );


const secondsElement =
  document.getElementById(
    "seconds"
  );


function toPersianNumber(value) {

  return String(value)
    .replace(
      /\d/g,
      digit =>
        "۰۱۲۳۴۵۶۷۸۹"[digit]
    );

}


function updateCountdown() {

  const now =
    new Date();


  const difference =
    eventDate - now;


  if (difference <= 0) {

    daysElement.textContent =
      "۰";

    hoursElement.textContent =
      "۰۰";

    minutesElement.textContent =
      "۰۰";

    secondsElement.textContent =
      "۰۰";

    return;

  }


  const days =
    Math.floor(
      difference /
      (1000 * 60 * 60 * 24)
    );


  const hours =
    Math.floor(
      (difference /
        (1000 * 60 * 60)) %
      24
    );


  const minutes =
    Math.floor(
      (difference /
        (1000 * 60)) %
      60
    );


  const seconds =
    Math.floor(
      (difference / 1000) %
      60
    );


  daysElement.textContent =
    toPersianNumber(days);


  hoursElement.textContent =
    toPersianNumber(
      String(hours).padStart(2, "0")
    );


  minutesElement.textContent =
    toPersianNumber(
      String(minutes).padStart(2, "0")
    );


  secondsElement.textContent =
    toPersianNumber(
      String(seconds).padStart(2, "0")
    );

}


updateCountdown();


setInterval(
  updateCountdown,
  1000
);


/* =====================================================
   SCROLL REVEAL
===================================================== */

const revealElements =
  document.querySelectorAll(
    ".reveal"
  );


const revealObserver =
  new IntersectionObserver(
    entries => {

      entries.forEach(
        entry => {

          if (
            entry.isIntersecting
          ) {

            entry.target.classList.add(
              "visible"
            );

            revealObserver.unobserve(
              entry.target
            );

          }

        }
      );

    },
    {
      threshold: .12
    }
  );


revealElements.forEach(
  element => {

    revealObserver.observe(
      element
    );

  }
);


/* =====================================================
   RSVP
===================================================== */

const rsvpButtons =
  document.querySelectorAll(
    ".rsvp-btn"
  );


const rsvpForm =
  document.getElementById(
    "rsvpForm"
  );


const guestCount =
  document.getElementById(
    "guestCount"
  );


const guestMessage =
  document.getElementById(
    "guestMessage"
  );


const submitRsvp =
  document.getElementById(
    "submitRsvp"
  );


const rsvpResult =
  document.getElementById(
    "rsvpResult"
  );


let rsvpAnswer = null;


rsvpButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        rsvpAnswer =
          button.dataset.answer;


        rsvpForm.hidden =
          false;


        if (
          rsvpAnswer === "no"
        ) {

          guestCount.value =
            "1";

        }


        rsvpForm.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

      }
    );

  }
);


/* =====================================================
   RSVP SUBMIT
===================================================== */

submitRsvp.addEventListener(
  "click",
  () => {

    if (!rsvpAnswer) {
      return;
    }


    const response = {

      guestId:
        guestId || "unknown",

      guestName:
        currentGuest,

      answer:
        rsvpAnswer,

      count:
        guestCount.value,

      message:
        guestMessage.value.trim(),

      submittedAt:
        new Date().toISOString()

    };


    /*
      فعلاً برای تست در مرورگر ذخیره می‌کنیم.

      در مرحله بعد همین response
      را به Google Sheets وصل می‌کنیم.
    */

    localStorage.setItem(
      "noora-rsvp",
      JSON.stringify(response)
    );


    rsvpResult.textContent =
      rsvpAnswer === "yes"
        ? "پاسخ شما ثبت شد؛ منتظر دیدارتان هستیم ✨"
        : "ممنون که خبرمان کردید 🤍";


    submitRsvp.disabled =
      true;

  }
);
