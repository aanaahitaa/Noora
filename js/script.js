/* =========================================================
   NOORA INVITATION — MAIN JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       GUEST PERSONALIZATION
    ====================================================== */

    const guestMap = {

        anna:
            "آنا جان",

        mahsa:
            "مهسا جان",

        mahdi:
            "مهدی جان",

        "family-ahmadi":
            "خانواده احمدی عزیز",

        "family-shirajpour":
            "خانواده شیرج‌پور عزیز"

    };


    const params =
        new URLSearchParams(
            window.location.search
        );


    const guestId =
        params.get("guest");


    const currentGuest =
        guestMap[guestId] ||
        "مهمان عزیز";


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
       OPENING
    ====================================================== */

    const opening =
        document.getElementById(
            "opening"
        );


    const envelope =
        document.getElementById(
            "envelope"
        );


    const openButton =
        document.getElementById(
            "openButton"
        );


    const openingScroll =
        document.getElementById(
            "openingScroll"
        );


    const invitation =
        document.getElementById(
            "invitation"
        );


    const body =
        document.body;


    let opened =
        false;


    body.classList.add(
        "locked"
    );


    function openInvitation() {

        if (opened) {
            return;
        }


        opened = true;


        envelope.classList.add(
            "open"
        );


        openButton.style.opacity =
            "0";


        openButton.style.pointerEvents =
            "none";


        startMusic();


        setTimeout(() => {

            openingScroll.classList.add(
                "show"
            );

        }, 1200);


        setTimeout(() => {

            opening.classList.add(
                "closed"
            );

            body.classList.remove(
                "locked"
            );


            window.scrollTo({
                top: 0,
                behavior: "instant"
            });

        }, 2300);

    }


    openButton.addEventListener(
        "click",
        openInvitation
    );


    envelope.addEventListener(
        "click",
        openInvitation
    );



    /* =====================================================
       MUSIC
    ====================================================== */

    const music =
        document.getElementById(
            "birthdayMusic"
        );


    const musicButton =
        document.getElementById(
            "musicButton"
        );


    let musicPlaying =
        false;


    function startMusic() {

        if (!music) {
            return;
        }


        music.volume =
            0.35;


        const playPromise =
            music.play();


        if (
            playPromise !== undefined
        ) {

            playPromise
                .then(() => {

                    musicPlaying =
                        true;

                    updateMusicButton();

                })
                .catch(() => {

                    musicPlaying =
                        false;

                });

        }

    }


    function updateMusicButton() {

        if (!musicButton) {
            return;
        }


        musicButton.textContent =
            musicPlaying
                ? "♫"
                : "×";

    }


    musicButton.addEventListener(
        "click",
        () => {

            if (!music) {
                return;
            }


            if (musicPlaying) {

                music.pause();

                musicPlaying =
                    false;

            } else {

                music.play()
                    .then(() => {

                        musicPlaying =
                            true;

                        updateMusicButton();

                    })
                    .catch(() => {});

            }


            updateMusicButton();

        }
    );



    /* =====================================================
       COUNTDOWN
    ====================================================== */

    const targetDate =
        new Date(
            "2026-10-01T18:00:00+03:30"
        ).getTime();


    const daysEl =
        document.getElementById(
            "days"
        );


    const hoursEl =
        document.getElementById(
            "hours"
        );


    const minutesEl =
        document.getElementById(
            "minutes"
        );


    const secondsEl =
        document.getElementById(
            "seconds"
        );


    function updateCountdown() {

        const now =
            new Date().getTime();


        const distance =
            targetDate - now;


        if (distance <= 0) {

            daysEl.textContent =
                "00";

            hoursEl.textContent =
                "00";

            minutesEl.textContent =
                "00";

            secondsEl.textContent =
                "00";

            return;

        }


        const days =
            Math.floor(
                distance /
                (1000 * 60 * 60 * 24)
            );


        const hours =
            Math.floor(
                (distance %
                    (1000 * 60 * 60 * 24)) /
                (1000 * 60 * 60)
            );


        const minutes =
            Math.floor(
                (distance %
                    (1000 * 60 * 60)) /
                (1000 * 60)
            );


        const seconds =
            Math.floor(
                (distance %
                    (1000 * 60)) /
                1000
            );


        daysEl.textContent =
            String(days)
                .padStart(2, "0");


        hoursEl.textContent =
            String(hours)
                .padStart(2, "0");


        minutesEl.textContent =
            String(minutes)
                .padStart(2, "0");


        secondsEl.textContent =
            String(seconds)
                .padStart(2, "0");

    }


    updateCountdown();


    setInterval(
        updateCountdown,
        1000
    );



    /* =====================================================
       SCROLL REVEAL
    ====================================================== */

    const revealElements =
        document.querySelectorAll(
            ".section-inner"
        );


    revealElements.forEach(
        (element) => {

            element.classList.add(
                "reveal"
            );

        }
    );


    const observer =
        new IntersectionObserver(
            (entries) => {

                entries.forEach(
                    (entry) => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.12
            }
        );


    revealElements.forEach(
        (element) => {

            observer.observe(
                element
            );

        }
    );



    /* =====================================================
       RSVP
    ====================================================== */

    const rsvpForm =
        document.getElementById(
            "rsvpForm"
        );


    const rsvpDetails =
        document.getElementById(
            "rsvpDetails"
        );


    const rsvpResult =
        document.getElementById(
            "rsvpResult"
        );


    const rsvpChoices =
        document.querySelectorAll(
            ".rsvp-choice"
        );


    const guestCountEl =
        document.getElementById(
            "guestCount"
        );


    const minusGuest =
        document.getElementById(
            "minusGuest"
        );


    const plusGuest =
        document.getElementById(
            "plusGuest"
        );


    const guestMessage =
        document.getElementById(
            "guestMessage"
        );


    let answer =
        null;


    let numberOfGuests =
        1;


    /* Select answer */

    rsvpChoices.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    rsvpChoices.forEach(
                        (item) => {

                            item.classList.remove(
                                "selected"
                            );

                        }
                    );


                    button.classList.add(
                        "selected"
                    );


                    answer =
                        button.dataset.answer;


                    if (
                        answer === "yes"
                    ) {

                        rsvpDetails.classList.add(
                            "show"
                        );

                        rsvpResult.textContent =
                            "";

                    } else {

                        rsvpDetails.classList.remove(
                            "show"
                        );


                        rsvpResult.textContent =
                            "ممنون که به ما اطلاع دادید. جای شما در جشن نورا خالی خواهد بود 🤍";

                    }

                }
            );

        }
    );


    /* Guest counter */

    minusGuest.addEventListener(
        "click",
        () => {

            if (
                numberOfGuests > 1
            ) {

                numberOfGuests--;

                guestCountEl.textContent =
                    numberOfGuests;

            }

        }
    );


    plusGuest.addEventListener(
        "click",
        () => {

            if (
                numberOfGuests < 10
            ) {

                numberOfGuests++;

                guestCountEl.textContent =
                    numberOfGuests;

            }

        }
    );


    /* Submit */

    rsvpForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            if (!answer) {

                rsvpResult.textContent =
                    "لطفاً ابتدا وضعیت حضور خود را انتخاب کنید.";

                return;

            }


            if (
                answer === "no"
            ) {

                return;

            }


            const formData = {

                guestId:
                    guestId ||
                    "unknown",

                guestName:
                    currentGuest,

                answer:
                    answer,

                guests:
                    numberOfGuests,

                message:
                    guestMessage.value.trim(),

                submittedAt:
                    new Date()
                        .toISOString()

            };


            /*
             ==================================================
             TEMPORARY

             فعلاً داده را در console می‌بینیم.
             در مرحله بعد همین قسمت را به Google Apps Script
             وصل می‌کنیم.
             ==================================================
            */

            console.log(
                "NOORA RSVP:",
                formData
            );


            /* Local backup */

            try {

                const existing =
                    JSON.parse(
                        localStorage.getItem(
                            "noora_rsvp"
                        ) || "[]"
                    );


                existing.push(
                    formData
                );


                localStorage.setItem(
                    "noora_rsvp",
                    JSON.stringify(
                        existing
                    )
                );

            } catch (error) {

                console.warn(
                    "Local storage unavailable.",
                    error
                );

            }


            rsvpResult.innerHTML =
                `
                <strong>
                    پاسخ شما ثبت شد 🤍
                </strong>
                <br>
                مشتاق دیدنتان در جشن نورا هستیم.
                `;


            rsvpForm
                .querySelectorAll(
                    "button"
                )
                .forEach(
                    (button) => {

                        if (
                            button.type ===
                            "submit"
                        ) {

                            button.disabled =
                                true;

                            button.style.opacity =
                                ".6";

                        }

                    }
                );

        }
    );



    /* =====================================================
       OPENING PARTICLES
    ====================================================== */

    function createSparkles() {

        const container =
            document.querySelector(
                ".opening"
            );


        if (!container) {
            return;
        }


        for (
            let i = 0;
            i < 25;
            i++
        ) {

            const sparkle =
                document.createElement(
                    "span"
                );


            sparkle.className =
                "generated-sparkle";


            sparkle.style.left =
                `${Math.random() * 100}%`;


            sparkle.style.top =
                `${Math.random() * 100}%`;


            sparkle.style.animationDelay =
                `${Math.random() * 2}s`;


            container.appendChild(
                sparkle
            );

        }

    }


    createSparkles();

});
