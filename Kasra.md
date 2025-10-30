# 💳 Kasra - Buy Now, Pay Later Platform on Hedera

**Kasra** is a modern, Sharia-compliant **Buy Now, Pay Later (BNPL)** e-commerce platform that leverages the speed, security, and transparency of the **Hedera Hashgraph** blockchain. Inspired by the design and functionality of leading BNPL providers like Tamara, Kasra aims to promote financial inclusion by offering accessible and flexible installment payment solutions.

## ✨ Features

Kasra is built around a set of core features designed for both merchants and consumers:

### 🌐 Blockchain-Powered Financial Services
*   **Flexible Installments:** Customers can split purchases into 4 or 12 interest-free installments, managed by a smart contract on the Hedera network.
*   **HBAR Payments:** Supports instant "Pay Now" options using HBAR cryptocurrency.
*   **Security & Transparency:** All payment agreements and transactions are recorded on the public Hedera ledger, ensuring an immutable and transparent history.
*   **Sharia Compliance:** Designed to be a Sharia-compliant alternative, focusing on transparency and avoiding late fees.

### 🛍️ E-commerce & User Experience
*   **Modern UI/UX:** Features a clean, Tamara-inspired interface, as shown in the screenshots below.
*   **Wallet-Based Authentication:** Secure login via Hedera-compatible wallets (e.g., HashPack, Blade Wallet).
*   **User Dashboard:** A dedicated dashboard for tracking active installment agreements, payment history, and order status.
*   **Responsive Design:** Optimized for a seamless experience across desktop, tablet, and mobile devices.

| Component | Screenshot |
| :--- | :--- |
| **Homepage** | ![Kasra Homepage Screenshot](F:\kasra hedera\screenshot-homepage.webp) |
| **Shop Page** | ![Kasra Shop Page Screenshot](F:\kasra hedera\screenshot-shop.webp) |

## 🏗️ Architecture and Technology Stack

The Kasra platform is a full-stack application with a clear separation between the frontend, backend, and the Hedera smart contract layer.

### Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript | Responsive user interface and client-side logic. |
| **Backend** | Node.js, Express.js | RESTful API server, serving static assets, and managing server-side interactions. |
| **Blockchain** | Hedera Hashgraph | The underlying distributed ledger for payments and smart contract execution. |
| **Smart Contract**| Solidity (v0.8.24), Hardhat | The `KasraBNPL.sol` contract manages the core BNPL logic. |
| **Hedera SDK** | `@hashgraph/sdk` | Used in the backend (`api.js`) for interacting with the Hedera network and Mirror Node. |

### Project Structure

```
kasra-hedera-dapp/
├── public/                  # Frontend files (HTML, CSS, JS, Assets)
│   ├── css/
│   ├── js/
│   ├── index.html           # Homepage
│   ├── shop.html            # Product listing page
│   └── dashboard.html       # User dashboard
├── contracts/
│   └── KasraBNPL.sol       # Smart contract for BNPL logic
├── artifacts/               # Compiled contract files
├── server.cjs               # Main Express server file
├── api.js                   # Hedera SDK integration logic
├── compile.js               # Script for compiling the smart contract
├── deploy.js                # Script for deploying the smart contract to Hedera
├── package.json             # Project dependencies and scripts
├── hardhat.config.cjs       # Hardhat configuration
└── .env                     # Environment variables (MUST be kept secret)
```

## 🚀 Getting Started (Developer Guide)

This guide will help you set up and run the Kasra platform on your local machine for development and testing.

### Prerequisites

*   **Node.js:** Version 14 or higher.
*   **npm:** Node Package Manager.
*   **Hedera Testnet Account:** Required for deployment and testing of Hedera-specific features. You will need your Account ID and Private Key.

### 1. Installation

1.  **Clone the repository:**
    ```bash
    git clone [YOUR_REPOSITORY_URL] kasra-hedera-dapp
    cd kasra-hedera-dapp
    ```
2.  **Install dependencies:**
    ```bash
    npm install --legacy-peer-deps
    ```

### 2. Configuration

Create a file named `.env` in the root directory and populate it with your Hedera account details. **NEVER commit this file to GitHub.**

```env
# Hedera Network Configuration
OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
OPERATOR_KEY=YOUR_PRIVATE_KEY
MERCHANT_ID=0.0.MERCHANT_ACCOUNT_ID

# Smart Contract (Update after deployment)
BNPL_CONTRACT_ID=0.0.CONTRACT_ID

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Smart Contract Deployment

The core BNPL logic is managed by the `KasraBNPL.sol` smart contract.

1.  **Compile the contract:**
    ```bash
    npx hardhat compile
    ```
2.  **Deploy to Hedera Testnet:**
    The `deploy.js` script uses the Hedera SDK to deploy the compiled contract.
    ```bash
    node deploy.js
    ```
    *Note: This script will output the new `BNPL_CONTRACT_ID`. You must update your `.env` file with this ID before running the server.*

### 4. Running the Application

1.  **Start the development server:**
    ```bash
    node server.cjs
    ```
2.  **Access the application:**
    Open your browser and navigate to `http://localhost:3000`.

## ⚙️ Deployment Guide

For detailed instructions on deploying Kasra to production environments, please refer to the dedicated deployment documentation:

*   **[DEPLOYMENT.md](DEPLOYMENT.md)**: Contains comprehensive steps for deploying to platforms like Heroku, DigitalOcean, and AWS EC2, including PM2 setup and Nginx configuration.

## 🚧 Roadmap

The project is currently a functional prototype with simulated Hedera integration. The following phases outline the path to a production-ready application:

| Phase | Goal | Status |
| :--- | :--- | :--- |
| **Phase 1** | Modern UI/UX and core e-commerce functionality. | ✅ Complete |
| **Phase 2** | Real Hedera wallet integration (HashPack/Blade), Testnet contract deployment, and Mirror Node API integration. | 🚧 In Progress |
| **Phase 3** | Advanced features: Merchant dashboard, credit scoring system, and multi-language support. | 💡 Future |

## 🤝 Contributing

We welcome contributions from the community! To contribute:

1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

## 🙏 Acknowledgments

*   **Hedera Hashgraph:** For providing the fast, secure, and energy-efficient public ledger.
*   **Tamara:** For the design and user experience inspiration.
*   **Hardhat:** For the Ethereum development environment.

## 📞 Support

Need help or have questions? The Kasra team is here for you! Open an issue in this repository or reach out via our social channels — we’re committed to making your BNPL experience seamless, secure, and transparent.


---
**Built with ❤️ using Hedera Hashgraph**
