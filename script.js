// =============================================
// LOGIN MODAL
// =============================================

function openLoginModal() {
    const modal = document.getElementById("loginModal");

    if (modal) {
        modal.style.display = "flex";
    }
}

function closeLoginModal() {
    const modal = document.getElementById("loginModal");
    const errorMsg = document.getElementById("errorMsg");

    if (modal) {
        modal.style.display = "none";
    }

    if (errorMsg) {
        errorMsg.style.display = "none";
    }
}

function login() {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorMsg = document.getElementById("errorMsg");

    if (!usernameInput || !passwordInput || !errorMsg) {
        return;
    }

    const user = usernameInput.value;
    const pass = passwordInput.value;

    // FIGYELEM: ez csak vizuális belépés, nem szerveroldali védelem.
    if (user === "admin" && pass === "Admin26") {
        window.location.href = "home.html";
    } else {
        errorMsg.style.display = "block";
    }
}

function logout() {
    window.location.href = "index.html";
}

// =============================================
// KÉP LAPOZÓ LOGIKA
// =============================================

let currentModalSliderId = "";

function moveSlide(sliderId, direction) {
    const slider = document.getElementById(sliderId);

    if (!slider) {
        return null;
    }

    const slides = slider.querySelectorAll(".slide");

    if (slides.length === 0) {
        return null;
    }

    let activeIndex = -1;

    slides.forEach((slide, index) => {
        if (slide.classList.contains("active")) {
            activeIndex = index;
            slide.classList.remove("active");
        }
    });

    if (activeIndex === -1) {
        activeIndex = 0;
    }

    let newIndex = activeIndex + direction;

    if (newIndex >= slides.length) {
        newIndex = 0;
    }

    if (newIndex < 0) {
        newIndex = slides.length - 1;
    }

    slides[newIndex].classList.add("active");

    return slides[newIndex];
}

function openModal(sliderId) {
    currentModalSliderId = sliderId;

    const slider = document.getElementById(sliderId);
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");

    if (!slider || !modal || !modalImg) {
        return;
    }

    const activeSlide = slider.querySelector(".slide.active");

    if (!activeSlide) {
        return;
    }

    modal.style.display = "flex";
    modalImg.src = activeSlide.src;
}

function closeModal() {
    const modal = document.getElementById("imageModal");

    if (modal) {
        modal.style.display = "none";
    }
}

function moveModalSlide(direction) {
    const newActiveSlide = moveSlide(
        currentModalSliderId,
        direction
    );

    const modalImage = document.getElementById("modalImage");

    if (newActiveSlide && modalImage) {
        modalImage.src = newActiveSlide.src;
    }
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeModal();
    }
});

// =============================================
// VIDEÓ SLIDER LOGIKA
// =============================================

let currentVideoIndex = 0;

function updateVideoSlide() {
    const track = document.getElementById("videoTrack");
    const dots = document.querySelectorAll(".video-dots .dot");

    document
        .querySelectorAll(".video-slide video")
        .forEach(video => video.pause());

    if (track) {
        track.style.transform =
            `translateX(-${currentVideoIndex * 100}%)`;
    }

    dots.forEach((dot, index) => {
        dot.classList.toggle(
            "active",
            index === currentVideoIndex
        );
    });
}

function moveVideoSlide(direction) {
    const slides = document.querySelectorAll(".video-slide");

    if (slides.length === 0) {
        return;
    }

    currentVideoIndex += direction;

    if (currentVideoIndex >= slides.length) {
        currentVideoIndex = 0;
    }

    if (currentVideoIndex < 0) {
        currentVideoIndex = slides.length - 1;
    }

    updateVideoSlide();
}

function setVideoSlide(index) {
    currentVideoIndex = index;

    updateVideoSlide();
}

// =============================================
// LIVE ÉRTESÍTÉSEK
// TWITCH + YOUTUBE
// =============================================

const LIVE_API_URL = "twitch.php";

let lastTwitchLive = false;
let lastYouTubeLive = false;

function escapeHtml(value) {
    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("hu-HU", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
}

async function getLiveStatus() {
    const response = await fetch(
        `${LIVE_API_URL}?t=${Date.now()}`,
        {
            cache: "no-store"
        }
    );

    if (!response.ok) {
        throw new Error(
            `Live API HTTP hiba: ${response.status}`
        );
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(
            data.error || "A live API hibát adott."
        );
    }

    return data;
}

function makeLiveCard(platform, data) {
    const isTwitch = platform === "twitch";

    const link = isTwitch
        ? data.url
        : data.url;

    const icon = isTwitch
        ? "img/twlogo.png"
        : "img/ytlogo.png";

    const platformName = isTwitch
        ? "TWITCH"
        : "YOUTUBE";

    const title = isTwitch
        ? "🔴 ÉLŐ ADÁS VAN TWITCHEN!"
        : "🔴 ÉLŐ ADÁS VAN YOUTUBE-ON!";

    let description = "";

    if (isTwitch) {
        const gameText = data.game
            ? `Játék: ${data.game}`
            : "Rihi Gaming most élőben van!";

        const viewersText =
            data.viewers !== undefined
                ? ` · ${Number(data.viewers).toLocaleString("hu-HU")} néző`
                : "";

        description = data.title
            ? `${data.title} — ${gameText}${viewersText}`
            : `${gameText}${viewersText}`;
    } else {
        description =
            data.title ||
            "Rihi Gaming most élőben van YouTube-on!";
    }

    const startedAt = formatDate(data.started_at);

    return `
        <a
            href="${escapeHtml(link)}"
            target="_blank"
            rel="noopener noreferrer"
            class="notif-card ${platform} is-live"
        >
            <img
                src="${icon}"
                alt="${platformName}"
                class="notif-icon"
            >

            <div class="notif-content">
                <div class="notif-header">
                    <span class="notif-title">
                        ${escapeHtml(title)}
                    </span>

                    <span class="notif-badge live-badge">
                        🔴 LIVE
                    </span>
                </div>

                <p class="notif-desc">
                    ${escapeHtml(description)}
                </p>

                ${startedAt ? `
                    <small class="notif-started">
                        Indult: ${escapeHtml(startedAt)}
                    </small>
                ` : ""}
            </div>

            <span class="notif-time">
                ${platformName}
            </span>
        </a>
    `;
}

function makeOfflineCard(platform) {
    const isTwitch = platform === "twitch";

    const link = isTwitch
        ? "https://www.twitch.tv/rihigaming_official"
        : "https://www.youtube.com/@rihigaming1";

    const icon = isTwitch
        ? "img/twlogo.png"
        : "img/ytlogo.png";

    const platformName = isTwitch
        ? "Twitch"
        : "YouTube";

    return `
        <a
            href="${link}"
            target="_blank"
            rel="noopener noreferrer"
            class="notif-card ${platform}"
        >
            <img
                src="${icon}"
                alt="${platformName}"
                class="notif-icon"
            >

            <div class="notif-content">
                <div class="notif-header">
                    <span class="notif-title">
                        ${platformName}: jelenleg nincs élő adás
                    </span>

                    <span class="notif-badge">
                        OFFLINE
                    </span>
                </div>

                <p class="notif-desc">
                    Nézz vissza később, vagy kattints a csatorna megnyitásához.
                </p>
            </div>

            <span class="notif-time">
                OFFLINE
            </span>
        </a>
    `;
}

async function updateNotifications() {
    const container =
        document.getElementById("notificationsList");

    if (!container) {
        return;
    }

    try {
        const result = await getLiveStatus();

        const twitchLive =
            result.twitch?.live === true &&
            result.twitch?.data;

        const youtubeLive =
            result.youtube?.live === true &&
            result.youtube?.data;

        const cards = [];

        if (youtubeLive) {
            cards.push(
                makeLiveCard(
                    "youtube",
                    result.youtube.data
                )
            );
        } else {
            cards.push(makeOfflineCard("youtube"));
        }

        if (twitchLive) {
            cards.push(
                makeLiveCard(
                    "twitch",
                    result.twitch.data
                )
            );
        } else {
            cards.push(makeOfflineCard("twitch"));
        }

        container.innerHTML = cards.join("");

        if (twitchLive && !lastTwitchLive) {
            showBrowserNotification(
                "🔴 Élő adás indult Twitchen!",
                result.twitch.data.title ||
                    "Rihi Gaming most élőben van!",
                "img/twlogo.png"
            );
        }

        if (youtubeLive && !lastYouTubeLive) {
            showBrowserNotification(
                "🔴 Élő adás indult YouTube-on!",
                result.youtube.data.title ||
                    "Rihi Gaming most élőben van!",
                "img/ytlogo.png"
            );
        }

        lastTwitchLive = Boolean(twitchLive);
        lastYouTubeLive = Boolean(youtubeLive);

        const badge = document.getElementById("notifBadge");

        if (badge) {
            const liveCount =
                Number(Boolean(twitchLive)) +
                Number(Boolean(youtubeLive));

            badge.innerText = liveCount;

            badge.style.display =
                liveCount > 0
                    ? "inline-block"
                    : "none";
        }

    } catch (error) {
        console.error("Live állapot hiba:", error);

        container.innerHTML = `
            <div class="notif-error">
                ⚠️ Most nem sikerült betölteni a Twitch- és YouTube-állapotot.
            </div>
        `;
    }
}

function showBrowserNotification(title, body, icon) {
    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {
        new Notification(title, {
            body,
            icon
        });
    }
}

// =============================================
// EMAILJS FELIRATKOZÁS
// =============================================

function setupEmailSubscription() {
    const subForm = document.getElementById("subscribeForm");
    const subStatus =
        document.getElementById("subscribeStatus");

    if (!subForm || !subStatus) {
        return;
    }

    subForm.addEventListener("submit", event => {
        event.preventDefault();

        const emailInput =
            document.getElementById("subscriberEmail");

        const email = emailInput?.value.trim();

        if (!email) {
            subStatus.style.color = "#ff3b30";
            subStatus.innerText =
                "Kérlek, add meg az e-mail címed!";

            return;
        }

        subStatus.style.color = "gold";
        subStatus.innerText =
            "Feliratkozás küldése...";

        const serviceID = "service_xcigsmn";
        const templateID = "template_8ble6kv";

        const templateParams = {
            user_email: email,
            message:
                "Új feliratkozó érkezett a Rihi Gaming értesítésekre!"
        };

        emailjs
            .send(
                serviceID,
                templateID,
                templateParams
            )
            .then(() => {
                subStatus.style.color = "#4BB543";
                subStatus.innerText =
                    "Sikeres feliratkozás! Köszönjük!";

                subForm.reset();
            })
            .catch(error => {
                subStatus.style.color = "#ff3b30";
                subStatus.innerText =
                    "Hiba történt a feliratkozás során. Próbáld újra!";

                console.error("EmailJS hiba:", error);
            });
    });
}

// =============================================
// SZABÁLYZATOK ANIMÁLT LENYITÁSA
// =============================================

function toggleRule(btn) {
    const box = btn.parentElement;

    const content =
        box.querySelector(".collapsible-content");

    const btnText =
        btn.querySelector(".btn-text");

    if (!content || !btnText) {
        return;
    }

    if (content.classList.contains("active")) {
        content.style.maxHeight = "0px";

        content.classList.remove("active");
        btn.classList.remove("active");

        btnText.textContent =
            "Összes szabályzat mutatása";

    } else {
        content.classList.add("active");
        btn.classList.add("active");

        content.style.maxHeight =
            content.scrollHeight + "px";

        btnText.textContent =
            "Kevesebb mutatása";
    }
}

// =============================================
// @ MENTION + EMOJI KIEMELÉS
// =============================================

function highlightRules() {
    const ruleBoxes = document.querySelectorAll(
        ".info-box p, .info-box li"
    );

    const emojiRegex =
        /(\p{Extended_Pictographic}|\p{Emoji_Component})/gu;

    ruleBoxes.forEach(element => {
        let html = element.innerHTML;

        html = html.replace(
            /(^|\s)(@[a-zA-Z0-9_áéíóöőúüűÁÉÍÓÖŐÚÜŰ]+)/g,
            '$1<span class="mention">$2</span>'
        );

        html = html.replace(
            emojiRegex,
            '<span class="emoji-highlight">$1</span>'
        );

        element.innerHTML = html;
    });
}

// =============================================
// OLDAL BETÖLTÉSE
// =============================================

document.addEventListener("DOMContentLoaded", () => {
    updateNotifications();

    // 45 másodpercenként új lekérés.
    setInterval(updateNotifications, 45000);

    setupEmailSubscription();
    highlightRules();
});