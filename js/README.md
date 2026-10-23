# 🧩 Módulos JavaScript (`frontend/js`)

Arquitetura modular em **ES6 Modules** para manter a lógica do frontend organizada e desacoplada.

---

## 📄 Arquivos

### 1. `api.js`
Camada de comunicação com o servidor FastAPI (`http://localhost:8000/api`):
- `uploadExcelFile(file)`: Envia a planilha via `FormData` para `/api/upload`.
- `fetchDemoData()`: Requisita os dados de demonstração em `/api/demo`.
- `getDownloadLimpoUrl()`: Retorna o endereço de download da planilha limpa (`/api/download-limpo`).

### 2. `grafico.js`
Gerencia o ciclo de vida das instâncias do **Chart.js**:
- Destrói gráficos anteriores antes de recriar novas visualizações.
- Configura paleta de cores e tema escuro para eixos e legendas.
- Renderiza até 4 gráficos simultâneos (`myChart1` Barras, `myChart2` Rosca, `myChart3` Linha Temporal/Comparativa e `myChart4` Barras Horizontais).

### 3. `main.js`
Ponto de entrada e controlador da interface (DOM):
- Gerencia eventos de Drag & Drop e seleção de arquivos.
- Controla a alternância entre tela de upload, animação de carregamento e painel de resultados.
- Atualiza os cards de KPIs dinamicamente quando o usuário troca a métrica no seletor.
- Filtra as linhas da tabela de dados limpos em tempo real conforme o usuário digita na busca.
