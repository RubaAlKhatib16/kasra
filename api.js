const { Client, PrivateKey, AccountId, TransferTransaction, FileCreateTransaction, FileAppendTransaction, Hbar } = require("@hashgraph/sdk");
const fs = require("fs");
require("dotenv").config();
console.log("OPERATOR_ID from env:", process.env.OPERATOR_ID);

const AGREEMENTS_FILE = "./agreements.json";

// Helper to read agreements from file
function readAgreements() {
    if (fs.existsSync(AGREEMENTS_FILE)) {
        const data = fs.readFileSync(AGREEMENTS_FILE, "utf8");
        return JSON.parse(data);
    }
    return {};
}

// Helper to write agreements to file
function writeAgreements(agreements) {
    fs.writeFileSync(AGREEMENTS_FILE, JSON.stringify(agreements, null, 2), "utf8");
}

// --- Hedera Client Setup ---
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
const merchantId = AccountId.fromString(process.env.MERCHANT_ID || "0.0.3"); // Placeholder for merchant account


// Ensure all required Account IDs are valid before proceeding
if (!process.env.OPERATOR_ID || !process.env.OPERATOR_KEY) {
    console.error("FATAL: OPERATOR_ID and OPERATOR_KEY must be set in .env");
    process.exit(1);
}

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// --- API Functions ---

/**
 * @notice Processes a direct HBAR payment for a purchase.
 * @param {string} buyerAccountId - The Hedera Account ID of the buyer (e.g., "0.0.123456").
 * @param {number} amountHbar - The amount to pay in HBAR.
 * @returns {Promise<string>} The transaction ID.
 */
async function processHbarPayment(buyerAccountId, amountHbar) {
    console.log(`Processing HBAR payment from ${buyerAccountId} for ${amountHbar} HBAR...`);

    const transaction = new TransferTransaction()
        .addHbarTransfer(AccountId.fromString(buyerAccountId), new Hbar(-amountHbar)) // Deduct from buyer
        .addHbarTransfer(merchantId, new Hbar(amountHbar)); // Credit to merchant

    // Note: In a real dApp, the buyer would sign this transaction via their wallet (e.g., HashPack).
    // For this prototype, we are simulating a server-side transfer for simplicity, which requires the buyer\'s key.
    // Since we don\'t have the buyer\'s key, this function is conceptual for now.
    // We will assume the wallet connection handles the signing and submission.

    // For the prototype, we will just return a simulated transaction ID.
    return `0.0.123456@${Date.now()}`;
}

/**
 * @notice Initiates a Buy Now, Pay Later agreement by calling the smart contract.
 * @param {string} buyerAccountId - The Hedera Account ID of the buyer.
 * @param {number} totalAmountHbar - The total purchase amount in HBAR.
 * @param {number} installments - The number of installments.
 * @returns {Promise<string>} The agreement ID.
 */
async function initiatePayLater(buyerAccountId, totalAmountHbar, installments) {
    console.log(`Initiating Pay Later for ${buyerAccountId} for ${totalAmountHbar} HBAR over ${installments} installments...`);

    // Convert HBAR to tinybars (1 HBAR = 100,000,000 tinybars)
    const agreementId = `BNPL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const installmentAmount = totalAmountHbar / installments;
    const agreementDetails = {
        agreementId,
        buyerAccountId,
        totalAmountHbar,
        installments,
        installmentAmount,
        merchantId: merchantId.toString(),
        creationDate: new Date().toISOString(),
        nextDueDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(), // 30 days from now
        status: "Active",
        payments: []
    };

    try {
        // Log agreement initiation on Hedera File Service
        const fileContent = JSON.stringify(agreementDetails);
        let fileId;

        // Check if a file for BNPL logs already exists, otherwise create one
        // For simplicity, we'll create a new file for each agreement for now, or append to a general log file.
        // A more robust solution would manage a single log file or multiple per user/merchant.
        const fileCreateTx = new FileCreateTransaction()
            .setKeys([operatorKey.publicKey])
            .setContents(fileContent)
            .setMaxTransactionFee(new Hbar(2)); // Adjust fee as necessary
        const submitFileCreateTx = await fileCreateTx.execute(client);
        const fileCreateReceipt = await submitFileCreateTx.getReceipt(client);
        fileId = fileCreateReceipt.fileId;

        console.log(`- BNPL Agreement logged to Hedera File Service with File ID: ${fileId.toString()}`);

        // Store the initiated agreement in the backend (agreements.json)
        let agreements = readAgreements();
        if (!agreements[buyerAccountId]) {
            agreements[buyerAccountId] = [];
        }
        agreements[buyerAccountId].push(agreementDetails);
        writeAgreements(agreements);

        console.log(`- Pay Later agreement initiated. Agreement ID: ${agreementId}`);
        return agreementId;

    } catch (error) {
        console.error("Error initiating Pay Later agreement:", error);
        throw new Error("Failed to initiate Pay Later agreement.");
    }
}

/**
 * @notice Fetches transaction history for a given account from the Hedera Mirror Node.
 * @param {string} accountId - The Hedera Account ID (e.g., "0.0.123456").
 * @returns {Promise<Array>} A list of transactions.
 */
async function getTransactionHistory(accountId) {
    // In a real application, we would query the Mirror Node REST API.
    // Example: https://testnet.mirrornode.hedera.com/api/v1/transactions?account.id={accountId}
    console.log(`Fetching transaction history for ${accountId} from backend...`);

    const allAgreements = readAgreements();
    const buyerAgreements = allAgreements[accountId] || [];

    // Format agreements for display, similar to the previous simulated data structure
    const formattedHistory = buyerAgreements.map(agreement => ({
        type: "Pay Later Agreement",
        amount: `${agreement.totalAmountHbar * 0.1} JOD`, // Assuming 1 HBAR = 0.1 JOD
        hbar_equivalent: `${agreement.totalAmountHbar} HBAR`,
        agreement_id: agreement.agreementId,
        date: new Date(agreement.creationDate).toLocaleDateString(),
        status: agreement.status,
        installments: agreement.installments,
        installmentAmount: agreement.installmentAmount,
        nextDueDate: agreement.nextDueDate,
        payments: agreement.payments
    }));

    // Optionally, integrate with Hedera Mirror Node here for actual HBAR transfers
    // For now, we'll just return the backend-managed agreements.

    return formattedHistory;
}

/**
 * @notice Processes an installment payment for a Pay Later agreement.
 * @param {string} buyerAccountId - The Hedera Account ID of the buyer.
 * @param {string} agreementId - The ID of the Pay Later agreement.
 * @param {number} paymentAmountHbar - The amount of the installment payment in HBAR.
 * @returns {Promise<string>} The transaction ID of the HBAR transfer.
 */
async function processInstallmentPayment(buyerAccountId, agreementId, paymentAmountHbar) {
    console.log(`Processing installment payment for agreement ${agreementId} from ${buyerAccountId} for ${paymentAmountHbar} HBAR...`);

    let agreements = readAgreements();
    let buyerAgreements = agreements[buyerAccountId];

    if (!buyerAgreements) {
        throw new Error("No agreements found for this buyer.");
    }

    const agreementIndex = buyerAgreements.findIndex(agg => agg.agreementId === agreementId);

    if (agreementIndex === -1) {
        throw new Error("Agreement not found.");
    }

    const agreement = buyerAgreements[agreementIndex];

    if (agreement.status !== "Active") {
        throw new Error("Agreement is not active.");
    }

    // Simulate HBAR transfer
    const transaction = new TransferTransaction()
        .addHbarTransfer(AccountId.fromString(buyerAccountId), new Hbar(-paymentAmountHbar))
        .addHbarTransfer(merchantId, new Hbar(paymentAmountHbar));

    // In a real scenario, the buyer would sign this. For now, we simulate.
    const txId = `0.0.123456@${Date.now()}`;

    // Update agreement status and payments
    agreement.payments.push({
        transactionId: txId,
        amount: paymentAmountHbar,
        date: new Date().toISOString(),
        status: "Completed"
    });

    // Check if all installments are paid
    const totalPaid = agreement.payments.reduce((sum, p) => sum + p.amount, 0);

    if (agreement.payments.length < agreement.installments) {
        // Calculate next due date (e.g., 30 days from the current payment date)
        agreement.nextDueDate = new Date(new Date().getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString();
    } else {
        agreement.nextDueDate = null; // No more payments due
    }
    if (totalPaid >= agreement.totalAmountHbar) {
        agreement.status = "Completed";
        console.log(`- Agreement ${agreementId} completed.`);
    }

    writeAgreements(agreements);

    // Log payment on Hedera File Service (append to the existing agreement file or a general log)
    // For simplicity, we'll append to a general log file or create a new one for each payment.
    // A more robust solution would manage a single log file or multiple per user/merchant.
    const paymentLogContent = JSON.stringify({
        type: "Installment Payment",
        agreementId,
        buyerAccountId,
        paymentAmountHbar,
        transactionId: txId,
        date: new Date().toISOString()
    });

    // For demonstration, we'll create a new file for each payment. In a real app, you might append to a log file.
    const fileCreateTx = new FileCreateTransaction()
        .setKeys([operatorKey.publicKey])
        .setContents(paymentLogContent)
        .setMaxTransactionFee(new Hbar(2));
    const submitFileCreateTx = await fileCreateTx.execute(client);
    const fileCreateReceipt = await submitFileCreateTx.getReceipt(client);
    const fileId = fileCreateReceipt.fileId;

    console.log(`- Installment payment logged to Hedera File Service with File ID: ${fileId.toString()}`);

    return txId;
}

module.exports = {
    processHbarPayment,
    initiatePayLater,
    processInstallmentPayment,
    getTransactionHistory
};