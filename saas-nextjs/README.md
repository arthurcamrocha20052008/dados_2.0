# 🎨 Frontend — Interface Web do Dashboard Mágico

Interface moderna em **HTML5**, **Tailwind CSS** e **Chart.js** projetada para oferecer uma experiência *plug-and-play*: o usuário arrasta a planilha e visualiza instantaneamente o relatório de limpeza, insights, KPIs, gráficos e tabela de dados.

---

## 📂 Estrutura da Pasta

- **`index.html`**: Estrutura visual da página, dividida em:
  - Área de Upload (Drag & Drop) + Botão de Planilha de Demonstração.
  - Barra de ferramentas superior com nome do arquivo, seletor de métrica KPI, download da planilha limpa e botão de novo envio.
  - Painéis de **Relatório do Robô de Limpeza** e **Descobertas Automáticas (Auto-EDA)**.
  - 4 Cards de KPIs dinâmicos.
  - Grid responsivo com 4 Gráficos interativos.
  - Tabela de amostra dos dados limpos com busca em tempo real.
- **`js/`**: Módulos JavaScript ES6 responsáveis pela comunicação com a API, controle de eventos e renderização gráfica.

---

## ▶️ Como Acessar

O frontend já é servido automaticamente pelo backend FastAPI em:
- **`http://localhost:8000`**

Caso deseje rodar o frontend em um servidor separado durante o desenvolvimento:
```bash
cd frontend
python -m http.server 3000
```
E acesse `http://localhost:3000`.
