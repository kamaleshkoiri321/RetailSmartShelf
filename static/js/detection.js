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
        // Mock product detection (in a real app, this would call an API)
        const detectedProducts = [
            {
                name: 'Milk',
                batch: 'A123',
                expiry: '2025-04-15',
                quantity: 10
            },
            {
                name: 'Bread',
                batch: 'B456',
                expiry: '2025-04-10',
                quantity: 5
            },
            {
                name: 'Eggs',
                batch: 'C789',
                expiry: '2025-04-05',
                quantity: 20
            }
        ];
        
        // Save to localStorage for inventory page
        localStorage.setItem('detectedProducts', JSON.stringify(detectedProducts));
        
        // Display results
        displayDetectionResults(detectedProducts);
        
        // Show results section
        resultsSection.classList.remove('hidden');
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
                <td>${product.expiry}</td>
                <td>${product.quantity}</td>
            `;
            
            detectionTableBody.appendChild(row);
        });
    }

    // View inventory button
    viewInventoryBtn.addEventListener('click', function() {
        window.location.href = '/inventory';
    });

    // Check if there are already detected products to display
    const savedProducts = localStorage.getItem('detectedProducts');
    if (savedProducts) {
        const products = JSON.parse(savedProducts);
        displayDetectionResults(products);
        resultsSection.classList.remove('hidden');
    }

    // In a real application, the detection would call an API endpoint
    // Future API integration placeholder:
    /*
    async function detectProductsFromAPI(imageData) {
        try {
            const response = await fetch('https://api.example.com/detect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: imageData })
            });
            
            if (!response.ok) {
                throw new Error('API request failed');
            }
            
            const data = await response.json();
            return data.products;
        } catch (error) {
            console.error('Error calling detection API:', error);
            alert('Failed to detect products. Please try again.');
            return null;
        }
    }
    */
});
