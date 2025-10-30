// Shopping Cart Management
// Handles cart operations and persistence

class ShoppingCart {
    constructor() {
        this.items = [];
        this.init();
    }

    init() {
        // Load cart from localStorage
        const savedCart = localStorage.getItem("kasraCart");
        if (savedCart) {
            this.items = JSON.parse(savedCart);
        }
        this.updateCartUI();
    }

    addItem(product) {
        // Check if item already exists
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartUI();
        this.showNotification(`${product.name} added to cart!`, "success");
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartUI();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
            this.updateCartUI();
        }
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartUI();
    }

    getItems() {
        return this.items;
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    saveCart() {
        localStorage.setItem("kasraCart", JSON.stringify(this.items));
    }

    updateCartUI() {
        // Update cart count badge
        const cartCount = document.getElementById("cartCount");
        if (cartCount) {
            const count = this.getItemCount();
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? "flex" : "none";
        }

        // Update cart modal if open
        this.renderCartModal();
    }

    renderCartModal() {
        const cartItems = document.getElementById("cartItems");
        const cartTotal = document.getElementById("cartTotal");

        if (!cartItems) return;

        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
                    <i class="fas fa-shopping-cart" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
            if (cartTotal) cartTotal.textContent = "0 HBAR";
            return;
        }

        cartItems.innerHTML = this.items.map(item => `
            <div style="display: flex; gap: 16px; padding: 16px; border-bottom: 1px solid var(--border);">
                <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1;">
                    <h4 style="font-size: 16px; margin-bottom: 4px;">${item.name}</h4>
                    <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">${item.category}</p>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <button onclick="cart.updateQuantity(\'${item.id}\', ${item.quantity - 1})" style="width: 28px; height: 28px; border-radius: 50%; background: var(--background); border: 1px solid var(--border); cursor: pointer;">
                            <i class="fas fa-minus" style="font-size: 10px;"></i>
                        </button>
                        <span style="font-weight: 600;">${item.quantity}</span>
                        <button onclick="cart.updateQuantity(\'${item.id}\', ${item.quantity + 1})" style="width: 28px; height: 28px; border-radius: 50%; background: var(--background); border: 1px solid var(--border); cursor: pointer;">
                            <i class="fas fa-plus" style="font-size: 10px;"></i>
                        </button>
                    </div>
                </div>
                <div style="text-align: right;">
                    <p style="font-size: 18px; font-weight: 700; color: var(--primary); margin-bottom: 8px;">${item.price * item.quantity} HBAR</p>
                    <button onclick="cart.removeItem(\'${item.id}\')" style="color: var(--text-secondary); cursor: pointer; font-size: 14px;">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `).join("");

        if (cartTotal) {
            cartTotal.textContent = `${this.getTotal()} HBAR`;
        }
    }

    showNotification(message, type = "info") {
        const notification = document.createElement("div");
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = "fadeOut 0.3s ease-out";
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Cart modal functionality
document.addEventListener("DOMContentLoaded", () => {
    const cartBtn = document.getElementById("cartBtn");
    const cartModal = document.getElementById("cartModal");
    const closeCartBtn = document.getElementById("closeCartBtn");

    if (cartBtn && cartModal) {
        cartBtn.addEventListener("click", () => {
            cartModal.style.display = "flex";
            cart.renderCartModal();
        });
    }

    if (closeCartBtn && cartModal) {
        closeCartBtn.addEventListener("click", () => {
            cartModal.style.display = "none";
        });
    }

    if (cartModal) {
        cartModal.addEventListener("click", (e) => {
            if (e.target === cartModal) {
                cartModal.style.display = "none";
            }
        });
    }
});

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
    module.exports = cart;
}
