// --- consensus_logic.js ---
// Setup folder: /js/consensus_logic.js

// Import Block class dari blockchain_logic.js (SIMULASI, aslinya harus di-import atau disalin)
// *Asumsi: Kita salin class Block dan calculateHash dari modul sebelumnya di sini agar stand-alone*

const CONSENSUS_DIFFICULTY = 3; // Target lebih mudah untuk simulasi konsensus
const CONSENSUS_TARGET_PREFIX = '0'.repeat(CONSENSUS_DIFFICULTY);
const MINING_REWARD = 50; 
let consensusChain = [];
let pendingTransactions = [];
let wallets = {
    'User_A': 100,
    'User_B': 100,
    'User_C': 100
};

// --- SIMULASI CLASS BLOCK & UTILS ---
const calculateHash = (index, prevHash, timestamp, data, nonce) => {
    const blockString = index + prevHash + timestamp + JSON.stringify(data) + nonce;
    return CryptoJS.SHA256(blockString).toString(CryptoJS.enc.Hex);
};

class Block {
    constructor(index, transactions, prevHash = '') {
        this.index = index;
        this.timestamp = new Date().getTime();
        this.transactions = transactions; // Data sekarang adalah array Transaksi
        this.prevHash = prevHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return calculateHash(this.index, this.prevHash, this.timestamp, this.transactions, this.nonce);
    }

    mineBlock() {
        while (!this.hash.startsWith(CONSENSUS_TARGET_PREFIX)) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Consensus Block Mined: ${this.hash}`);
    }
}

// --- FUNGSI UTAMA RANTAI ---
const getLatestConsensusBlock = () => {
    return consensusChain[consensusChain.length - 1];
};

const createConsensusGenesisBlock = () => {
    const genesis = new Block(0, [{ from: null, to: 'Initial_Supply', amount: 300 }], '0');
    // Set hash default yang valid
    genesis.hash = '0000000000000000000000000000000000000000000000000000000000000000'; 
    consensusChain.push(genesis);
};

// --- FUNGSI WALLET DAN TRANSAKSI ---

// Mendapatkan saldo user
const getBalance = (user) => {
    return wallets[user] || 0;
};

// 1. Menambahkan Transaksi Baru
const addTransaction = () => {
    const sender = document.getElementById('senderSelect').value;
    const recipient = document.getElementById('recipientSelect').value;
    const amount = parseInt(document.getElementById('amountInput').value);
    const statusDiv = document.getElementById('transactionStatus');

    if (sender === recipient) {
        statusDiv.textContent = 'Pengirim dan Penerima tidak boleh sama.';
        statusDiv.className = 'status-message invalid';
        return;
    }
    if (amount <= 0 || isNaN(amount)) {
        statusDiv.textContent = 'Jumlah transaksi harus positif.';
        statusDiv.className = 'status-message invalid';
        return;
    }
    if (getBalance(sender) < amount) {
        statusDiv.textContent = `Saldo ${sender} tidak cukup (${getBalance(sender)} koin).`;
        statusDiv.className = 'status-message invalid';
        return;
    }

    const transaction = {
        from: sender,
        to: recipient,
        amount: amount,
        timestamp: new Date().toISOString()
    };
    
    pendingTransactions.push(transaction);
    statusDiv.textContent = `Transaksi dari ${sender} ke ${recipient} sebesar ${amount} koin berhasil ditambahkan ke pool!`;
    statusDiv.className = 'status-message valid';

    // Update tampilan
    renderPendingTransactions();
    document.getElementById('mineAllButton').disabled = false;
};

// 2. Mining Transaksi Pending (Simulasi Konsensus)
const minePendingTransactions = () => {
    if (pendingTransactions.length === 0) {
        document.getElementById('miningResult').textContent = 'Tidak ada transaksi pending untuk di-mine.';
        document.getElementById('miningResult').className = 'status-message invalid';
        return;
    }

    document.getElementById('miningResult').textContent = 'Memulai Mining dan mencapai Konsensus...';
    document.getElementById('mineAllButton').disabled = true;

    setTimeout(() => {
        // Tambahkan reward mining (Proof-of-Work reward)
        const minerAddress = 'User_A'; // Misal, User A yang melakukan mining
        const rewardTx = { from: 'System', to: minerAddress, amount: MINING_REWARD, timestamp: new Date().toISOString() };
        
        // Buat blok baru dengan semua transaksi pending + reward
        const transactionsToMine = [...pendingTransactions, rewardTx];

        const latestBlock = getLatestConsensusBlock();
        const newBlock = new Block(
            latestBlock.index + 1,
            transactionsToMine,
            latestBlock.hash
        );

        // Mining (Konsensus tercapai)
        newBlock.mineBlock();
        consensusChain.push(newBlock);

        // UPDATE SALDO (Proses transaksi)
        processTransactions(transactionsToMine);

        // Reset transaksi pending
        pendingTransactions = [];

        // Update tampilan
        renderConsensusChain();
        renderWallets();
        renderPendingTransactions(); // Untuk mengosongkan list pending

        document.getElementById('miningResult').textContent = `Blok #${newBlock.index} berhasil di-mine! User A mendapat reward ${MINING_REWARD} koin.`;
        document.getElementById('miningResult').className = 'status-message valid';
        document.getElementById('mineAllButton').disabled = false;
    }, 1000);
};

// 3. Proses Transaksi (Update Saldo)
const processTransactions = (transactions) => {
    transactions.forEach(tx => {
        if (tx.from && tx.from !== 'System') {
            wallets[tx.from] -= tx.amount;
        }
        if (tx.to) {
            wallets[tx.to] = (wallets[tx.to] || 0) + tx.amount;
        }
    });
};


// --- FUNGSI TAMPILAN (RENDER) ---

// Render Wallet
const renderWallets = () => {
    const walletContainer = document.getElementById('walletContainer');
    walletContainer.innerHTML = '';

    for (const user in wallets) {
        const walletDiv = document.createElement('div');
        walletDiv.classList.add('wallet-info');
        walletDiv.innerHTML = `
            <span>👤 ${user}:</span>
            <span class="balance-amount">${wallets[user]} Koin</span>
        `;
        walletContainer.appendChild(walletDiv);
    }
};

// Render Transaksi Pending
const renderPendingTransactions = () => {
    const pendingContainer = document.getElementById('pendingContainer');
    pendingContainer.innerHTML = '';
    
    if (pendingTransactions.length === 0) {
        pendingContainer.innerHTML = '<p class="no-pending">Tidak ada transaksi yang tertunda.</p>';
        document.getElementById('mineAllButton').disabled = true;
        return;
    }

    pendingTransactions.forEach(tx => {
        const txDiv = document.createElement('div');
        txDiv.classList.add('transaction-item');
        txDiv.textContent = `Dari: ${tx.from} | Ke: ${tx.to} | Jumlah: ${tx.amount} koin`;
        pendingContainer.appendChild(txDiv);
    });
};

// Render Rantai Blok Konsensus
const renderConsensusChain = () => {
    const chainContainer = document.getElementById('consensusChainContainer');
    chainContainer.innerHTML = '';

    consensusChain.forEach(block => {
        const blockDiv = document.createElement('div');
        blockDiv.classList.add('block-card');
        blockDiv.classList.add('valid-block'); // Blok yang sudah di-mine dianggap valid

        blockDiv.innerHTML = `
            <h3>BLOCK #${block.index} (Konsensus)</h3>
            <p><strong>Hash:</strong> <span class="hash-value">${block.hash}</span></p>
            <p><strong>Prev Hash:</strong> <span class="hash-value prev-hash">${block.prevHash}</span></p>
            <p><strong>Nonce:</strong> ${block.nonce}</p>
            <p><strong>Timestamp:</strong> ${new Date(block.timestamp).toLocaleString()}</p>
            <p><strong>Jumlah Transaksi:</strong> ${block.transactions.length}</p>
            <details>
                <summary>Detail Transaksi</summary>
                <ul class="transaction-list">
                    ${block.transactions.map(tx => 
                        `<li>${tx.from ? tx.from : 'System'} -> ${tx.to}: ${tx.amount} Koin</li>`
                    ).join('')}
                </ul>
            </details>
        `;
        chainContainer.appendChild(blockDiv);
    });
};

// Render Select Options untuk Pengirim/Penerima
const renderSelectOptions = () => {
    const users = Object.keys(wallets);
    const senderSelect = document.getElementById('senderSelect');
    const recipientSelect = document.getElementById('recipientSelect');
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user;
        option.textContent = user;
        senderSelect.appendChild(option.cloneNode(true));
        recipientSelect.appendChild(option);
    });
    
    // Set default agar tidak memilih user yang sama
    recipientSelect.value = 'User_B';
};


// --- INISIALISASI & EVENT LISTENERS ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inisialisasi
    createConsensusGenesisBlock();
    renderSelectOptions();
    renderWallets();
    renderConsensusChain();
    
    // 2. Event Listeners
    document.getElementById('addTransactionButton').addEventListener('click', addTransaction);
    document.getElementById('mineAllButton').addEventListener('click', minePendingTransactions);
});