// Checkout Page Functionality
// Handles payment processing and order completion

class CheckoutManager {
    constructor() {
        this.cart = null;
        this.selectedPaymentMethod = null;
        this.total = 0;
        this.networkFee = 0.1;
        this.init();
    }

    init() {
        // Load cart
        const savedCart = localStorage.getItem('kasraCart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        } else {
            this.cart = [];
        }

        // Redirect if cart is empty
        if (this.cart.length === 0) {
            window.location.href = '/shop';
            return;
        }

        this.calculateTotal();
        this.renderOrderSummary();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Payment option selection
        const paymentOptions = document.querySelectorAll('.payment-option');
        paymentOptions.forEach(option => {
            option.addEventListener('click', () => {
                paymentOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.selectedPaymentMethod = option.dataset.method;
                this.updateInstallmentBreakdown();
                this.enableCheckoutButton();
            });
        });

        // Confirm payment button
        const confirmBtn = document.getElementById('confirmPaymentBtn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.processPayment());
        }
    }

    calculateTotal() {
        this.total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    renderOrderSummary() {
        const orderItems = document.getElementById('orderItems');
        const subtotal = document.getElementById('subtotal');
        const networkFee = document.getElementById('networkFee');
        const total = document.getElementById('total');

        if (orderItems) {
            orderItems.innerHTML = this.cart.map(item => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border);">
                    <div style="display: flex; gap: 12px; flex: 1;">
                        <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                        <div>
                            <div style="font-weight: 500; margin-bottom: 4px;">${item.name}</div>
                            <div style="color: var(--text-secondary); font-size: 14px;">Qty: ${item.quantity}</div>
                        </div>
                    </div>
                    <div style="font-weight: 600;">${item.price * item.quantity} HBAR</div>
                </div>
            `).join('');
        }

        if (subtotal) subtotal.textContent = `${this.total} HBAR`;
        if (networkFee) networkFee.textContent = `${this.networkFee} HBAR`;
        if (total) total.textContent = `${(this.total + this.networkFee).toFixed(2)} HBAR`;
    }

    updateInstallmentBreakdown() {
        if (!this.selectedPaymentMethod) return;

        if (this.selectedPaymentMethod === 'installment-4') {
            const installmentAmount = (this.total / 4).toFixed(2);
            document.getElementById('installment4-1').textContent = `${installmentAmount} HBAR`;
            document.getElementById('installment4-2').textContent = `${installmentAmount} HBAR`;
            document.getElementById('installment4-3').textContent = `${installmentAmount} HBAR`;
            document.getElementById('installment4-4').textContent = `${installmentAmount} HBAR`;
        } else if (this.selectedPaymentMethod === 'installment-12') {
            const installmentAmount = (this.total / 12).toFixed(2);
            document.getElementById('installment12-monthly').textContent = `${installmentAmount} HBAR`;
        }
    }

    enableCheckoutButton() {
        const confirmBtn = document.getElementById('confirmPaymentBtn');
        if (confirmBtn && this.selectedPaymentMethod) {
            confirmBtn.disabled = false;
        }
    }

    async processPayment() {
        // Check if wallet is connected
        if (typeof walletManager === 'undefined' || !walletManager.isWalletConnected()) {
            this.showNotification('Please connect your wallet first', 'error');
            return;
        }

        const confirmBtn = document.getElementById('confirmPaymentBtn');
        this.setLoadingState(confirmBtn, true);

        try {
            const accountId = walletManager.getAccountId();
            let response;

            if (this.selectedPaymentMethod === 'hbar') {
                // Process immediate HBAR payment
                response = await this.processHbarPayment(accountId);
            } else {
                // Process Pay Later agreement
                const installments = this.selectedPaymentMethod === 'installment-4' ? 4 : 12;
                response = await this.processPayLater(accountId, installments);
            }

            if (response.success) {
                // Clear cart
                localStorage.removeItem('kasraCart');
                
                // Show success modal
                this.showSuccessModal();
            } else {
                throw new Error(response.error || 'Payment failed');
            }
        } catch (error) {
            console.error('Payment error:', error);
            this.showNotification(error.message || 'Payment failed. Please try again.', 'error');
        } finally {
            this.setLoadingState(confirmBtn, false);
        }
    }

    async processHbarPayment(accountId) {
        try {
            const response = await fetch('/api/payment/hbar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    buyerAccountId: accountId,
                    amountHbar: this.total + this.networkFee,
                })
            });

            return await response.json();
        } catch (error) {
            console.error('HBAR payment error:', error);
            return { success: false, error: error.message };
        }
    }

    async processPayLater(accountId, installments) {
        try {
            const response = await fetch('/api/paylater/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    buyerAccountId: accountId,
                    totalAmountHbar: this.total,
                    installments: installments
                })
            });

            return await response.json();
        } catch (error) {
            console.error('Pay Later error:', error);
            return { success: false, error: error.message };
        }
    }

    showSuccessModal() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    setLoadingState(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = '<span class="loading"></span> Processing...';
        } else {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText || button.innerHTML;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Initialize checkout manager
document.addEventListener('DOMContentLoaded', () => {
    const checkoutManager = new CheckoutManager();
});

