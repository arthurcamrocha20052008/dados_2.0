# 🧪 Módulo ETL — Limpeza e Inteligência Analítica

Este pacote concentra toda a inteligência de dados do sistema, dividida em duas etapas: **Sanitização de Dados (`limpeza.py`)** e **Análise Exploratória Automática (`analise.py`)**.

---

## 📄 Arquivos

### 1. `limpeza.py` (`limpar_dados_excel`)
Recebe um `DataFrame` bruto do Pandas e aplica um pipeline de correção automática:
- **Reconstrução de Cabeçalho:** Detecta se o topo da planilha possui células de título mescladas (`Unnamed`) e reposiciona o cabeçalho real.
- **Remoção de Ruído:** Elimina linhas/colunas vazias e registros duplicados.
- **Tratamento de Erros de Fórmula:** Substitui erros clássicos do Excel (`#DIV/0!`, `#VALOR!`, `#VALUE!`, `#REF!`, `#N/D`, `#NOME?`) por valores tratáveis.
- **Conversão Numérica Inteligente:** Identifica números salvos como texto no padrão brasileiro (`R$ 1.500,00`) ou internacional (`1,500.00`) e converte para `float`.
- **Padronização de Datas:** Converte strings de data (`dd/mm/aaaa` ou `aaaa-mm-dd`) para `datetime64`.
- **Imputação de Valores Ausentes (`NaN`):** Preenche lacunas numéricas com `0` e categóricas com `"Não Informado"`, registrando cada ação no **Relatório de Auditoria**.

### 2. `analise.py` (`gerar_analise_dashboard`)
Recebe o `DataFrame` limpo e decide automaticamente a melhor visualização:
- **Classificação de Colunas:** Prioriza métricas financeiras/negócio (`Faturamento`, `Vendas`, `Valor`, `Lucro`) e evita somar colunas de identificação (`ID`, `CPF`, `CEP`, `Código`).
- **Cálculo de KPIs:** Calcula soma, média, máximo, mínimo e mediana para todas as colunas numéricas.
- **Insights Automáticos:** Gera resumos textuais sobre a categoria líder, amplitude dos dados e intervalo de datas.
- **Estruturação de 4 Gráficos:**
  1. `chart1` (Barras Verticais): Top 10 Categorias por Métrica Principal.
  2. `chart2` (Rosca): Participação/Distribuição percentual.
  3. `chart3` (Linha): Evolução Temporal (quando há datas) ou Comparativo entre 2 métricas.
  4. `chart4` (Barras Horizontais): Média ou Soma de métrica secundária por categoria.
