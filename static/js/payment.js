// Payment page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize payment page if we're on it
    if (document.getElementById('payment-page')) {
        initPaymentPage();
    }
});

// Initialize the payment page
function initPaymentPage() {
    updatePaymentSummary();
    generateQRCode();
    
    // Set up go back button
    const goBackButton = document.getElementById('go-back-button');
    if (goBackButton) {
        goBackButton.addEventListener('click', function() {
            window.location.href = '/cart';
        });
    }
    
    // Set up complete order button
    const completeOrderButton = document.getElementById('complete-order-button');
    if (completeOrderButton) {
        completeOrderButton.addEventListener('click', function() {
            completeOrder();
        });
    }
}

// Update payment summary
function updatePaymentSummary() {
    const cart = getCart();
    const summaryContainer = document.getElementById('order-summary');
    const totalAmountElement = document.getElementById('total-amount');
    const itemCountElement = document.getElementById('item-count');
    
    // Check if cart is empty
    if (cart.length === 0) {
        window.location.href = '/cart';
        return;
    }
    
    // Update total amount
    if (totalAmountElement) {
        const total = localStorage.getItem('cartTotal') || '0.00';
        totalAmountElement.textContent = `₹${total}`;
    }
    
    // Update item count
    if (itemCountElement) {
        const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
        itemCountElement.textContent = itemCount;
    }
    
    // Render order summary
    if (summaryContainer) {
        summaryContainer.innerHTML = '';
        
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'd-flex justify-content-between mb-2';
            itemElement.innerHTML = `
                <div>
                    <span>${item.name} × ${item.quantity}</span>
                </div>
                <span>₹${(item.price * item.quantity).toFixed(2)}</span>
            `;
            
            summaryContainer.appendChild(itemElement);
        });
    }
}

// Generate QR code for payment
function generateQRCode() {
    const qrContainer = document.getElementById('qr-code');
    if (!qrContainer) return;
    
    // Clear previous QR code
    qrContainer.innerHTML = '';
    
    // Get cart total
    const total = localStorage.getItem('cartTotal') || '0.00';
    
    // Create payment data
    const paymentData = {
        amount: total,
        currency: 'INR',
        reference: 'SGCART' + Date.now().toString(),
        timestamp: new Date().toISOString(),
        items: getCart().map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity
        }))
    };
    
    // Generate QR code with payment data
    const qrCodeString = JSON.stringify(paymentData);
    
    // Generate QR code
    new QRCode(qrContainer, {
        text: qrCodeString,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // Display payment reference
    const paymentReference = document.getElementById('payment-reference');
    if (paymentReference) {
        paymentReference.textContent = paymentData.reference;
    }
}

// Complete the order
function completeOrder() {
    // In a real application, this would verify payment status
    // For this demo, we'll simulate a successful payment
    
    // Show loading state
    const completeOrderButton = document.getElementById('complete-order-button');
    if (completeOrderButton) {
        completeOrderButton.disabled = true;
        completeOrderButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
    }
    
    // Simulate payment processing
    setTimeout(() => {
        // Clear the cart
        localStorage.removeItem('cart');
        localStorage.removeItem('cartTotal');
        
        // Show success message
        const paymentStatus = document.getElementById('payment-status');
        if (paymentStatus) {
            paymentStatus.innerHTML = `
                <div class="alert alert-success" role="alert">
                    <h4 class="alert-heading">Payment Successful!</h4>
                    <p>Your order has been processed successfully. Thank you for shopping with us!</p>
                    <hr>
                    <p class="mb-0">You will be redirected to the home page in a few seconds.</p>
                </div>
            `;
        }
        
        // Hide QR code and buttons
        const qrCodeSection = document.getElementById('qr-code-section');
        if (qrCodeSection) {
            qrCodeSection.style.display = 'none';
        }
        
        const buttonContainer = document.getElementById('payment-buttons');
        if (buttonContainer) {
            buttonContainer.style.display = 'none';
        }
        
        // Redirect to home page after a delay
        setTimeout(() => {
            window.location.href = '/';
        }, 5000);
    }, 2000);
}
