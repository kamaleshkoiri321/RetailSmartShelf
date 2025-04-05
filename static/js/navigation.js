document.addEventListener('DOMContentLoaded', function() {
    // Get navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // Check if we're on a protected page
    const currentPage = window.location.pathname;
    if (currentPage === '/detection' || currentPage === '/inventory') {
        // We're on a protected page, so the user must be logged in (server would redirect otherwise)
        enableNavigation();
        
        // Store authentication status in localStorage for consistency across pages
        localStorage.setItem('isLoggedIn', 'true');
    }
    
    // Handle logout - direct to /logout route when clicking login while on protected pages
    const loginLink = document.querySelector('.nav-links a[href="/login"]');
    if (loginLink && (currentPage === '/detection' || currentPage === '/inventory')) {
        loginLink.href = '/logout';
        loginLink.textContent = 'Logout';
        
        loginLink.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to log out?')) {
                e.preventDefault();
                return false;
            }
            // Clear localStorage on logout
            localStorage.removeItem('isLoggedIn');
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
