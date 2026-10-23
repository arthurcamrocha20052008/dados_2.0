# 🚀 Dashboards Automatizados — SaaS (`app.dashboardmagico` + MySQL Workbench)

Arquitetura SaaS corporativa construída com **Next.js (App Router)**, **Tailwind CSS** (Design System inspirado em Linear/Vercel) e **MySQL Workbench (`mysql2/promise`)**, pré-configurada para operar sob **HTTPS** no domínio **`https://app.dashboardmagico.com`**.

---

## 📂 Árvore de Arquivos

```text
saas-nextjs/
├── .env.example                     # Variáveis de ambiente MySQL Workbench e HTTPS
├── package.json                     # Next.js 15 + mysql2 + bcryptjs + jose + Tailwind
└── src/
    ├── middleware.ts                # Proteção de rotas (/dashboard) via JWT HttpOnly
    ├── lib/
    │   └── mysql/
    │       └── db.ts                # Pool de conexões MySQL Workbench (dashboard_magico)
    └── app/
        ├── layout.tsx               # Root Layout com branding "Dashboards Automatizados"
        ├── api/
        │   └── auth/
        │       ├── signin/route.ts  # Login consultando a tabela `usuarios` no MySQL
        │       └── signup/route.ts  # Cadastro gravando na tabela `usuarios` no MySQL
        ├── signin/
        │   └── page.tsx             # Tela de Login Corporativo (/signin)
        ├── signup/
        │   └── page.tsx             # Tela de Cadastro Corporativo (/signup)
        └── dashboard/
            └── page.tsx             # Painel protegido (/dashboard) integrado ao MySQL
```
