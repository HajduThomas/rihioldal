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
    modalImg.style.opacity = "1";
    modalImg.style.transform = "translateX(0)";
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

    if (!newActiveSlide || !modalImage) {
        return;
    }

    modalImage.style.opacity = "0";
    modalImage.style.transform =
        `translateX(${direction > 0 ? -40 : 40}px)`;

    setTimeout(() => {
        const showNew = () => {
            modalImage.style.transition = "none";
            modalImage.style.transform =
                `translateX(${direction > 0 ? 40 : -40}px)`;

            void modalImage.offsetWidth;

            modalImage.style.transition = "";
            modalImage.style.opacity = "1";
            modalImage.style.transform = "translateX(0)";
        };

        modalImage.onload = showNew;
        modalImage.src = newActiveSlide.src;

        if (modalImage.complete) {
            showNew();
        }
    }, 250);
}

document.addEventListener("keydown", event => {
    const modal = document.getElementById("imageModal");
    const modalOpen = modal && modal.style.display === "flex";

    if (event.key === "Escape") {
        closeModal();
    }

    if (modalOpen && event.key === "ArrowRight") {
        moveModalSlide(1);
    }

    if (modalOpen && event.key === "ArrowLeft") {
        moveModalSlide(-1);
    }
});


// =============================================
// SETUP LENYÍLÓ MENÜ
// =============================================

function setupAccordion() {
    const headers = document.querySelectorAll(".setup-header");
    const firstBox = document.querySelector(".setup-box");

    if (firstBox) {
        firstBox.classList.add("open");
    }

    headers.forEach(header => {
        function toggle() {
            header.parentElement.classList.toggle("open");
        }

        header.addEventListener("click", toggle);

        header.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggle();
            }
        });
    });
}


// =============================================
// TWITCH KLIPPEK
// =============================================

const CLIPS_API_URL = "clips.php";
const TWITCH_CHANNEL = "rihigaming_official";

let currentVideoIndex = 0;
let loadedClips = [];

function clipEmbedUrl(clipId, autoplay) {
    return "https://clips.twitch.tv/embed?clip=" +
        encodeURIComponent(clipId) +
        "&parent=" + encodeURIComponent(window.location.hostname) +
        "&autoplay=" + (autoplay ? "true" : "false");
}

function buildClipThumb(slide, clip) {
    slide.innerHTML = "";

    const thumb = document.createElement("div");

    thumb.className = "clip-thumb";
    thumb.tabIndex = 0;
    thumb.setAttribute("role", "button");
    thumb.setAttribute("aria-label", "Klip lejátszása: " + clip.title);

    const img = document.createElement("img");

    img.src = clip.thumbnail_url;
    img.alt = clip.title;
    img.loading = "lazy";

    const play = document.createElement("span");

    play.className = "clip-play";
    play.innerHTML = "&#9654;";

    const title = document.createElement("div");

    title.className = "clip-title";
    title.textContent = clip.title;

    thumb.appendChild(img);
    thumb.appendChild(play);
    thumb.appendChild(title);

    const start = () => playClip(slide, clip);

    thumb.addEventListener("click", start);

    thumb.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            start();
        }
    });

    slide.appendChild(thumb);
}

function playClip(slide, clip) {
    slide.innerHTML = "";

    const frame = document.createElement("iframe");

    frame.src = clipEmbedUrl(clip.id, true);
    frame.title = clip.title;
    frame.allowFullscreen = true;
    frame.setAttribute("allow", "autoplay; fullscreen");

    slide.appendChild(frame);
}

function showClipsMessage(text) {
    const track = document.getElementById("videoTrack");

    if (!track) {
        return;
    }

    track.innerHTML = "";

    const slide = document.createElement("div");

    slide.className = "video-slide";

    const msg = document.createElement("div");

    msg.className = "clip-status";
    msg.innerHTML =
        escapeHtml(text) +
        '<br><a href="https://www.twitch.tv/' + TWITCH_CHANNEL +
        '/clips" target="_blank" rel="noopener noreferrer">' +
        'Klippek megnyitása Twitchen</a>';

    slide.appendChild(msg);
    track.appendChild(slide);

    const dots = document.getElementById("videoDots");

    if (dots) {
        dots.innerHTML = "";
    }
}

function renderClips(clips) {
    const track = document.getElementById("videoTrack");
    const dots = document.getElementById("videoDots");

    if (!track) {
        return;
    }

    track.innerHTML = "";

    if (dots) {
        dots.innerHTML = "";
    }

    clips.forEach((clip, index) => {
        const slide = document.createElement("div");

        slide.className = "video-slide";

        buildClipThumb(slide, clip);
        track.appendChild(slide);

        if (dots) {
            const dot = document.createElement("span");

            dot.className = "dot" + (index === 0 ? " active" : "");
            dot.addEventListener("click", () => setVideoSlide(index));

            dots.appendChild(dot);
        }
    });

    currentVideoIndex = 0;
    updateVideoSlide();
}

async function loadTwitchClips() {
    const track = document.getElementById("videoTrack");

    if (!track) {
        return;
    }

    try {
        const response = await fetch(
            CLIPS_API_URL + "?t=" + Date.now(),
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error("Klip API HTTP hiba: " + response.status);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || "A klip API hibát adott.");
        }

        if (!data.clips || data.clips.length === 0) {
            showClipsMessage("Még nincs elérhető klip.");
            return;
        }

        loadedClips = data.clips;
        renderClips(loadedClips);
    } catch (error) {
        console.error("Klip betöltési hiba:", error);
        showClipsMessage("A klippek most nem tölthetők be.");
    }
}

function updateVideoSlide() {
    const track = document.getElementById("videoTrack");
    const slides = document.querySelectorAll("#videoTrack .video-slide");
    const dots = document.querySelectorAll(".video-dots .dot");

    slides.forEach((slide, index) => {
        if (
            index !== currentVideoIndex &&
            slide.querySelector("iframe") &&
            loadedClips[index]
        ) {
            buildClipThumb(slide, loadedClips[index]);
        }
    });

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
    const slides = document.querySelectorAll("#videoTrack .video-slide");

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
// LIVE ÉRTESÍTÉSEK – TWITCH ÉS YOUTUBE
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
        { cache: "no-store" }
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
    const link = data.url;

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
    const container = document.getElementById("notificationsList");

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
                makeLiveCard("youtube", result.youtube.data)
            );
        } else {
            cards.push(makeOfflineCard("youtube"));
        }

        if (twitchLive) {
            cards.push(
                makeLiveCard("twitch", result.twitch.data)
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
                liveCount > 0 ? "inline-block" : "none";
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
    const subStatus = document.getElementById("subscribeStatus");

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
            subStatus.innerText = "Kérlek, add meg az e-mail címed!";
            return;
        }

        subStatus.style.color = "gold";
        subStatus.innerText = "Feliratkozás küldése...";

        const serviceID = "service_xcigsmn";
        const templateID = "template_8ble6kv";

        const templateParams = {
            user_email: email,
            message:
                "Új feliratkozó érkezett a Rihi Gaming értesítésekre!"
        };

        emailjs
            .send(serviceID, templateID, templateParams)
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
    const content = box.querySelector(".collapsible-content");
    const btnText = btn.querySelector(".btn-text");

    if (!content || !btnText) {
        return;
    }

    if (content.classList.contains("active")) {
        content.style.maxHeight = "0px";
        content.classList.remove("active");
        btn.classList.remove("active");
        btnText.textContent = "Összes szabályzat mutatása";
    } else {
        content.classList.add("active");
        btn.classList.add("active");
        content.style.maxHeight = content.scrollHeight + "px";
        btnText.textContent = "Kevesebb mutatása";
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
// MOBIL NAVIGÁCIÓS MENÜ
// =============================================

function setupMobileMenu() {
    const nav = document.querySelector(".profile-container-700px");

    if (!nav) {
        return;
    }

    const toggleBtn = document.createElement("button");

    toggleBtn.type = "button";
    toggleBtn.className = "menu-toggle";
    toggleBtn.setAttribute("aria-expanded", "false");

    const panel = document.createElement("div");

    panel.className = "mobile-menu";

    nav.querySelectorAll(".nav-btn").forEach(btn => {
        const link = document.createElement("a");

        link.className = "menu-link";
        link.href = btn.getAttribute("href");
        link.textContent = btn.textContent.trim();

        if (btn.target) {
            link.target = btn.target;
        }

        if (btn.rel) {
            link.rel = btn.rel;
        } else if (link.target === "_blank") {
            link.rel = "noopener noreferrer";
        }

        if (btn.classList.contains("active")) {
            link.classList.add("active");
        }

        link.addEventListener("click", () => setOpen(false));

        panel.appendChild(link);
    });

    const menuWrap = document.createElement("div");

    menuWrap.className = "menu-wrap";
    menuWrap.appendChild(toggleBtn);
    menuWrap.appendChild(panel);

    nav.appendChild(menuWrap);

    function setOpen(open) {
        nav.classList.toggle("menu-open", open);
        toggleBtn.setAttribute("aria-expanded", String(open));

        toggleBtn.innerHTML = open
            ? '<span class="menu-icon">&#10005;</span> Bezár'
            : '<span class="menu-icon">&#9776;</span> Menü';
    }

    setOpen(false);

    toggleBtn.addEventListener("click", event => {
        event.stopPropagation();
        setOpen(!nav.classList.contains("menu-open"));
    });

    document.addEventListener("click", event => {
        if (!nav.contains(event.target)) {
            setOpen(false);
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            setOpen(false);
        }
    });
}


// =============================================
// TÁMOGATÁS MEGERŐSÍTŐ ABLAK – ANIMÁCIÓVAL
// =============================================

function setupSupportConfirmation() {
    const modal = document.getElementById("tamogatas-ablak");
    const yesLink = document.getElementById("tamogatas-igen");
    const noButton = document.getElementById("tamogatas-nem");

    if (!modal || !yesLink || !noButton) {
        return;
    }

    const supportUrl =
        "https://www.paypal.com/paypalme/Rihigaming71";

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    let currentAnimation = null;
    let closing = false;

    function openSupportModal() {
        if (modal.open || closing) {
            return;
        }

        modal.classList.remove("is-closing");
        modal.showModal();

        if (reducedMotion.matches) {
            return;
        }

        currentAnimation = modal.animate(
            [
                {
                    opacity: 0,
                    transform: "translateY(24px) scale(0.94)"
                },
                {
                    opacity: 1,
                    transform: "translateY(0) scale(1)"
                }
            ],
            {
                duration: 300,
                easing: "cubic-bezier(0.16, 1, 0.3, 1)"
            }
        );
    }

    async function closeSupportModal() {
        if (!modal.open || closing) {
            return;
        }

        closing = true;

        const currentStyle = getComputedStyle(modal);
        const startOpacity = currentStyle.opacity;
        const startTransform = currentStyle.transform;

        if (currentAnimation) {
            currentAnimation.cancel();
        }

        try {
            if (!reducedMotion.matches) {
                modal.classList.add("is-closing");

                currentAnimation = modal.animate(
                    [
                        {
                            opacity: startOpacity,
                            transform: startTransform
                        },
                        {
                            opacity: 0,
                            transform: "translateY(16px) scale(0.96)"
                        }
                    ],
                    {
                        duration: 200,
                        easing: "ease-in",
                        fill: "forwards"
                    }
                );

                await currentAnimation.finished;
            }
        } catch (error) {
            // Megszakított animációnál is bezárjuk az ablakot.
        } finally {
            modal.close();

            if (currentAnimation) {
                currentAnimation.cancel();
                currentAnimation = null;
            }

            modal.classList.remove("is-closing");
            closing = false;
        }
    }

    // A normál navigáció és a mobilmenü linkjét is kezeli.
    document.addEventListener("click", event => {
        if (!(event.target instanceof Element)) {
            return;
        }

        const link = event.target.closest(
            ".nav-btn, .menu-link"
        );

        if (!link || link.href !== supportUrl) {
            return;
        }

        event.preventDefault();

        yesLink.href = supportUrl;
        openSupportModal();
    });

    noButton.addEventListener("click", () => {
        closeSupportModal();
    });

    yesLink.addEventListener("click", event => {
        if (closing) {
            event.preventDefault();
            return;
        }

        // A link új lapon megnyílik, közben az ablak bezáródik.
        closeSupportModal();
    });

    modal.addEventListener("cancel", event => {
        event.preventDefault();
        closeSupportModal();
    });
}


// =============================================
// OLDAL BETÖLTÉSE
// =============================================

function safeRun(name, fn) {
    try {
        fn();
    } catch (error) {
        console.error("Hiba itt: " + name, error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    safeRun("setupAccordion", setupAccordion);
    safeRun("setupMobileMenu", setupMobileMenu);
    safeRun("setupSupportConfirmation", setupSupportConfirmation);
    safeRun("loadTwitchClips", loadTwitchClips);
    safeRun("updateNotifications", updateNotifications);

    setInterval(updateNotifications, 45000);

    safeRun("setupEmailSubscription", setupEmailSubscription);
    safeRun("highlightRules", highlightRules);
});