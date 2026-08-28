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

    if (user === 'admin' && pass === 'admin') {
        window.location.href = 'home.html';
    } else {
        errorMsg.style.display = 'block';
    }
}


function logout() {
    window.location.href = 'index.html';
}

// KÉP LAPOZÓ LOGIKA
function moveSlide(sliderId, direction) {
    const slider = document.getElementById(sliderId);
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
    if (newIndex >= slides.length) {
        newIndex = 0;
    } else if (newIndex < 0) {
        newIndex = slides.length - 1;
    }

    // Megjelenítjük az új képet
    slides[newIndex].classList.add('active');
}

let currentModalSliderId = '';

// Kis dobozban lévő lapozás
function moveSlide(sliderId, direction) {
    const slider = document.getElementById(sliderId);
    const slides = slider.querySelectorAll('.slide');
    let activeIndex = -1;

    slides.forEach((slide, index) => {
        if (slide.classList.contains('active')) {
            activeIndex = index;
            slide.classList.remove('active');
        }
    });

    let newIndex = activeIndex + direction;
    if (newIndex >= slides.length) newIndex = 0;
    if (newIndex < 0) newIndex = slides.length - 1;

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

// Modálon belüli lapozás (lépteti a hátttérben lévő slidert is)
function moveModalSlide(direction) {
    const newActiveSlide = moveSlide(currentModalSliderId, direction);
    document.getElementById('modalImage').src = newActiveSlide.src;
}

// Esc billentyűvel is bezárható
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        closeModal();
    }
});