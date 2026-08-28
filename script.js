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