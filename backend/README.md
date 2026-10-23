# ⚙️ Backend — Auto-Dashboard API

Servidor **FastAPI** responsável por receber planilhas Excel/CSV, orquestrar o pipeline de limpeza e análise (ETL), disponibilizar o download da planilha corrigida e servir os arquivos estáticos do frontend.

---

## 📂 Estrutura da Pasta

- **`fast.py`**: Ponto de entrada da aplicação FastAPI, configuração de CORS, rotas da API e montagem do frontend.
- **`requerimento.txt`**: Lista de pacotes Python necessários (`fastapi`, `uvicorn`, `pandas`, `openpyxl`, `python-multipart`, `numpy`).
- **`ETL/`**: Pacote modular contendo o robô de limpeza (`limpeza.py`) e o motor analítico (`analise.py`).

---

## 🔌 Endpoints da API

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/upload` | Recebe um arquivo `.xlsx`, `.xls` ou `.csv`, limpa erros e retorna KPIs, gráficos, insights e amostra dos dados. |
| `POST` | `/api/demo` | Gera e processa uma planilha de demonstração propositalmente suja para teste imediato. |
| `GET` | `/api/download-limpo` | Exporta e faz download do último arquivo processado já limpo e padronizado em `.xlsx`. |
| `GET` | `/` | Serve a aplicação web do Frontend automaticamente. |

---

## ▶️ Como Rodar o Backend

```bash
cd backend
uvicorn fast:app --reload --port 8000
```
A documentação interativa (Swagger UI) também fica disponível em `http://localhost:8000/docs`.
