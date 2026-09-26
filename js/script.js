/* =========================================================
   NOORA — INTERACTIONS
========================================================= */


/* =========================================================
   DOM
========================================================= */

const envelopeScreen =
    document.getElementById("envelopeScreen");

const envelopeTrigger =
    document.getElementById("envelopeTrigger");

const envelope =
    document.querySelector(".envelope");

const invitation =
    document.getElementById("invitation");

const music =
    document.getElementById("backgroundMusic");

const musicButton =
    document.getElementById("musicButton");

const introName =
    document.getElementById("introName");

const guestName =
    document.getElementById("guestName");


/* =========================================================
   GUEST SYSTEM
========================================================= */

const params =
    new URLSearchParams(window.location.search);

const guest =
    params.get("guest");


/*
    Later we can move this into a JSON file
    or Google Sheet.

    For now:
*/

const guests = {

    "anna":
        "آنا جان",

    "mahsa":
        "مهسا جان",

    "mahdi":
        "مهـدی جان",

    "family-ahmadi":
        "خانواده احمدی عزیز",

    "family-shirajpour":
        "خانواده شیرج‌پور عزیز"

};


/* Decode URL guest name */

let currentGuest =
    guests[guest] || "مهمان عزیز";


/* Show guest name */

guestName.textContent =
    currentGuest;

introName.textContent =
    currentGuest;


/* =========================================================
   STAR FIELD
========================================================= */

const stars =
    document.getElementById("stars");

function createStars() {

    const amount =
        window.innerWidth < 600
            ? 45
            : 80;

    for (let i = 0; i < amount; i++) {

        const star =
            document.createElement("span");

        star.className = "star";

        star.style.left =
            Math.random() * 100 + "%";

        star.style.top =
            Math.random() * 100 + "%";

        const size =
            Math.random() * 2 + 1;

        star.style.width =
            size + "px";

        star.style.height =
            size + "px";

        star.style.animationDelay =
            Math.random() * 4 + "s";

        star.style.animationDuration =
            2 + Math.random() * 4 + "s";

        stars.appendChild(star);
    }
}

createStars();


/* =========================================================
   MAGIC PARTICLES
========================================================= */

function createMagicParticles() {

    const symbols = [
        "✦",
        "✧",
        "✥",
        "•"
    ];

    for (let i = 0; i < 38; i++) {

        const particle =
            document.createElement("div");

        particle.className =
            "magic-particle";

        particle.textContent =
            symbols[
                Math.floor(
                    Math.random() *
                    symbols.length
                )
            ];

        const centerX =
            window.innerWidth / 2;

        const centerY =
            window.innerHeight / 2;

        particle.style.left =
            centerX + "px";

        particle.style.top =
            centerY + "px";

        const angle =
            Math.random() *
            Math.PI *
            2;

        const distance =
            70 +
            Math.random() * 220;

        particle.style.setProperty(
            "--x",
            Math.cos(angle) *
            distance +
            "px"
        );

        particle.style.setProperty(
            "--y",
            Math.sin(angle) *
            distance +
            "px"
        );

        particle.style.fontSize =
            7 +
            Math.random() *
            12 +
            "px";

        particle.style.animationDelay =
            Math.random() * .35 +
            "s";

        document.body.appendChild(
            particle
        );

        setTimeout(() => {

            particle.remove();

        }, 1900);
    }
}


/* =========================================================
   ENVELOPE OPEN
========================================================= */

let opened =
    false;


envelopeTrigger.addEventListener(
    "click",
    openInvitation
);


function openInvitation() {

    if (opened) return;

    opened = true;

    envelope.classList.add("open");

    introName.classList.add("show");

    createMagicParticles();

    /*
        Try to start music after
        direct user interaction.
    */

    setTimeout(() => {

        startMusic();

    }, 700);


    /*
        Let letter animation breathe
        before revealing the site.
    */

    setTimeout(() => {

        envelopeScreen.classList.add(
            "opened"
        );

        invitation.classList.add(
            "visible"
        );

        musicButton.classList.add(
            "visible"
        );

        document.body.classList.remove(
            "locked"
        );

    }, 1900);
}


/* =========================================================
   INITIAL LOCK
========================================================= */

document.body.classList.add(
    "locked"
);


/* =========================================================
   MUSIC
========================================================= */

let musicPlaying =
    false;


async function startMusic() {

    /*
        If the audio file doesn't exist,
        don't break the site.
    */

    try {

        await music.play();

        musicPlaying = true;

        musicButton.classList.add(
            "playing"
        );

    } catch (error) {

        console.log(
            "Music is not available yet."
        );

    }
}


musicButton.addEventListener(
    "click",
    toggleMusic
);


function toggleMusic() {

    if (musicPlaying) {

        music.pause();

        musicPlaying = false;

        musicButton.classList.remove(
            "playing"
        );

    } else {

        startMusic();
    }
}


/* =========================================================
   COUNTDOWN
========================================================= */


/*
    پنج‌شنبه ۹ مهر ۱۴۰۵
    = October 1, 2026
    18:00 Iran time (+03:30)

    Later you can change ONLY this line.
*/

const eventDate =
    new Date(
        "2026-10-01T18:00:00+03:30"
    );


function updateCountdown() {

    const now =
        new Date();

    const difference =
        eventDate - now;


    if (difference <= 0) {

        document.getElementById(
            "days"
        ).textContent = "00";

        document.getElementById(
            "hours"
        ).textContent = "00";

        document.getElementById(
            "minutes"
        ).textContent = "00";

        document.getElementById(
            "seconds"
        ).textContent = "00";

        return;
    }


    const days =
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        );


    const hours =
        Math.floor(
            difference /
            (1000 * 60 * 60)
        ) % 24;


    const minutes =
        Math.floor(
            difference /
            (1000 * 60)
        ) % 60;


    const seconds =
        Math.floor(
            difference /
            1000
        ) % 60;


    document.getElementById(
        "days"
    ).textContent =
        String(days).padStart(2, "0");


    document.getElementById(
        "hours"
    ).textContent =
        String(hours).padStart(2, "0");


    document.getElementById(
        "minutes"
    ).textContent =
        String(minutes).padStart(2, "0");


    document.getElementById(
        "seconds"
    ).textContent =
        String(seconds).padStart(2, "0");
}


updateCountdown();


setInterval(
    updateCountdown,
    1000
);


/* =========================================================
   SCROLL REVEAL
========================================================= */

const revealElements =
    document.querySelectorAll(
        ".reveal"
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
            threshold: .15
        }

    );


revealElements.forEach(
    (element) => {

        observer.observe(
            element
        );

    }
);


/* =========================================================
   RSVP
========================================================= */

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


let answer =
    null;


let numberOfGuests =
    1;


/* RSVP selection */

rsvpOptions.forEach(
    (option) => {

        option.addEventListener(
            "click",
            () => {

                rsvpOptions.forEach(
                    (item) => {

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

                    rsvpDetails.classList.add(
                        "active"
                    );

                } else {

                    rsvpDetails.classList.remove(
                        "active"
                    );

                    /*
                        In V1 this only shows
                        confirmation.

                        Later:
                        send to Google Sheet.
                    */

                    setTimeout(
                        showThanks,
                        250
                    );
                }

            }
        );

    }
);


/* =========================================================
   GUEST COUNTER
========================================================= */

plusGuests.addEventListener(
    "click",
    () => {

        if (
            numberOfGuests < 10
        ) {

            numberOfGuests++;

            updateGuestCount();

        }

    }
);


minusGuests.addEventListener(
    "click",
    () => {

        if (
            numberOfGuests > 1
        ) {

            numberOfGuests--;

            updateGuestCount();

        }

    }
);


function updateGuestCount() {

    guestCount.textContent =
        numberOfGuests;
}


/* =========================================================
   SUBMIT RSVP
========================================================= */

submitRsvp.addEventListener(
    "click",
    () => {

        /*
            V1:
            No database yet.

            Later this exact function
            will send:

            guest
            answer
            numberOfGuests
            message

            to Google Sheets.
        */

        console.log({
            guest: currentGuest,
            answer: answer,
            guests: numberOfGuests,
            message:
                document.getElementById(
                    "guestMessage"
                ).value
        });


        showThanks();

    }
);


/* =========================================================
   THANK YOU
========================================================= */

function showThanks() {

    rsvpDetails.classList.remove(
        "active"
    );

    rsvpOptions.forEach(
        (option) => {

            option.style.display =
                "none";

        }
    );

    rsvpThanks.classList.add(
        "active"
    );

    createMagicParticles();
}
