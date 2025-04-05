document.addEventListener('DOMContentLoaded', function() {
    // Check login status
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        window.location.href = '/login';
        return;
    }

    // Check if there are detected products
    const savedProducts = localStorage.getItem('detectedProducts');
    if (!savedProducts) {
        // No products detected yet, redirect to detection page
        alert('No products detected yet. Please upload an image first.');
        window.location.href = '/detection';
        return;
    }

    // Elements
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    const alertsContainer = document.getElementById('alertsContainer');
    const backToDetectionBtn = document.getElementById('backToDetectionBtn');

    // Load products from localStorage
    const products = JSON.parse(savedProducts);
    
    // Display inventory with status and discount suggestions
    displayInventory(products);
    
    // Display alerts for expiring products
    displayAlerts(products);

    // Back to detection button
    backToDetectionBtn.addEventListener('click', function() {
        window.location.href = '/detection';
    });

    // Function to display inventory with status and discount suggestions
    function displayInventory(products) {
        // Clear existing rows
        inventoryTableBody.innerHTML = '';
        
        // Current date for comparison
        const currentDate = new Date();
        
        // Add product rows with status and discount
        products.forEach(product => {
            const expiryDate = new Date(product.expiry);
            const daysUntilExpiry = getDaysDifference(currentDate, expiryDate);
            
            // Determine status
            let status = '';
            let statusClass = '';
            let discountSuggestion = '';
            
            if (daysUntilExpiry < 0) {
                status = 'Expired';
                statusClass = 'status-expired';
                discountSuggestion = 'Remove from shelf';
            } else if (daysUntilExpiry <= 3) {
                status = 'Near Expiry';
                statusClass = 'status-near-expiry';
                discountSuggestion = '50% off';
            } else if (daysUntilExpiry <= 7) {
                status = 'Near Expiry';
                statusClass = 'status-near-expiry';
                discountSuggestion = '20% off';
            } else {
                status = 'Good';
                statusClass = 'status-good';
                discountSuggestion = 'None';
            }
            
            const row = document.createElement('tr');
            row.className = status.toLowerCase().replace(' ', '-');
            
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.batch}</td>
                <td>${product.expiry}</td>
                <td>${product.quantity}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>${discountSuggestion}</td>
            `;
            
            inventoryTableBody.appendChild(row);
        });
    }

    // Function to display alerts for expiring products
    function displayAlerts(products) {
        // Clear existing alerts
        alertsContainer.innerHTML = '';
        
        // Current date for comparison
        const currentDate = new Date();
        
        // Filter products that are expired or expiring within 7 days
        const alertProducts = products.filter(product => {
            const expiryDate = new Date(product.expiry);
            const daysUntilExpiry = getDaysDifference(currentDate, expiryDate);
            return daysUntilExpiry <= 7;
        });
        
        // No alerts if no products are expiring soon
        if (alertProducts.length === 0) {
            alertsContainer.innerHTML = '<p>No alerts at this time.</p>';
            return;
        }
        
        // Add alert card for each expiring product
        alertProducts.forEach(product => {
            const expiryDate = new Date(product.expiry);
            const daysUntilExpiry = getDaysDifference(currentDate, expiryDate);
            
            const alertCard = document.createElement('div');
            
            // Determine alert type
            if (daysUntilExpiry < 0) {
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
});
