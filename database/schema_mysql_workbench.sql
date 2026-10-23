-- ============================================================================
-- SCRIPT OFICIAL PARA MYSQL WORKBENCH — DASHBOARDS AUTOMATIZADOS
-- Aplicativo: app.dashboardmagico (https://app.dashboardmagico.com)
-- Como usar: Abra este arquivo no MySQL Workbench e clique no ícone ⚡ (Execute)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS dashboard_magico
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dashboard_magico;

-- 1. Tabela de Usuários (Autenticação Corporativa)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    empresa VARCHAR(120) DEFAULT 'Corporativo',
    ativo TINYINT(1) DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_login DATETIME NULL,
    INDEX idx_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabela de Histórico de Planilhas Processadas pelo Robô de Limpeza (ETL)
CREATE TABLE IF NOT EXISTS uploads_planilhas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    total_linhas INT NOT NULL DEFAULT 0,
    total_colunas INT NOT NULL DEFAULT 0,
    qtd_correcoes_etl INT NOT NULL DEFAULT 0,
    relatorio_json JSON NULL,
    insights_json JSON NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_uploads_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabela de Dashboards e KPIs Gerados Automaticamente (Auto-EDA)
CREATE TABLE IF NOT EXISTS dashboards_gerados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upload_id INT NOT NULL,
    nome_metrica_principal VARCHAR(120) NULL,
    soma_principal DECIMAL(18, 2) DEFAULT 0.00,
    media_principal DECIMAL(18, 2) DEFAULT 0.00,
    maximo_principal DECIMAL(18, 2) DEFAULT 0.00,
    minimo_principal DECIMAL(18, 2) DEFAULT 0.00,
    kpis_json JSON NULL,
    graficos_json JSON NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dashboard_upload
        FOREIGN KEY (upload_id) REFERENCES uploads_planilhas(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Inserir Usuário Administrador Padrão para Teste (Senha: 123456)
INSERT IGNORE INTO usuarios (nome_completo, email, senha_hash, empresa)
VALUES (
    'Arthur Rocha (Admin)',
    'admin@dashboardmagico.com',
    '$2b$12$KIX/demoHashParaTesteLocalNoMySQLWorkbench123456',
    'Dashboards Automatizados Enterprise'
);

-- Consulta de verificação rápida no MySQL Workbench
SELECT * FROM usuarios;
