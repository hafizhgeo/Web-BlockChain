// --- blockchain_logic.js ---
// Setup folder: /js/blockchain_logic.js

// Konstanta dan Variabel Global
const DIFFICULTY = 4; // Target Angka Nol Awal (misalnya '0000')
const TARGET_PREFIX = '0'.repeat(DIFFICULTY);
let blockchain = []; // Array untuk menyimpan semua objek block

// DOM Elements
const container = document.getElementById('blockchainContainer');
const newDataInput = document.getElementById('newData');
const mineButton = document.getElementById('mineNewBlock');
const addButton = document.getElementById('addBlock');
const miningStatus = document.getElementById('miningStatus');
const validateButton = document.getElementById('validateChain');
const validationResult = document.getElementById('validationResult');


// --- CLASS BLOCK ---
// Kelas untuk merepresentasikan struktur sebuah block
class Block {
    constructor(index, data, prevHash = '') {
        this.index = index;
        this.timestamp = new Date().getTime();
        this.data = data;
        this.prevHash = prevHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    // Metode untuk menghitung Hash
    calculateHash() {
        const blockString = this.index + this.prevHash + this.timestamp + this.data + this.nonce;
        // Menggunakan library Crypto-JS untuk SHA-256
        return CryptoJS.SHA256(blockString).toString(CryptoJS.enc.Hex);
    }

    // Metode untuk menjalankan Proof-of-Work (Mining)
    mineBlock() {
        while (!this.hash.startsWith(TARGET_PREFIX)) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Block Mined: ${this.hash}`);
    }
}


// --- FUNGSI UTAMA RANTAI BLOK ---

// 1. Membuat Blok Genesis (Blok pertama)
const createGenesisBlock = () => {
    const genesis = new Block(0, "Genesis Block");
    // Karena ini blok pertama, tidak perlu mining, cukup set hash default yang valid
    genesis.hash = '0000000000000000000000000000000000000000000000000000000000000000';
    blockchain.push(genesis);
};

// 2. Mendapatkan Hash Blok Terakhir
const getLatestBlock = () => {
    return blockchain[blockchain.length - 1];
};

// 3. Menambahkan Blok Baru ke Rantai
const addBlock = () => {
    if (!newDataInput.value) {
        miningStatus.textContent = "Data tidak boleh kosong!";
        return;
    }

    // Blok baru dibuat berdasarkan hash blok terakhir
    const latestBlock = getLatestBlock();
    const newBlock = new Block(
        latestBlock.index + 1,
        newDataInput.value,
        latestBlock.hash // Previous Hash adalah Hash dari blok terakhir
    );

    // Mining
    miningStatus.textContent = `Mining Block #${newBlock.index}...`;
    newBlock.mineBlock();
    
    // Blok ditambahkan ke rantai
    blockchain.push(newBlock);
    
    // Tampilan diperbarui
    renderBlockchain();
    
    // Reset control
    newDataInput.value = '';
    addButton.disabled = true;
    mineButton.disabled = false;
    miningStatus.textContent = `Block #${newBlock.index} berhasil ditambahkan!`;
    validationResult.textContent = ''; // Reset validasi
};

// 4. Memvalidasi Integritas Rantai
const isChainValid = () => {
    for (let i = 1; i < blockchain.length; i++) {
        const currentBlock = blockchain[i];
        const previousBlock = blockchain[i - 1];

        // Cek 1: Apakah Hash saat ini valid? (re-calculate hash)
        if (currentBlock.hash !== currentBlock.calculateHash()) {
            return { valid: false, message: `Hash blok #${i} TIDAK VALID!` };
        }

        // Cek 2: Apakah Previous Hash menunjuk ke Hash Blok sebelumnya?
        if (currentBlock.prevHash !== previousBlock.hash) {
            return { valid: false, message: `Koneksi rantai putus di blok #${i}: Previous Hash salah!` };
        }

        // Cek 3: Apakah Hash saat ini memenuhi kriteria difficulty?
        if (!currentBlock.hash.startsWith(TARGET_PREFIX)) {
             return { valid: false, message: `Hash blok #${i} tidak memenuhi kriteria mining!` };
        }
    }
    return { valid: true, message: "Rantai Blok VALID dan aman." };
};


// --- FUNGSI TAMPILAN (RENDER) ---

// Fungsi untuk menampilkan blok ke DOM
const renderBlock = (block) => {
    const blockDiv = document.createElement('div');
    blockDiv.classList.add('block-card');
    blockDiv.classList.add(block.hash.startsWith(TARGET_PREFIX) ? 'valid-block' : 'invalid-block');

    blockDiv.innerHTML = `
        <h3>BLOCK #${block.index}</h3>
        <p><strong>Hash:</strong> <span class="hash-value">${block.hash}</span></p>
        <p><strong>Prev Hash:</strong> <span class="hash-value prev-hash">${block.prevHash}</span></p>
        <p><strong>Nonce:</strong> ${block.nonce}</p>
        <p><strong>Timestamp:</strong> ${new Date(block.timestamp).toLocaleString()}</p>
        <div class="block-data">
            <strong>Data:</strong>
            <textarea class="data-editor" rows="3" data-index="${block.index}">${block.data}</textarea>
        </div>
    `;

    // Tambahkan event listener agar data bisa diubah (untuk simulasi tampering)
    const dataEditor = blockDiv.querySelector('.data-editor');
    dataEditor.addEventListener('input', (e) => {
        const index = parseInt(e.target.dataset.index);
        // Simulasikan perubahan data (tampering)
        blockchain[index].data = e.target.value; 
        
        // Memaksa recalculate hash saat data diubah
        blockchain[index].hash = blockchain[index].calculateHash();
        
        renderBlockchain(index); // Render ulang dari blok yang diubah ke depan
        validationResult.textContent = ''; // Reset validasi
    });

    return blockDiv;
};

// Fungsi untuk merender seluruh rantai
const renderBlockchain = (startIndex = 0) => {
    // Kosongkan container dan masukkan blok yang ada
    if (startIndex === 0) {
        container.innerHTML = '';
    }

    for (let i = startIndex; i < blockchain.length; i++) {
        // Jika startIndex > 0, kita hanya update blok yang terpengaruh
        if (startIndex > 0) {
            const oldBlockElement = container.children[i];
            if (oldBlockElement) {
                container.removeChild(oldBlockElement);
            }
        }
        const blockElement = renderBlock(blockchain[i]);
        container.appendChild(blockElement);
    }
};


// --- INISIALISASI & EVENT LISTENERS ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inisialisasi: Buat blok pertama
    createGenesisBlock();
    renderBlockchain();

    // 2. Event Listener Tombol Mine
    mineButton.addEventListener('click', () => {
        // Logika mining dilakukan di fungsi addBlock, namun kita simpan state di JS
        mineButton.textContent = 'Mining...';
        mineButton.disabled = true;
        addButton.disabled = true;
        
        miningStatus.textContent = "Mencari Nonce yang valid...";

        // Set timeout agar simulasi Mining terasa nyata
        setTimeout(() => {
            addBlock(); // Melakukan mining dan add block
            mineButton.textContent = 'Mine';
            addButton.disabled = false;
        }, 500); // Penundaan 0.5 detik
    });
    
    // 3. Event Listener Tombol Add Block (jika mining sudah dilakukan secara terpisah)
    addButton.addEventListener('click', addBlock);

    // 4. Event Listener Tombol Validasi
    validateButton.addEventListener('click', () => {
        const result = isChainValid();
        validationResult.textContent = result.message;
        
        // Update warna pesan validasi
        validationResult.className = 'status-message';
        validationResult.classList.add(result.valid ? 'valid' : 'invalid');

        // Render ulang untuk memperbarui status warna blok jika ada tampering
        renderBlockchain();
    });

    // Event input data baru
    newDataInput.addEventListener('input', () => {
        mineButton.disabled = false;
        addButton.disabled = true; // Harus mining ulang jika data diubah
    });
});