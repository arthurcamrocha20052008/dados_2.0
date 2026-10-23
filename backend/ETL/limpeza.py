import re
import numpy as np
import pandas as pd

EXCEL_ERRORS = {
    "#DIV/0!", "#VALOR!", "#VALUE!", "#REF!", "#N/D", "#N/A",
    "#NAME?", "#NOME?", "#NUM!", "#NULL!", "#NULO!", "#ERRO!",
    "N/A", "NULL", "NONE", "NAN", "-"
}


def _converter_serie_numerica(serie: pd.Series) -> pd.Series:
    """Converte strings numéricas/monetárias (BR ou US) para float de forma segura."""
    def parse_val(val):
        if pd.isna(val):
            return np.nan
        if isinstance(val, (int, float, np.number)):
            return float(val)
        s = str(val).strip()
        if not s:
            return np.nan
        # Remove símbolos de moeda, porcentagem e espaços
        s = re.sub(r"[R\$\€\£\%\s]", "", s)
        # Caso tenha ponto e vírgula: identifica qual é o separador decimal (o último)
        if "," in s and "." in s:
            if s.rfind(",") > s.rfind("."):
                # Formato BR: 1.234,56
                s = s.replace(".", "").replace(",", ".")
            else:
                # Formato US: 1,234.56
                s = s.replace(",", "")
        elif "," in s:
            # Apenas vírgula: 1234,56 -> decimal
            s = s.replace(",", ".")
        try:
            return float(s)
        except ValueError:
            return np.nan

    return serie.apply(parse_val)


def limpar_dados_excel(df: pd.DataFrame):
    relatorio = []
    df = df.copy()

    # 0. Ajustar cabeçalho caso as primeiras linhas sejam títulos mesclados ("Unnamed")
    unnamed_ratio = sum(str(c).startswith("Unnamed") for c in df.columns) / max(len(df.columns), 1)
    if unnamed_ratio > 0.5 and len(df) > 1:
        for idx in range(min(5, len(df))):
            row_vals = df.iloc[idx].dropna()
            if len(row_vals) >= max(2, int(df.shape[1] * 0.5)):
                df.columns = [str(v).strip() if pd.notna(v) else f"Coluna_{i+1}" for i, v in enumerate(df.iloc[idx])]
                df = df.iloc[idx + 1:].reset_index(drop=True)
                relatorio.append("📋 Cabeçalho desalinhado detectado e corrigido automaticamente.")
                break

    # Padronizar nomes das colunas
    df.columns = [str(col).strip() if str(col).strip() else f"Coluna_{i+1}" for i, col in enumerate(df.columns)]

    # 1. Remover linhas e colunas totalmente vazias
    linhas_antes, cols_antes = df.shape
    df = df.dropna(how="all")
    df = df.dropna(axis=1, how="all")
    if len(df) < linhas_antes:
        relatorio.append(f"🧹 Removidas {linhas_antes - len(df)} linhas totalmente em branco.")
    if df.shape[1] < cols_antes:
        relatorio.append(f"🧹 Removidas {cols_antes - df.shape[1]} colunas totalmente vazias.")

    # 2. Limpar espaços extras e erros de fórmula do Excel (#DIV/0!, #VALOR!, etc.)
    erros_encontrados = 0
    for col in df.select_dtypes(include=["object", "string"]).columns:
        df[col] = df[col].apply(lambda x: x.strip() if isinstance(x, str) else x)
        mask_erro = df[col].apply(lambda x: str(x).upper() in EXCEL_ERRORS if pd.notna(x) else False)
        qtd_erros = int(mask_erro.sum())
        if qtd_erros > 0:
            erros_encontrados += qtd_erros
            df.loc[mask_erro, col] = np.nan

    if erros_encontrados > 0:
        relatorio.append(f"🛠️ Corrigidos {erros_encontrados} erros de fórmula/célula inválida (ex: #DIV/0!, #VALOR!, N/A).")

    # 3. Remover linhas duplicadas
    duplicadas = int(df.duplicated().sum())
    if duplicadas > 0:
        df = df.drop_duplicates().reset_index(drop=True)
        relatorio.append(f"🧹 Removidas {duplicadas} linhas duplicadas.")

    # 4. Converter textos que deveriam ser números (ex: "R$ 1.500,00", "1.234,56", "45%")
    for col in df.columns:
        if pd.api.types.is_object_dtype(df[col]) or pd.api.types.is_string_dtype(df[col]):
            amostra = df[col].dropna().astype(str).head(30)
            if len(amostra) == 0:
                continue
            parece_numero = amostra.str.contains(
                r"^(?:R\$|\$|\€)?\s*-?\d+(?:[\.,]\d+)*\s*%?$", regex=True
            ).mean()

            if parece_numero > 0.5:
                convertido = _converter_serie_numerica(df[col])
                if convertido.notnull().sum() >= 0.5 * df[col].notnull().sum():
                    df[col] = convertido
                    relatorio.append(f"🔢 Coluna '{col}' (texto formatado) convertida para número.")

    # 5. Detectar e converter colunas de data escritas como texto
    for col in df.columns:
        if pd.api.types.is_object_dtype(df[col]) or pd.api.types.is_string_dtype(df[col]):
            amostra = df[col].dropna().astype(str).head(30)
            if len(amostra) == 0:
                continue
            parece_data = amostra.str.contains(
                r"^\d{1,4}[/-]\d{1,2}[/-]\d{1,4}", regex=True
            ).mean()
            if parece_data > 0.5:
                try:
                    convertido = pd.to_datetime(df[col], dayfirst=True, errors="coerce")
                    if convertido.notnull().sum() >= 0.5 * df[col].notnull().sum():
                        df[col] = convertido
                        relatorio.append(f"📅 Coluna '{col}' reconhecida e padronizada como Data.")
                except Exception:
                    pass

    # 6. Tratar valores ausentes (NaN) com registro no relatório
    for col in df.select_dtypes(include=["number"]).columns:
        n_nulos = int(df[col].isnull().sum())
        if n_nulos > 0:
            mediana = df[col].median()
            valor_preenchimento = 0.0 if pd.isna(mediana) else float(mediana)
            df[col] = df[col].fillna(0)
            relatorio.append(
                f"⚠️ Preenchidos {n_nulos} valores vazios com '0' na coluna numérica '{col}'."
            )

    for col in df.select_dtypes(include=["object", "category", "string"]).columns:
        n_nulos = int(df[col].isnull().sum())
        if n_nulos > 0:
            df[col] = df[col].fillna("Não Informado")
            relatorio.append(
                f"⚠️ Preenchidos {n_nulos} valores vazios com 'Não Informado' na coluna '{col}'."
            )

    return df.reset_index(drop=True), relatorio
