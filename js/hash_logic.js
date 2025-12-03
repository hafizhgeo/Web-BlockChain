// --- hash_logic.js ---
// Setup folder: /js/hash_logic.js

document.addEventListener('DOMContentLoaded', () => {
    // Pastikan DOM sudah dimuat sebelum mencari elemen
    const dataInput = document.getElementById('dataInput');
    const hashOutput = document.getElementById('hashOutput');
    const hashLength = document.getElementById('hashLength');

    // Cek apakah elemen input ada di halaman ini
    if (dataInput && hashOutput) {
        // Fungsi untuk menghitung dan menampilkan hash
        const calculateHash = () => {
            const data = dataInput.value;
            
            // Menggunakan library Crypto-JS untuk menghitung SHA-256
            // Catatan: Library ini diimpor di <head> file hash.html
            let hashResult = '';
            
            if (data.length > 0) {
                const hash = CryptoJS.SHA256(data);
                // Konversi hasil hash ke string format heksadesimal
                hashResult = hash.toString(CryptoJS.enc.Hex);
            } else {
                // Beri nilai default jika input kosong
                hashResult = '0000000000000000000000000000000000000000000000000000000000000000'; 
            }
            
            // Tampilkan hasilnya ke elemen output
            hashOutput.value = hashResult;
            hashLength.textContent = hashResult.length;
        };

        // Tambahkan event listener agar fungsi calculateHash dipanggil
        // setiap kali konten di dataInput berubah
        dataInput.addEventListener('input', calculateHash);

        // Panggil sekali saat halaman dimuat untuk menampilkan hash awal (untuk input kosong)
        calculateHash();
    }
});