import os
import io
import base64
import json
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
from groq import Groq
from dotenv import load_dotenv

# Construct absolute path to .env file in the parent directory
base_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(base_dir, "..", ".env")
load_dotenv(dotenv_path=dotenv_path)

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TableData(BaseModel):
    headers: List[str]
    rows: List[List[str]]

@app.post("/extract-table")
async def extract_table(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        base64_image = base64.b64encode(contents).decode("utf-8")
        
        api_key = os.getenv("VITE_GROQ_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Groq API key not found in .env")
            
        client = Groq(api_key=api_key)
        
        prompt = """
        You are a world-class document digitizer. Analyze the provided image (bill, log, table, or handwritten note) and extract all data into a structured grid format.

        EXTRACTION RULES:
        1. Identify the logical "columns" based on the data types (e.g., Date, Description, Amount, Quantity).
        2. Extract every single row of data found in the image.
        3. Even if it's not a formal table (like a bill), interpret the text into a logical row/column structure.
        4. Be extremely precise with numbers, symbols, and dates.
        5. If a cell is empty or unclear, use an empty string "".

        OUTPUT FORMAT:
        Return a JSON object with this EXACT structure:
        {
          "headers": ["Col1", "Col2", ...],
          "rows": [
            ["Row1Col1", "Row1Col2", ...],
            ["Row2Col1", "Row2Col2", ...],
            ...
          ]
        }
        Return ONLY the JSON object. Do not include any text before or after.
        """
        
        # Use a high-quality vision model
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            response_format={"type": "json_object"},
        )
        
        content = response.choices[0].message.content
        return json.loads(content)
        
    except Exception as e:
        print(f"Extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/export-excel")
async def export_excel(data: TableData):
    try:
        # Create DataFrame
        df = pd.DataFrame(data.rows, columns=data.headers)
        
        # Save to buffer
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Extracted Data')
        
        output.seek(0)
        
        headers = {
            'Content-Disposition': 'attachment; filename="extracted_table.xlsx"'
        }
        
        return StreamingResponse(
            output, 
            headers=headers,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        
    except Exception as e:
        print(f"Export error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
