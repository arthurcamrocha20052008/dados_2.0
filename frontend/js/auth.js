const BASE_AUTH_URL = window.DASHBOARD_API_URL || `${window.location.origin}/api/auth`;

const STORAGE_TOKEN_KEY = "dm_session_token";
const STORAGE_USER_KEY = "dm_session_user";

export async function realizarCadastro({ nome_empresa, nome_completo, email, senha }) {
    try {
        const res = await fetch(`${BASE_AUTH_URL}/cadastro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome_empresa, nome_completo, email, senha }),
        });
        const data = await res.json();
        if (data.success && data.token) {
            salvarSessaoLocal(data.token, data.usuario);
        }
        return data;
    } catch (err) {
        return { success: false, error: "Erro de comunicação com o servidor de segurança." };
    }
}

export async function realizarLogin({ email, senha }) {
    try {
        const res = await fetch(`${BASE_AUTH_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha }),
        });
        const data = await res.json();
        if (data.success && data.token) {
            salvarSessaoLocal(data.token, data.usuario);
        }
        return data;
    } catch (err) {
        return { success: false, error: "Erro de comunicação com o servidor de segurança." };
    }
}

export function salvarSessaoLocal(token, usuario) {
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(usuario));
}

export function obterUsuarioLogado() {
    try {
        const raw = localStorage.getItem(STORAGE_USER_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function atualizarEmpresaLocal(nomeEmpresa) {
    const atual = obterUsuarioLogado() || { email: "visitante@empresa.com" };
    atual.nome_empresa = nomeEmpresa;
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(atual));
    return atual;
}

export function encerrarSessao() {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    window.location.href = "./login.html";
}
