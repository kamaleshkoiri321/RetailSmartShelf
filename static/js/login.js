document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        window.location.href = '/detection';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const googleBtn = document.querySelector('.google-btn');

    // Add event listeners for real-time validation
    emailInput.addEventListener('blur', validateEmail);
    passwordInput.addEventListener('blur', validatePassword);
    emailInput.addEventListener('input', clearEmailError);
    passwordInput.addEventListener('input', clearPasswordError);

    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form fields
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        
        if (isEmailValid && isPasswordValid) {
            // Simulate successful login
            localStorage.setItem('isLoggedIn', 'true');
            
            // Enable navigation
            enableNavigation();
            
            // Redirect to detection page
            window.location.href = '/detection';
        }
    });

    // Handle Google login
    googleBtn.addEventListener('click', function() {
        // Simulate Google login
        localStorage.setItem('isLoggedIn', 'true');
        
        // Enable navigation
        enableNavigation();
        
        // Redirect to detection page
        window.location.href = '/detection';
    });

    // Email validation function
    function validateEmail() {
        const email = emailInput.value.trim();
        
        if (email === '') {
            emailError.textContent = 'Email or phone number is required';
            emailInput.classList.add('error');
            return false;
        }
        
        return true;
    }

    // Password validation function
    function validatePassword() {
        const password = passwordInput.value.trim();
        
        if (password === '') {
            passwordError.textContent = 'Password is required';
            passwordInput.classList.add('error');
            return false;
        }
        
        return true;
    }

    // Clear email error
    function clearEmailError() {
        emailError.textContent = '';
        emailInput.classList.remove('error');
    }

    // Clear password error
    function clearPasswordError() {
        passwordError.textContent = '';
        passwordInput.classList.remove('error');
    }
});
