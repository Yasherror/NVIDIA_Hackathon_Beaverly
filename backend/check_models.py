import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

base_url = os.getenv("NEBIUS_BASE_URL", "https://api.tokenfactory.nebius.com/v1/")
api_key = os.getenv("NEBIUS_API_KEY")

print(f"Connecting to base_url: {base_url}")
print(f"API Key configured: {bool(api_key)}")

client = OpenAI(
    base_url=base_url,
    api_key=api_key,
)

try:
    models = client.models.list().data
    print(f"SUCCESS: Connected! Found {len(models)} models available:")
    for m in models[:10]:
        print(f" - {m.id}")
except Exception as e:
    print(f"CONNECTION ERROR: {e}")
