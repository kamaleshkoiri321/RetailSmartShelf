document.addEventListener('DOMContentLoaded', function() {
    // Check login status
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        window.location.href = '/login';
        return;
    }

    // Elements
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    const alertsContainer = document.getElementById('alertsContainer');
    const backToDetectionBtn = document.getElementById('backToDetectionBtn');
    const addProductForm = document.getElementById('addProductForm');
    
    // Webcam elements for product
    const startProductCameraBtn = document.getElementById('startProductCameraBtn');
    const captureProductImageBtn = document.getElementById('captureProductImageBtn');
    const productWebcam = document.getElementById('productWebcam');
    const productImagePreview = document.getElementById('productImagePreview');
    
    let productStream = null;
    let capturedProductImage = null;
    
    // Set default date for expiry date (today + 30 days)
    const defaultExpiryDate = new Date();
    defaultExpiryDate.setDate(defaultExpiryDate.getDate() + 30);
    document.getElementById('productExpiryDate').valueAsDate = defaultExpiryDate;
    
    // Webcam functionality for product image
    startProductCameraBtn.addEventListener('click', async function() {
        try {
            // Animate the button first
            startProductCameraBtn.classList.add('pulse');
            
            productStream = await navigator.mediaDevices.getUserMedia({ 
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'environment' // Try to use back camera on mobile
                } 
            });
            
            productWebcam.srcObject = productStream;
            
            // Show the video element with animation
            productWebcam.classList.remove('hidden');
            productWebcam.classList.add('fade-in');
            
            // Enable capture button with animation
            captureProductImageBtn.disabled = false;
            captureProductImageBtn.classList.add('pulse');
            setTimeout(() => captureProductImageBtn.classList.remove('pulse'), 1000);
            
            // Update start camera button state
            startProductCameraBtn.disabled = true;
            startProductCameraBtn.classList.remove('pulse');
            startProductCameraBtn.innerHTML = '<i class="fas fa-video-slash"></i> Camera On';
            
            // Hide the preview if it was shown
            if (!productImagePreview.classList.contains('hidden')) {
                productImagePreview.classList.add('fade-out');
                setTimeout(() => {
                    productImagePreview.classList.add('hidden');
                    productImagePreview.classList.remove('fade-out');
                }, 300);
            }
        } catch (err) {
            console.error('Error accessing webcam:', err);
            alert('Could not access webcam. Please ensure you have a webcam connected and have given permission to use it.');
            startProductCameraBtn.classList.remove('pulse');
        }
    });
    
    captureProductImageBtn.addEventListener('click', function() {
        if (!productStream) return;
        
        // Visual feedback on button click
        captureProductImageBtn.classList.add('pulse');
        
        // Create canvas and capture image
        const canvas = document.createElement('canvas');
        canvas.width = productWebcam.videoWidth;
        canvas.height = productWebcam.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(productWebcam, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 image
        capturedProductImage = canvas.toDataURL('image/jpeg');
        
        // Hide video first with fade out
        productWebcam.classList.add('fade-out');
        setTimeout(() => {
            productWebcam.classList.add('hidden');
            productWebcam.classList.remove('fade-out');
            
            // Show preview with fade in
            productImagePreview.src = capturedProductImage;
            productImagePreview.classList.remove('hidden');
            productImagePreview.classList.add('fade-in');
            
            // Remove animation classes after transition
            setTimeout(() => {
                productImagePreview.classList.remove('fade-in');
                captureProductImageBtn.classList.remove('pulse');
            }, 500);
        }, 300);
        
        // Display capture feedback message
        const captureMsg = document.createElement('div');
        captureMsg.className = 'capture-success';
        captureMsg.innerHTML = '<i class="fas fa-check-circle"></i> Image captured successfully!';
        captureMsg.style.position = 'absolute';
        captureMsg.style.top = '10px';
        captureMsg.style.left = '50%';
        captureMsg.style.transform = 'translateX(-50%)';
        captureMsg.style.backgroundColor = 'rgba(46, 204, 113, 0.9)';
        captureMsg.style.color = 'white';
        captureMsg.style.padding = '8px 16px';
        captureMsg.style.borderRadius = '20px';
        captureMsg.style.zIndex = '100';
        captureMsg.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        captureMsg.style.transition = 'all 0.3s ease';
        
        const webcamContainer = document.querySelector('.webcam-container.product-webcam');
        webcamContainer.style.position = 'relative';
        webcamContainer.appendChild(captureMsg);
        
        setTimeout(() => {
            captureMsg.style.opacity = '0';
            setTimeout(() => captureMsg.remove(), 300);
        }, 2000);
        
        // Stop webcam
        stopProductWebcam();
    });
    
    function stopProductWebcam() {
        if (productStream) {
            productStream.getTracks().forEach(track => track.stop());
            productStream = null;
            productWebcam.srcObject = null;
            captureProductImageBtn.disabled = true;
            startProductCameraBtn.disabled = false;
            startProductCameraBtn.innerHTML = '<i class="fas fa-video"></i> Start Camera';
        }
    }

    // Add product form submission
    addProductForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('productName').value.trim();
        const batch = document.getElementById('productBatch').value.trim();
        const quantity = parseInt(document.getElementById('productQuantity').value, 10);
        const expiryDate = document.getElementById('productExpiryDate').value;
        
        if (!name || !batch || isNaN(quantity) || quantity < 1 || !expiryDate) {
            alert('Please fill out all required fields correctly.');
            return;
        }
        
        // Add loading effect to submit button
        const submitBtn = addProductForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        submitBtn.disabled = true;
        
        // Create new product object
        const newProduct = {
            name: name,
            batch: batch,
            quantity: quantity,
            expiry_date: expiryDate,
            product_image: capturedProductImage || null
        };
        
        // Submit to server
        fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newProduct)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success notification
                const notification = document.createElement('div');
                notification.className = 'notification success fade-in';
                notification.innerHTML = '<i class="fas fa-check-circle"></i> Product added successfully!';
                notification.style.position = 'fixed';
                notification.style.top = '20px';
                notification.style.right = '20px';
                notification.style.backgroundColor = 'rgba(46, 204, 113, 0.9)';
                notification.style.color = 'white';
                notification.style.padding = '15px 25px';
                notification.style.borderRadius = '10px';
                notification.style.zIndex = '1000';
                notification.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.classList.add('fade-out');
                    setTimeout(() => notification.remove(), 500);
                }, 3000);
                
                // Refresh the inventory display
                fetchAndDisplayInventory();
                
                // Reset form
                addProductForm.reset();
                productImagePreview.classList.add('hidden');
                capturedProductImage = null;
                
                // Set default expiry date again
                const defaultExpiryDate = new Date();
                defaultExpiryDate.setDate(defaultExpiryDate.getDate() + 30);
                document.getElementById('productExpiryDate').valueAsDate = defaultExpiryDate;
            } else {
                alert('Error adding product: ' + (data.message || 'Unknown error'));
            }
            
            // Restore button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        })
        .catch(error => {
            console.error('Add product error:', error);
            alert('Failed to add product. Please try again.');
            
            // Restore button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        });
    });

    // Fetch inventory data
    function fetchAndDisplayInventory() {
        // Show loading state
        inventoryTableBody.innerHTML = '<tr><td colspan="9" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading inventory...</td></tr>';
        alertsContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading alerts...</div>';
        
        fetch('/api/products')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayInventory(data.products);
                    displayAlerts(data.products);
                } else {
                    console.error('Error fetching products:', data.message);
                    
                    // Check localStorage as fallback
                    const savedProducts = localStorage.getItem('detectedProducts');
                    if (savedProducts) {
                        const products = JSON.parse(savedProducts);
                        displayInventory(products);
                        displayAlerts(products);
                    } else {
                        // Show empty state
                        inventoryTableBody.innerHTML = '<tr><td colspan="9" class="text-center">No products found. Add products using the form above.</td></tr>';
                        alertsContainer.innerHTML = '<p>No alerts at this time.</p>';
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                
                // Check localStorage as fallback
                const savedProducts = localStorage.getItem('detectedProducts');
                if (savedProducts) {
                    const products = JSON.parse(savedProducts);
                    displayInventory(products);
                    displayAlerts(products);
                } else {
                    // Show error state
                    inventoryTableBody.innerHTML = '<tr><td colspan="9" class="text-center text-danger"><i class="fas fa-exclamation-triangle"></i> Failed to load inventory. Please try again.</td></tr>';
                    alertsContainer.innerHTML = '<p class="text-danger"><i class="fas fa-exclamation-triangle"></i> Failed to load alerts. Please try again.</p>';
                }
            });
    }
    
    // Back to detection button
    backToDetectionBtn.addEventListener('click', function() {
        // Add transition effect
        document.body.style.opacity = '0';
        setTimeout(() => {
            window.location.href = '/detection';
        }, 300);
    });

    // Function to display inventory with status and discount suggestions
    function displayInventory(products) {
        // Clear existing rows
        inventoryTableBody.innerHTML = '';
        
        // Handle empty inventory
        if (products.length === 0) {
            inventoryTableBody.innerHTML = '<tr><td colspan="9" class="text-center">No products in inventory. Add some products using the form above.</td></tr>';
            return;
        }
        
        // Add product rows with status and discount
        products.forEach((product, index) => {
            // Get days until expiry, either from API or calculate
            let daysUntilExpiry = product.days_until_expiry;
            if (daysUntilExpiry === undefined) {
                const currentDate = new Date();
                const expiryDate = new Date(product.expiry_date);
                daysUntilExpiry = getDaysDifference(currentDate, expiryDate);
            }
            
            // Determine status
            let status = '';
            let statusClass = '';
            let discountSuggestion = '';
            
            // Use API provided values if available, otherwise calculate
            if (product.is_expired || daysUntilExpiry < 0) {
                status = 'Expired';
                statusClass = 'status-expired';
                discountSuggestion = 'Remove from shelf';
            } else if (product.is_expiring_soon || daysUntilExpiry <= 7) {
                status = 'Near Expiry';
                statusClass = 'status-expiring-soon';
                discountSuggestion = daysUntilExpiry <= 3 ? '50% off' : '20% off';
            } else {
                status = 'Good';
                statusClass = 'status-good';
                discountSuggestion = 'None';
            }
            
            const row = document.createElement('tr');
            row.className = 'inventory-row fade-in ' + status.toLowerCase().replace(' ', '-');
            row.style.animationDelay = (index * 0.1) + 's';
            
            // Format the created_at date if available
            const dateAdded = product.created_at 
                ? formatDate(product.created_at) 
                : formatDate(new Date().toISOString());
            
            // Create image thumbnail cell content
            let imageThumbnail = '';
            if (product.product_image) {
                imageThumbnail = `<img src="${product.product_image}" alt="${product.name}" class="thumbnail" onclick="showImageModal('${product.product_image}')">`;
            } else {
                imageThumbnail = '<i class="fas fa-image text-muted"></i>';
            }
            
            row.innerHTML = `
                <td>${product.id || (index + 1)}</td>
                <td>${product.name}</td>
                <td>${product.batch}</td>
                <td>${dateAdded}</td>
                <td>${formatDate(product.expiry_date)}</td>
                <td>${product.quantity}</td>
                <td><span class="status-cell ${statusClass}">${status}</span></td>
                <td>${discountSuggestion}</td>
                <td>${imageThumbnail}</td>
            `;
            
            inventoryTableBody.appendChild(row);
        });
    }

    // Function to display alerts for expiring products
    function displayAlerts(products) {
        // Clear existing alerts
        alertsContainer.innerHTML = '';
        
        // Filter products that are expired or expiring within 7 days
        const alertProducts = products.filter(product => {
            if (product.is_expired || product.is_expiring_soon) {
                return true;
            }
            
            // Calculate if not provided by API
            if (product.days_until_expiry !== undefined) {
                return product.days_until_expiry <= 7;
            } else {
                const currentDate = new Date();
                const expiryDate = new Date(product.expiry_date);
                const daysUntilExpiry = getDaysDifference(currentDate, expiryDate);
                return daysUntilExpiry <= 7;
            }
        });
        
        // No alerts if no products are expiring soon
        if (alertProducts.length === 0) {
            alertsContainer.innerHTML = '<p class="no-alerts">No alerts at this time. <i class="fas fa-check-circle"></i></p>';
            return;
        }
        
        // Add alert card for each expiring product
        alertProducts.forEach((product, index) => {
            let daysUntilExpiry = product.days_until_expiry;
            if (daysUntilExpiry === undefined) {
                const currentDate = new Date();
                const expiryDate = new Date(product.expiry_date);
                daysUntilExpiry = getDaysDifference(currentDate, expiryDate);
            }
            
            const alertCard = document.createElement('div');
            
            // Add animation with staggered delay
            alertCard.classList.add('fade-in');
            alertCard.style.animationDelay = (index * 0.15) + 's';
            
            // Determine alert type
            if (product.is_expired || daysUntilExpiry < 0) {
                alertCard.className = 'alert-card alert-expired fade-in';
                alertCard.innerHTML = `
                    <h4><i class="fas fa-exclamation-circle"></i> Expired Product</h4>
                    <p><strong>${product.name}</strong> (Batch: ${product.batch})</p>
                    <p>Expired <span class="alert-days">${Math.abs(daysUntilExpiry)} days ago</span></p>
                    <p>Action: Remove from shelf immediately</p>
                `;
            } else {
                alertCard.className = 'alert-card alert-expiring-soon fade-in';
                alertCard.innerHTML = `
                    <h4><i class="fas fa-exclamation-triangle"></i> Near Expiry</h4>
                    <p><strong>${product.name}</strong> (Batch: ${product.batch})</p>
                    <p>Expires in <span class="alert-days">${daysUntilExpiry} days</span></p>
                    <p>Action: Apply ${daysUntilExpiry <= 3 ? '50%' : '20%'} discount</p>
                `;
            }
            
            alertsContainer.appendChild(alertCard);
        });
    }
    
    // Initialize the page
    fetchAndDisplayInventory();
    
    // Add event listeners to form inputs for animation
    const formInputs = document.querySelectorAll('input, select');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.closest('.form-group').classList.add('active');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.closest('.form-group').classList.remove('active');
            }
        });
    });
});
