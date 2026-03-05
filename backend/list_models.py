import os
from groq import Groq
from dotenv import load_dotenv

# Load .env from parent dir
base_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(base_dir, "..", ".env")
load_dotenv(dotenv_path=dotenv_path)

api_key = os.getenv("VITE_GROQ_API_KEY")
if not api_key:
    print("API key not found")
    exit(1)

client = Groq(api_key=api_key)
try:
    models = client.models.list()
    for model in models.data:
        print(model.id)
except Exception as e:
    print(f"Error: {e}")
