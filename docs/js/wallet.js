// Wallet Connection Management
// Handles Hedera wallet connection and authentication

class WalletManager {
    constructor() {
        this.accountId = null;
        this.isConnected = false;
        this.init();
    }

    init() {
        // Check if wallet is already connected
        const savedAccount = localStorage.getItem("hederaAccountId");
        if (savedAccount) {
            this.accountId = savedAccount;
            this.isConnected = true;
            this.updateUI();
        }

        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Connect wallet buttons
        const connectButtons = document.querySelectorAll("#connectWalletBtn, #connectWalletBtnFooter");
        connectButtons.forEach(btn => {
            if (btn) {
                btn.addEventListener("click", () => this.connect());
            }
        });

        // Logout functionality
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => this.disconnect());
        }
    }

    async connect() {
        try {
            // In a real implementation, this would use HashPack or Blade Wallet
            // For now, we'll simulate the connection
            
            // Simulate wallet selection dialog
            const accountId = await this.simulateWalletConnection();
            
            if (accountId) {
                this.accountId = accountId;
                this.isConnected = true;
                localStorage.setItem("hederaAccountId", accountId);
                this.updateUI();
                this.showNotification("Wallet connected successfully!", "success");
            }
        } catch (error) {
            console.error("Wallet connection error:", error);
            this.showNotification("Failed to connect wallet. Please try again.", "error");
        }
    }

    async simulateWalletConnection() {
        // Simulate wallet connection delay
        return new Promise((resolve) => {
            setTimeout(() => {
                // Generate a simulated Hedera account ID
                const randomId = Math.floor(Math.random() * 1000000);
                resolve(`0.0.${randomId}`);
            }, 1000);
        });
    }

    disconnect() {
        this.accountId = null;
        this.isConnected = false;
        localStorage.removeItem("hederaAccountId");
        this.updateUI();
        this.showNotification("Wallet disconnected", "info");
        
        // Redirect to home if on protected pages
        if (window.location.pathname === "/dashboard") {
            window.location.href = "/";
        }
    }

    updateUI() {
        const walletStatus = document.getElementById("walletStatus");
        const walletAddress = document.getElementById("walletAddress");
        const connectButtons = document.querySelectorAll("#connectWalletBtn, #connectWalletBtnFooter");

        if (this.isConnected && this.accountId) {
            // Show wallet status
            if (walletStatus) {
                walletStatus.style.display = "flex";
            }
            
            if (walletAddress) {
                // Show shortened address
                const shortened = this.accountId.substring(0, 8) + "..." + this.accountId.substring(this.accountId.length - 6);
                walletAddress.textContent = shortened;
            }

            // Update connect buttons to show disconnect
            connectButtons.forEach(btn => {
                if (btn) {
                    btn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Disconnect';
                    btn.onclick = () => this.disconnect();
                }
            });
        } else {
            // Hide wallet status
            if (walletStatus) {
                walletStatus.style.display = "none";
            }

            // Reset connect buttons
            connectButtons.forEach(btn => {
                if (btn) {
                    btn.innerHTML = '<i class="fas fa-wallet"></i> Connect Wallet';
                    btn.onclick = () => this.connect();
                }
            });
        }
    }

    showNotification(message, type = "info") {
        // Create notification element
        const notification = document.createElement("div");
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = "fadeOut 0.3s ease-out";
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    getAccountId() {
        return this.accountId;
    }

    isWalletConnected() {
        return this.isConnected;
    }
}

// Initialize wallet manager
const walletManager = new WalletManager();

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
    module.exports = walletManager;
}
