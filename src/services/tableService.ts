const API_URL = (
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000"
).replace(/\/$/, "");

export interface TableData {
    headers: string[];
    rows: string[][];
}

const parseErrorResponse = async (response: Response): Promise<string> => {
    try {
        const data = await response.json();
        if (data?.detail) return data.detail;
        if (data?.message) return data.message;
    } catch {
        // Ignore JSON parse errors and fallback to plain text/status message
    }

    try {
        const text = await response.text();
        if (text) return text;
    } catch {
        // Ignore text parse errors
    }

    return `Request failed with status ${response.status}`;
};

const request = async (endpoint: string, init: RequestInit): Promise<Response> => {
    try {
        return await fetch(`${API_URL}${endpoint}`, init);
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error(
                `Cannot connect to backend at ${API_URL}. Start the FastAPI server and ensure the URL is correct.`
            );
        }
        throw error;
    }
};

export const tableService = {
    async extractTable(file: File): Promise<TableData> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await request("/extract-table", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(await parseErrorResponse(response));
        }

        return response.json();
    },

    async exportExcel(data: TableData): Promise<void> {
        const response = await request("/export-excel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(await parseErrorResponse(response));
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "extracted_table.xlsx";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },
};
