let chartInst1 = null;
let chartInst2 = null;
let chartInst3 = null;
let chartInst4 = null;

const PALETTE = [
    '#6366f1', '#06b6d4', '#10b981', '#f59e0b',
    '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6'
];

const DARK_SCALES = {
    x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(148, 163, 184, 0.1)' }
    },
    y: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(148, 163, 184, 0.1)' }
    }
};

const DARK_PLUGINS = {
    legend: {
        labels: { color: '#e2e8f0', font: { size: 12 } }
    }
};

export function renderCharts(chartsData) {
    // 1. Gráfico 1 (Barras Verticais - Top Categorias)
    if (chartInst1) chartInst1.destroy();
    const card1 = document.getElementById('card-chart1');
    if (chartsData && chartsData.chart1) {
        card1.classList.remove('hidden');
        document.getElementById('chart1-title').textContent = chartsData.chart1.title;
        const ctx1 = document.getElementById('myChart1').getContext('2d');

        chartInst1 = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: chartsData.chart1.labels,
                datasets: [{
                    label: chartsData.chart1.metric_label || 'Valor',
                    data: chartsData.chart1.values,
                    backgroundColor: '#6366f1',
                    hoverBackgroundColor: '#818cf8',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: DARK_PLUGINS,
                scales: DARK_SCALES
            }
        });
    } else {
        card1.classList.add('hidden');
    }

    // 2. Gráfico 2 (Rosca - Distribuição Percentual)
    if (chartInst2) chartInst2.destroy();
    const card2 = document.getElementById('card-chart2');
    if (chartsData && chartsData.chart2) {
        card2.classList.remove('hidden');
        document.getElementById('chart2-title').textContent = chartsData.chart2.title;
        const ctx2 = document.getElementById('myChart2').getContext('2d');

        chartInst2 = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: chartsData.chart2.labels,
                datasets: [{
                    data: chartsData.chart2.values,
                    backgroundColor: PALETTE,
                    borderColor: '#1e293b',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { color: '#e2e8f0', padding: 14 } }
                }
            }
        });
    } else {
        card2.classList.add('hidden');
    }

    // 3. Gráfico 3 (Evolução Temporal ou Comparativo em Linha)
    if (chartInst3) chartInst3.destroy();
    const card3 = document.getElementById('card-chart3');
    if (chartsData && chartsData.chart3) {
        card3.classList.remove('hidden');
        document.getElementById('chart3-title').textContent = chartsData.chart3.title;
        const ctx3 = document.getElementById('myChart3').getContext('2d');

        const datasets = [{
            label: chartsData.chart3.label1 || 'Série 1',
            data: chartsData.chart3.values1,
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.15)',
            fill: true,
            tension: 0.35,
            pointRadius: 4
        }];

        if (chartsData.chart3.values2) {
            datasets.push({
                label: chartsData.chart3.label2 || 'Série 2',
                data: chartsData.chart3.values2,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.35,
                pointRadius: 4
            });
        }

        chartInst3 = new Chart(ctx3, {
            type: 'line',
            data: {
                labels: chartsData.chart3.labels,
                datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: DARK_PLUGINS,
                scales: DARK_SCALES
            }
        });
    } else {
        card3.classList.add('hidden');
    }

    // 4. Gráfico 4 (Barras Horizontais - Média ou 2ª Métrica)
    if (chartInst4) chartInst4.destroy();
    const card4 = document.getElementById('card-chart4');
    if (chartsData && chartsData.chart4) {
        card4.classList.remove('hidden');
        document.getElementById('chart4-title').textContent = chartsData.chart4.title;
        const ctx4 = document.getElementById('myChart4').getContext('2d');

        chartInst4 = new Chart(ctx4, {
            type: 'bar',
            data: {
                labels: chartsData.chart4.labels,
                datasets: [{
                    label: chartsData.chart4.metric_label || 'Valor',
                    data: chartsData.chart4.values,
                    backgroundColor: '#10b981',
                    hoverBackgroundColor: '#34d399',
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: DARK_PLUGINS,
                scales: DARK_SCALES
            }
        });
    } else {
        card4.classList.add('hidden');
    }
}
