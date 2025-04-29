document.addEventListener('DOMContentLoaded', function() {
    // Load cart items and billing info from localStorage
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const billingInfo = JSON.parse(localStorage.getItem('billingInfo')) || {};
    const cartItemsContainer = document.querySelector('.cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    
    // Check if cart is empty or billing info is missing
    if (cartItems.length === 0 || !billingInfo.fullName) {
        alert('Your cart is empty or billing information is missing. Redirecting to checkout...');
        window.location.href = 'checkout.html';
        return;
    }
    
    let subtotal = 0;
    
    // Display cart items
    cartItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.imageUrl || item.image}" alt="${item.name}">
            <div class="item-details">
                <h3>${item.name}</h3>
                <p>₹${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);
        subtotal += item.price * item.quantity;
    });
    
    // Calculate totals
    const tax = 1; // Fixed tax of 1 rupee
    const shipping = 0; // Free shipping
    const total = subtotal + tax + shipping;
    
    // Update display
    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    taxElement.textContent = `₹${tax.toFixed(2)}`;
    totalElement.textContent = `₹${total.toFixed(2)}`;
    
    // Payment method selection
    const paymentOptions = document.querySelectorAll('.payment-option');
    const paymentForms = {
        card: document.querySelector('.card-form'),
        gpay: document.querySelector('.gpay-form'),
        paytm: document.querySelector('.paytm-form'),
        upi: document.querySelector('.upi-form')
    };
    
    // Initialize payment method selection
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            const method = this.dataset.method;
            
            // Remove active class from all options
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected payment form
            Object.values(paymentForms).forEach(form => form.style.display = 'none');
            if (paymentForms[method]) {
                paymentForms[method].style.display = 'block';
            }
        });
    });
    
    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})/g, '$1 ').trim();
            e.target.value = value;
        });
    }
    
    // Expiry date formatting
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            }
            e.target.value = value;
        });
    }
    
    // CVV formatting
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }

    // Google Pay specific initialization
    const gpayContainer = document.createElement('div');
    gpayContainer.id = 'gpay-qr-container';
    gpayContainer.style.display = 'none';
    gpayContainer.innerHTML = `
        <h3>Scan QR Code with Google Pay</h3>
        <div id="gpay-qr-code"></div>
    `;
    document.querySelector('.gpay-form').appendChild(gpayContainer);

    // Enhanced error handling
    function handlePaymentError(error, method) {
        console.error(`${method} payment error:`, error);
        const errorMessages = {
            gpay: 'Error processing Google Pay. Please try again or use another payment method.',
            card: 'Error processing card payment. Please check your details and try again.',
            paytm: 'Error processing Paytm payment. Please try again.',
            upi: 'Error processing UPI payment. Please try again.'
        };
        alert(errorMessages[method] || 'Payment error occurred. Please try again.');
    }

    // Payment amount validation
    function validatePaymentAmount(amount) {
        if (isNaN(amount) || amount <= 0) {
            throw new Error('Invalid payment amount');
        }
        return true;
    }

    // Billing info validation
    function validateBillingInfo(info) {
        const requiredFields = ['fullName', 'email', 'phone', 'address'];
        const missingFields = requiredFields.filter(field => !info[field]);
        if (missingFields.length > 0) {
            throw new Error(`Missing required billing information: ${missingFields.join(', ')}`);
        }
        return true;
    }

    // Process Google Pay payment
    async function processGooglePayPayment(total, billingInfo) {
        try {
            validatePaymentAmount(total);
            validateBillingInfo(billingInfo);

            const gpayUpiId = 'joshva2003dj@oksbi';
            
            // Generate a unique transaction ID
            const transactionId = 'EITEN' + Date.now();
            
            // Create UPI URL with proper parameters
            const upiUrl = `upi://pay?pa=${gpayUpiId}&pn=${encodeURIComponent(billingInfo.fullName)}&am=${total}&cu=INR&tn=${encodeURIComponent('EITEN Order')}&tr=${transactionId}`;
            
            // Create Google Pay deep link
            const gpayUrl = `https://gpay.app.goo.gl/pay?pa=${gpayUpiId}&pn=${encodeURIComponent(billingInfo.fullName)}&am=${total}&cu=INR&tn=${encodeURIComponent('EITEN Order')}&tr=${transactionId}`;

            // Create order object
            const order = {
                items: JSON.parse(localStorage.getItem('cart')) || [],
                billingInfo: billingInfo,
                paymentMethod: 'gpay',
                total: total,
                date: new Date().toISOString(),
                status: 'pending',
                transactionId: transactionId,
                paymentVerified: false
            };

            // Save order to localStorage
            localStorage.setItem('latestOrder', JSON.stringify(order));

            // Log payment attempt
            console.log('Google Pay payment initiated:', {
                amount: total,
                upiId: gpayUpiId,
                timestamp: new Date().toISOString(),
                transactionId: transactionId
            });

            // Set payment timeout
            const paymentTimeout = setTimeout(() => {
                handlePaymentFailure(new Error('Payment session expired'));
            }, 300000); // 5 minutes timeout

            if (navigator.userAgent.match(/Android/i)) {
                // For Android, try both UPI and Google Pay URLs
                try {
                    window.location.href = upiUrl;
                } catch (e) {
                    window.location.href = gpayUrl;
                }
            } else {
                // For desktop, show QR code with UPI URL
                await generateQRCode(upiUrl);
                
                // Show payment instructions
                const paymentInstructions = document.createElement('div');
                paymentInstructions.className = 'payment-instructions';
                paymentInstructions.innerHTML = `
                    <h3>Payment Instructions</h3>
                    <ol>
                        <li>Open Google Pay or any UPI app on your phone</li>
                        <li>Scan the QR code above</li>
                        <li>Complete the payment in your app</li>
                        <li>You will be automatically redirected after successful payment</li>
                    </ol>
                    <div class="payment-status">
                        <p>Payment Status: <span id="payment-status-text">Pending</span></p>
                        <div class="payment-progress">
                            <div class="progress-bar"></div>
                        </div>
                    </div>
                `;
                document.querySelector('.gpay-form').appendChild(paymentInstructions);

                // Start payment verification
                startPaymentVerification(transactionId, order);
            }

            clearTimeout(paymentTimeout);
        } catch (error) {
            handlePaymentError(error, 'gpay');
            throw error;
        }
    }

    // Function to verify payment status
    async function verifyPaymentStatus(transactionId) {
        try {
            // In a real implementation, this would check with your payment gateway
            // For now, we'll simulate checking with a delay
            return new Promise((resolve) => {
                // Simulate API call delay
                setTimeout(() => {
                    // Check if payment was actually made
                    const order = JSON.parse(localStorage.getItem('latestOrder') || '{}');
                    if (order.transactionId === transactionId) {
                        // Only resolve as true if payment is actually verified
                        const isPaymentComplete = confirm('Have you completed the payment in your UPI app?');
                        if (isPaymentComplete) {
                            order.paymentVerified = true;
                            localStorage.setItem('latestOrder', JSON.stringify(order));
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
                }, 10000); // 10 seconds delay
            });
        } catch (error) {
            console.error('Error verifying payment:', error);
            return false;
        }
    }

    // Function to start payment verification
    function startPaymentVerification(transactionId, order) {
        const maxAttempts = 30; // 5 minutes total (10 seconds * 30)
        let attempts = 0;
        const statusText = document.getElementById('payment-status-text');
        const progressBar = document.querySelector('.progress-bar');

        const checkInterval = setInterval(async () => {
            try {
                attempts++;
                const isVerified = await verifyPaymentStatus(transactionId);
                
                // Update UI
                const progress = (attempts / maxAttempts) * 100;
                progressBar.style.width = `${progress}%`;
                
                if (isVerified) {
                    clearInterval(checkInterval);
                    statusText.textContent = 'Payment Verified';
                    statusText.style.color = '#4CAF50';
                    handlePaymentSuccess(order);
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    statusText.textContent = 'Payment Verification Timeout';
                    statusText.style.color = '#f44336';
                    handlePaymentFailure(new Error('Payment verification timeout'));
                } else {
                    statusText.textContent = `Waiting for Payment (${attempts}/${maxAttempts})`;
                }
            } catch (error) {
                clearInterval(checkInterval);
                handlePaymentFailure(error);
            }
        }, 10000); // Check every 10 seconds
    }

    // QR code generation
    async function generateQRCode(upiUrl) {
        try {
            const qrContainer = document.getElementById('gpay-qr-container');
            qrContainer.style.display = 'block';
            
            // Clear any existing QR code
            const qrCodeElement = document.getElementById('gpay-qr-code');
            qrCodeElement.innerHTML = '';
            
            // Create a canvas element for the QR code
            const canvas = document.createElement('canvas');
            canvas.id = 'gpay-qr-canvas';
            qrCodeElement.appendChild(canvas);
            
            // Generate QR code with higher error correction
            await QRCode.toCanvas(canvas, upiUrl, {
                width: 256,
                height: 256,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                },
                errorCorrectionLevel: 'H' // High error correction for better scanning
            });

            // Add a click handler to the QR code for easy copying
            canvas.addEventListener('click', () => {
                navigator.clipboard.writeText(upiUrl).then(() => {
                    alert('UPI URL copied to clipboard!');
                }).catch(() => {
                    alert('Could not copy UPI URL. Please scan the QR code.');
                });
            });
        } catch (error) {
            console.error('QR code generation error:', error);
            alert('Error generating QR code. Please try another payment method.');
        }
    }

    // Payment button click handler
    const payButton = document.querySelector('.pay-btn');
    if (payButton) {
        payButton.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const selectedMethod = document.querySelector('.payment-option.active')?.dataset.method;
            if (!selectedMethod) {
                alert('Please select a payment method');
                return;
            }
            
            // Disable button and show loading state
            this.disabled = true;
            this.innerHTML = '<span class="spinner"></span> Processing...';
            
            try {
                const total = parseFloat(document.getElementById('total').textContent.replace('₹', ''));
                const billingInfo = JSON.parse(localStorage.getItem('billingInfo')) || {};

                switch(selectedMethod) {
                    case 'gpay':
                        await processGooglePayPayment(total, billingInfo);
                        break;
                    case 'card':
                        // Handle card payment
                        handleCardPayment(total, billingInfo);
                        break;
                    case 'paytm':
                        // Handle Paytm payment
                        handlePaytmPayment(total, billingInfo);
                        break;
                    case 'upi':
                        // Handle UPI payment
                        handleUPIPayment(total, billingInfo);
                        break;
                    default:
                        throw new Error('Invalid payment method selected');
                }
            } catch (error) {
                console.error('Payment processing error:', error);
                alert('Error processing payment. Please try again.');
                // Redirect to payment failed page
                window.location.href = 'payment-success.html?status=failed&error=' + encodeURIComponent(error.message);
            } finally {
                // Re-enable button
                this.disabled = false;
                this.innerHTML = 'Pay Now';
            }
        });
    }

    // Helper function to handle payment success
    function handlePaymentSuccess(order) {
        try {
            // Update order status
            order.status = 'completed';
            order.completedAt = new Date().toISOString();
            order.paymentVerified = true;
            localStorage.setItem('latestOrder', JSON.stringify(order));
            
            // Update inventory stock and sold count
            updateInventoryStock(order.items);
            
            // Update sales history
            updateProductSalesHistory(order);
            
            // Clear cart
            localStorage.removeItem('cart');
            
            // Redirect to success page
            window.location.href = 'payment-success.html?status=success&ORDER_ID=' + order.transactionId;
        } catch (error) {
            console.error('Error in payment success handling:', error);
            handlePaymentFailure(error);
        }
    }

    // Function to update inventory stock
    function updateInventoryStock(items) {
        try {
            // Get current inventory from localStorage
            let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
            
            // Update stock for each item in the order
            items.forEach(item => {
                const inventoryItem = inventory.find(inv => inv.id === item.id);
                if (inventoryItem) {
                    // Reduce stock by the quantity purchased
                    inventoryItem.stock = Math.max(0, inventoryItem.stock - (item.quantity || 1));
                    
                    // Update sold count
                    inventoryItem.sold = (inventoryItem.sold || 0) + (item.quantity || 1);
                    
                    // Update last sold date
                    inventoryItem.lastSold = new Date().toISOString();
                }
            });
            
            // Save updated inventory back to localStorage
            localStorage.setItem('inventory', JSON.stringify(inventory));
            
            // Log inventory update
            console.log('Inventory updated after successful payment:', inventory);
        } catch (error) {
            console.error('Error updating inventory:', error);
            throw error;
        }
    }

    // Function to update product sales history
    function updateProductSalesHistory(order) {
        try {
            // Get current sales history from localStorage
            let salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
            
            // Add new sale record
            const saleRecord = {
                orderId: order.transactionId,
                date: new Date().toISOString(),
                items: order.items.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity || 1,
                    price: item.price
                })),
                totalAmount: order.total,
                paymentMethod: order.paymentMethod
            };
            
            // Add to sales history
            salesHistory.push(saleRecord);
            
            // Save updated sales history
            localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
            
            // Log sales update
            console.log('Sales history updated:', saleRecord);
        } catch (error) {
            console.error('Error updating sales history:', error);
            throw error;
        }
    }

    // Helper function to handle payment failure
    function handlePaymentFailure(error) {
        console.error('Payment failed:', error);
        // Update order status
        const order = JSON.parse(localStorage.getItem('latestOrder') || '{}');
        order.status = 'failed';
        order.error = error.message;
        localStorage.setItem('latestOrder', JSON.stringify(order));

        // Redirect to failure page
        window.location.href = 'payment-success.html?status=failed&error=' + encodeURIComponent(error.message);
    }

    // Add styles for payment instructions
    const style = document.createElement('style');
    style.textContent = `
        .payment-instructions {
            margin-top: 1rem;
            padding: 1rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .payment-instructions h3 {
            margin-bottom: 1rem;
            color: #333;
        }
        
        .payment-instructions ol {
            margin-left: 1.5rem;
            margin-bottom: 1rem;
        }
        
        .payment-instructions li {
            margin-bottom: 0.5rem;
            color: #666;
        }

        .payment-status {
            margin-top: 1rem;
            padding: 1rem;
            background: #f5f5f5;
            border-radius: 4px;
        }

        .payment-progress {
            margin-top: 0.5rem;
            height: 4px;
            background: #e0e0e0;
            border-radius: 2px;
            overflow: hidden;
        }

        .progress-bar {
            height: 100%;
            background: #4CAF50;
            width: 0%;
            transition: width 0.3s ease;
        }
    `;
    document.head.appendChild(style);
});

// Luhn algorithm for card number validation
function validateCardNumber(cardNumber) {
    let sum = 0;
    let isEven = false;
    
    // Remove any non-digit characters
    cardNumber = cardNumber.replace(/\D/g, '');
    
    // Check if the card number is empty or not a number
    if (!cardNumber || isNaN(cardNumber)) {
        return false;
    }
    
    // Check if the card number length is valid
    if (cardNumber.length < 13 || cardNumber.length > 19) {
        return false;
    }
    
    // Luhn algorithm
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i));
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

// Add this function for Paytm checksum generation
function generateChecksum(orderId, amount, customerId) {
    // This is a placeholder for the actual checksum generation
    // In production, you should use Paytm's checksum generation API
    return 'CHECKSUMHASH';
} 