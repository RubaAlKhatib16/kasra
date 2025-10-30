// Shop Page Functionality
// Handles product display, filtering, and search

// Sample product data
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
    {
        id: 'prod-003',
        name: 'Designer Sunglasses',
        category: 'fashion',
        price: 150,
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop',
        description: 'Stylish designer sunglasses with UV protection'
    },
    {
        id: 'prod-004',
        name: 'Performance Running Shoes',
        category: 'sports',
        price: 180,
        image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=300&fit=crop',
        description: 'Lightweight running shoes for optimal performance'
    },
    {
        id: 'prod-005',
        name: 'Leather Backpack',
        category: 'fashion',
        price: 220,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
        description: 'Premium leather backpack with laptop compartment'
    },
    {
        id: 'prod-006',
        name: 'Bluetooth Speaker',
        category: 'electronics',
        price: 120,
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop',
        description: 'Portable bluetooth speaker with 360° sound'
    },
    {
        id: 'prod-007',
        name: 'Yoga Mat Set',
        category: 'sports',
        price: 80,
        image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=300&fit=crop',
        description: 'Premium yoga mat with carrying bag'
    },
    {
        id: 'prod-008',
        name: 'Skincare Set',
        category: 'beauty',
        price: 95,
        image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop',
        description: 'Complete skincare routine set'
    },
    {
        id: 'prod-009',
        name: 'Coffee Maker',
        category: 'home',
        price: 160,
        image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=300&fit=crop',
        description: 'Automatic coffee maker with timer'
    },
    {
        id: 'prod-010',
        name: 'Desk Lamp',
        category: 'home',
        price: 65,
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop',
        description: 'Modern LED desk lamp with adjustable brightness'
    },
    {
        id: 'prod-011',
        name: 'Fitness Tracker',
        category: 'sports',
        price: 130,
        image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=300&fit=crop',
        description: 'Advanced fitness tracker with heart rate monitor'
    },
    {
        id: 'prod-012',
        name: 'Makeup Palette',
        category: 'beauty',
        price: 75,
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=300&fit=crop',
        description: 'Professional makeup palette with 24 shades'
    }
];

class ShopManager {
    constructor() {
        this.products = products;
        this.filteredProducts = products;
        this.currentCategory = 'all';
        this.currentSort = 'featured';
        this.init();
    }

    init() {
        this.renderProducts();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Category filters
        const categoryButtons = document.querySelectorAll('[data-category]');
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                categoryButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
                this.filterProducts();
            });
        });

        // Sort buttons
        const sortButtons = document.querySelectorAll('[data-sort]');
        sortButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                sortButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentSort = e.target.dataset.sort;
                this.sortProducts();
            });
        });

        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchProducts(e.target.value);
            });
        }
    }

    filterProducts() {
        if (this.currentCategory === 'all') {
            this.filteredProducts = this.products;
        } else {
            this.filteredProducts = this.products.filter(p => p.category === this.currentCategory);
        }
        this.sortProducts();
    }

    sortProducts() {
        switch (this.currentSort) {
            case 'price-low':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                this.filteredProducts.reverse();
                break;
            default:
                // Featured - keep original order
                break;
        }
        this.renderProducts();
    }

    searchProducts(query) {
        const searchTerm = query.toLowerCase().trim();
        if (searchTerm === '') {
            this.filteredProducts = this.currentCategory === 'all' 
                ? this.products 
                : this.products.filter(p => p.category === this.currentCategory);
        } else {
            this.filteredProducts = this.products.filter(p => 
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm) ||
                p.category.toLowerCase().includes(searchTerm)
            );
        }
        this.renderProducts();
    }

    renderProducts() {
        const container = document.getElementById('productsContainer');
        const productCount = document.getElementById('productCount');

        if (!container) return;

        if (this.filteredProducts.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 0; color: var(--text-secondary);">
                    <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                    <p>No products found</p>
                </div>
            `;
            if (productCount) productCount.textContent = '0';
            return;
        }

        container.innerHTML = this.filteredProducts.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">
                        ${product.price} HBAR
                        <div class="product-price-installment">or 4 payments of ${(product.price / 4).toFixed(1)} HBAR</div>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-primary" style="flex: 1;" onclick="shopManager.addToCart('${product.id}')">
                            <i class="fas fa-shopping-cart"></i>
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        if (productCount) {
            productCount.textContent = this.filteredProducts.length;
        }
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product && typeof cart !== 'undefined') {
            cart.addItem(product);
        }
    }
}

// Initialize shop manager
const shopManager = new ShopManager();

