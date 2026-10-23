# 📊 Dashboards Automatizados — `app.dashboardmagico` (Dados 2.0)

🌐 **Acesse o App Online (Vercel HTTPS):** **[https://dashboardmagico.vercel.app](https://dashboardmagico.vercel.app)**  
🔗 **Painel do Projeto na Vercel:** [https://vercel.com/camposxresenhudos/dashboardmagico](https://vercel.com/camposxresenhudos/dashboardmagico)  
🐍 **Linguagem Primordial:** **Python** (FastAPI, Pandas, NumPy, OpenPyXL, Argon2id & PyMySQL)

---

Sistema **Auto-EDA (Análise Exploratória de Dados Automática)** com **Robô de Limpeza de Dados (ETL)** e **Segurança Criptográfica Argon2id** desenvolvidos em **Python**. Basta enviar qualquer planilha Excel (`.xlsx`, `.xls`) ou `.csv` (mesmo desorganizada ou com erros) e a plataforma limpa os dados, extrai KPIs, gera descobertas analíticas e monta um painel executivo automaticamente.

---

## 🏗️ Arquitetura Limpa do Projeto (Sem Arquivos Duplicados)

```text
dados2.0/
├── README.md                        # Documentação geral do projeto e link oficial na Vercel
├── .gitattributes                   # Configuração GitHub Linguist (Python como linguagem principal)
├── vercel.json                      # Configuração de deploy apontando para a pasta frontend/
├── planilha_teste_com_erros.xlsx    # Planilha de exemplo com erros reais para teste imediato
├── database/                        # Modelagem e Script SQL para MySQL Workbench
│   ├── README.md
│   └── schema_mysql_workbench.sql   # Criação do banco `dashboard_magico` e tabelas relacionais
├── backend/                         # Núcleo em Python (FastAPI + Pandas + Segurança Argon2id)
│   ├── README.md
│   ├── fast.py                      # Servidor FastAPI, rotas de upload, autenticação e exportação
│   ├── database.py                  # Integração PyMySQL com o MySQL Workbench
│   ├── requerimento.txt             # Dependências Python do projeto
│   ├── seguranca/                   # Proteção de dados e criptografia em Python
│   │   ├── README.md
│   │   ├── criptografia.py          # Hashing Argon2id, tokens HMAC-SHA256 e sanitização
│   │   └── repositorio_usuarios.py  # Persistência segura de usuários e empresas
│   └── ETL/                         # Motor Python de Extração, Transformação e Análise
│       ├── README.md
│       ├── limpeza.py               # Robô de sanitização e correção de erros do Excel
│       └── analise.py               # Motor Auto-EDA (KPIs, Insights e 4 gráficos inteligentes)
└── frontend/                        # Interface Web servida na Vercel (outputDirectory)
    ├── README.md
    ├── index.html                   # Painel principal ("Olá, <nome da empresa>" acima do Excel)
    ├── login.html                   # Área de Login Corporativo (E-mail e Senha)
    ├── cadastro.html                # Área de Criar Conta (Nome da Empresa, E-mail e Senha)
    ├── manifest.json                # Manifesto PWA (`app.dashboardmagico`)
    └── js/                          # Módulos de integração com a API Python
        ├── README.md
        ├── main.js                  # Controlador de eventos, saudação da empresa e UI
        ├── auth.js                  # Comunicação com `backend/seguranca` (Login e Cadastro)
        ├── api.js                   # Comunicação de planilhas e motor de contingência
        └── grafico.js               # Renderização dos 4 gráficos executivos
```

---

## ✨ Funcionalidades Principais (Python Core)

1. **🔐 Segurança Corporativa (`backend/seguranca/`):**
   - Criptografia de senhas com **Argon2id** (`pwdlib`) e assinatura de sessão **HMAC-SHA256**.
   - Cadastro da empresa em **Criar Conta**, exibindo automaticamente **`"Olá, <nome da empresa>"`** acima da área de envio do Excel.
2. **🧹 Robô de Auto-Limpeza (`backend/ETL/limpeza.py`):**
   - Corrige cabeçalhos desalinhados (`Unnamed`), remove linhas/colunas vazias e registros duplicados.
   - Limpa erros de fórmulas do Excel (`#DIV/0!`, `#VALOR!`, `#REF!`, `#N/D`, `N/A`).
   - Converte textos monetários/numéricos (`R$ 1.500,00`, `1,234.56`, `%`) em números decimais e padroniza datas.
3. **📈 Motor Analítico Inteligente (`backend/ETL/analise.py`):**
   - Prioriza métricas de negócio (Faturamento, Vendas, Lucro, Preço) e ignora colunas de ID/Código.
   - Gera **4 gráficos automáticos**: Barras Verticais (Top Categorias), Rosca (Participação), Linha (Evolução Temporal ou Comparativo) e Barras Horizontais (Consolidado).
4. **🗄️ Persistência MySQL Workbench (`database/` & `backend/database.py`):**
   - Script SQL completo para criar o schema `dashboard_magico` e gravar usuários, auditorias ETL e KPIs gerados.

---

## 🚀 Como Executar Localmente com Python

### 1. Instalar dependências Python
```bash
pip install -r backend/requerimento.txt
```

### 2. Iniciar o servidor Python (FastAPI)
```bash
cd backend
python fast.py
```
*(Ou `python -m uvicorn fast:app --reload`)*
