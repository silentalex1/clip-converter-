document.addEventListener('DOMContentLoaded', () => {
const tabs = document.querySelectorAll('.tab-link');
const contents = document.querySelectorAll('.tab-content');
const createForm = document.getElementById('create-form');
const loginForm = document.getElementById('login-form');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(item => item.classList.remove('active'));
        contents.forEach(item => item.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('create-username').value;
    const password = document.getElementById('create-password').value;
    const email = document.getElementById('create-email').value;

    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const userData = { username, password, email, verificationCode };
    sessionStorage.setItem('pendingVerification', JSON.stringify(userData));

    console.log(`
        --- EMAIL SERVICE ---
        To: ${email}
        Subject: Verification code for Clip Converter
        
        Here is your verification code: ${verificationCode}
        
        If you did not make this request, please report it here: https://discord.gg/yWErcPvkVt
        --- END EMAIL ---
    `);

    alert("A verification code has been sent to your console. Please check it to complete registration.");
    window.location.href = 'verifycode.html';
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = e.target.children[0].value;
    const password = e.target.children[1].value;
    const storedUsers = JSON.parse(localStorage.getItem('clipConverterDB')) || [];
    
    const user = storedUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
        localStorage.setItem('clipConverterUser', user.username);
        window.location.href = 'index.html';
    } else {
        alert('Invalid username or password.');
    }
});
