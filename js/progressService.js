// Handles progress table and chart rendering
import { renderProgressTable } from './uiService.js';
import { getMetrics } from './metricsService.js';

export function updateProgress() {
    const metricsArr = getMetrics();
    renderProgressTable(metricsArr);
    const ctx = document.getElementById('progress-chart')?.getContext('2d');
    function renderChart() {
        if (ctx) {
            const labels = Array.isArray(metricsArr) && metricsArr.length > 0 ? metricsArr.map((_, i) => i + 1) : [''];
            const wpmData = Array.isArray(metricsArr) && metricsArr.length > 0 ? metricsArr.map(m => m.wpm) : [0];
            const accData = Array.isArray(metricsArr) && metricsArr.length > 0 ? metricsArr.map(m => m.accuracy) : [0];
            if (window.progressChart) {
                window.progressChart.data.labels = labels;
                window.progressChart.data.datasets[0].data = wpmData;
                window.progressChart.data.datasets[1].data = accData;
                window.progressChart.update();
            } else {
                window.progressChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            { label: 'WPM', data: wpmData, borderColor: '#2d7ff9', fill: false },
                            { label: 'Accuracy', data: accData, borderColor: '#1a7f37', fill: false }
                        ]
                    },
                    options: { responsive: true, plugins: { legend: { display: true } } }
                });
            }
        }
    }
    if (window.Chart) {
        renderChart();
    } else {
        setTimeout(() => {
            if (window.Chart) renderChart();
        }, 200);
    }
}
