function handleCredentialResponse(response) {
    const token = response.credential;
    console.log('ID Token:', token);
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('User Info:', payload);

    const messageBox = document.getElementById('messageBox');
    messageBox.style.display = 'block';
    messageBox.classList.remove('error', 'success');
    messageBox.classList.add('success');
    messageBox.textContent = 'Google Sign-In successful, contacting backend...';

    fetch('https://xmkvtmgtwb.execute-api.us-east-1.amazonaws.com/dev/auth/google/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: token })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Failed to sign in with Google');
        }
        return res.json();
    })
    .then(data => {
        console.log('Backend response:', data);
        console.log('Token to save:', data.token);
        messageBox.classList.remove('error', 'success');
        messageBox.classList.add('success');
        messageBox.textContent = 'Successfully signed in!';
        try {
            localStorage.setItem('jwt', data.token);
            localStorage.setItem('userName', payload.name || 'User');
            console.log('Token saved to localStorage:', localStorage.getItem('jwt'));
            console.log('User name saved to localStorage:', localStorage.getItem('userName'));
            setTimeout(() => {
                window.location.href = '/profile';
            }, 1000);
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            messageBox.classList.remove('success');
            messageBox.classList.add('error');
            messageBox.textContent = 'Error saving token: ' + error.message;
        }
    })
    .catch(err => {
        console.error('❌ Error sending token to backend:', err);
        messageBox.classList.remove('error', 'success');
        messageBox.classList.add('error');
        messageBox.textContent = 'Error signing in: ' + err.message;
    });
}

function updateAuthButtons() {
    const isLoggedIn = !!localStorage.getItem('jwt');
    const authButton = document.getElementById('authButton');
    const authButtonMobile = document.getElementById('authButtonMobile');
    const userInfo = document.getElementById('userInfo');

    if (isLoggedIn) {
        const userName = localStorage.getItem('userName') || 'User';
        authButton.innerHTML = '<button class="bg-blue-600 text-white font-semibold px-4 py-2 rounded-full hover:bg-blue-700 transition">Logout</button>';
        authButtonMobile.innerHTML = '<button class="block bg-blue-600 text-white font-semibold px-4 py-2 rounded-full hover:bg-blue-700 transition">Logout</button>';
        authButton.onclick = () => {
            localStorage.removeItem('jwt');
            localStorage.removeItem('userName');
            window.location.href = '/login.html';
        };
        authButtonMobile.onclick = authButton.onclick;
        if (userInfo) {
            userInfo.textContent = `Welcome, ${userName}`;
        }
    } else {
        authButton.innerHTML = '<a href="/login.html" class="text-blue-900 hover:text-blue-600 font-semibold text-lg">Login</a>';
        authButtonMobile.innerHTML = '<a href="/login.html" class="block text-blue-900 hover:text-blue-600 font-semibold text-lg">Login</a>';
        authButton.onclick = null;
        authButtonMobile.onclick = null;
        if (userInfo) {
            userInfo.textContent = '';
        }
    }
}

function renderGoogleButton() {
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
        console.error('Google Sign-In script failed to load');
        const messageBox = document.getElementById('messageBox');
        messageBox.style.display = 'block';
        messageBox.classList.remove('success');
        messageBox.classList.add('error');
        messageBox.textContent = 'Google Sign-In failed to load. Please try again later.';
        const googleButtonDiv = document.getElementById('google-button');
        googleButtonDiv.innerHTML = `
            <button class="social-button google" onclick="google.accounts.id.prompt()">
                <i class="fab fa-google"></i>
                <span>Sign in with Google</span>
            </button>
        `;
        return;
    }

    google.accounts.id.initialize({
        client_id: '299309099963-5sodtstum7m95l0siojj3a5ruacdv9tg.apps.googleusercontent.com',
        callback: handleCredentialResponse,
    });

    const buttonWidth = window.innerWidth <= 640 ? Math.min(window.innerWidth - 40, 400) : 400;

    google.accounts.id.renderButton(
        document.getElementById('google-button'),
        {
            theme: 'outline',
            size: 'large',
            width: buttonWidth,
            text: 'signin_with',
            shape: 'rectangular',
        }
    );

    window.addEventListener('resize', () => {
        const newWidth = window.innerWidth <= 640 ? Math.min(window.innerWidth - 40, 400) : 400;
        google.accounts.id.renderButton(
            document.getElementById('google-button'),
            {
                theme: 'outline',
                size: 'large',
                width: newWidth,
                text: 'signin_with',
                shape: 'rectangular',
            }
        );
    });
}

window.onload = () => {
    setTimeout(renderGoogleButton, 1000);
    updateAuthButtons();
};