// --- block_logic.js ---
// Setup folder: /js/block_logic.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Ambil semua elemen DOM
    const blockModule = document.getElementById('blockModule');
    const blockNumber = document.getElementById('blockNumber');
    const dataInput = document.getElementById('dataInput');
    const timestampInput = document.getElementById('timestamp');
    const prevHashInput = document.getElementById('prevHash');
    const nonceInput = document.getElementById('nonce');
    const difficultyInput = document.getElementById('difficulty');
    const hashOutput = document.getElementById('hashOutput');
    const mineButton = document.getElementById('mineButton');

    // Tentukan target hash (misal: "0000")
    let targetPrefix = '0000';

    // 2. Fungsi untuk menghasilkan Hash SHA-256
    const calculateHash = (number, data, prevHash, nonce, timestamp) => {
        // Gabungkan semua data menjadi satu string
        const blockString = number + data + prevHash + nonce + timestamp;
        // Hitung SHA-256 menggunakan CryptoJS
        return CryptoJS.SHA256(blockString).toString(CryptoJS.enc.Hex);
    };

    // 3. Fungsi untuk memperbarui tampilan Hash dan status validitas
    const updateHashAndValidity = () => {
        // Ambil nilai terbaru
        const number = blockNumber.value;
        const data = dataInput.value;
        const prevHash = prevHashInput.value;
        const nonce = nonceInput.value;
        const timestamp = timestampInput.value;

        // Hitung hash
        const currentHash = calculateHash(number, data, prevHash, nonce, timestamp);
        hashOutput.value = currentHash;

        // Cek validitas (apakah hash dimulai dengan targetPrefix)
        const isValid = currentHash.startsWith(targetPrefix);

        // Perbarui tampilan status validitas
        if (isValid) {
            blockModule.classList.remove('invalid-block');
            blockModule.classList.add('valid-block');
        } else {
            blockModule.classList.remove('valid-block');
            blockModule.classList.add('invalid-block');
        }
    };

    // 4. Fungsi Mining (Proof-of-Work)
    const mineBlock = () => {
        // Non-aktifkan tombol selama mining
        mineButton.disabled = true;
        mineButton.textContent = 'Mining...';
        
        // Ambil data sebelum mining
        const number = blockNumber.value;
        const data = dataInput.value;
        const prevHash = prevHashInput.value;
        const timestamp = new Date().getTime(); // Ambil timestamp baru
        timestampInput.value = timestamp; // Tampilkan timestamp baru

        let nonce = 0;
        let hash = '';
        
        // Atur Target Prefix berdasarkan difficulty input
        const difficulty = parseInt(difficultyInput.value);
        targetPrefix = '0'.repeat(difficulty);
        
        // Loop untuk mencari nonce yang valid (Proof-of-Work)
        while (true) {
            hash = calculateHash(number, data, prevHash, nonce, timestamp);
            
            if (hash.startsWith(targetPrefix)) {
                // Nonce ditemukan!
                break;
            }
            nonce++;
            
            // Tambahkan batas untuk mencegah loop tak terbatas pada browser yang lambat
            if (nonce > 5000000) { 
                alert('Mining terlalu lama atau Difficulty terlalu tinggi!');
                break;
            }
        }
        
        // Perbarui hasil di DOM setelah mining selesai
        nonceInput.value = nonce;
        updateHashAndValidity();
        
        // Aktifkan kembali tombol
        mineButton.disabled = false;
        mineButton.textContent = 'MINE';
    };

    // 5. Setup Event Listeners
    // Panggil updateHash setiap kali data atau blockNumber diubah (sebelum mining)
    [blockNumber, dataInput, prevHashInput, difficultyInput].forEach(element => {
        element.addEventListener('input', () => {
            nonceInput.value = 0; // Reset nonce jika data diubah
            updateHashAndValidity();
        });
    });

    // Event listener untuk tombol Mine
    mineButton.addEventListener('click', mineBlock);

    // 6. Inisialisasi: Set timestamp awal dan hitung hash pertama
    timestampInput.value = new Date().getTime();
    updateHashAndValidity();
});