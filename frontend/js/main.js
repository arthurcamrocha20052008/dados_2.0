import { uploadExcelFile, fetchDemoData, getDownloadLimpoUrl } from './api.js';
import { renderCharts } from './grafico.js';

document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();

    const uploadSection = document.getElementById('upload-section');
    const uploadContainer = document.getElementById('upload-container');
    const fileInput = document.getElementById('excel-file');
    const btnDemo = document.getElementById('btn-demo');
    const btnNovoArquivo = document.getElementById('btn-novo-arquivo');
    const btnDownloadLimpo = document.getElementById('btn-download-limpo');
    const metricSelector = document.getElementById('metric-selector');
    const searchInput = document.getElementById('search-table');
    const loader = document.getElementById('loader');
    const dashboard = document.getElementById('dashboard');

    let dadosAtuais = null;

    // Evento de clique para abrir o seletor de arquivos
    uploadContainer.addEventListener('click', () => fileInput.click());

    // Efeitos visuais de Drag & Drop
    uploadContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadContainer.classList.add('border-indigo-500', 'bg-slate-700/50');
    });

    uploadContainer.addEventListener('dragleave', () => {
        uploadContainer.classList.remove('border-indigo-500', 'bg-slate-700/50');
    });

    uploadContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadContainer.classList.remove('border-indigo-500', 'bg-slate-700/50');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Botão de Demonstração Instantânea
    btnDemo.addEventListener('click', async () => {
        uploadSection.classList.add('hidden');
        loader.classList.remove('hidden');
        dashboard.classList.add('hidden');

        const result = await fetchDemoData();
        loader.classList.add('hidden');

        if (result.success) {
            populateDashboard(result);
        } else {
            alert('Erro ao carregar demonstração: ' + result.error);
            uploadSection.classList.remove('hidden');
        }
    });

    // Botão para enviar novo arquivo
    btnNovoArquivo.addEventListener('click', () => {
        fileInput.value = '';
        dashboard.classList.add('hidden');
        uploadSection.classList.remove('hidden');
    });

    // Botão para baixar planilha limpa
    btnDownloadLimpo.addEventListener('click', () => {
        window.location.href = getDownloadLimpoUrl();
    });

    // Troca dinâmica da métrica principal nos KPIs
    metricSelector.addEventListener('change', (e) => {
        const metricaEscolhida = e.target.value;
        atualizarCardsMetrica(metricaEscolhida);
    });

    // Filtro de busca na tabela de dados limpos
    searchInput.addEventListener('input', (e) => {
        if (!dadosAtuais) return;
        const termo = e.target.value.toLowerCase().trim();
        const filtradas = !termo
            ? dadosAtuais.preview
            : dadosAtuais.preview.filter(row =>
                row.some(cell => String(cell).toLowerCase().includes(termo))
            );
        renderPreviewTable(dadosAtuais.columns, filtradas);
    });

    async function handleFile(file) {
        uploadSection.classList.add('hidden');
        loader.classList.remove('hidden');
        dashboard.classList.add('hidden');

        const result = await uploadExcelFile(file);

        loader.classList.add('hidden');

        if (result.success) {
            populateDashboard(result);
        } else {
            alert('Erro ao processar arquivo: ' + result.error);
            uploadSection.classList.remove('hidden');
        }
    }

    function formatarNumero(valor) {
        return Number(valor).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function atualizarCardsMetrica(nomeMetrica) {
        if (!dadosAtuais || !dadosAtuais.kpis.metricas_detalhadas) return;
        const detalhe = dadosAtuais.kpis.metricas_detalhadas[nomeMetrica];
        if (!detalhe) return;

        document.getElementById('kpi-sum-label').textContent = `Soma (${nomeMetrica})`;
        document.getElementById('kpi-sum').textContent = formatarNumero(detalhe.soma);

        document.getElementById('kpi-avg-label').textContent = `Média (${nomeMetrica})`;
        document.getElementById('kpi-avg').textContent = formatarNumero(detalhe.media);

        document.getElementById('kpi-max-label').textContent = `Pico Máximo (${nomeMetrica})`;
        document.getElementById('kpi-max').textContent = formatarNumero(detalhe.maximo);
    }

    function renderPreviewTable(columns, rows) {
        const thead = document.getElementById('preview-thead');
        const tbody = document.getElementById('preview-tbody');
        thead.innerHTML = '';
        tbody.innerHTML = '';

        const trHead = document.createElement('tr');
        columns.forEach(col => {
            const th = document.createElement('th');
            th.className = 'px-4 py-3 text-left text-xs font-semibold text-indigo-300 uppercase tracking-wider border-b border-slate-700 bg-slate-800/90 sticky top-0';
            th.textContent = col;
            trHead.appendChild(th);
        });
        thead.appendChild(trHead);

        rows.forEach(row => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-700/40 transition border-b border-slate-800';
            row.forEach(cell => {
                const td = document.createElement('td');
                td.className = 'px-4 py-2.5 text-sm text-slate-300 whitespace-nowrap';
                td.textContent = typeof cell === 'number' ? cell.toLocaleString('pt-BR') : cell;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }

    function populateDashboard(data) {
        dadosAtuais = data;
        dashboard.classList.remove('hidden');

        // Nome do arquivo no topo
        document.getElementById('file-badge').textContent = data.filename || 'planilha.xlsx';

        // 1. Relatório de Limpeza
        const reportBox = document.getElementById('report-box');
        const reportList = document.getElementById('report-list');
        const reportCount = document.getElementById('report-count');
        reportList.innerHTML = '';

        if (data.relatorio && data.relatorio.length > 0) {
            reportBox.classList.remove('hidden');
            reportCount.textContent = `${data.relatorio.length} correções automáticas`;
            data.relatorio.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                reportList.appendChild(li);
            });
        } else {
            reportBox.classList.remove('hidden');
            reportCount.textContent = '100% íntegra';
            const li = document.createElement('li');
            li.textContent = '✨ Nenhum erro estrutural encontrado. Sua planilha já estava limpa!';
            reportList.appendChild(li);
        }

        // 2. Insights Inteligentes
        const insightsBox = document.getElementById('insights-box');
        const insightsList = document.getElementById('insights-list');
        insightsList.innerHTML = '';
        if (data.insights && data.insights.length > 0) {
            insightsBox.classList.remove('hidden');
            data.insights.forEach(texto => {
                const li = document.createElement('li');
                li.innerHTML = texto.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-300">$1</strong>');
                insightsList.appendChild(li);
            });
        } else {
            insightsBox.classList.add('hidden');
        }

        // 3. Preencher KPIs e Seletor de Métricas
        document.getElementById('kpi-rows').textContent = data.kpis.total_linhas.toLocaleString('pt-BR');
        document.getElementById('kpi-cols').textContent = `${data.kpis.total_colunas} colunas`;

        const colsNum = data.kpis.colunas_numericas || [];
        metricSelector.innerHTML = '';
        if (colsNum.length > 0) {
            metricSelector.parentElement.classList.remove('hidden');
            colsNum.forEach(col => {
                const opt = document.createElement('option');
                opt.value = col;
                opt.textContent = col;
                metricSelector.appendChild(opt);
            });
            atualizarCardsMetrica(colsNum[0]);
        } else {
            metricSelector.parentElement.classList.add('hidden');
        }

        // 4. Renderizar Gráficos via Módulo dedicado
        renderCharts(data.charts);

        // 5. Renderizar Tabela de Dados Limpos
        if (data.columns && data.preview) {
            searchInput.value = '';
            renderPreviewTable(data.columns, data.preview);
        }

        lucide.createIcons();
    }
});
