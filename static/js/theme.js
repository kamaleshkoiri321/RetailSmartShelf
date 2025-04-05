/**
 * Theme Management for RetailAI application
 * Handles dark/light mode toggle and persists user preference
 */

// Check if a theme preference is stored in local storage
const storedTheme = localStorage.getItem('theme');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Set initial theme based on stored preference or system preference
function setInitialTheme() {
    if (storedTheme) {
        document.documentElement.setAttribute('data-theme', storedTheme);
        updateThemeIcons(storedTheme);
    } else if (prefersDarkScheme.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeIcons('dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        updateThemeIcons('light');
    }
}

// Toggle the theme between light and dark
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    updateThemeIcons(newTheme);
}

// Update icons on theme toggle buttons to reflect current theme
function updateThemeIcons(theme) {
    const themeTogglers = document.querySelectorAll('.theme-toggle, .mobile-theme-toggle');
    
    themeTogglers.forEach(toggler => {
        if (theme === 'dark') {
            toggler.innerHTML = '<i class="fas fa-sun"></i>';
            toggler.setAttribute('title', 'Switch to light mode');
        } else {
            toggler.innerHTML = '<i class="fas fa-moon"></i>';
            toggler.setAttribute('title', 'Switch to dark mode');
        }
    });
}

// Set the initial theme when the page loads
document.addEventListener('DOMContentLoaded', () => {
    setInitialTheme();
    
    // Add event listeners to theme toggle buttons
    const themeTogglers = document.querySelectorAll('.theme-toggle, .mobile-theme-toggle');
    themeTogglers.forEach(toggler => {
        toggler.addEventListener('click', toggleTheme);
    });
});

// Watch for system preference changes
prefersDarkScheme.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        updateThemeIcons(newTheme);
    }
});
