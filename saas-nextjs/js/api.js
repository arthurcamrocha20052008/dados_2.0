// Opera 100% em HTTPS na Vercel (app.dashboardmagico) sem números de porta ou localhost fixo
const BASE_URL = `${window.location.origin}/api`;

let _ULTIMO_DADOS_LIMPOS = null;
let _ULTIMO_NOME_ARQUIVO = "planilha_limpa.xlsx";

const EXCEL_ERRORS = new Set([
    "#DIV/0!", "#VALOR!", "#VALUE!", "#REF!", "#N/D", "#N/A",
    "#NAME?", "#NOME?", "#NUM!", "#NULL!", "#NULO!", "#ERRO!",
    "N/A", "NULL", "NONE", "NAN", "-"
]);

function processarPlanilhaNoBrowser(rowsBrutas, filename) {
    const relatorio = [];
    if (!rowsBrutas || rowsBrutas.length === 0) {
        return { success: false, error: "A planilha enviada está vazia." };
    }

    // 1. Remover linhas totalmente vazias
    const qtdAntes = rowsBrutas.length;
    let rows = rowsBrutas.filter(r =>
        Object.values(r).some(v => v !== null && v !== undefined && String(v).trim() !== "")
    );
    if (rows.length < qtdAntes) {
        relatorio.append
            ? relatorio.push(`🧹 Removidas ${qtdAntes - rows.length} linhas totalmente em branco.`)
            : relatorio.push(`🧹 Removidas ${qtdAntes - rows.length} linhas totalmente em branco.`);
    }

    // 2. Identificar colunas que não estão 100% vazias
    const todasColunas = Object.keys(rows[0] || {});
    const colunasValidas = todasColunas.filter(col =>
        rows.some(r => r[col] !== null && r[col] !== undefined && String(r[col]).trim() !== "")
    );
    if (colunasValidas.length < todasColunas.length) {
        relatorio.push(`🧹 Removidas ${todasColunas.length - colunasValidas.length} colunas totalmente vazias.`);
    }

    // 3. Remover duplicatas e limpar espaços / erros de fórmula (#DIV/0!, #VALOR!)
    const vistos = new Set();
    const rowsSemDuplicatas = [];
    let duplicadas = 0;
    let errosFormula = 0;

    for (const r of rows) {
        const novo = {};
        for (const col of colunasValidas) {
            let val = r[col];
            if (typeof val === "string") {
                val = val.trim();
                if (EXCEL_ERRORS.has(val.toUpperCase())) {
                    val = null;
                    errosFormula++;
                }
            }
            novo[col] = val;
        }
        const assinatura = JSON.stringify(novo);
        if (vistos.has(assinatura)) {
            duplicadas++;
        } else {
            vistos.add(assinatura);
            rowsSemDuplicatas.push(novo);
        }
    }
    rows = rowsSemDuplicatas;

    if (errosFormula > 0) {
        relatorio.push(`🛠️ Corrigidos ${errosFormula} erros de fórmula/célula inválida (ex: #DIV/0!, #VALOR!).`);
    }
    if (duplicadas > 0) {
        relatorio.push(`🧹 Removidas ${duplicadas} linhas duplicadas.`);
    }

    // 4. Detectar tipos de coluna e converter números formatados como texto ("R$ 1.500,00")
    const numericCols = [];
    const categoricalCols = [];

    for (const col of colunasValidas) {
        let numValidos = 0;
        let totalNaoNulos = 0;
        const valoresConvertidos = [];

        for (const r of rows) {
            const v = r[col];
            if (v === null || v === undefined || v === "") {
                valoresConvertidos.push(null);
                continue;
            }
            totalNaoNulos++;
            if (typeof v === "number" && !Number.isNaN(v)) {
                numValidos++;
                valoresConvertidos.push(v);
                continue;
            }
            let s = String(v).replace(/[R$€£%\s]/g, "");
            if (s.includes(",") && s.includes(".")) {
                if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
                    s = s.replace(/\./g, "").replace(",", ".");
                } else {
                    s = s.replace(/,/g, "");
                }
            } else if (s.includes(",")) {
                s = s.replace(",", ".");
            }
            const parsed = Number(s);
            if (!Number.isNaN(parsed) && s !== "") {
                numValidos++;
                valoresConvertidos.push(parsed);
            } else {
                valoresConvertidos.push(null);
            }
        }

        if (totalNaoNulos > 0 && numValidos / totalNaoNulos >= 0.6) {
            numericCols.push(col);
            let nulosPreenchidos = 0;
            rows.forEach((r, idx) => {
                if (valoresConvertidos[idx] === null) {
                    r[col] = 0;
                    nulosPreenchidos++;
                } else {
                    r[col] = Number(valoresConvertidos[idx].toFixed(2));
                }
            });
            relatorio.push(`🔢 Coluna '${col}' padronizada como número decimal.`);
            if (nulosPreenchidos > 0) {
                relatorio.push(`⚠️ Preenchidos ${nulosPreenchidos} valores vazios com '0' em '${col}'.`);
            }
        } else {
            categoricalCols.push(col);
            let nulosTexto = 0;
            rows.forEach(r => {
                if (r[col] === null || r[col] === undefined || r[col] === "") {
                    r[col] = "Não Informado";
                    nulosTexto++;
                }
            });
            if (nulosTexto > 0) {
                relatorio.push(`⚠️ Preenchidos ${nulosTexto} valores vazios com 'Não Informado' em '${col}'.`);
            }
        }
    }

    // 5. Calcular KPIs
    const metricasDetalhadas = {};
    for (const numCol of numericCols) {
        const vals = rows.map(r => Number(r[numCol]) || 0);
        const soma = vals.reduce((a, b) => a + b, 0);
        const media = vals.length ? soma / vals.length : 0;
        const maximo = vals.length ? Math.max(...vals) : 0;
        const minimo = vals.length ? Math.min(...vals) : 0;
        metricasDetalhadas[numCol] = { soma, media, maximo, minimo };
    }

    const kpis = {
        total_linhas: rows.length,
        total_colunas: colunasValidas.length,
        colunas_numericas: numericCols,
        colunas_categoricas: categoricalCols,
        metricas_detalhadas: metricasDetalhadas,
    };

    if (numericCols.length > 0) {
        const principal = numericCols[0];
        kpis.nome_metrica = principal;
        kpis.soma_principal = metricasDetalhadas[principal].soma;
        kpis.media_principal = metricasDetalhadas[principal].media;
        kpis.max_principal = metricasDetalhadas[principal].maximo;
    }

    // 6. Gerar Gráficos e Insights
    const charts = {};
    const insights = [];

    if (categoricalCols.length > 0 && numericCols.length > 0) {
        const cat0 = categoricalCols[0];
        const num0 = numericCols[0];
        const mapa = {};
        rows.forEach(r => {
            const k = String(r[cat0]);
            mapa[k] = (mapa[k] || 0) + (Number(r[num0]) || 0);
        });
        const ordenado = Object.entries(mapa).sort((a, b) => b[1] - a[1]).slice(0, 10);
        charts.chart1 = {
            type: "bar",
            title: `Top ${ordenado.length} ${cat0} por Soma de ${num0}`,
            metric_label: `Soma de ${num0}`,
            labels: ordenado.map(i => i[0]),
            values: ordenado.map(i => Number(i[1].toFixed(2))),
        };

        const somaTotal = metricasDetalhadas[num0].soma;
        if (ordenado.length > 0 && somaTotal > 0) {
            const pct = ((ordenado[0][1] / somaTotal) * 100).toFixed(1);
            insights.push(`🏆 **Líder em ${cat0}**: '${ordenado[0][0]}' concentra **${pct}%** do total de ${num0}.`);
        }
    }

    if (numericCols.length > 0) {
        const num0 = numericCols[0];
        insights.push(
            `📊 **Amplitude de ${num0}**: Varia entre o mínimo de **${metricasDetalhadas[num0].minimo.toLocaleString("pt-BR")}** e o pico máximo de **${metricasDetalhadas[num0].maximo.toLocaleString("pt-BR")}**.`
        );
    }

    if (categoricalCols.length > 1 && numericCols.length > 0) {
        const cat1 = categoricalCols[1];
        const num0 = numericCols[0];
        const mapa2 = {};
        rows.forEach(r => {
            const k = String(r[cat1]);
            mapa2[k] = (mapa2[k] || 0) + (Number(r[num0]) || 0);
        });
        const ord2 = Object.entries(mapa2).sort((a, b) => b[1] - a[1]).slice(0, 7);
        charts.chart2 = {
            type: "doughnut",
            title: `Participação por ${cat1} (${num0})`,
            labels: ord2.map(i => i[0]),
            values: ord2.map(i => Number(i[1].toFixed(2))),
        };
    }

    if (numericCols.length > 0) {
        const num0 = numericCols[0];
        const num1 = numericCols[1] || null;
        const amostra = rows.slice(0, 15);
        charts.chart3 = {
            type: "line",
            title: num1 ? `Comparativo: ${num0} vs ${num1}` : `Evolução de ${num0}`,
            label1: num0,
            label2: num1 || undefined,
            labels: amostra.map((r, i) => String(r[categoricalCols[0]] || `Reg #${i + 1}`)),
            values1: amostra.map(r => Number(r[num0]) || 0),
            values2: num1 ? amostra.map(r => Number(r[num1]) || 0) : undefined,
        };
    }

    if (categoricalCols.length > 0 && numericCols.length > 0) {
        const cat0 = categoricalCols[0];
        const numAlvo = numericCols[1] || numericCols[0];
        const mapa4 = {};
        rows.forEach(r => {
            const k = String(r[cat0]);
            mapa4[k] = (mapa4[k] || 0) + (Number(r[numAlvo]) || 0);
        });
        const ord4 = Object.entries(mapa4).sort((a, b) => b[1] - a[1]).slice(0, 10);
        charts.chart4 = {
            type: "bar_horizontal",
            title: `Consolidado de ${numAlvo} por ${cat0}`,
            metric_label: numAlvo,
            labels: ord4.map(i => i[0]),
            values: ord4.map(i => Number(i[1].toFixed(2))),
        };
    }

    _ULTIMO_DADOS_LIMPOS = rows;
    _ULTIMO_NOME_ARQUIVO = filename.replace(/\.[^.]+$/, "") + "_limpo.xlsx";

    return {
        success: true,
        filename,
        relatorio,
        insights,
        kpis,
        charts,
        columns: colunasValidas,
        preview: rows.slice(0, 50).map(r => colunasValidas.map(c => r[c])),
    };
}

export async function uploadExcelFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch(`${BASE_URL}/upload`, {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            return await response.json();
        }
    } catch {
        // Fallback automático no navegador (Vercel Edge / SheetJS)
    }

    try {
        const buffer = await file.arrayBuffer();
        const workbook = window.XLSX.read(buffer, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rowsBrutas = window.XLSX.utils.sheet_to_json(firstSheet, { defval: null });
        return processarPlanilhaNoBrowser(rowsBrutas, file.name);
    } catch (err) {
        return { success: false, error: "Não foi possível ler a planilha: " + err.message };
    }
}

export async function fetchDemoData() {
    try {
        const response = await fetch(`${BASE_URL}/demo`, {
            method: "POST"
        });
        if (response.ok) {
            return await response.json();
        }
    } catch {
        // Fallback automático de demonstração na Vercel
    }

    const demoRows = [
        { Data_Venda: "15/01/2026", Regiao: " Sudeste ", Categoria: "Eletrônicos", Vendedor: "Ana Silva", Faturamento: "R$ 4.500,00", Lucro_Liquido: "R$ 1.120,00", Coluna_Vazia: null },
        { Data_Venda: "18/01/2026", Regiao: "Sul", Categoria: "Móveis", Vendedor: "Carlos Souza", Faturamento: "R$ 2.300,50", Lucro_Liquido: "R$ 540,00", Coluna_Vazia: null },
        { Data_Venda: null, Regiao: null, Categoria: null, Vendedor: null, Faturamento: null, Lucro_Liquido: null, Coluna_Vazia: null },
        { Data_Venda: "05/02/2026", Regiao: "Nordeste", Categoria: "Informática", Vendedor: "Mariana Costa", Faturamento: "R$ 6.800,00", Lucro_Liquido: "R$ 1.890,00", Coluna_Vazia: null },
        { Data_Venda: "12/02/2026", Regiao: "Sudeste", Categoria: "Eletrônicos", Vendedor: "João Pedro", Faturamento: "R$ 3.200,00", Lucro_Liquido: "R$ 850,00", Coluna_Vazia: null },
        { Data_Venda: "12/02/2026", Regiao: "Sudeste", Categoria: "Eletrônicos", Vendedor: "João Pedro", Faturamento: "R$ 3.200,00", Lucro_Liquido: "R$ 850,00", Coluna_Vazia: null },
        { Data_Venda: "20/02/2026", Regiao: "Centro-Oeste", Categoria: "Eletrodomésticos", Vendedor: "Fernanda Lima", Faturamento: "#DIV/0!", Lucro_Liquido: "R$ 620,00", Coluna_Vazia: null },
        { Data_Venda: "03/03/2026", Regiao: "Sul ", Categoria: "Informática", Vendedor: "Carlos Souza", Faturamento: "R$ 5.100,75", Lucro_Liquido: "R$ 1.340,00", Coluna_Vazia: null },
        { Data_Venda: "15/03/2026", Regiao: "Nordeste", Categoria: "Móveis", Vendedor: "Mariana Costa", Faturamento: "R$ 1.950,00", Lucro_Liquido: null, Coluna_Vazia: null },
        { Data_Venda: "28/03/2026", Regiao: "Norte", Categoria: "Eletrônicos", Vendedor: "Ana Silva", Faturamento: "R$ 4.120,00", Lucro_Liquido: "R$ 980,00", Coluna_Vazia: null },
        { Data_Venda: "10/04/2026", Regiao: "Sudeste", Categoria: "Informática", Vendedor: "João Pedro", Faturamento: "R$ 7.450,00", Lucro_Liquido: "R$ 2.100,00", Coluna_Vazia: null },
    ];
    return processarPlanilhaNoBrowser(demoRows, "vendas_com_erros_exemplo.xlsx");
}

export function getDownloadLimpoUrl() {
    if (_ULTIMO_DADOS_LIMPOS && window.XLSX) {
        const ws = window.XLSX.utils.json_to_sheet(_ULTIMO_DADOS_LIMPOS);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Dados_Limpos");
        window.XLSX.writeFile(wb, _ULTIMO_NOME_ARQUIVO);
        return null;
    }
    return `${BASE_URL}/download-limpo`;
}
