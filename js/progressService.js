import { renderProgressTable } from './uiService.js';
import { getMetrics } from './metricsService.js';

async function loadChartJs() {
    if (window.Chart) return;
    
    return new Promise(resolve => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => resolve();
        script.onerror = () => resolve();
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
        const chartData = {
            labels: hasData ? metrics.map((_, i) => i + 1) : [''],
            datasets: [
                { label: 'WPM', data: hasData ? metrics.map(m => m.wpm) : [0], borderColor: '#2d7ff9', fill: false },
                { label: 'Accuracy', data: hasData ? metrics.map(m => m.accuracy) : [0], borderColor: '#1a7f37', fill: false }
            ]
        };
        
        if (window.progressChart) {
            Object.assign(window.progressChart.data, chartData);
            window.progressChart.update();
        } else {
            window.progressChart = new window.Chart(canvas, {
                type: 'line',
                data: chartData,
                options: { responsive: true, plugins: { legend: { display: true } } }
            });
        }
    } catch (e) {
        console.warn('Chart error:', e);
    }
}
