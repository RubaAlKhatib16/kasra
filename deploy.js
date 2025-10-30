const { Client, PrivateKey, AccountId, FileCreateTransaction, ContractCreateTransaction, Hbar } = require("@hashgraph/sdk");
const fs = require("fs");
require("dotenv").config();

async function deployContract() {
    // 1. Load Operator Credentials
    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);

    // 2. Setup Client
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    // 3. Load Contract Bytecode
    const contractJson = JSON.parse(fs.readFileSync("./artifacts/KasraBNPL.json", "utf8"));
    const bytecode = contractJson.bytecode;

    console.log(`\nDeploying contract to Hedera Testnet...`);

    // 4. Upload the contract bytecode as a file
    console.log(`- Uploading contract bytecode as a file...`);
    const fileCreateTx = new FileCreateTransaction()
        .setKeys([operatorKey])
        .setContents(bytecode)
        .setMaxTransactionFee(new Hbar(2)); // Set max transaction fee to 2 Hbar

    const fileSubmitTx = await fileCreateTx.execute(client);
    const fileRx = await fileSubmitTx.getReceipt(client);
    const fileId = fileRx.fileId;

    console.log(`- Contract bytecode file created with ID: ${fileId.toString()}`);

    // 5. Create the contract from the file ID
    console.log(`- Creating contract from file ID...`);
    const contractCreateTx = new ContractCreateTransaction()
        .setGas(2000000) // Set a high gas limit
        .setBytecodeFileId(fileId)
        .setAdminKey(operatorKey)
        .setInitialBalance(new Hbar(50)); // Initial balance for the contract

    const contractSubmitTx = await contractCreateTx.execute(client);
    const contractRx = await contractSubmitTx.getReceipt(client);
    const contractId = contractRx.contractId;

    console.log(`- Contract deployed successfully!`);
    console.log(`- Contract ID: ${contractId.toString()}`);
    console.log(`- Contract Address: ${contractId.toSolidityAddress()}`);

    // 6. Save Contract ID to .env for later use
    const envPath = "./.env";
    let envContent = fs.readFileSync(envPath, "utf8");
    if (!envContent.includes("BNPL_CONTRACT_ID")) {
        envContent += `\nBNPL_CONTRACT_ID=${contractId.toString()}`;
    } else {
        envContent = envContent.replace(/BNPL_CONTRACT_ID=.*/, `BNPL_CONTRACT_ID=${contractId.toString()}`);
    }
    fs.writeFileSync(envPath, envContent);
    console.log(`- Contract ID saved to .env file.`);

    return contractId;
}

deployContract().catch(error => {
    console.error("Error during contract deployment:", error);
    process.exit(1);
});
