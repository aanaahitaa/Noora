/* =========================================================
   NOORA — CLEAN V2
   Main JavaScript
========================================================= */


document.addEventListener(
  "DOMContentLoaded",
  () => {


    /* =====================================================
       DOM ELEMENTS
    ===================================================== */

    const envelopeScreen =
      document.getElementById(
        "envelopeScreen"
      );


    const envelopeTrigger =
      document.getElementById(
        "envelopeTrigger"
      );


    const envelope =
      document.querySelector(
        ".envelope"
      );


    const invitation =
      document.getElementById(
        "invitation"
      );


    const music =
      document.getElementById(
        "backgroundMusic"
      );


    const musicButton =
      document.getElementById(
        "musicButton"
      );


    const introName =
      document.getElementById(
        "introName"
      );


    const mainGuestName =
      document.getElementById(
        "guestName"
      );



    /* =====================================================
       GUEST PERSONALIZATION
    ===================================================== */


    const params =
      new URLSearchParams(
        window.location.search
      );


    const guestId =
      params.get(
        "guest"
      );


    /*
      مهمان‌ها را اینجا تعریف می‌کنیم.

      مثال:

      ?guest=anna

      نتیجه:

      آنا جان
    */

    const guestMap = {

      anna:
        "آنا جان",

      mahsa:
        "مهسا جان",

      mahdi:
        "مهـدی جان",

      "family-ahmadi":
        "خانواده احمدی عزیز",

      "family-shirajpour":
        "خانواده شیرج‌پور عزیز"

    };


    const currentGuest =
      guestMap[guestId]
      ||
      "مهمان عزیز";


    /*
      اسم مهمان همین اول صفحه
      و قبل از باز شدن پاکت
      قرار می‌گیرد.
    */

    if (introName) {

      introName.textContent =
        currentGuest;

    }


    /*
      اسم مهمان در صفحه اصلی
    */

    if (mainGuestName) {

      mainGuestName.textContent =
        currentGuest;

    }



    /* =====================================================
       BACKGROUND STARS
    ===================================================== */

    const stars =
      document.getElementById(
        "stars"
      );


    if (stars) {

      for (
        let i = 0;
        i < 90;
        i++
      ) {

        const star =
          document.createElement(
            "span"
          );


        star.className =
          "star";


        star.style.left =
          `${Math.random() * 100}%`;


        star.style.top =
          `${Math.random() * 100}%`;


        star.style.animationDelay =
          `${Math.random() * 3}s`;


        star.style.opacity =
          `${0.15 + Math.random() * .7}`;


        stars.appendChild(
          star
        );

      }

    }



    /* =====================================================
       MAGIC PARTICLES
    ===================================================== */


    function createMagicParticles() {

      for (
        let i = 0;
        i < 28;
        i++
      ) {

        const particle =
          document.createElement(
            "span"
          );


        particle.className =
          "magic-particle";


        particle.textContent =
          Math.random() > .5
            ? "✦"
            : "·";


        particle.style.left =
          `${45 + Math.random() * 10}%`;


        particle.style.top =
          `${40 + Math.random() * 15}%`;


        particle.style.setProperty(
          "--x",
          `${(Math.random() - .5) * 260}px`
        );


        particle.style.setProperty(
          "--y",
          `${-80 - Math.random() * 220}px`
        );


        particle.style.fontSize =
          `${7 + Math.random() * 12}px`;


        particle.style.animationDelay =
          `${Math.random() * .35}s`;


        document.body.appendChild(
          particle
        );


        setTimeout(
          () => {
            particle.remove();
          },
          1900
        );

      }

    }



    /* =====================================================
       MUSIC
    ===================================================== */


    function startMusic() {

      if (!music) {
        return;
      }


      music.volume =
        0.45;


      music
        .play()
        .then(
          () => {

            musicButton?.classList.add(
              "playing"
            );

          }
        )
        .catch(
          () => {

            /*
              بعضی مرورگرها
              پخش موسیقی را محدود می‌کنند.
            */

          }
        );

    }



    function toggleMusic() {

      if (!music) {
        return;
      }


      if (music.paused) {

        music
          .play()
          .then(
            () => {

              musicButton?.classList.add(
                "playing"
              );

            }
          )
          .catch(
            () => {}
          );

      }

      else {

        music.pause();


        musicButton?.classList.remove(
          "playing"
        );

      }

    }


    musicButton?.addEventListener(
      "click",
      toggleMusic
    );



    /* =====================================================
       ENVELOPE
    ===================================================== */


    let opened =
      false;


    function openInvitation() {

      if (opened) {
        return;
      }


      opened =
        true;


      envelope?.classList.add(
        "open"
      );


      createMagicParticles();


      /*
        چون این کلیک توسط کاربر انجام شده،
        مرورگر اجازه پخش موسیقی را می‌دهد.
      */

      startMusic();


      setTimeout(
        () => {

          envelopeScreen?.classList.add(
            "opened"
          );


          document.body.classList.remove(
            "locked"
          );


          invitation?.scrollIntoView(
            {
              behavior:
                "smooth",

              block:
                "start"
            }
          );

        },
        1900
      );

    }


    envelopeTrigger?.addEventListener(
      "click",
      openInvitation
    );



    /* =====================================================
       COUNTDOWN
    ===================================================== */


    /*
      پنج‌شنبه ۹ مهر ۱۴۰۵
      ساعت ۱۸:۰۰
      برابر با 1 October 2026
    */

    const eventDate =
      new Date(
        "2026-10-01T18:00:00+03:30"
      );


    function updateCountdown() {

      const difference =
        eventDate.getTime()
        -
        Date.now();


      const ids = [

        "days",
        "hours",
        "minutes",
        "seconds"

      ];


      if (
        difference <= 0
      ) {

        ids.forEach(
          id => {

            const element =
              document.getElementById(
                id
              );


            if (element) {

              element.textContent =
                "00";

            }

          }
        );


        return;

      }


      const days =
        Math.floor(
          difference /
          86400000
        );


      const hours =
        Math.floor(
          difference /
          3600000
        ) % 24;


      const minutes =
        Math.floor(
          difference /
          60000
        ) % 60;


      const seconds =
        Math.floor(
          difference /
          1000
        ) % 60;


      document.getElementById(
        "days"
      ).textContent =
        String(days)
          .padStart(
            2,
            "0"
          );


      document.getElementById(
        "hours"
      ).textContent =
        String(hours)
          .padStart(
            2,
            "0"
          );


      document.getElementById(
        "minutes"
      ).textContent =
        String(minutes)
          .padStart(
            2,
            "0"
          );


      document.getElementById(
        "seconds"
      ).textContent =
        String(seconds)
          .padStart(
            2,
            "0"
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


    if (
      "IntersectionObserver"
      in window
    ) {

      const observer =
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


                  observer.unobserve(
                    entry.target
                  );

                }

              }
            );

          },
          {
            threshold:
              0.12
          }
        );


      revealElements.forEach(
        element => {

          observer.observe(
            element
          );

        }
      );

    }

    else {

      revealElements.forEach(
        element => {

          element.classList.add(
            "visible"
          );

        }
      );

    }



    /* =====================================================
       RSVP
    ===================================================== */


    const rsvpOptions =
      document.querySelectorAll(
        ".rsvp-option"
      );


    const rsvpDetails =
      document.getElementById(
        "rsvpDetails"
      );


    const rsvpThanks =
      document.getElementById(
        "rsvpThanks"
      );


    const guestCount =
      document.getElementById(
        "guestCount"
      );


    const plusGuests =
      document.getElementById(
        "plusGuests"
      );


    const minusGuests =
      document.getElementById(
        "minusGuests"
      );


    const submitRsvp =
      document.getElementById(
        "submitRsvp"
      );


    const guestMessage =
      document.getElementById(
        "guestMessage"
      );


    let answer =
      null;


    let numberOfGuests =
      1;



    /* ---------- RSVP answer ---------- */


    rsvpOptions.forEach(
      option => {

        option.addEventListener(
          "click",
          () => {

            rsvpOptions.forEach(
              item => {

                item.classList.remove(
                  "selected"
                );

              }
            );


            option.classList.add(
              "selected"
            );


            answer =
              option.dataset.answer;


            if (
              answer === "yes"
            ) {

              rsvpDetails?.classList.add(
                "active"
              );


              rsvpThanks?.classList.remove(
                "active"
              );

            }

            else {

              rsvpDetails?.classList.remove(
                "active"
              );


              setTimeout(
                showThanks,
                250
              );

            }

          }
        );

      }
    );



    /* ---------- Guest counter ---------- */


    plusGuests?.addEventListener(
      "click",
      () => {

        if (
          numberOfGuests < 10
        ) {

          numberOfGuests++;


          if (guestCount) {

            guestCount.textContent =
              numberOfGuests;

          }

        }

      }
    );



    minusGuests?.addEventListener(
      "click",
      () => {

        if (
          numberOfGuests > 1
        ) {

          numberOfGuests--;


          if (guestCount) {

            guestCount.textContent =
              numberOfGuests;

          }

        }

      }
    );



    /* ---------- Thank you ---------- */


    function showThanks() {

      rsvpThanks?.classList.add(
        "active"
      );

    }



    /* ---------- Submit ---------- */


    submitRsvp?.addEventListener(
      "click",
      () => {


        const data = {

          guest:
            guestId
            ||
            "unknown",

          guestName:
            currentGuest,

          answer:
            answer,

          guests:
            numberOfGuests,

          message:
            guestMessage?.value.trim()
            ||
            ""

        };


        /*
          فعلاً فقط در Console ذخیره می‌شود.

          مرحله بعد:
          اتصال همین data
          به Google Sheets
        */

        console.log(
          "RSVP:",
          data
        );


        rsvpDetails?.classList.remove(
          "active"
        );


        showThanks();

      }
    );


  }
);
