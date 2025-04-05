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
            productStream = await navigator.mediaDevices.getUserMedia({ 
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'environment' // Try to use back camera on mobile
                } 
            });
            
            productWebcam.srcObject = productStream;
            productWebcam.classList.remove('hidden');
            captureProductImageBtn.disabled = false;
            startProductCameraBtn.disabled = true;
            startProductCameraBtn.innerHTML = '<i class="fas fa-video-slash"></i> Camera On';
            
            // Hide the preview if it was shown
            productImagePreview.classList.add('hidden');
        } catch (err) {
            console.error('Error accessing webcam:', err);
            alert('Could not access webcam. Please ensure you have a webcam connected and have given permission to use it.');
        }
    });
    
    captureProductImageBtn.addEventListener('click', function() {
        if (!productStream) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = productWebcam.videoWidth;
        canvas.height = productWebcam.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(productWebcam, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 image
        capturedProductImage = canvas.toDataURL('image/jpeg');
        
        // Set as preview
        productImagePreview.src = capturedProductImage;
        productImagePreview.classList.remove('hidden');
        
        // Stop webcam
        stopProductWebcam();
    });
    
    function stopProductWebcam() {
        if (productStream) {
            productStream.getTracks().forEach(track => track.stop());
            productStream = null;
            productWebcam.classList.add('hidden');
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
                
                alert('Product added successfully!');
            } else {
                alert('Error adding product: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Add product error:', error);
            alert('Failed to add product. Please try again.');
        });
    });

    // Fetch inventory data
    function fetchAndDisplayInventory() {
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
                }
            });
    }
    
    // Back to detection button
    backToDetectionBtn.addEventListener('click', function() {
        window.location.href = '/detection';
    });

    // Function to display inventory with status and discount suggestions
    function displayInventory(products) {
        // Clear existing rows
        inventoryTableBody.innerHTML = '';
        
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
                statusClass = 'status-near-expiry';
                discountSuggestion = daysUntilExpiry <= 3 ? '50% off' : '20% off';
            } else {
                status = 'Good';
                statusClass = 'status-good';
                discountSuggestion = 'None';
            }
            
            const row = document.createElement('tr');
            row.className = status.toLowerCase().replace(' ', '-');
            
            // Format the created_at date if available
            const dateAdded = product.created_at 
                ? formatDate(product.created_at) 
                : formatDate(new Date().toISOString());
            
            // Create image thumbnail cell content
            let imageThumbnail = '';
            if (product.product_image) {
                imageThumbnail = `<img src="${product.product_image}" alt="${product.name}" class="product-image-thumbnail" onclick="showImageModal('${product.product_image}')">`;
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
                <td><span class="status-badge ${statusClass}">${status}</span></td>
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
            alertsContainer.innerHTML = '<p>No alerts at this time.</p>';
            return;
        }
        
        // Add alert card for each expiring product
        alertProducts.forEach(product => {
            let daysUntilExpiry = product.days_until_expiry;
            if (daysUntilExpiry === undefined) {
                const currentDate = new Date();
                const expiryDate = new Date(product.expiry_date);
                daysUntilExpiry = getDaysDifference(currentDate, expiryDate);
            }
            
            const alertCard = document.createElement('div');
            
            // Determine alert type
            if (product.is_expired || daysUntilExpiry < 0) {
                alertCard.className = 'alert-card expired';
                alertCard.innerHTML = `
                    <h4><i class="fas fa-exclamation-circle"></i> Expired Product</h4>
                    <p><strong>${product.name}</strong> (Batch: ${product.batch})</p>
                    <p>Expired <span class="alert-days">${Math.abs(daysUntilExpiry)} days ago</span></p>
                    <p>Action: Remove from shelf immediately</p>
                `;
            } else {
                alertCard.className = 'alert-card near-expiry';
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
});