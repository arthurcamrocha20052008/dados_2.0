# 🗄️ Banco de Dados — MySQL Workbench (`dashboard_magico`)

Esta pasta contém a modelagem relacional e o script SQL oficial para rodar o banco de dados do sistema **Dashboards Automatizados (`app.dashboardmagico`)** diretamente no **MySQL Workbench**.

---

## 🛠️ Como Executar no MySQL Workbench

1. Abra o **MySQL Workbench** e conecte-se à sua instância MySQL (`Local instance MySQL80` ou servidor remoto).
2. Vá no menu **File → Open SQL Script...** e selecione o arquivo [`schema_mysql_workbench.sql`](file:///c:/Users/camis/OneDrive/Documentos/ARTHUR/dados2.0/database/schema_mysql_workbench.sql).
3. Clique no ícone de raio **⚡ (Execute)** na barra superior.
4. Atualize a aba **Schemas** à esquerda: o banco **`dashboard_magico`** estará criado com 3 tabelas:
   - `usuarios`: Credenciais e perfis de acesso corporativo.
   - `uploads_planilhas`: Registro de cada planilha Excel/CSV limpa pelo robô ETL e seu relatório de auditoria.
   - `dashboards_gerados`: Armazenamento das métricas (Soma, Média, Pico Máximo) e JSON dos gráficos gerados.
