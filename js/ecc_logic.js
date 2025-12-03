// --- ecc_logic.js ---
// Setup folder: /js/ecc_logic.js

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const generateKeyButton = document.getElementById('generateKeyButton');
    const privateKeyTextarea = document.getElementById('privateKey');
    const publicKeyTextarea = document.getElementById('publicKey');
    const messageInput = document.getElementById('messageInput');
    const signButton = document.getElementById('signButton');
    const signatureOutput = document.getElementById('signatureOutput');
    const verifyButton = document.getElementById('verifyButton');
    const verificationResult = document.getElementById('verificationResult');

    // Variabel Global untuk menyimpan Kunci (agar dapat digunakan oleh fungsi lain)
    let currentKey = null; // Objek RSAKey dari jsrsasign
    const ALGORITHM = 'SHA256withECDSA'; // Algoritma yang digunakan (ECC dengan SHA-256)
    const CURVE = 'secp256r1'; // Kurva ECC standar

    // --- 1. GENERATE KEY PAIR ---
    const generateKeyPair = () => {
        try {
            // Non-aktifkan tombol
            generateKeyButton.disabled = true;
            generateKeyButton.textContent = 'Generating...';

            // Bersihkan hasil sebelumnya
            privateKeyTextarea.value = '';
            publicKeyTextarea.value = '';
            signatureOutput.value = '';
            verificationResult.textContent = '';
            
            // Lakukan generasi kunci (asynchronous, tapi di jsrsasign bisa disimulasikan synchronous)
            // Menggunakan setTimeout untuk simulasi loading
            setTimeout(() => {
                currentKey = KEYUTIL.generateKeypair('EC', CURVE); 
                
                // Ambil nilai Private Key (format PKCS#8) dan Public Key (format SubjectPublicKeyInfo)
                const pkcs8Pem = KEYUTIL.getPEM(currentKey.prvKeyObj, 'PKCS8PRV');
                const spkiPem = KEYUTIL.getPEM(currentKey.pubKeyObj, 'PKCS8PUB');
                
                privateKeyTextarea.value = pkcs8Pem;
                publicKeyTextarea.value = spkiPem;

                // Aktifkan tombol selanjutnya
                signButton.disabled = false;
                verifyButton.disabled = false;

                generateKeyButton.disabled = false;
                generateKeyButton.textContent = 'Generate Key Pair';
            }, 300);

        } catch (e) {
            alert('Gagal Generate Key Pair: ' + e.message);
            generateKeyButton.disabled = false;
            generateKeyButton.textContent = 'Generate Key Pair';
        }
    };

    // --- 2. SIGN MESSAGE ---
    const signMessage = () => {
        if (!currentKey) {
            verificationResult.textContent = 'Harap Generate Key Pair terlebih dahulu.';
            verificationResult.className = 'status-message invalid';
            return;
        }

        try {
            const message = messageInput.value;
            if (!message) {
                 verificationResult.textContent = 'Pesan tidak boleh kosong.';
                 verificationResult.className = 'status-message invalid';
                 return;
            }

            const sig = new KJUR.crypto.Signature({ alg: ALGORITHM });
            sig.init(currentKey.prvKeyObj);
            sig.updateString(message);
            
            // Hasil signature dalam format heksadesimal
            const signature = sig.sign(); 
            signatureOutput.value = signature;

            verificationResult.textContent = 'Pesan berhasil ditandatangani.';
            verificationResult.className = 'status-message valid';

        } catch (e) {
            alert('Gagal Sign Message: ' + e.message);
        }
    };

    // --- 3. VERIFY SIGNATURE ---
    const verifySignature = () => {
        if (!currentKey) {
            verificationResult.textContent = 'Harap Generate Key Pair terlebih dahulu.';
            verificationResult.className = 'status-message invalid';
            return;
        }

        try {
            const message = messageInput.value;
            const signature = signatureOutput.value;
            
            if (!message || !signature) {
                 verificationResult.textContent = 'Pesan dan Signature tidak boleh kosong.';
                 verificationResult.className = 'status-message invalid';
                 return;
            }

            const sig = new KJUR.crypto.Signature({ alg: ALGORITHM });
            sig.init(currentKey.pubKeyObj); // Inisialisasi dengan Public Key
            sig.updateString(message);
            
            const isValid = sig.verify(signature); // Verifikasi

            // Tampilkan hasil
            if (isValid) {
                verificationResult.textContent = 'VERIFIKASI BERHASIL! Tanda Tangan Valid.';
                verificationResult.className = 'status-message valid';
            } else {
                verificationResult.textContent = 'VERIFIKASI GAGAL! Tanda Tangan Tidak Valid (Pesan atau Kunci telah diubah).';
                verificationResult.className = 'status-message invalid';
            }

        } catch (e) {
            alert('Gagal Verify Signature: ' + e.message);
        }
    };

    // --- EVENT LISTENERS ---
    generateKeyButton.addEventListener('click', generateKeyPair);
    signButton.addEventListener('click', signMessage);
    verifyButton.addEventListener('click', verifySignature);
    
    // Reset status saat pesan diubah (perlu sign ulang)
    messageInput.addEventListener('input', () => {
        signatureOutput.value = '';
        verificationResult.textContent = '';
        verificationResult.className = 'status-message';
    });
});