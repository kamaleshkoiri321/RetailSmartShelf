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
    
    // Webcam elements
    const startCameraBtn = document.getElementById('startCameraBtn');
    const captureImageBtn = document.getElementById('captureImageBtn');
    const webcamElement = document.getElementById('webcam');
    
    let stream = null;
    
    // Webcam functionality
    startCameraBtn.addEventListener('click', async function() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'environment' // Try to use back camera on mobile
                } 
            });
            
            webcamElement.srcObject = stream;
            webcamElement.classList.remove('hidden');
            captureImageBtn.disabled = false;
            startCameraBtn.disabled = true;
            startCameraBtn.innerHTML = '<i class="fas fa-video-slash"></i> Camera On';
        } catch (err) {
            console.error('Error accessing webcam:', err);
            alert('Could not access webcam. Please ensure you have a webcam connected and have given permission to use it.');
        }
    });
    
    captureImageBtn.addEventListener('click', function() {
        if (!stream) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = webcamElement.videoWidth;
        canvas.height = webcamElement.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(webcamElement, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 image
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        
        // Set as preview
        imagePreview.src = imageDataUrl;
        imagePreview.classList.remove('hidden');
        uploadInstructions.classList.add('hidden');
        
        // Enable detect button
        detectButton.disabled = false;
        
        // Stop webcam
        stopWebcam();
    });
    
    function stopWebcam() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
            webcamElement.classList.add('hidden');
            webcamElement.srcObject = null;
            captureImageBtn.disabled = true;
            startCameraBtn.disabled = false;
            startCameraBtn.innerHTML = '<i class="fas fa-video"></i> Start Camera';
        }
    }

    // Image upload handling
    imageDropArea.addEventListener('click', function() {
        if (captureImageBtn.disabled) {
            imageInput.click();
        }
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
            
            // If webcam is running, stop it
            stopWebcam();
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
                image_data: imagePreview.src  // Send the image data
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
            detectButton.innerHTML = '<i class="fas fa-search"></i> Detect Products';
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
});