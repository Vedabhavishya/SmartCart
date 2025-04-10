// Main JavaScript functionality for the Smart Grocery Cart application

document.addEventListener('DOMContentLoaded', function() {
    // Initialize product search if we're on the products page
    if (document.getElementById('product-search')) {
        initProductSearch();
    }

    // Initialize navigation active state
    setActiveNavItem();

    // Load cart count if header cart icon exists
    updateCartCountDisplay();
});

// Set active state on navigation links
function setActiveNavItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || 
            (currentPath === '/' && href === '/') || 
            (currentPath !== '/' && href !== '/' && currentPath.includes(href))) {
            link.classList.add('active');
        }
    });
}

// Initialize product search with live suggestions
function initProductSearch() {
    const searchInput = document.getElementById('product-search');
    const suggestionsContainer = document.getElementById('search-suggestions');
    
    // Fetch all products for searching
    fetch('/api/products')
        .then(response => response.json())
        .then(data => {
            const products = data.products;
            
            searchInput.addEventListener('input', function() {
                const query = this.value.toLowerCase();
                suggestionsContainer.innerHTML = '';
                
                if (query.length < 2) {
                    suggestionsContainer.style.display = 'none';
                    return;
                }
                
                const filteredProducts = products.filter(product => 
                    product.name.toLowerCase().includes(query) ||
                    product.category.toLowerCase().includes(query)
                );
                
                if (filteredProducts.length > 0) {
                    suggestionsContainer.style.display = 'block';
                    
                    filteredProducts.slice(0, 5).forEach(product => {
                        const item = document.createElement('div');
                        item.classList.add('suggestion-item');
                        item.innerHTML = `
                            <div class="d-flex justify-content-between align-items-center">
                                <span>${product.name}</span>
                                <span class="badge bg-secondary">₹${product.price.toFixed(2)}</span>
                            </div>
                            <small class="text-muted">${product.category}</small>
                        `;
                        
                        item.addEventListener('click', function() {
                            addToCart(product);
                            searchInput.value = '';
                            suggestionsContainer.style.display = 'none';
                        });
                        
                        suggestionsContainer.appendChild(item);
                    });
                } else {
                    suggestionsContainer.style.display = 'block';
                    suggestionsContainer.innerHTML = '<div class="suggestion-item">No products found</div>';
                }
            });
            
            // Close suggestions when clicking outside
            document.addEventListener('click', function(e) {
                if (e.target !== searchInput && e.target !== suggestionsContainer) {
                    suggestionsContainer.style.display = 'none';
                }
            });
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });
}

// Update cart count in the header
function updateCartCountDisplay() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const cart = getCart();
        const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = itemCount;
        
        // Show or hide based on item count
        if (itemCount > 0) {
            cartCountElement.style.display = 'inline-block';
        } else {
            cartCountElement.style.display = 'none';
        }
    }
}

// Get cart from localStorage
function getCart() {
    try {
        return JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        console.error('Error parsing cart from localStorage:', e);
        return [];
    }
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCountDisplay();
}

// Add product to cart
function addToCart(product, quantity = 1) {
    const cart = getCart();
    
    // Check if product is already in cart
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex >= 0) {
        // Update quantity if product exists
        cart[existingProductIndex].quantity += quantity;
    } else {
        // Add new product to cart
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            barcode: product.barcode,
            quantity: quantity
        });
    }
    
    saveCart(cart);
    
    // Show toast notification
    showToast(`Added ${product.name} to cart`);
}

// Show toast notification
function showToast(message) {
    // Check if toast container exists, create if not
    let toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toastElement = document.createElement('div');
    toastElement.id = toastId;
    toastElement.className = 'toast align-items-center text-white bg-primary border-0';
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');
    
    toastElement.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toastElement);
    
    // Initialize and show the toast
    const toast = new bootstrap.Toast(toastElement, { delay: 2000 });
    toast.show();
    
    // Remove toast after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}
