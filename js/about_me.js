// --- about_me.js ---
// Setup folder: /js/about_me.js

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Mencegah form melakukan submit default

            // Anda harus mengirim data ini ke server (Backend) untuk diproses
            // Karena ini simulasi front-end murni, kita akan menampilkan alert
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;

            alert(`Pesan dari ${name} (${email}) berhasil dikirim (simulasi). Data ini siap dikirim ke backend!`);
            
            // Opsional: reset form setelah submit
            // contactForm.reset(); 
        });
    }

    // Tambahkan logika interaktif lain yang hanya berlaku untuk about.html di sini.
});