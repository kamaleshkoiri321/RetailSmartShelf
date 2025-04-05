/**
 * Theme Management for RetailAI application
 * Note: Dark mode functionality has been removed - we have a single light mode theme now
 */

document.addEventListener('DOMContentLoaded', () => {
    // Remove theme toggles from the UI
    const themeToggles = document.querySelectorAll('.theme-toggle, .mobile-theme-toggle');
    themeToggles.forEach(toggle => {
        toggle.style.display = 'none';
    });
    
    // Clear any stored theme preference
    localStorage.removeItem('theme');
});
