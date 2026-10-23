import json
import os
import pymysql
from dotenv import load_dotenv

load_dotenv()

MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "dashboard_magico")


def obter_conexao_mysql():
    """Conecta ao banco de dados MySQL configurado no MySQL Workbench."""
    return pymysql.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
        connect_timeout=3,
    )


def salvar_processamento_mysql(
    nome_arquivo: str,
    relatorio: list,
    insights: list,
    kpis: dict,
    charts: dict,
) -> dict:
    """Registra a planilha processada e os KPIs no MySQL Workbench (se o serviço MySQL estiver ativo)."""
    try:
        conn = obter_conexao_mysql()
        with conn.cursor() as cursor:
            sql_upload = """
                INSERT INTO uploads_planilhas
                    (nome_arquivo, total_linhas, total_colunas, qtd_correcoes_etl, relatorio_json, insights_json)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(
                sql_upload,
                (
                    nome_arquivo,
                    kpis.get("total_linhas", 0),
                    kpis.get("total_colunas", 0),
                    len(relatorio),
                    json.dumps(relatorio, ensure_ascii=False),
                    json.dumps(insights, ensure_ascii=False),
                ),
            )
            upload_id = cursor.lastrowid

            sql_dash = """
                INSERT INTO dashboards_gerados
                    (upload_id, nome_metrica_principal, soma_principal, media_principal, maximo_principal, minimo_principal, kpis_json, graficos_json)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(
                sql_dash,
                (
                    upload_id,
                    kpis.get("nome_metrica"),
                    kpis.get("soma_principal", 0.0),
                    kpis.get("media_principal", 0.0),
                    kpis.get("max_principal", 0.0),
                    kpis.get("min_principal", 0.0),
                    json.dumps(kpis, ensure_ascii=False),
                    json.dumps(charts, ensure_ascii=False),
                ),
            )
        conn.close()
        return {"salvo_mysql": True, "upload_id": upload_id}
    except Exception as err:
        # Se o MySQL Workbench / MySQL Server ainda não estiver ligado, o dashboard continua funcionando normalmente
        return {"salvo_mysql": False, "aviso_mysql": str(err)}


def listar_historico_mysql(limite: int = 10) -> list:
    """Retorna os últimos dashboards salvos no MySQL Workbench."""
    try:
        conn = obter_conexao_mysql()
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT u.id, u.nome_arquivo, u.total_linhas, u.total_colunas,
                       u.qtd_correcoes_etl, u.criado_em,
                       d.nome_metrica_principal, d.soma_principal, d.media_principal
                FROM uploads_planilhas u
                LEFT JOIN dashboards_gerados d ON d.upload_id = u.id
                ORDER BY u.criado_em DESC
                LIMIT %s
                """,
                (limite,),
            )
            rows = cursor.fetchall()
        conn.close()
        return rows
    except Exception:
        return []
