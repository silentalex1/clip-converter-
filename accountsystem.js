document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-link');
    const contents = document.querySelectorAll('.tab-content');
    const registerForm = document.getElementById('register-form');
    const formMessage = document.getElementById('form-message');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(item => item.classList.remove('active'));
            contents.forEach(item => item.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        
        formMessage.textContent = 'Creating account...';
        
        const userData = { username, email, password };
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const result = await response.json();

            if (response.ok) {
                localStorage.setItem('verificationUser', JSON.stringify({ email, username }));
                window.location.href = '/verifycode';
            } else {
                formMessage.textContent = result.message || 'An error occurred.';
                formMessage.style.color = '#ff4d4d';
            }
        } catch (error) {
            formMessage.textContent = 'Could not connect to the server.';
            formMessage.style.color = '#ff4d4d';
        }
    });
});
