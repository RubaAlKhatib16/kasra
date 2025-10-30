const express = require('express');
const path = require('path');
const fs = require('fs');
const { initiatePayLater, getTransactionHistory, processHbarPayment, processInstallmentPayment } = require('./api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== Routes ====================

// Homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Shop page
app.get('/shop', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});

// Checkout page
app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'checkout.html'));
});

// Login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Profile page
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// Dashboard page
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Legacy routes for backward compatibility
app.get('/paylater', (req, res) => {
    res.redirect('/checkout');
});

app.get('/profile', (req, res) => {
    res.redirect('/dashboard');
});

// ==================== API Routes ====================

// Get products
app.get('/api/products', (req, res) => {
    // In a real application, this would fetch from a database
    // For now, return sample product data
    const products = [
        {
            id: 'prod-001',
            name: 'Premium Wireless Headphones',
            category: 'electronics',
            price: 250,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
            description: 'High-quality wireless headphones with noise cancellation'
        },
        {
            id: 'prod-002',
            name: 'Smart Watch Pro',
            category: 'electronics',
            price: 400,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
            description: 'Advanced smartwatch with health tracking features'
        },
        // Add more products as needed
    ];
    
    res.json({ success: true, products });
});

// Initiate Pay Later agreement
app.post('/api/paylater/initiate', async (req, res) => {
    try {
        const { buyerAccountId, totalAmountHbar, installments } = req.body;
        
        if (!buyerAccountId || !totalAmountHbar || !installments) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing required fields: buyerAccountId, totalAmountHbar, installments' 
            });
        }

        const agreementId = await initiatePayLater(buyerAccountId, totalAmountHbar, installments);
        
        res.json({ 
            success: true, 
            agreementId,
            message: 'Pay Later agreement initiated successfully'
        });
    } catch (error) {
        console.error('API Error /api/paylater/initiate:', error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Process HBAR payment
app.post('/api/payment/hbar', async (req, res) => {
    try {
        const { buyerAccountId, amountHbar, orderId } = req.body;
        
        if (!buyerAccountId || !amountHbar) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing required fields: buyerAccountId, amountHbar' 
            });
        }

        const transactionId = await processHbarPayment(buyerAccountId, amountHbar);
        
        res.json({ 
            success: true, 
            transactionId,
            message: 'Payment processed successfully'
        });
    } catch (error) {
        console.error('API Error /api/payment/hbar:', error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.post('/api/paylater/payinstallment', async (req, res) => {
    try {
        const { buyerAccountId, agreementId, paymentAmountHbar } = req.body;

        if (!buyerAccountId || !agreementId || !paymentAmountHbar) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: buyerAccountId, agreementId, paymentAmountHbar'
            });
        }

        const transactionId = await processInstallmentPayment(buyerAccountId, agreementId, paymentAmountHbar);

        res.json({
            success: true,
            transactionId,
            message: 'Installment payment processed successfully'
        });
    } catch (error) {
        console.error('API Error /api/paylater/payinstallment:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get transaction history
app.get('/api/transactions/:accountId', async (req, res) => {
    try {
        const { accountId } = req.params;
        const history = await getTransactionHistory(accountId);
        
        res.json({ 
            success: true, 
            history 
        });
    } catch (error) {
        console.error('API Error /api/transactions:', error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get orders for a specific account
app.get('/api/orders/:accountId', async (req, res) => {
    try {
        const { accountId } = req.params;
        
        // Simulated order data
        const orders = [
            {
                id: 'order-001',
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                items: [
                    {
                        name: 'Premium Wireless Headphones',
                        quantity: 1,
                        price: 250
                    }
                ],
                total: 250,
                paymentMethod: 'installment',
                installments: 4,
                installmentsPaid: 1,
                status: 'active',
                nextPaymentDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
                nextPaymentAmount: 62.5
            },
            {
                id: 'order-002',
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                items: [
                    {
                        name: 'Smart Watch Pro',
                        quantity: 1,
                        price: 400
                    }
                ],
                total: 400,
                paymentMethod: 'hbar',
                status: 'completed',
                transactionId: '0.0.123456@1678888888.123456789'
            }
        ];
        
        res.json({ 
            success: true, 
            orders 
        });
    } catch (error) {
        console.error('API Error /api/orders:', error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// ==================== Error Handling ====================

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
    });
});

// ==================== Start Server ====================

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   Kasra BNPL Server                                  ║
║   Powered by Hedera Hashgraph                        ║
║                                                       ║
║   Server running on: http://localhost:${PORT}        ║
║   Environment: ${process.env.NODE_ENV || 'development'}                           ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
});

module.exports = app;

