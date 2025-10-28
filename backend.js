document.addEventListener('DOMContentLoaded', () => {
    const userData = JSON.parse(localStorage.getItem('verificationUser'));
    const verifyForm = document.getElementById('verify-form');
    const codeInput = document.getElementById('code-input');
    const verifyMessage = document.getElementById('verify-message');

    if (!userData || !userData.email) {
        window.location.href = '/accountcreation';
        return;
    }

    document.getElementById('display-username').textContent = userData.username;
    document.getElementById('display-email').textContent = userData.email;

    verifyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = codeInput.value;
        verifyMessage.textContent = 'Verifying...';
        verifyMessage.style.color = '#fff';

        try {
            const response = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userData.email, code: code }),
            });

            const result = await response.json();

            if (response.ok) {
                localStorage.setItem('loggedInUser', userData.username);
                localStorage.removeItem('verificationUser');
                verifyMessage.textContent = 'Success! Redirecting...';
                verifyMessage.style.color = '#00ff7f';
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            } else {
                verifyMessage.textContent = result.message || 'Invalid code. Please try again.';
                verifyMessage.style.color = '#ff4d4d';
            }
        } catch (error) {
            verifyMessage.textContent = 'Could not connect to the server.';
            verifyMessage.style.color = '#ff4d4d';
        }
    });
});
