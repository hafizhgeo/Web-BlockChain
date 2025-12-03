// Updates all elements with class `date` to current time in WIB (UTC+7) every second
(function () {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jumat", 'Sabtu'];
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

    function getWIBDate(now) {
        // Convert local time to UTC, then add 7 hours for WIB
        const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
        const wib = new Date(utc.getTime() + 7 * 60 * 60 * 1000);
        return wib;
    }

    function two(n) { return n < 10 ? '0' + n : '' + n; }

    function formatWIB(d) {
        const dayName = days[d.getDay()];
        const date = d.getDate();
        const monthName = months[d.getMonth()];
        const year = d.getFullYear();
        const hh = two(d.getHours());
        const mm = two(d.getMinutes());
        const ss = two(d.getSeconds());
        return `${dayName}, ${date} ${monthName} ${year} (${hh}:${mm}:${ss} WIB)`;
    }

    function updateAll() {
        const now = new Date();
        const wib = getWIBDate(now);
        const str = formatWIB(wib);
        const els = document.querySelectorAll('.date');
        els.forEach(el => {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return;
            el.textContent = str;
        });
    }

    // Start immediately and update every second
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            updateAll();
            setInterval(updateAll, 1000);
        });
    } else {
        updateAll();
        setInterval(updateAll, 1000);
    }
})();
