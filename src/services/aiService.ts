import Groq from "groq-sdk";
import type { ParsedEntry } from "./parsingService";

export async function extractWithAi(rawText: string): Promise<ParsedEntry | null> {
    const key = import.meta.env.VITE_GROQ_API_KEY;

    if (!key || key === "your_groq_api_key_here") {
        console.warn("Groq API key not configured.");
        return null;
    }

    const client = new Groq({ apiKey: key, dangerouslyAllowBrowser: true });

    const prompt = `You are an expert at reading noisy OCR text from scanned invoices and forms.
The text below was extracted by an OCR engine and may contain errors, garbled characters, or missing spaces.
Do your best to identify the key fields. If a field is genuinely not present, use an empty string "".
Never use the word "Unknown" — use "" instead for missing values.

Required JSON structure (return ONLY this JSON, no other text):
{
  "name": "Vendor or company name (e.g. East Repair Inc.)",
  "date": "Date in DD/MM/YYYY format",
  "items": [{ "description": "item description", "price": "12.50" }],
  "total": "final total amount as a number string e.g. 154.06"
}

OCR Text (may be noisy):
${rawText}`;

    console.log("=== TEXT SENT TO GROQ ===", rawText.substring(0, 500));

    // Models to try in order (all free on Groq)
    const models = [
        "llama-3.3-70b-versatile",  // most capable, best accuracy
        "llama-3.1-8b-instant",     // fast fallback
        "gemma2-9b-it",             // google gemma fallback
    ];

    for (const model of models) {
        try {
            console.log(`Trying Groq model: ${model}`);
            const response = await client.chat.completions.create({
                model,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1,  // low temp = more deterministic/accurate 
                max_tokens: 1024,
                response_format: { type: "json_object" },
            });

            const text = response.choices[0]?.message?.content ?? "";
            console.log("Groq response:", text);

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]) as ParsedEntry;
                console.log(`Success with Groq model: ${model}`);
                return parsed;
            }
        } catch (error: any) {
            console.warn(`Groq model ${model} failed:`, error.message);
            // On rate limit (429), try next model; on auth error stop
            if (!error.message?.includes("429") && !error.message?.includes("rate") && !error.message?.includes("limit")) {
                break;
            }
        }
    }

    return null;
}
