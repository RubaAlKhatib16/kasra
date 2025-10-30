// Dashboard Page Functionality
// Handles order display and installment management

class DashboardManager {
    constructor() {
        this.orders = [];
        this.currentTab = 'all';
        this.init();
    }

    async init() {
        // Check if wallet is connected
        if (typeof walletManager === 'undefined' || !walletManager.isWalletConnected()) {
            window.location.href = '/login';
            return;
        }

        await this.loadOrders();
        this.updateStats();
        this.renderOrders();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const tabs = document.querySelectorAll('.tab-content');
                tabs.forEach(t => t.classList.remove('active'));
                
                const tabId = btn.dataset.tab + 'Tab';
                const activeTab = document.getElementById(tabId);
                if (activeTab) {
                    activeTab.classList.add('active');
                }
                
                this.currentTab = btn.dataset.tab;
                this.renderOrders();
            });
        });

        // Payment modal
        const closeModal = document.getElementById('closePaymentModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                document.getElementById('paymentModal').style.display = 'none';
            });
        }
    }

    async loadOrders() {
        try {
            const accountId = walletManager.getAccountId();
            const response = await fetch(`/api/transactions/${accountId}`);
            const data = await response.json();
            
            if (data.success) {
                this.orders = data.history;
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            this.showNotification('Failed to load orders', 'error');
        }
    }

    updateStats() {
        const totalOrders = this.orders.length;
        const activeInstallments = this.orders.filter(o => o.type === 'Pay Later Agreement' && o.status === 'Active').length;
        const totalSpent = this.orders.reduce((sum, o) => sum + (o.hbar_equivalent ? parseFloat(o.hbar_equivalent.replace(' HBAR', '')) : 0), 0);
        
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('activeInstallments').textContent = activeInstallments;
        document.getElementById('totalSpent').textContent = `${totalSpent} HBAR`;
    }

    renderOrders() {
        let filteredOrders = this.orders;
        
        switch (this.currentTab) {
            case 'installments':
                filteredOrders = this.orders.filter(o => o.type === 'Pay Later Agreement' && o.status === 'Active');
                break;
            case 'completed':
                filteredOrders = this.orders.filter(o => o.status === 'Completed');
                break;
        }

        const containerId = this.currentTab === 'all' ? 'allOrdersContainer' : 
                           this.currentTab === 'installments' ? 'installmentsContainer' : 
                           'completedContainer';
        
        const container = document.getElementById(containerId);
        if (!container) return;

        if (filteredOrders.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 0; color: var(--text-secondary);">
                    <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                    <p>No orders found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredOrders.map(order => this.renderOrderCard(order)).join('');
    }

    renderOrderCard(agreement) {
        const statusBadge = this.getStatusBadge(agreement.status);
        const paymentMethodBadge = agreement.type === 'Pay Later Agreement' 
            ? '<span class="badge badge-info">Installments</span>' 
            : '<span class="badge badge-success">HBAR</span>';

        let progressSection = '';
        if (agreement.type === 'Pay Later Agreement' && agreement.status === 'Active') {
            const totalPaid = agreement.payments.reduce((sum, p) => sum + p.amount, 0);
            const progress = (totalPaid / agreement.totalAmountHbar) * 100;
            progressSection = `
                <div class="installment-progress">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-weight: 500;">Payment Progress</span>
                        <span style="color: var(--primary); font-weight: 600;">${agreement.payments.length}/${agreement.installments} paid</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 12px; font-size: 14px;">
                        <span style="color: var(--text-secondary);">Next payment: ${this.formatDate(agreement.nextDueDate)}</span>
                        <span style="font-weight: 600;">${agreement.installmentAmount} HBAR</span>
                    </div>
                    <button class="btn btn-primary" style="width: 100%; margin-top: 12px;" onclick="dashboardManager.showPaymentModal('${agreement.agreement_id}', ${agreement.installmentAmount})">
                        <i class="fas fa-credit-card"></i>
                        Make Payment
                    </button>
                </div>
            `;
        }

        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <div style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">Agreement #${agreement.agreement_id}</div>
                        <div style="color: var(--text-secondary); font-size: 14px;">${this.formatDate(agreement.date)}</div>
                    </div>
                    <div style="text-align: right;">
                        ${statusBadge}
                        ${paymentMethodBadge}
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding-top: 16px; border-top: 1px solid var(--border);">
                    <span style="font-weight: 500;">Total</span>
                    <span style="font-size: 20px; font-weight: 700; color: var(--primary);">${agreement.hbar_equivalent}</span>
                </div>
                
                ${progressSection}
            </div>
        `;
    }

    getStatusBadge(status) {
        const badges = {
            'active': '<span class="badge badge-warning">Active</span>',
            'completed': '<span class="badge badge-success">Completed</span>',
            'pending': '<span class="badge badge-info">Pending</span>'
        };
        return badges[status] || badges['pending'];
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showPaymentModal(orderId, amount) {
        const modal = document.getElementById('paymentModal');
        const amountEl = document.getElementById('paymentAmount');
        
        if (modal && amountEl) {
            amountEl.textContent = `${amount} HBAR`;
            modal.style.display = 'flex';
            
            // Set up confirm button
            const confirmBtn = document.getElementById('confirmPaymentBtn');
            if (confirmBtn) {
                confirmBtn.onclick = () => this.processInstallmentPayment(orderId, amount);
            }
        }
    }

    async processInstallmentPayment(agreementId, amount) {
        const confirmBtn = document.getElementById('confirmPaymentBtn');
        this.setLoadingState(confirmBtn, true);

        try {
            const accountId = walletManager.getAccountId();
            const response = await fetch('/api/paylater/payinstallment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ buyerAccountId: accountId, agreementId: agreementId, paymentAmountHbar: amount })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }
            
            this.showNotification('Payment successful!', 'success');
            document.getElementById('paymentModal').style.display = 'none';
            
            // Reload orders
            await this.loadOrders();
            this.updateStats();
            this.renderOrders();
        } catch (error) {
            console.error('Payment error:', error);
            this.showNotification('Payment failed. Please try again.', 'error');
        } finally {
            this.setLoadingState(confirmBtn, false);
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

// Initialize dashboard manager
const dashboardManager = new DashboardManager();

