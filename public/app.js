// Sample products
const products = [
    { id: 1, name: 'Wireless Headphones', price: 99.99, emoji: '🎧' },
    { id: 2, name: 'Smart Watch', price: 249.99, emoji: '⌚' },
    { id: 3, name: 'Laptop Stand', price: 49.99, emoji: '💻' },
    { id: 4, name: 'USB-C Cable', price: 19.99, emoji: '🔌' },
    { id: 5, name: 'Wireless Mouse', price: 39.99, emoji: '🖱️' },
    { id: 6, name: 'Mechanical Keyboard', price: 129.99, emoji: '⌨️' }
];

let cart = [];
let googlePayClient = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartDisplay();
    initializeGooglePay();
});

// Render products
function renderProducts() {
    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">${product.emoji}</div>
            <div class="product-title">${product.name}</div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                Add to Cart
            </button>
        </div>
    `).join('');
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartDisplay();
}

// Remove product from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartDisplay();
        }
    }
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('checkout-btn');
    const emailSection = document.getElementById('email-section');

    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);

    // Render cart items
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        checkoutBtn.disabled = true;
        emailSection.style.display = 'none';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `).join('');
        checkoutBtn.disabled = false;
        emailSection.style.display = 'block';
    }

    // Update Google Pay button
    if (cart.length > 0 && googlePayClient) {
        updateGooglePayButton();
    }
}

// Initialize Google Pay
async function initializeGooglePay() {
    try {
        googlePayClient = new google.payments.api.PaymentsClient({
            environment: 'TEST' // Change to 'PRODUCTION' for live payments
        });

        const isReadyToPay = await googlePayClient.isReadyToPay({
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [{
                type: 'CARD',
                parameters: {
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                    allowedCardNetworks: ['MASTERCARD', 'VISA']
                },
                tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: {
                        gateway: 'example',
                        gatewayMerchantId: 'exampleGatewayMerchantId'
                    }
                }
            }]
        });

        if (isReadyToPay.result) {
            updateGooglePayButton();
        }
    } catch (error) {
        console.error('Error initializing Google Pay:', error);
    }
}

// Update Google Pay button
function updateGooglePayButton() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const button = googlePayClient.createButton({
        onClick: onGooglePayButtonClicked,
        buttonColor: 'default',
        buttonType: 'pay',
        buttonSizeMode: 'fill'
    });

    const buttonContainer = document.getElementById('google-pay-button');
    buttonContainer.innerHTML = '';
    buttonContainer.appendChild(button);
}

// Handle Google Pay button click
async function onGooglePayButtonClicked() {
    const email = document.getElementById('customer-email').value;

    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        merchantInfo: {
            merchantId: 'BCR2DN6TZ5X2XJ2L',
            merchantName: 'Ecommerce Store'
        },
        transactionInfo: {
            totalPriceStatus: 'FINAL',
            totalPrice: total.toFixed(2),
            currencyCode: 'USD',
            countryCode: 'US'
        },
        allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: ['MASTERCARD', 'VISA']
            },
            tokenizationSpecification: {
                type: 'PAYMENT_GATEWAY',
                parameters: {
                    gateway: 'example',
                    gatewayMerchantId: 'exampleGatewayMerchantId'
                }
            }
        }]
    };

    try {
        const paymentData = await googlePayClient.loadPaymentData(paymentDataRequest);
        
        // Store email in database
        await storeEmail(email);
        
        // Process payment (in a real app, you'd send paymentData to your backend)
        console.log('Payment data:', paymentData);
        
        alert('Payment successful! Thank you for your purchase.');
        
        // Clear cart
        cart = [];
        updateCartDisplay();
        document.getElementById('customer-email').value = '';
    } catch (error) {
        console.error('Payment error:', error);
        if (error.statusCode !== 'CANCELED') {
            alert('Payment failed. Please try again.');
        }
    }
}

// Store email in database
async function storeEmail(email) {
    try {
        const response = await fetch('/api/store-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        
        if (data.success) {
            console.log('Email stored successfully:', email);
        } else {
            console.warn('Email storage warning:', data.message);
        }
    } catch (error) {
        console.error('Error storing email:', error);
    }
}

// Regular checkout button (fallback)
document.getElementById('checkout-btn').addEventListener('click', async () => {
    const email = document.getElementById('customer-email').value;

    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }

    // Store email
    await storeEmail(email);

    // Simulate payment processing
    alert('Order placed successfully! Thank you for your purchase.');
    
    // Clear cart
    cart = [];
    updateCartDisplay();
    document.getElementById('customer-email').value = '';
});