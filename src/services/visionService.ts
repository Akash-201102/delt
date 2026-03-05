import Groq from "groq-sdk";
import { CasinoEntry } from "./casinoParsingService";

export async function extractWithVision(base64Image: string): Promise<CasinoEntry[] | null> {
    const key = import.meta.env.VITE_GROQ_API_KEY;

    if (!key || key === "your_groq_api_key_here") {
        console.error("Vision AI: Groq API key not configured.");
        return null;
    }

    const client = new Groq({ apiKey: key, dangerouslyAllowBrowser: true });

    const prompt = `You are a high-accuracy document digitizer specializing in casino table logs and Excel spreadsheets.
Your task is to extract EVERY row of player activity from the provided image.

COMPULSORY COLUMNS TO FIND:
1. playerName: The full name of the player.
2. timeIn: The clock-in time (e.g., 10:45 AM, 22:30).
3. tableNo: The table number or ID.
4. rupees: The buy-in or amount (numeric values only).
5. timeOut: The clock-out time (if present, else "").

EXTRACTION RULES:
- Scrutinize the image for rows. If it looks like a table or Excel sheet, extract every single filled row.
- Be aggressive: If the text is slightly blurry, use your intelligence to determine the most likely name/number.
- Do NOT skip rows because they are messy.
- Return a JSON object with this structure:
{
  "entries": [
    {
      "playerName": "...",
      "timeIn": "...",
      "tableNo": "...",
      "rupees": "...",
      "timeOut": "..."
    }
  ]
}`;

    // Try both models for best results
    const models = ["llama-3.2-11b-vision-preview", "llama-3.2-90b-vision-preview"];

    for (const model of models) {
        try {
            console.log(`Vision AI: Attempting extraction with ${model}...`);
            const response = await client.chat.completions.create({
                model: model,
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`,
                                },
                            },
                        ],
                    },
                ],
                temperature: 0,
                max_tokens: 4096,
                response_format: { type: "json_object" },
            });

            const content = response.choices[0]?.message?.content ?? "";
            console.log(`Vision AI (${model}) raw response:`, content);

            if (!content || content === "{}") continue;

            try {
                const parsed = JSON.parse(content);
                const result = (parsed.entries || (parsed.playerName ? [parsed] : [])) as CasinoEntry[];

                if (result.length > 0) {
                    console.log(`Vision AI: Successfully extracted ${result.length} entries.`);
                    return result;
                }
            } catch (pError) {
                console.warn(`Vision AI: Failed to parse JSON from ${model}:`, pError);
            }
        } catch (error: any) {
            console.warn(`Vision AI: Model ${model} failed:`, error.message);
            if (error.message?.includes("rate") || error.message?.includes("429")) {
                continue; // Try next model
            }
        }
    }

    console.error("Vision AI: All attempts failed.");
    return null;
}
