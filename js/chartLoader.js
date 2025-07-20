// Chart.js CDN loader for progress chart
(function loadChartJs() {
    if (!window.Chart) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => { if (window.updateProgress) window.updateProgress(); };
        document.head.appendChild(script);
    }
})();
