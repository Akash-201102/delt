# Casino Entry Digitizer Training Setup

## Overview
This setup allows you to train your AI model to recognize and extract casino entry data from forms.

## Training Options

### Option 1: Folder-based Training (Recommended)
1. Create a `training-data/` folder in your project root
2. Add sample casino entry forms/images with this structure:
   ```
   training-data/
   ├── images/
   │   ├── entry1.jpg
   │   ├── entry2.png
   │   └── ...
   └── annotations/
       ├── entry1.json
       ├── entry2.json
       └── ...
   ```

3. Each annotation file should contain:
   ```json
   {
     "playerName": "Rahul",
     "timeIn": "09:15 AM",
     "tableNo": "5",
     "rupees": "5000",
     "timeOut": "11:45 AM"
   }
   ```

### Option 2: Camera-based Training
Use the built-in camera capture to:
1. Take photos of real casino entry forms
2. Review and correct the AI extraction
3. Save corrected data to improve future accuracy

## Database Setup
Add this SQL to your Supabase database:

```sql
CREATE TABLE casino_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT,
  time_in TEXT,
  table_no TEXT,
  rupees TEXT,
  time_out TEXT,
  raw_ocr_text TEXT,
  confidence NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Usage
1. Navigate to `/casino` in your app
2. Choose "Open Camera" or "Upload from Folder"
3. Capture/upload casino entry forms
4. AI will extract the data automatically
5. Review and edit if needed
6. Save to database

## AI Model Training
The system uses Groq AI with these models (in order):
1. `llama-3.3-70b-versatile` (most accurate)
2. `llama-3.1-8b-instant` (fast fallback)
3. `gemma2-9b-it` (Google fallback)

## Environment Variables
Add to your `.env` file:
```
VITE_GROQ_API_KEY=your_groq_api_key_here
```

## Tips for Best Results
- Use clear, well-lit images
- Ensure forms are flat and not skewed
- Use consistent formatting for training data
- Review and correct AI extractions to improve accuracy over time
