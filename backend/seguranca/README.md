# 🔐 Módulo de Segurança (`backend/seguranca`)

Responsável por toda a camada de proteção de dados sensíveis, autenticação e criptografia de credenciais do sistema **Dashboards Automatizados**, seguindo o padrão de segurança do projeto `fluxo_caixa`.

---

## 🛡️ Camadas de Proteção Implementadas

1. **Hashing Criptográfico Argon2id (`criptografia.py`):**
   - Utiliza `pwdlib` (`PasswordHash.recommended()` com **Argon2id**), impedindo que senhas sejam salvas em texto puro no MySQL Workbench ou em disco.
2. **Tokens de Sessão Assinados (`HMAC-SHA256`):**
   - Cada login ou cadastro gera um token assinado digitalmente com tempo de expiração (`exp`) e dados da empresa autenticada.
3. **Sanitização Contra XSS e SQL Injection:**
   - Todos os campos de entrada (`nome_empresa`, `nome_completo`, `email`) passam por sanitização e validação estrita via Regex e queries parametrizadas (`%s` no PyMySQL e `?` no SQLite).
4. **Persistência Dupla (`repositorio_usuarios.py`):**
   - Grava na tabela `usuarios` do **MySQL Workbench (`dashboard_magico`)** e mantém sincronização de contingência criptografada para nunca falhar caso o serviço MySQL esteja pausado.
