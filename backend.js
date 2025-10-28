document.addEventListener('DOMContentLoaded', () => {
    const userInfoDisplay = document.getElementById('user-info');
    const verifyForm = document.getElementById('verify-form');
    const codeInput = document.getElementById('code-input');

    const pendingUserData = JSON.parse(sessionStorage.getItem('pendingVerification'));

    if (!pendingUserData) {
        userInfoDisplay.innerHTML = "No pending verification found. Please start over.";
        verifyForm.style.display = 'none';
        return;
    }

    userInfoDisplay.innerHTML = `
        Username: <span>${pendingUserData.username}</span><br>
        Email: <span>${pendingUserData.email}</span>
    `;

    verifyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredCode = codeInput.value.toUpperCase();

        if (enteredCode === pendingUserData.verificationCode) {
            let db = JSON.parse(localStorage.getItem('clipConverterDB')) || [];
            
            const newUser = {
                username: pendingUserData.username,
                password: pendingUserData.password,
                email: pendingUserData.email
            };

            db.push(newUser);
            localStorage.setItem('clipConverterDB', JSON.stringify(db));
            localStorage.setItem('clipConverterUser', newUser.username);

            sessionStorage.removeItem('pendingVerification');
            
            alert('Account verified successfully! You are now logged in.');
            window.location.href = 'index.html';

        } else {
            alert('The verification code is incorrect. Please try again.');
        }
    });
});
