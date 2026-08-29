const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Hamburger menü
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Aktív menüpont váltása + menü bezárása mobilon
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        // Eltávolítjuk az active class-t mindenkiről
        navLinks.forEach(item => item.classList.remove('active'));
        
        // Hozzáadjuk az active class-t a kattintott linkhez
        link.classList.add('active');

        // Mobil menü bezárása
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});