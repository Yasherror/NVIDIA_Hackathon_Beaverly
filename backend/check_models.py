from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(
    base_url=os.getenv("NEBIUS_BASE_URL", "https://api.studio.nebius.ai/v1/"),
    api_key=os.getenv("NEBIUS_API_KEY")
)
try:
    models = client.models.list().data
    print("AVAILABLE MODELS:")
    for m in models:
        print(m.id)
except Exception as e:
    print("ERROR:", e)
