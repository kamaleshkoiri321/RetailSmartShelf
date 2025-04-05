document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const registerForm = document.getElementById('registerForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');

    // Form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset errors
        nameError.textContent = '';
        emailError.textContent = '';
        passwordError.textContent = '';
        confirmPasswordError.textContent = '';
        
        // Validation flags
        let isValid = true;
        
        // Validate name
        if (!nameInput.value.trim()) {
            nameError.textContent = 'Please enter your name';
            isValid = false;
        }
        
        // Validate email
        if (!validateEmail()) {
            isValid = false;
        }
        
        // Validate password
        if (!validatePassword()) {
            isValid = false;
        }
        
        // Validate confirm password
        if (passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordError.textContent = 'Passwords do not match';
            isValid = false;
        }
        
        if (isValid) {
            try {
                // Submit data to server
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: nameInput.value.trim(),
                        email: emailInput.value.trim(),
                        password: passwordInput.value
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Registration successful, redirect to detection page
                    window.location.href = '/detection';
                } else {
                    // Show error from server
                    emailError.textContent = data.message || 'Registration failed. Please try again.';
                }
            } catch (error) {
                console.error('Registration error:', error);
                emailError.textContent = 'An error occurred. Please try again later.';
            }
        }
    });
    
    // Email validation
    function validateEmail() {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            emailError.textContent = 'Please enter your email address';
            return false;
        } else if (!emailRegex.test(email)) {
            emailError.textContent = 'Please enter a valid email address';
            return false;
        }
        
        return true;
    }
    
    // Password validation
    function validatePassword() {
        const password = passwordInput.value;
        
        if (!password) {
            passwordError.textContent = 'Please enter a password';
            return false;
        } else if (password.length < 6) {
            passwordError.textContent = 'Password must be at least 6 characters';
            return false;
        }
        
        return true;
    }
    
    // Clear errors on input
    nameInput.addEventListener('input', () => {
        nameError.textContent = '';
    });
    
    emailInput.addEventListener('input', () => {
        emailError.textContent = '';
    });
    
    passwordInput.addEventListener('input', () => {
        passwordError.textContent = '';
    });
    
    confirmPasswordInput.addEventListener('input', () => {
        confirmPasswordError.textContent = '';
    });
});
