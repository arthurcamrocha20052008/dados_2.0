import os
from pathlib import Path
import sqlite3
from database import obter_conexao_mysql
from .criptografia import (
    criar_token_sessao,
    gerar_hash_senha,
    sanitizar_texto,
    validar_email,
    verificar_forca_senha,
    verificar_senha,
)

# Em produção na Vercel (Serverless), utiliza /tmp; localmente utiliza a pasta seguranca
if os.getenv("VERCEL"):
    LOCAL_DB_PATH = Path("/tmp/usuarios_seguros.db")
else:
    LOCAL_DB_PATH = Path(__file__).resolve().parent / "usuarios_seguros.db"


def _inicializar_sqlite_contingencia():
    conn = sqlite3.connect(LOCAL_DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome_completo TEXT NOT NULL,
            nome_empresa TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha_hash TEXT NOT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.commit()
    conn.close()


_inicializar_sqlite_contingencia()


def cadastrar_usuario(nome_empresa: str, email: str, senha: str, nome_completo: str = "") -> dict:
    """Valida, criptografa a senha com Argon2id e salva o usuário no MySQL Workbench (e contingência local)."""
    empresa_limpa = sanitizar_texto(nome_empresa)
    nome_limpo = sanitizar_texto(nome_completo) or empresa_limpa
    email_limpo = email.strip().lower() if email else ""

    if not empresa_limpa:
        return {"success": False, "error": "Por favor, informe o nome da empresa."}

    if not validar_email(email_limpo):
        return {"success": False, "error": "Formato de e-mail inválido."}

    senha_ok, msg_senha = verificar_forca_senha(senha)
    if not senha_ok:
        return {"success": False, "error": msg_senha}

    senha_hash = gerar_hash_senha(senha)
    salvo_mysql = False
    usuario_id = None

    # 1. Tenta salvar no MySQL Workbench (tabela `usuarios`)
    try:
        conn_mysql = obter_conexao_mysql()
        with conn_mysql.cursor() as cursor:
            cursor.execute("SELECT id FROM usuarios WHERE email = %s LIMIT 1", (email_limpo,))
            if cursor.fetchone():
                conn_mysql.close()
                return {"success": False, "error": "Este e-mail já está cadastrado."}

            cursor.execute(
                """
                INSERT INTO usuarios (nome_completo, email, senha_hash, empresa)
                VALUES (%s, %s, %s, %s)
                """,
                (nome_limpo, email_limpo, senha_hash, empresa_limpa),
            )
            usuario_id = cursor.lastrowid
            salvo_mysql = True
        conn_mysql.close()
    except Exception:
        salvo_mysql = False

    # 2. Sincroniza também no banco seguro local para garantir funcionamento offline/sem MySQL ativo
    try:
        conn_sq = sqlite3.connect(LOCAL_DB_PATH)
        cur = conn_sq.cursor()
        cur.execute("SELECT id FROM usuarios WHERE email = ? LIMIT 1", (email_limpo,))
        existente = cur.fetchone()
        if existente and not salvo_mysql:
            conn_sq.close()
            return {"success": False, "error": "Este e-mail já está cadastrado."}
        if not existente:
            cur.execute(
                """
                INSERT INTO usuarios (nome_completo, nome_empresa, email, senha_hash)
                VALUES (?, ?, ?, ?)
                """,
                (nome_limpo, empresa_limpa, email_limpo, senha_hash),
            )
            if usuario_id is None:
                usuario_id = cur.lastrowid
            conn_sq.commit()
        conn_sq.close()
    except Exception as e:
        if not salvo_mysql:
            return {"success": False, "error": f"Erro ao salvar cadastro: {e}"}

    dados_usuario = {
        "id": usuario_id,
        "email": email_limpo,
        "nome_empresa": empresa_limpa,
        "nome_completo": nome_limpo,
    }
    token = criar_token_sessao(dados_usuario)

    return {
        "success": True,
        "message": "Conta criada com segurança!",
        "token": token,
        "usuario": dados_usuario,
        "salvo_mysql": salvo_mysql,
    }


def autenticar_usuario(email: str, senha: str) -> dict:
    """Autentica o usuário verificando o hash Argon2id no MySQL Workbench (ou contingência local)."""
    email_limpo = email.strip().lower() if email else ""
    if not validar_email(email_limpo) or not senha:
        return {"success": False, "error": "Informe um e-mail válido e sua senha."}

    usuario_encontrado = None

    # 1. Busca primeiro no MySQL Workbench
    try:
        conn_mysql = obter_conexao_mysql()
        with conn_mysql.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, nome_completo, email, senha_hash, empresa
                FROM usuarios
                WHERE email = %s AND ativo = 1
                LIMIT 1
                """,
                (email_limpo,),
            )
            row = cursor.fetchone()
            if row:
                usuario_encontrado = {
                    "id": row["id"],
                    "nome_completo": row["nome_completo"],
                    "nome_empresa": row.get("empresa") or row["nome_completo"],
                    "email": row["email"],
                    "senha_hash": row["senha_hash"],
                }
                cursor.execute("UPDATE usuarios SET ultimo_login = NOW() WHERE id = %s", (row["id"],))
        conn_mysql.close()
    except Exception:
        pass

    # 2. Caso o MySQL Workbench não esteja aberto, verifica no banco seguro local
    if not usuario_encontrado:
        try:
            conn_sq = sqlite3.connect(LOCAL_DB_PATH)
            conn_sq.row_factory = sqlite3.Row
            cur = conn_sq.cursor()
            cur.execute(
                "SELECT id, nome_completo, nome_empresa, email, senha_hash FROM usuarios WHERE email = ? LIMIT 1",
                (email_limpo,),
            )
            row_sq = cur.fetchone()
            conn_sq.close()
            if row_sq:
                usuario_encontrado = dict(row_sq)
        except Exception:
            pass

    if not usuario_encontrado:
        return {"success": False, "error": "E-mail ou senha incorretos."}

    if not verificar_senha(senha, usuario_encontrado["senha_hash"]):
        return {"success": False, "error": "E-mail ou senha incorretos."}

    dados_publicos = {
        "id": usuario_encontrado["id"],
        "email": usuario_encontrado["email"],
        "nome_empresa": usuario_encontrado["nome_empresa"],
        "nome_completo": usuario_encontrado["nome_completo"],
    }
    token = criar_token_sessao(dados_publicos)

    return {
        "success": True,
        "token": token,
        "usuario": dados_publicos,
    }
