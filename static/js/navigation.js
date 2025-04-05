document.addEventListener('DOMContentLoaded', function() {
    // Check login status
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // Get navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // If user is logged in, enable navigation
    if (isLoggedIn) {
        enableNavigation();
    } else {
        // If on pages other than login and not logged in, redirect to login
        const currentPage = window.location.pathname;
        if (currentPage !== '/' && currentPage !== '/login') {
            window.location.href = '/login';
        }
    }

    // Handle logout (clicking on Login when already logged in)
    const loginLink = document.querySelector('.nav-links a[href="/login"]');
    if (loginLink && isLoggedIn) {
        loginLink.addEventListener('click', function(e) {
            if (confirm('Are you sure you want to log out?')) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('detectedProducts');
                return true;
            } else {
                e.preventDefault();
                return false;
            }
        });
    }
});

// Function to enable navigation (can be called from login.js after successful login)
function enableNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.classList.remove('disabled');
    });
}
