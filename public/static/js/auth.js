


// Initialize button state on page load
document.addEventListener('DOMContentLoaded', () => {
    const authButton = document.getElementById('authButton');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn) {
        authButton.textContent = 'Logout';
        authButton.onclick = handleAuth; // Ensure the click handler is set
    } else {
        authButton.textContent = 'Login';
        authButton.onclick = handleAuth;
    }
});

// Handle button click for login/logout
function handleAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        // Logout: Clear session and redirect
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html'; // Adjust to your login page URL
    } else {
        // Login: Redirect to login page
        window.location.href = 'login.html'; // Adjust to your login page URL
    }
}


