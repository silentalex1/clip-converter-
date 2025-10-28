document.addEventListener('DOMContentLoaded', () => {
    const userData = JSON.parse(localStorage.getItem('pendingVerificationUser'));
    const verifyForm = document.getElementById('verify-form');
    const codeInput = document.getElementById('code-input');

    if (!userData) {
        window.location.href = '/accountcreation';
        return;
    }

    document.getElementById('display-username').textContent = userData.username;
    document.getElementById('display-email').textContent = userData.email;

    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem('verificationCode', verificationCode);

    console.log(`
        --- EMAIL SIMULATION ---
        To: ${userData.email}
        Subject: Verification code for clip converter.

        Here is your verification code: ${verificationCode}

        If you did not make an account please report it here: https://discord.gg/yWErcPvkVt
        --- END SIMULATION ---
    `);
    
    alert(`Your verification code has been sent (check the console): ${verificationCode}`);

    verifyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredCode = codeInput.value;
        const correctCode = localStorage.getItem('verificationCode');

        if (enteredCode === correctCode) {
            localStorage.setItem('loggedInUser', userData.username);
            localStorage.removeItem('pendingVerificationUser');
            localStorage.removeItem('verificationCode');
            alert('Account verified successfully! Redirecting...');
            window.location.href = '/';
        } else {
            alert('Incorrect verification code. Please try again.');
        }
    });
});
