import io
from pathlib import Path
import pandas as pd
from fastapi import FastAPI, File, Header, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from ETL.analise import gerar_analise_dashboard
from ETL.limpeza import limpar_dados_excel
from database import listar_historico_mysql, salvar_processamento_mysql
from seguranca import (
    autenticar_usuario,
    cadastrar_usuario,
    verificar_token_sessao,
)

app = FastAPI(title="Dashboards Automatizados API — app.dashboardmagico", version="2.0")

# Habilita CORS para o frontend se conectar livremente
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Armazena em memória a última planilha limpa para permitir download corrigido
_ESTADO_ATUAL = {"df_limpo": None, "nome_arquivo": "planilha_limpa.xlsx"}


class CadastroPayload(BaseModel):
    nome_empresa: str
    email: str
    senha: str
    nome_completo: str = ""


class LoginPayload(BaseModel):
    email: str
    senha: str


@app.post("/api/auth/cadastro")
async def api_cadastrar(payload: CadastroPayload):
    """Cria uma nova conta com senha protegida por Argon2id na pasta seguranca."""
    return cadastrar_usuario(
        nome_empresa=payload.nome_empresa,
        email=payload.email,
        senha=payload.senha,
        nome_completo=payload.nome_completo,
    )


@app.post("/api/auth/login")
async def api_login(payload: LoginPayload):
    """Autentica o usuário com verificação criptográfica Argon2id."""
    return autenticar_usuario(email=payload.email, senha=payload.senha)


@app.get("/api/auth/sessao")
async def api_verificar_sessao(authorization: str | None = Header(default=None)):
    """Valida o token assinado da sessão ativa."""
    if not authorization or not authorization.startswith("Bearer "):
        return {"authenticated": False}
    token = authorization.replace("Bearer ", "").strip()
    dados = verificar_token_sessao(token)
    if not dados:
        return {"authenticated": False}
    return {"authenticated": True, "usuario": dados}


def _formatar_preview(df: pd.DataFrame, limite: int = 50) -> list[list]:
    preview_df = df.head(limite).copy()
    for col in preview_df.select_dtypes(include=["datetime64", "datetimetz"]).columns:
        preview_df[col] = preview_df[col].dt.strftime("%d/%m/%Y").fillna("-")
    for col in preview_df.select_dtypes(include=["number"]).columns:
        preview_df[col] = preview_df[col].round(2)
    return preview_df.fillna("-").values.tolist()


def _processar_dataframe(df_bruto: pd.DataFrame, nome_arquivo: str):
    df_limpo, relatorio = limpar_dados_excel(df_bruto)
    kpis, charts, insights = gerar_analise_dashboard(df_limpo)

    _ESTADO_ATUAL["df_limpo"] = df_limpo
    nome_base = Path(nome_arquivo).stem
    _ESTADO_ATUAL["nome_arquivo"] = f"{nome_base}_limpo.xlsx"

    status_db = salvar_processamento_mysql(nome_arquivo, relatorio, insights, kpis, charts)

    return {
        "success": True,
        "filename": nome_arquivo,
        "mysql": status_db,
        "relatorio": relatorio,
        "insights": insights,
        "kpis": kpis,
        "charts": charts,
        "columns": df_limpo.columns.tolist(),
        "preview": _formatar_preview(df_limpo, 50),
    }


@app.post("/api/upload")
async def upload_excel(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nome = file.filename or "planilha.xlsx"
        if nome.lower().endswith(".csv"):
            df_bruto = pd.read_csv(io.BytesIO(contents), sep=None, engine="python")
        else:
            df_bruto = pd.read_excel(io.BytesIO(contents))

        return _processar_dataframe(df_bruto, nome)
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/api/demo")
async def carregar_planilha_demo():
    """Gera uma planilha de exemplo propositalmente 'suja' para demonstrar a auto-limpeza e o dashboard."""
    dados_sujos = {
        "Data_Venda": [
            "15/01/2026", "18/01/2026", None, "05/02/2026", "12/02/2026",
            "12/02/2026", "20/02/2026", "03/03/2026", "15/03/2026", "28/03/2026",
            "10/04/2026", "22/04/2026", "05/05/2026"
        ],
        "Região": [
            " Sudeste ", "Sul", None, "Nordeste", "Sudeste",
            "Sudeste", "Centro-Oeste", "Sul ", "Nordeste", "Norte",
            "Sudeste", None, "Sul"
        ],
        "Categoria": [
            "Eletrônicos", "Móveis", None, "Informática", "Eletrônicos",
            "Eletrônicos", "Eletrodomésticos", "Informática", "Móveis", "Eletrônicos",
            "Informática", "Móveis", "#VALOR!"
        ],
        "Vendedor": [
            "Ana Silva", "Carlos Souza", None, "Mariana Costa", "João Pedro",
            "João Pedro", "Fernanda Lima", "Carlos Souza", "Mariana Costa", "Ana Silva",
            "João Pedro", "Fernanda Lima", "Ana Silva"
        ],
        "Faturamento": [
            "R$ 4.500,00", "R$ 2.300,50", None, "R$ 6.800,00", "R$ 3.200,00",
            "R$ 3.200,00", "#DIV/0!", "R$ 5.100,75", "R$ 1.950,00", "R$ 4.120,00",
            "R$ 7.450,00", "R$ 2.890,00", "R$ 3.600,00"
        ],
        "Lucro_Liquido": [
            "R$ 1.120,00", "R$ 540,00", None, "R$ 1.890,00", "R$ 850,00",
            "R$ 850,00", "R$ 620,00", "R$ 1.340,00", None, "R$ 980,00",
            "R$ 2.100,00", "R$ 710,00", "R$ 920,00"
        ],
        "Coluna_Vazia": [None] * 13,
    }
    df_demo = pd.DataFrame(dados_sujos)
    return _processar_dataframe(df_demo, "vendas_com_erros_exemplo.xlsx")


@app.get("/api/historico")
async def historico_dashboards():
    """Lista os dashboards salvos no banco MySQL Workbench."""
    return {"success": True, "historico": listar_historico_mysql()}


@app.get("/api/download-limpo")
async def download_excel_limpo():
    df_limpo = _ESTADO_ATUAL.get("df_limpo")
    if df_limpo is None:
        return {"success": False, "error": "Nenhuma planilha foi processada ainda."}

    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df_limpo.to_excel(writer, index=False, sheet_name="Dados_Limpos")
    buffer.seek(0)

    headers = {
        "Content-Disposition": f'attachment; filename="{_ESTADO_ATUAL["nome_arquivo"]}"'
    }
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers,
    )


# Serve o frontend automaticamente na raiz
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("fast:app", host="127.0.0.1", port=8000, reload=True)
