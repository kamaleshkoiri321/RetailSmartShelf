document.addEventListener('DOMContentLoaded', function() {
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
            // Send login request to server
            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: emailInput.value.trim(),
                    password: passwordInput.value.trim()
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Store login state for frontend use
                    localStorage.setItem('isLoggedIn', 'true');
                    
                    // Enable navigation
                    enableNavigation();
                    
                    // Redirect to detection page
                    window.location.href = '/detection';
                } else {
                    // Show error message
                    passwordError.textContent = data.message || 'Login failed';
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                passwordError.textContent = 'An error occurred during login. Please try again.';
            });
        }
    });

    // Handle Google login (mock for demo)
    googleBtn.addEventListener('click', function() {
        // For demo, we'll use a dummy Google account
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'google_user@example.com',
                password: generateRandomString(12)
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Store login state
                localStorage.setItem('isLoggedIn', 'true');
                
                // Enable navigation
                enableNavigation();
                
                // Redirect to detection page
                window.location.href = '/detection';
            }
        })
        .catch(error => {
            console.error('Google login error:', error);
            passwordError.textContent = 'An error occurred during Google login. Please try again.';
        });
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
