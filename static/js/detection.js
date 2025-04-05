document.addEventListener('DOMContentLoaded', function() {
    // Check login status
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        window.location.href = '/login';
        return;
    }
    
    // Elements
    const startCameraBtn = document.getElementById('startCameraBtn');
    const captureImageBtn = document.getElementById('captureImageBtn');
    const webcamElement = document.getElementById('webcam');
    const imagePreview = document.getElementById('imagePreview');
    const imageInput = document.getElementById('imageInput');
    const imageDropArea = document.getElementById('imageDropArea');
    const uploadInstructions = document.getElementById('uploadInstructions');
    const detectButton = document.getElementById('detectButton');
    const resultsSection = document.getElementById('resultsSection');
    const detectionTableBody = document.getElementById('detectionTableBody');
    const viewInventoryBtn = document.getElementById('viewInventoryBtn');
    const cameraStatus = document.getElementById('cameraStatus');
    
    let stream = null;
    let capturedImage = null;
    
    // Start webcam
    startCameraBtn.addEventListener('click', async function() {
        try {
            // Add animation to button
            startCameraBtn.classList.add('pulse');
            
            // Update status message
            cameraStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Accessing camera...';
            cameraStatus.classList.add('active');
            
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 640 },
                    facingMode: 'environment' // Try to use back camera on mobile
                }
            });
            
            webcamElement.srcObject = stream;
            
            // Show video with fade in effect
            webcamElement.classList.remove('hidden');
            webcamElement.classList.add('fade-in');
            setTimeout(() => webcamElement.classList.remove('fade-in'), 500);
            
            // Enable capture button with animation
            captureImageBtn.disabled = false;
            captureImageBtn.classList.add('pulse');
            setTimeout(() => captureImageBtn.classList.remove('pulse'), 1000);
            
            // Update start camera button
            startCameraBtn.innerHTML = '<i class="fas fa-video-slash"></i> Stop Camera';
            startCameraBtn.classList.remove('pulse');
            
            // Hide image preview if visible
            if (!imagePreview.classList.contains('hidden')) {
                imagePreview.classList.add('fade-out');
                setTimeout(() => {
                    imagePreview.classList.add('hidden');
                    imagePreview.classList.remove('fade-out');
                }, 300);
            }
            
            // Update status message
            cameraStatus.innerHTML = '<i class="fas fa-check-circle"></i> Camera ready';
            setTimeout(() => {
                cameraStatus.innerHTML = '<i class="fas fa-info-circle"></i> Click "Capture" to take photo';
            }, 2000);
            
            // Reset image preview and detection results
            imagePreview.src = '';
            capturedImage = null;
            
            // Hide results section if visible
            if (!resultsSection.classList.contains('hidden')) {
                resultsSection.classList.add('fade-out');
                setTimeout(() => {
                    resultsSection.classList.add('hidden');
                    resultsSection.classList.remove('fade-out');
                }, 300);
            }
            
            // Disable detect button
            detectButton.disabled = true;
            
        } catch (err) {
            console.error('Error accessing webcam:', err);
            cameraStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Camera access failed';
            setTimeout(() => {
                cameraStatus.classList.remove('active');
            }, 3000);
            
            alert('Could not access webcam. Please ensure you have a webcam connected and have given permission to use it.');
            
            // Reset button animation
            startCameraBtn.classList.remove('pulse');
        }
    });
    
    // Capture image from webcam
    captureImageBtn.addEventListener('click', function() {
        if (!stream) return;
        
        // Visual feedback for capture button
        captureImageBtn.classList.add('pulse');
        
        // Add a "flash" effect
        const flash = document.createElement('div');
        flash.style.position = 'absolute';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = 'white';
        flash.style.opacity = '0.8';
        flash.style.zIndex = '10';
        flash.style.pointerEvents = 'none';
        flash.style.transition = 'opacity 0.3s ease';
        
        document.querySelector('.webcam-container').appendChild(flash);
        
        setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => flash.remove(), 300);
        }, 100);
        
        const canvas = document.createElement('canvas');
        canvas.width = webcamElement.videoWidth;
        canvas.height = webcamElement.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(webcamElement, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 and set as preview
        capturedImage = canvas.toDataURL('image/jpeg');
        
        // Hide webcam and show preview
        webcamElement.classList.add('fade-out');
        setTimeout(() => {
            webcamElement.classList.add('hidden');
            webcamElement.classList.remove('fade-out');
            
            imagePreview.src = capturedImage;
            imagePreview.classList.remove('hidden');
            imagePreview.classList.add('fade-in');
            setTimeout(() => imagePreview.classList.remove('fade-in'), 500);
            
            // Enable detect button
            detectButton.disabled = false;
            detectButton.classList.add('pulse');
            setTimeout(() => detectButton.classList.remove('pulse'), 1000);
            
            // Reset capture button
            captureImageBtn.classList.remove('pulse');
            captureImageBtn.disabled = true;
            
            // Update camera status
            cameraStatus.innerHTML = '<i class="fas fa-check-circle"></i> Image captured!';
            
            // Change start camera button
            startCameraBtn.innerHTML = '<i class="fas fa-camera"></i> Take New Photo';
            startCameraBtn.disabled = false;
        }, 300);
        
        // Update upload area to show we have an image
        uploadInstructions.style.display = 'none';
        
        // Stop webcam
        stopWebcam();
    });
    
    // Stop webcam
    function stopWebcam() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
            webcamElement.srcObject = null;
            captureImageBtn.disabled = true;
            // Leave startCameraBtn enabled so user can take a new photo
        }
    }
    
    // File input handler
    imageInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            handleImageFile(e.target.files[0]);
        }
    });
    
    // Drag and drop handlers
    imageDropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });
    
    imageDropArea.addEventListener('dragleave', function() {
        this.classList.remove('dragover');
    });
    
    imageDropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageFile(e.dataTransfer.files[0]);
        }
    });
    
    imageDropArea.addEventListener('click', function() {
        // Trigger file input click
        if (!imagePreview.classList.contains('hidden')) return;
        imageInput.click();
    });
    
    // Handle the uploaded image file
    function handleImageFile(file) {
        if (!file.type.match('image.*')) {
            alert('Please select an image file.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            // Stop webcam if running
            stopWebcam();
            
            // Update camera status
            cameraStatus.innerHTML = '<i class="fas fa-check-circle"></i> Image uploaded!';
            cameraStatus.classList.add('active');
            setTimeout(() => {
                cameraStatus.classList.remove('active');
            }, 3000);
            
            // Set image preview
            imagePreview.src = e.target.result;
            capturedImage = e.target.result;
            
            // Hide webcam and show image
            webcamElement.classList.add('hidden');
            imagePreview.classList.remove('hidden');
            imagePreview.classList.add('fade-in');
            setTimeout(() => imagePreview.classList.remove('fade-in'), 500);
            
            // Hide upload instructions
            uploadInstructions.style.display = 'none';
            
            // Enable detect button
            detectButton.disabled = false;
            detectButton.classList.add('pulse');
            setTimeout(() => detectButton.classList.remove('pulse'), 1000);
            
            // Update start camera button
            startCameraBtn.innerHTML = '<i class="fas fa-camera"></i> Take New Photo';
            startCameraBtn.disabled = false;
        };
        
        reader.readAsDataURL(file);
    }
    
    // Detect button
    detectButton.addEventListener('click', function() {
        if (!capturedImage) {
            alert('Please capture or upload an image first.');
            return;
        }
        
        // Add loading state
        detectButton.disabled = true;
        detectButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting Products...';
        
        // Update camera status
        cameraStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing image...';
        cameraStatus.classList.add('active');
        
        // Simulate API call with a short delay (replace with actual API call)
        setTimeout(() => {
            // Get demo products
            const demoProducts = getDemoProducts();
            
            // Show results
            displayDetectionResults(demoProducts);
            
            // Store products in localStorage for inventory demo
            localStorage.setItem('detectedProducts', JSON.stringify(demoProducts));
            
            // Reset button
            detectButton.innerHTML = '<i class="fas fa-search"></i> Detect Products';
            detectButton.disabled = false;
            
            // Update camera status
            cameraStatus.innerHTML = '<i class="fas fa-check-circle"></i> Products detected!';
            setTimeout(() => {
                cameraStatus.classList.remove('active');
            }, 3000);
            
        }, 1500);
    });
    
    // Function to display detection results
    function displayDetectionResults(products) {
        // Clear existing rows
        detectionTableBody.innerHTML = '';
        
        // Show results section if hidden
        if (resultsSection.classList.contains('hidden')) {
            resultsSection.classList.remove('hidden');
            resultsSection.classList.add('fade-in');
            setTimeout(() => resultsSection.classList.remove('fade-in'), 500);
        }
        
        // Add product rows with staggered animation
        products.forEach((product, index) => {
            // Determine status and class
            let statusText = '';
            let statusClass = '';
            
            if (product.is_expired) {
                statusText = 'Expired';
                statusClass = 'status-expired';
            } else if (product.is_expiring_soon) {
                statusText = 'Near Expiry';
                statusClass = 'status-expiring-soon';
            } else {
                statusText = 'Good';
                statusClass = 'status-good';
            }
            
            const row = document.createElement('tr');
            row.className = 'detection-result-row';
            row.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;
            row.style.opacity = '0';
            
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.batch}</td>
                <td>${formatDate(product.expiry_date)}</td>
                <td>${product.quantity}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            `;
            
            detectionTableBody.appendChild(row);
        });
        
        // Scroll to the results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // View inventory button
    viewInventoryBtn.addEventListener('click', function() {
        // Add transition effect
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            window.location.href = '/inventory';
        }, 300);
    });
    
    // Demo product data for testing
    function getDemoProducts() {
        const today = new Date();
        
        // Expired product (5 days ago)
        const expiredDate = new Date();
        expiredDate.setDate(today.getDate() - 5);
        
        // Near expiry (3 days from now)
        const nearExpiryDate = new Date();
        nearExpiryDate.setDate(today.getDate() + 3);
        
        // Good product (30 days from now)
        const goodExpiryDate = new Date();
        goodExpiryDate.setDate(today.getDate() + 30);
        
        return [
            {
                name: 'Milk Carton',
                batch: 'MK4872',
                expiry_date: expiredDate.toISOString().split('T')[0],
                quantity: 5,
                is_expired: true,
                is_expiring_soon: false
            },
            {
                name: 'Fresh Bread',
                batch: 'BR2209',
                expiry_date: nearExpiryDate.toISOString().split('T')[0],
                quantity: 8,
                is_expired: false,
                is_expiring_soon: true
            },
            {
                name: 'Cereal Box',
                batch: 'CR7732',
                expiry_date: goodExpiryDate.toISOString().split('T')[0],
                quantity: 12,
                is_expired: false,
                is_expiring_soon: false
            }
        ];
    }
});
