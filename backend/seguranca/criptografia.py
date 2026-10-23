import base64
import hashlib
import hmac
import json
import os
import re
import time
from pwdlib import PasswordHash

# Utiliza Argon2id (padrão ouro de criptografia de senhas, igual ao fluxo_caixa)
_password_hasher = PasswordHash.recommended()

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "chave-secreta-seguranca-dados20-argon2-hmac-2026"
).encode("utf-8")

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


def sanitizar_texto(valor: str) -> str:
    """Remove caracteres perigosos (prevenção contra XSS e Injection)."""
    if not valor:
        return ""
    limpo = str(valor).strip()
    limpo = re.sub(r"[<>\"';]", "", limpo)
    return limpo


def validar_email(email: str) -> bool:
    """Valida o formato do e-mail corporativo."""
    if not email:
        return False
    return bool(EMAIL_REGEX.match(email.strip().lower()))


def verificar_forca_senha(senha: str) -> tuple[bool, str]:
    """Verifica requisitos mínimos de segurança da senha."""
    if not senha or len(senha) < 6:
        return False, "A senha deve ter pelo menos 6 caracteres."
    return True, "Senha válida."


def gerar_hash_senha(senha_plana: str) -> str:
    """Gera hash irreversível Argon2id para armazenar no banco de dados."""
    return _password_hasher.hash(senha_plana)


def verificar_senha(senha_plana: str, senha_hash: str) -> bool:
    """Compara a senha digitada com o hash Argon2id armazenado."""
    try:
        return _password_hasher.verify(senha_plana, senha_hash)
    except Exception:
        return False


def criar_token_sessao(dados_usuario: dict, expira_segundos: int = 86400) -> str:
    """Assina digitalmente um token de sessão (HMAC-SHA256) para o usuário autenticado."""
    payload = {
        "id": dados_usuario.get("id"),
        "email": dados_usuario.get("email"),
        "nome_empresa": dados_usuario.get("nome_empresa"),
        "nome_completo": dados_usuario.get("nome_completo"),
        "exp": int(time.time()) + expira_segundos,
    }
    payload_bytes = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    payload_b64 = base64.urlsafe_b64encode(payload_bytes).decode("utf-8")
    assinatura = hmac.new(SECRET_KEY, payload_b64.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{assinatura}"


def verificar_token_sessao(token: str) -> dict | None:
    """Verifica a assinatura digital e a validade temporal do token de sessão."""
    try:
        if not token or "." not in token:
            return None
        payload_b64, assinatura_recebida = token.split(".", 1)
        assinatura_esperada = hmac.new(
            SECRET_KEY, payload_b64.encode("utf-8"), hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(assinatura_recebida, assinatura_esperada):
            return None
        payload_json = base64.urlsafe_b64decode(payload_b64.encode("utf-8")).decode("utf-8")
        dados = json.loads(payload_json)
        if dados.get("exp", 0) < int(time.time()):
            return None
        return dados
    except Exception:
        return None
