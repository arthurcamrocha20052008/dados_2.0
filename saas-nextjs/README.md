# 🚀 Dashboards Automatizados — SaaS (`app.dashboardmagico`)

Arquitetura SaaS corporativa construída com **Next.js (App Router)**, **Tailwind CSS** (Design System inspirado em Linear/Vercel) e **Supabase (PostgreSQL & Auth)**, pré-configurada para operar sob **HTTPS** no domínio **`https://app.dashboardmagico.com`**.

---

## 📂 Árvore de Arquivos

```text
saas-nextjs/
├── .env.example                     # Variáveis de ambiente de produção (HTTPS)
├── package.json                     # Dependências Next.js 15 + Supabase SSR + Tailwind
└── src/
    ├── middleware.ts                # Proteção de rotas (/dashboard) e sessão Supabase
    ├── lib/
    │   └── supabase/
    │       ├── client.ts            # Cliente Supabase para Client Components
    │       └── server.ts            # Cliente Supabase para Server Components / Actions
    └── app/
        ├── layout.tsx               # Root Layout com branding "Dashboards Automatizados"
        ├── signin/
        │   └── page.tsx             # Tela de Login Corporativo (/signin)
        ├── signup/
        │   └── page.tsx             # Tela de Cadastro Corporativo (/signup)
        └── dashboard/
            └── page.tsx             # Painel protegido (/dashboard) de Dashboards Automatizados
```
