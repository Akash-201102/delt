import type { ParsedEntry } from "./parsingService";

export interface CasinoEntry {
  playerName: string;
  timeIn: string;
  tableNo: string;
  rupees: string;
  timeOut: string;
}

export async function extractCasinoDataWithAi(rawText: string): Promise<CasinoEntry | null> {
    const key = import.meta.env.VITE_GROQ_API_KEY;

    if (!key || key === "your_groq_api_key_here") {
        console.warn("Groq API key not configured.");
        return null;
    }

    const Groq = (await import("groq-sdk")).default;
    const client = new Groq({ apiKey: key, dangerouslyAllowBrowser: true });

    const prompt = `You are an expert at reading noisy OCR text from casino entry forms.
The text below was extracted by an OCR engine and may contain errors, garbled characters, or missing spaces.
Do your best to identify the key fields for casino entries. If a field is genuinely not present, use an empty string "".
Never use the word "Unknown" — use "" instead for missing values.

Required JSON structure (return ONLY this JSON, no other text):
{
  "playerName": "player's full name",
  "timeIn": "time in format like 09:15 AM or 14:30",
  "tableNo": "table number as string",
  "rupees": "amount as string like 5000",
  "timeOut": "time out format like 11:45 AM or 16:30"
}

OCR Text (may be noisy):
${rawText}`;

    console.log("=== CASINO TEXT SENT TO GROQ ===", rawText.substring(0, 500));

    const models = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant", 
        "gemma2-9b-it",
    ];

    for (const model of models) {
        try {
            console.log(`Trying Groq model for casino: ${model}`);
            const response = await client.chat.completions.create({
                model,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1,
                max_tokens: 1024,
                response_format: { type: "json_object" },
            });

            const text = response.choices[0]?.message?.content ?? "";
            console.log("Groq casino response:", text);

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]) as CasinoEntry;
                console.log(`Success with Groq casino model: ${model}`);
                return parsed;
            }
        } catch (error: any) {
            console.warn(`Groq casino model ${model} failed:`, error.message);
            if (!error.message?.includes("429") && !error.message?.includes("rate") && !error.message?.includes("limit")) {
                break;
            }
        }
    }

    return null;
}

export function parseCasinoOcrText(rawText: string): CasinoEntry {
    const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const result: CasinoEntry = {
        playerName: "",
        timeIn: "",
        tableNo: "",
        rupees: "",
        timeOut: ""
    };

    // Simple regex-based parsing for casino entries
    for (const line of lines) {
        // Player name (usually first word or before "Time In")
        const nameMatch = line.match(/^([A-Za-z\s]+?)(?=\s+(Time\s*In|\d{1,2}:\d{2}|Table))/i);
        if (nameMatch && !result.playerName) {
            result.playerName = nameMatch[1].trim();
        }

        // Time patterns
        const timeMatch = line.match(/(\d{1,2}:\d{2}\s*(AM|PM)?)|(\d{1,2}:\d{2})/i);
        if (timeMatch) {
            const time = timeMatch[0];
            if (!result.timeIn) {
                result.timeIn = time;
            } else if (!result.timeOut) {
                result.timeOut = time;
            }
        }

        // Table number
        const tableMatch = line.match(/(?:Table\s*No\.?|Table)\s*(\d+)/i);
        if (tableMatch && !result.tableNo) {
            result.tableNo = tableMatch[1];
        }

        // Rupees/amount
        const rupeeMatch = line.match(/(\d+(?:,\d{3})*(?:\.\d{2})?)/);
        if (rupeeMatch && !result.rupees) {
            result.rupees = rupeeMatch[1].replace(/,/g, '');
        }
    }

    return result;
}
