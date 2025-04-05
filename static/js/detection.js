document.addEventListener('DOMContentLoaded', function() {
    // Check login status
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        window.location.href = '/login';
        return;
    }

    // Elements
    const imageDropArea = document.getElementById('imageDropArea');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const uploadInstructions = document.getElementById('uploadInstructions');
    const detectButton = document.getElementById('detectButton');
    const resultsSection = document.getElementById('resultsSection');
    const detectionTableBody = document.getElementById('detectionTableBody');
    const viewInventoryBtn = document.getElementById('viewInventoryBtn');

    // Image upload handling
    imageDropArea.addEventListener('click', function() {
        imageInput.click();
    });

    imageDropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        imageDropArea.classList.add('dragover');
    });

    imageDropArea.addEventListener('dragleave', function() {
        imageDropArea.classList.remove('dragover');
    });

    imageDropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        imageDropArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            handleImageFile(e.dataTransfer.files[0]);
        }
    });

    imageInput.addEventListener('change', function() {
        if (imageInput.files.length) {
            handleImageFile(imageInput.files[0]);
        }
    });

    // Handle the selected image file
    function handleImageFile(file) {
        if (!file.type.match('image.*')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();
        
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove('hidden');
            uploadInstructions.classList.add('hidden');
            detectButton.disabled = false;
        };
        
        reader.readAsDataURL(file);
    }

    // Product detection
    detectButton.addEventListener('click', function() {
        // Set button to loading state
        detectButton.disabled = true;
        detectButton.textContent = 'Detecting...';
        
        // Call the backend API to save the detection
        fetch('/detection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_data: imagePreview.src  // In a real app, you might send the actual image file
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Get products from the detection
                const detectedProducts = data.detection.products;
                
                // Save to localStorage for inventory page (optional, since we also store in DB)
                localStorage.setItem('detectedProducts', JSON.stringify(detectedProducts));
                
                // Display results
                displayDetectionResults(detectedProducts);
                
                // Show results section
                resultsSection.classList.remove('hidden');
            } else {
                alert('Error detecting products: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Detection error:', error);
            alert('Failed to process detection. Please try again.');
        })
        .finally(() => {
            // Reset button state
            detectButton.disabled = false;
            detectButton.textContent = 'Detect Products';
        });
    });

    // Display detection results in table
    function displayDetectionResults(products) {
        // Clear existing rows
        detectionTableBody.innerHTML = '';
        
        // Add product rows
        products.forEach(product => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.batch}</td>
                <td>${formatDate(product.expiry_date)}</td>
                <td>${product.quantity}</td>
            `;
            
            detectionTableBody.appendChild(row);
        });
    }

    // View inventory button
    viewInventoryBtn.addEventListener('click', function() {
        window.location.href = '/inventory';
    });

    // Check for already detected products
    fetch('/api/detections')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.detection && data.detection.products && data.detection.products.length > 0) {
                const products = data.detection.products;
                
                // Save to localStorage for inventory page
                localStorage.setItem('detectedProducts', JSON.stringify(products));
                
                // Display results
                displayDetectionResults(products);
                
                // Show results section
                resultsSection.classList.remove('hidden');
            }
        })
        .catch(error => {
            console.error('Error fetching detections:', error);
            // If API fails, check localStorage as fallback
            const savedProducts = localStorage.getItem('detectedProducts');
            if (savedProducts) {
                const products = JSON.parse(savedProducts);
                displayDetectionResults(products);
                resultsSection.classList.remove('hidden');
            }
        });

    // Helper function to format a date
    function formatDate(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    }
});