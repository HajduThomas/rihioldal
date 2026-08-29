function openLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('errorMsg').style.display = 'none';
}

function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    if (user === 'admin' && pass === 'Admin26') {
        window.location.href = 'home.html';
    } else {
        errorMsg.style.display = 'block';
    }
}

function logout() {
    window.location.href = 'index.html';
}

// KÉP LAPOZÓ LOGIKA
let currentModalSliderId = '';

function moveSlide(sliderId, direction) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;

    const slides = slider.querySelectorAll('.slide');
    let activeIndex = -1;

    // Megkeressük az éppen látható képet
    slides.forEach((slide, index) => {
        if (slide.classList.contains('active')) {
            activeIndex = index;
            slide.classList.remove('active');
        }
    });

    // Kiszámoljuk az új kép indexét (körbejáró lapozás)
    let newIndex = activeIndex + direction;
    if (newIndex >= slides.length) newIndex = 0;
    if (newIndex < 0) newIndex = slides.length - 1;

    // Megjelenítjük az új képet
    slides[newIndex].classList.add('active');
    return slides[newIndex];
}

// Modál (Popup) megnyitása
function openModal(sliderId) {
    currentModalSliderId = sliderId;
    const slider = document.getElementById(sliderId);
    const activeSlide = slider.querySelector('.slide.active');
    
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    
    modal.style.display = 'flex';
    modalImg.src = activeSlide.src;
}

// Modál bezárása
function closeModal() {
    document.getElementById('imageModal').style.display = 'none';
}

// Modálon belüli lapozás (lépteti a háttérben lévő slidert is)
function moveModalSlide(direction) {
    const newActiveSlide = moveSlide(currentModalSliderId, direction);
    if (newActiveSlide) {
        document.getElementById('modalImage').src = newActiveSlide.src;
    }
}

// Esc billentyűvel való bezárás
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        closeModal();
    }
});

// VIDEÓ SLIDER LOGIKA CSÚSZÁS ANIMÁCIÓVAL
let currentVideoIndex = 0;

function updateVideoSlide() {
    const track = document.getElementById('videoTrack');
    const dots = document.querySelectorAll('.video-dots .dot');

    // 1. Videó leállítása váltáskor
    document.querySelectorAll('.video-slide video').forEach(video => {
        video.pause();
    });

    // 2. Csúsztatási animáció végrehajtása
    if (track) {
        track.style.transform = `translateX(-${currentVideoIndex * 100}%)`;
    }

    // 3. Pöttyök aktiválása
    dots.forEach((dot, idx) => {
        if (idx === currentVideoIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Léptetés a nyílgombokkal
function moveVideoSlide(direction) {
    const slides = document.querySelectorAll('.video-slide');
    if (slides.length === 0) return;

    currentVideoIndex += direction;

    if (currentVideoIndex >= slides.length) {
        currentVideoIndex = 0;
    } else if (currentVideoIndex < 0) {
        currentVideoIndex = slides.length - 1;
    }

    updateVideoSlide();
}

// Ugrás konkrét videóra a pöttyel
function setVideoSlide(index) {
    currentVideoIndex = index;
    updateVideoSlide();
}

// ÉRTESÍTÉSEK ADATBÁZISA
const notifications = [
    {
        platform: "youtube",
        title: "Új YouTube Videó került ki!",
        desc: "Nézzétek meg a legújabb vicces pillanatokat és clipeket!",
        time: "10 perce",
        link: "https://www.youtube.com/@rihigaming1",
        icon: "img/ytlogo.png"
    },
    {
        platform: "twitch",
        title: "ÉLŐ ADÁS VAN TWITCHEN! 🔴",
        desc: "Gyertek, most indult a stream, mehet a duma meg a játék!",
        time: "2 órája",
        link: "https://www.twitch.tv/rihigaming_official",
        icon: "img/twlogo.png"
    }
];

// INITIALIZÁCIÓ DOM BETÖLTÉSKOR
document.addEventListener("DOMContentLoaded", () => {
    // Értesítések kirajzolása az oldalon
    const container = document.getElementById("notificationsList");
    if (container) {
        if (notifications.length === 0) {
            container.innerHTML = "<p style='color: gray;'>Jelenleg nincsenek új értesítések.</p>";
        } else {
            container.innerHTML = notifications.map(notif => `
                <a href="${notif.link}" target="_blank" class="notif-card ${notif.platform}">
                    <img src="${notif.icon}" alt="${notif.platform}" class="notif-icon">
                    <div class="notif-content">
                        <div class="notif-header">
                            <span class="notif-title">${notif.title}</span>
                            <span class="notif-badge">${notif.platform}</span>
                        </div>
                        <p class="notif-desc">${notif.desc}</p>
                    </div>
                    <span class="notif-time">${notif.time}</span>
                </a>
            `).join('');
        }
    }

    // Értesítési jelzőbuborék (badge) számláló frissítése
    const badge = document.getElementById("notifBadge");
    if (badge) {
        if (typeof notifications !== 'undefined' && notifications.length > 0) {
            badge.innerText = notifications.length;
            badge.style.display = "inline-block";
        } else {
            badge.style.display = "none";
        }
    }

    // E-mail feliratkozás kezelése
    const subForm = document.getElementById("subscribeForm");
    const subStatus = document.getElementById("subscribeStatus");
    if (subForm) {
        subForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("subscriberEmail").value;

            subStatus.style.color = "gold";
            subStatus.innerText = "Feliratkozás küldése...";

            const serviceID = "service_xcigsmn";
            const templateID = "template_8ble6kv";
            const templateParams = {
                user_email: email,
                message: "Új feliratkozó érkezett a Rihi Gaming értesítésekre!"
            };

            emailjs.send(serviceID, templateID, templateParams)
                .then(() => {
                    subStatus.style.color = "#4BB543";
                    subStatus.innerText = "Sikeres feliratkozás! Köszönjük!";
                    subForm.reset();
                })
                .catch((err) => {
                    subStatus.style.color = "#ff3b30";
                    subStatus.innerText = "Hiba történt a feliratkozás során. Próbáld újra!";
                    console.error("EmailJS Hiba:", err);
                });
        });
    }

   
});

// Szabályzatok animált lenyitása és becsukása
function toggleRule(btn) {
    const box = btn.parentElement;
    const content = box.querySelector('.collapsible-content');
    const btnText = btn.querySelector('.btn-text');

    if (content.classList.contains('active')) {
        // Becsukás animációja
        content.style.maxHeight = '0px';
        content.classList.remove('active');
        btn.classList.remove('active');
        btnText.textContent = 'Összes szabályzat mutatása';
    } else {
        // Lenyitás animációja (kiszámolja a pontos magasságot)
        content.classList.add('active');
        btn.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
        btnText.textContent = 'Kevesebb mutatása';
    }
}

// @ jellel kezdődő szavak és Emojik automatikus kiemelése
document.addEventListener("DOMContentLoaded", function() {
    const ruleBoxes = document.querySelectorAll('.info-box p, .info-box li');
    
    // Emojik felismerésére szolgáló regex minta
    const emojiRegex = /(\p{Extended_Pictographic}|\p{Emoji_Component})/gu;

    ruleBoxes.forEach(element => {
        let html = element.innerHTML;

        // 1. Megkeresi a @ szavakat (pl. @rihigaming) és kiemeli
        html = html.replace(
            /(^|\s)(@[a-zA-Z0-9_áéíóöőúüűÁÉÍÓÖŐÚÜŰ]+)/g, 
            '$1<span class="mention">$2</span>'
        );

        // 2. Megkeresi az emojikat és bevonja a kiemelő span-be
        html = html.replace(
            emojiRegex,
            '<span class="emoji-highlight">$1</span>'
        );

        element.innerHTML = html;
    });
});