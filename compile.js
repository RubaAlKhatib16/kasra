const solc = require('solc');
const fs = require('fs');
const path = require('path');

const contractPath = path.resolve(__dirname, 'contracts', 'KasraBNPL.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        'KasraBNPL.sol': {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['abi', 'evm.bytecode'],
            },
        },
    },
};

console.log('Compiling contract...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
    console.error('Compilation Errors:');
    output.errors.forEach(err => {
        if (err.type === 'Error') {
            console.error(err.formattedMessage);
        }
    });
    process.exit(1);
}

const contract = output.contracts['KasraBNPL.sol']['KasraBNPL'];
const abi = contract.abi;
const bytecode = contract.evm.bytecode.object;

const buildPath = path.resolve(__dirname, 'artifacts');
if (!fs.existsSync(buildPath)) {
    fs.mkdirSync(buildPath);
}

const outputPath = path.resolve(buildPath, 'KasraBNPL.json');
fs.writeFileSync(outputPath, JSON.stringify({ abi, bytecode }, null, 2));

console.log(`Compilation successful. ABI and Bytecode saved to ${outputPath}`);
