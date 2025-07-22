// Handles progress table and chart rendering
import { renderProgressTable } from './uiService.js';
import { getMetrics } from './metricsService.js';

let chartLoaded = false;

async function loadChartJs() {
    if (window.Chart || chartLoaded) return;
    
    return new Promise(resolve => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
            chartLoaded = true;
            resolve();
        };
        script.onerror = () => resolve(); // Don't fail if chart can't load
        document.head.appendChild(script);
    });
}

export async function updateProgress() {
    const metrics = getMetrics();
    renderProgressTable(metrics);
    
    const canvas = document.getElementById('progress-chart');
    if (!canvas) return;
    
    try {
        await loadChartJs();
        if (!window.Chart) return;
        
        const hasData = metrics.length > 0;
        const labels = hasData ? metrics.map((_, i) => i + 1) : [''];
        const wpmData = hasData ? metrics.map(m => m.wpm) : [0];
        const accData = hasData ? metrics.map(m => m.accuracy) : [0];
        
        if (window.progressChart) {
            // Update existing chart
            Object.assign(window.progressChart.data, {
                labels,
                datasets: [
                    { ...window.progressChart.data.datasets[0], data: wpmData },
                    { ...window.progressChart.data.datasets[1], data: accData }
                ]
            });
            window.progressChart.update();
        } else {
            // Create new chart
            window.progressChart = new window.Chart(canvas, {
                type: 'line',
                data: {
                    labels,
                    datasets: [
                        { label: 'WPM', data: wpmData, borderColor: '#2d7ff9', fill: false },
                        { label: 'Accuracy', data: accData, borderColor: '#1a7f37', fill: false }
                    ]
                },
                options: { responsive: true, plugins: { legend: { display: true } } }
            });
        }
    } catch (e) {
        console.warn('Chart error:', e);
    }
}
