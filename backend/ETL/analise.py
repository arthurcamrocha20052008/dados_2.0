import numpy as np
import pandas as pd

ID_KEYWORDS = {"id", "codigo", "código", "cod", "cpf", "cnpj", "cep", "matricula", "matrícula", "telefone", "tel"}
PRIORITY_KEYWORDS = [
    "valor", "venda", "vendas", "total", "receita", "faturamento",
    "lucro", "preco", "preço", "custo", "salario", "salário", "qtd", "quantidade"
]


def _escolher_colunas_metricas(df: pd.DataFrame, numeric_cols: list[str]) -> list[str]:
    """Ordena colunas numéricas priorizando métricas de negócio e deixando IDs por último."""
    if not numeric_cols:
        return []

    candidatas = []
    ids = []
    for col in numeric_cols:
        nome_lower = col.lower().strip()
        # Verifica se parece coluna de ID (nome exato ou valores sequenciais únicos inteiros)
        eh_id_nome = any(k == nome_lower or nome_lower.startswith(f"{k}_") or nome_lower.endswith(f"_{k}") for k in ID_KEYWORDS)
        if eh_id_nome:
            ids.append(col)
        else:
            candidatas.append(col)

    # Ordena candidatas por palavras-chave prioritárias
    def score_coluna(col_name: str) -> int:
        nl = col_name.lower()
        for idx, kw in enumerate(PRIORITY_KEYWORDS):
            if kw in nl:
                return idx
        return 100

    candidatas.sort(key=score_coluna)
    return candidatas + ids


def gerar_analise_dashboard(df: pd.DataFrame):
    numeric_cols_raw = df.select_dtypes(include=["number"]).columns.tolist()
    numeric_cols = _escolher_colunas_metricas(df, numeric_cols_raw)
    categorical_cols = df.select_dtypes(include=["object", "category", "string"]).columns.tolist()
    date_cols = df.select_dtypes(include=["datetime64", "datetimetz"]).columns.tolist()

    # Evitar colunas categóricas que são IDs únicos em 100% das linhas (como nomes/emails únicos) se houver outras categorias melhores
    boas_categorias = [c for c in categorical_cols if 1 < df[c].nunique() <= max(30, int(len(df) * 0.8))]
    outras_categorias = [c for c in categorical_cols if c not in boas_categorias]
    categorical_cols_ordenadas = boas_categorias + outras_categorias

    # 1. Cálculo de KPIs (Métricas Principais)
    kpis = {
        "total_linhas": int(df.shape[0]),
        "total_colunas": int(df.shape[1]),
        "colunas_numericas": numeric_cols,
        "colunas_categoricas": categorical_cols_ordenadas,
        "colunas_data": date_cols,
        "metricas_detalhadas": {},
    }

    for num_col in numeric_cols:
        serie = df[num_col].dropna()
        kpis["metricas_detalhadas"][num_col] = {
            "soma": float(serie.sum()) if len(serie) else 0.0,
            "media": float(serie.mean()) if len(serie) else 0.0,
            "maximo": float(serie.max()) if len(serie) else 0.0,
            "minimo": float(serie.min()) if len(serie) else 0.0,
            "mediana": float(serie.median()) if len(serie) else 0.0,
        }

    if numeric_cols:
        primeiro_num = numeric_cols[0]
        detalhe = kpis["metricas_detalhadas"][primeiro_num]
        kpis["nome_metrica"] = primeiro_num
        kpis["soma_principal"] = detalhe["soma"]
        kpis["media_principal"] = detalhe["media"]
        kpis["max_principal"] = detalhe["maximo"]
        kpis["min_principal"] = detalhe["minimo"]

    # 2. Geração de Insights Automáticos
    insights = []
    if categorical_cols_ordenadas and numeric_cols:
        cat0 = categorical_cols_ordenadas[0]
        num0 = numeric_cols[0]
        soma_total = df[num0].sum()
        agrupado = df.groupby(cat0)[num0].sum().sort_values(ascending=False)
        if len(agrupado) > 0 and soma_total > 0:
            lider_nome = str(agrupado.index[0])
            lider_val = float(agrupado.iloc[0])
            pct = (lider_val / soma_total) * 100
            insights.append(
                f"🏆 **Líder em {cat0}**: '{lider_nome}' concentra **{pct:.1f}%** do total de {num0} ({lider_val:,.2f})."
            )
    if numeric_cols:
        num0 = numeric_cols[0]
        insights.append(
            f"📊 **Amplitude de {num0}**: Varia entre o mínimo de **{df[num0].min():,.2f}** e o pico máximo de **{df[num0].max():,.2f}**."
        )
    if date_cols:
        dt0 = date_cols[0]
        min_dt = df[dt0].min()
        max_dt = df[dt0].max()
        if pd.notna(min_dt) and pd.notna(max_dt):
            insights.append(
                f"📅 **Período Analisado ({dt0})**: Dados compreendidos entre **{min_dt.strftime('%d/%m/%Y')}** e **{max_dt.strftime('%d/%m/%Y')}**."
            )

    # 3. Configuração dos Gráficos Inteligentes Automáticos (Até 4 gráficos)
    charts_data = {}

    # Gráfico 1: Top Categorias por Valor Numérico (Barras Verticais)
    if categorical_cols_ordenadas and numeric_cols:
        cat_col = categorical_cols_ordenadas[0]
        num_col = numeric_cols[0]
        grouped = (
            df.groupby(cat_col)[num_col]
            .sum()
            .reset_index()
            .sort_values(by=num_col, ascending=False)
            .head(10)
        )
        charts_data["chart1"] = {
            "type": "bar",
            "title": f"Top {len(grouped)} {cat_col} por Soma de {num_col}",
            "metric_label": f"Soma de {num_col}",
            "labels": grouped[cat_col].astype(str).tolist(),
            "values": [round(float(v), 2) for v in grouped[num_col].tolist()],
        }
    elif categorical_cols_ordenadas:
        cat_col = categorical_cols_ordenadas[0]
        contagem = df[cat_col].value_counts().head(10)
        charts_data["chart1"] = {
            "type": "bar",
            "title": f"Frequência por {cat_col}",
            "metric_label": "Quantidade de Registros",
            "labels": contagem.index.astype(str).tolist(),
            "values": [int(v) for v in contagem.values.tolist()],
        }

    # Gráfico 2: Distribuição Percentual (Rosca / Doughnut)
    if len(categorical_cols_ordenadas) > 1 and numeric_cols:
        cat_col2 = categorical_cols_ordenadas[1]
        num_col2 = numeric_cols[0]
        grouped2 = (
            df.groupby(cat_col2)[num_col2]
            .sum()
            .reset_index()
            .sort_values(by=num_col2, ascending=False)
            .head(7)
        )
        charts_data["chart2"] = {
            "type": "doughnut",
            "title": f"Participação por {cat_col2} ({num_col2})",
            "metric_label": num_col2,
            "labels": grouped2[cat_col2].astype(str).tolist(),
            "values": [round(float(v), 2) for v in grouped2[num_col2].tolist()],
        }
    elif categorical_cols_ordenadas and numeric_cols:
        cat_col1 = categorical_cols_ordenadas[0]
        num_col1 = numeric_cols[0]
        grouped2 = (
            df.groupby(cat_col1)[num_col1]
            .sum()
            .reset_index()
            .sort_values(by=num_col1, ascending=False)
            .head(6)
        )
        charts_data["chart2"] = {
            "type": "doughnut",
            "title": f"Proporção de {num_col1} por {cat_col1}",
            "metric_label": num_col1,
            "labels": grouped2[cat_col1].astype(str).tolist(),
            "values": [round(float(v), 2) for v in grouped2[num_col1].tolist()],
        }

    # Gráfico 3: Evolução Temporal (se houver data) OU Comparação de Métricas (Linha)
    if date_cols and numeric_cols:
        dt_col = date_cols[0]
        num_col = numeric_cols[0]
        temp_df = df[[dt_col, num_col]].dropna().copy()
        temp_df = temp_df.sort_values(by=dt_col)
        # Se houver muitas datas diferentes, agrupa por mês/ano
        if temp_df[dt_col].nunique() > 25:
            temp_df["Periodo"] = temp_df[dt_col].dt.strftime("%Y-%m")
            grouped_time = temp_df.groupby("Periodo")[num_col].sum().reset_index()
            labels_time = grouped_time["Periodo"].tolist()
        else:
            temp_df["Periodo"] = temp_df[dt_col].dt.strftime("%d/%m/%Y")
            grouped_time = temp_df.groupby("Periodo", sort=False)[num_col].sum().reset_index()
            labels_time = grouped_time["Periodo"].tolist()

        charts_data["chart3"] = {
            "type": "line",
            "title": f"Evolução Temporal de {num_col} ({dt_col})",
            "label1": num_col,
            "labels": labels_time,
            "values1": [round(float(v), 2) for v in grouped_time[num_col].tolist()],
        }
    elif len(numeric_cols) > 1:
        label_col = categorical_cols_ordenadas[0] if categorical_cols_ordenadas else None
        amostra_df = df.head(20)
        labels_comp = (
            amostra_df[label_col].astype(str).tolist()
            if label_col
            else [f"Reg #{i+1}" for i in range(len(amostra_df))]
        )
        charts_data["chart3"] = {
            "type": "line",
            "title": f"Comparativo: {numeric_cols[0]} vs {numeric_cols[1]}",
            "label1": numeric_cols[0],
            "label2": numeric_cols[1],
            "labels": labels_comp,
            "values1": [round(float(v), 2) for v in amostra_df[numeric_cols[0]].tolist()],
            "values2": [round(float(v), 2) for v in amostra_df[numeric_cols[1]].tolist()],
        }

    # Gráfico 4: Média por Categoria (Barras Horizontais) ou Segunda Métrica
    if categorical_cols_ordenadas and numeric_cols:
        cat_col = categorical_cols_ordenadas[0]
        num_alvo = numeric_cols[1] if len(numeric_cols) > 1 else numeric_cols[0]
        operacao = "Média" if len(numeric_cols) == 1 else "Soma"
        grouped4 = (
            df.groupby(cat_col)[num_alvo].mean()
            if operacao == "Média"
            else df.groupby(cat_col)[num_alvo].sum()
        )
        grouped4 = grouped4.reset_index().sort_values(by=num_alvo, ascending=False).head(10)
        charts_data["chart4"] = {
            "type": "bar_horizontal",
            "title": f"{operacao} de {num_alvo} por {cat_col}",
            "metric_label": f"{operacao} de {num_alvo}",
            "labels": grouped4[cat_col].astype(str).tolist(),
            "values": [round(float(v), 2) for v in grouped4[num_alvo].tolist()],
        }

    return kpis, charts_data, insights
