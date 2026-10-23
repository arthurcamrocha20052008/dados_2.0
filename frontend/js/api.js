const BASE_URL = "http://localhost:8000/api";

export async function uploadExcelFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch(`${BASE_URL}/upload`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Erro na comunicação com o servidor.");
        }

        return await response.json();
    } catch (error) {
        console.error("Erro na API:", error);
        return { success: false, error: error.message };
    }
}

export async function fetchDemoData() {
    try {
        const response = await fetch(`${BASE_URL}/demo`, {
            method: "POST"
        });
        if (!response.ok) {
            throw new Error("Erro ao carregar planilha de demonstração.");
        }
        return await response.json();
    } catch (error) {
        console.error("Erro na Demo API:", error);
        return { success: false, error: error.message };
    }
}

export function getDownloadLimpoUrl() {
    return `${BASE_URL}/download-limpo`;
}
