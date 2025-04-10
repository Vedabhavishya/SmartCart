// Cart page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart page if we're on it
    if (document.getElementById('cart-items')) {
        renderCart();
    }
});

// Render cart items
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    
    const cart = getCart();
    
    // Handle empty cart
    if (cart.length === 0) {
        if (cartItemsContainer) cartItemsContainer.innerHTML = '';
        if (totalElement) totalElement.textContent = '₹0.00';
        if (emptyCartMessage) emptyCartMessage.style.display = 'block';
        
        const checkoutButton = document.getElementById('checkout-button');
        if (checkoutButton) checkoutButton.disabled = true;
        
        return;
    }
    
    // Hide empty cart message if there are items
    if (emptyCartMessage) emptyCartMessage.style.display = 'none';
    
    // Enable checkout button
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) checkoutButton.disabled = false;
    
    // Render cart items
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
        
        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'card mb-3';
            itemElement.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="card-title">${item.name}</h5>
                            <p class="card-text text-muted">₹${item.price.toFixed(2)} each</p>
                            <span class="badge bg-primary">${item.category}</span>
                        </div>
                        <div class="d-flex align-items-center">
                            <button class="btn btn-sm btn-outline-secondary decrease-quantity" data-index="${index}">-</button>
                            <span class="mx-2 item-quantity">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary increase-quantity" data-index="${index}">+</button>
                            <span class="mx-4 item-subtotal">₹${(item.price * item.quantity).toFixed(2)}</span>
                            <button class="btn btn-sm btn-danger remove-item" data-index="${index}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            cartItemsContainer.appendChild(itemElement);
        });
        
        // Add event listeners for cart actions
        addCartEventListeners();
    }
    
    // Update total
    updateCartTotal();
}

// Add event listeners for cart buttons
function addCartEventListeners() {
    // Decrease quantity buttons
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            updateItemQuantity(index, -1);
        });
    });
    
    // Increase quantity buttons
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            updateItemQuantity(index, 1);
        });
    });
    
    // Remove item buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeCartItem(index);
        });
    });
    
    // Checkout button
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            window.location.href = '/payment';
        });
    }
    
    // Clear cart button
    const clearCartButton = document.getElementById('clear-cart-button');
    if (clearCartButton) {
        clearCartButton.addEventListener('click', function() {
            clearCart();
        });
    }
}

// Update item quantity
function updateItemQuantity(index, change) {
    const cart = getCart();
    
    if (index >= 0 && index < cart.length) {
        cart[index].quantity += change;
        
        // Remove item if quantity reaches 0
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        
        saveCart(cart);
        renderCart();
    }
}

// Remove item from cart
function removeCartItem(index) {
    const cart = getCart();
    
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        saveCart(cart);
        renderCart();
    }
}

// Clear all items from cart
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        localStorage.removeItem('cart');
        renderCart();
        updateCartCountDisplay();
    }
}

// Update cart total
function updateCartTotal() {
    const cart = getCart();
    const totalElement = document.getElementById('cart-total');
    
    if (totalElement) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalElement.textContent = `₹${total.toFixed(2)}`;
        
        // Store the total for payment page
        localStorage.setItem('cartTotal', total.toFixed(2));
    }
}
