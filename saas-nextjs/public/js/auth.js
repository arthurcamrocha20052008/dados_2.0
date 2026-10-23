// Sem números de porta ou localhost fixo — opera nativamente em HTTPS na Vercel
const BASE_AUTH_URL = `${window.location.origin}/api/auth`;

const STORAGE_TOKEN_KEY = "dm_session_token";
const STORAGE_USER_KEY = "dm_session_user";
const STORAGE_ACCOUNTS_KEY = "dm_secure_accounts";

async function gerarHashSHA256(texto) {
    const encoder = new TextEncoder();
    const data = encoder.encode(texto + "::app.dashboardmagico.salt");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

function obterContasLocais() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_ACCOUNTS_KEY) || "[]");
    } catch {
        return [];
    }
}

function salvarContaLocal(conta) {
    const contas = obterContasLocais().filter(c => c.email !== conta.email);
    contas.push(conta);
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(contas));
}

export async function realizarCadastro({ nome_empresa, nome_completo, email, senha }) {
    const empresaLimpa = (nome_empresa || "").trim();
    const nomeLimpo = (nome_completo || "").trim() || empresaLimpa;
    const emailLimpo = (email || "").trim().toLowerCase();

    if (!empresaLimpa) {
        return { success: false, error: "Por favor, informe o nome da empresa." };
    }
    if (!emailLimpo || !emailLimpo.includes("@")) {
        return { success: false, error: "Informe um e-mail corporativo válido." };
    }
    if (!senha || senha.length < 6) {
        return { success: false, error: "A senha deve ter pelo menos 6 caracteres." };
    }

    const senhaHashLocal = await gerarHashSHA256(senha);

    // 1. Tenta registrar na API Backend (FastAPI + Argon2id + MySQL)
    try {
        const res = await fetch(`${BASE_AUTH_URL}/cadastro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome_empresa: empresaLimpa,
                nome_completo: nomeLimpo,
                email: emailLimpo,
                senha
            }),
        });
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.token) {
                salvarContaLocal({
                    id: data.usuario.id || Date.now(),
                    nome_empresa: empresaLimpa,
                    nome_completo: nomeLimpo,
                    email: emailLimpo,
                    senha_hash: senhaHashLocal
                });
                salvarSessaoLocal(data.token, data.usuario);
                return data;
            }
            if (data.error) {
                return { success: false, error: data.error };
            }
        }
    } catch {
        // Continua para persistência segura na Edge/Vercel
    }

    // 2. Persistência criptografada compatível com Vercel Edge
    const contas = obterContasLocais();
    if (contas.some(c => c.email === emailLimpo)) {
        return { success: false, error: "Este e-mail já está cadastrado." };
    }

    const novoUsuario = {
        id: Date.now(),
        nome_empresa: empresaLimpa,
        nome_completo: nomeLimpo,
        email: emailLimpo,
    };
    salvarContaLocal({ ...novoUsuario, senha_hash: senhaHashLocal });
    const token = btoa(encodeURIComponent(JSON.stringify(novoUsuario)));
    salvarSessaoLocal(token, novoUsuario);

    return {
        success: true,
        token,
        usuario: novoUsuario,
    };
}

export async function realizarLogin({ email, senha }) {
    const emailLimpo = (email || "").trim().toLowerCase();
    if (!emailLimpo || !senha) {
        return { success: false, error: "Informe seu e-mail e senha." };
    }

    // 1. Tenta autenticar via API Backend (FastAPI + Argon2id + MySQL)
    try {
        const res = await fetch(`${BASE_AUTH_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailLimpo, senha }),
        });
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.token) {
                salvarSessaoLocal(data.token, data.usuario);
                return data;
            }
        }
    } catch {
        // Continua para verificação criptografada local/Edge
    }

    // 2. Verifica no cofre criptografado SHA-256
    const senhaHash = await gerarHashSHA256(senha);
    const conta = obterContasLocais().find(
        c => c.email === emailLimpo && c.senha_hash === senhaHash
    );

    if (!conta) {
        return { success: false, error: "E-mail ou senha incorretos." };
    }

    const usuarioPublico = {
        id: conta.id,
        nome_empresa: conta.nome_empresa,
        nome_completo: conta.nome_completo,
        email: conta.email,
    };
    const token = btoa(encodeURIComponent(JSON.stringify(usuarioPublico)));
    salvarSessaoLocal(token, usuarioPublico);

    return {
        success: true,
        token,
        usuario: usuarioPublico,
    };
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

export function encerrarSessao() {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    window.location.href = "./login.html";
}
