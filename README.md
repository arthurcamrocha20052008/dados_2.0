# 📊 Dashboards Automatizados — `app.dashboardmagico` (Dados 2.0)

Sistema **Auto-EDA (Análise Exploratória de Dados Automática)** com **Robô de Limpeza de Dados (ETL)** integrado. Basta enviar qualquer planilha Excel (`.xlsx`, `.xls`) ou `.csv` (mesmo desorganizada ou com erros) e a plataforma limpa os dados, extrai KPIs, gera descobertas analíticas e monta um painel interativo automaticamente.

---

## 🏗️ Arquitetura do Projeto

```text
dados2.0/
├── README.md                        # Documentação geral do projeto
├── planilha_teste_com_erros.xlsx    # Planilha de exemplo com erros para teste rápido
├── database/                        # Modelagem e Script SQL para MySQL Workbench
│   ├── README.md
│   └── schema_mysql_workbench.sql   # Criação do banco `dashboard_magico` e tabelas
├── backend/                         # API REST em Python (FastAPI)
│   ├── README.md
│   ├── fast.py                      # Servidor FastAPI, rotas de upload, auth e exportação
│   ├── database.py                  # Conexão PyMySQL com o MySQL Workbench
│   ├── requerimento.txt             # Dependências Python do projeto
│   ├── seguranca/                   # Criptografia Argon2id e proteção de credenciais
│   │   ├── README.md
│   │   ├── criptografia.py          # Hashing Argon2id, tokens HMAC-SHA256 e sanitização
│   │   └── repositorio_usuarios.py  # Persistência segura de usuários e autenticação
│   └── ETL/                         # Motor de Extração, Transformação e Análise
│       ├── README.md
│       ├── limpeza.py               # Robô de sanitização e correção de erros do Excel
│       └── analise.py               # Motor Auto-EDA (KPIs, Insights e 4 gráficos inteligentes)
└── frontend/                        # Interface Web Responsiva (Tailwind CSS + Chart.js)
    ├── README.md
    ├── index.html                   # Painel principal ("Olá, <nome da empresa>" acima do Excel)
    ├── login.html                   # Área de Login Corporativo (E-mail e Senha)
    ├── cadastro.html                # Área de Criar Conta (Nome da Empresa, E-mail e Senha)
    └── js/                          # Módulos JavaScript (ES6 Modules)
        ├── README.md
        ├── main.js                  # Controlador de eventos, saudação da empresa e UI
        ├── auth.js                  # Comunicação de Login, Criar Conta e Sessão
        ├── api.js                   # Comunicação HTTP de planilhas com o Backend
        └── grafico.js               # Renderização dinâmica de gráficos com Chart.js
```

---

## ✨ Funcionalidades Principais

1. **🧹 Robô de Auto-Limpeza (`ETL/limpeza.py`):**
   - Corrige cabeçalhos desalinhados (`Unnamed`).
   - Remove linhas e colunas 100% em branco e registros duplicados.
   - Limpa erros de fórmulas do Excel (`#DIV/0!`, `#VALOR!`, `#REF!`, `#N/D`, `N/A`).
   - Converte textos monetários/numéricos (`R$ 1.500,00`, `1,234.56`, `%`) em números reais.
   - Reconhece e padroniza datas automaticamente.
2. **📈 Motor Analítico Inteligente (`ETL/analise.py`):**
   - Prioriza métricas de negócio (Faturamento, Vendas, Lucro, Preço) e ignora colunas de ID/Código.
   - Gera **4 gráficos automáticos**: Barras Verticais (Top Categorias), Rosca (Participação), Linha (Evolução Temporal ou Comparativo) e Barras Horizontais (Média/Soma).
   - Cria **Insights Automáticos** destacando líderes, amplitudes e períodos.
3. **💻 Interface Interativa (`frontend/`):**
   - Upload via Drag & Drop ou botão de **Demonstração Instantânea em 1 clique**.
   - Seletor dinâmico de métrica KPI em tempo real.
   - Download da **Planilha Excel Limpa (`.xlsx`)**.
   - Tabela de inspeção dos dados limpos com filtro de busca instantâneo.

---

## 🚀 Como Executar

### 1. Instalar dependências
```bash
pip install -r backend/requerimento.txt
```

### 2. Iniciar o servidor
```bash
cd backend
uvicorn fast:app --reload
```

### 3. Acessar no navegador
Abra: **`http://localhost:8000`**
