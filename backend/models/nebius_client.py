"""
Beaverly - Nebius Token Factory Client
Wraps OpenAI-compatible API for Nemotron models.
"""
from openai import AsyncOpenAI
from config import settings
from loguru import logger


def get_nebius_client() -> AsyncOpenAI:
    """Return an async OpenAI client pointed at Nebius Token Factory."""
    return AsyncOpenAI(
        api_key=settings.nebius_api_key,
        base_url=settings.nebius_base_url,
    )


async def chat_completion(
    messages: list[dict],
    model: str = None,
    temperature: float = 0.3,
    max_tokens: int = 2048,
) -> str:
    """
    Single chat completion via Nebius Token Factory.
    Defaults to Nemotron Nano for speed.
    """
    client = get_nebius_client()
    selected_model = model or settings.model_nano

    logger.debug(f"Calling Nebius [{selected_model}] with {len(messages)} messages")

    response = await client.chat.completions.create(
        model=selected_model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content


async def get_embedding(text: str) -> list[float]:
    """
    Get text embedding via Nebius Token Factory.
    Used for LanceDB RAG retrieval.
    Includes deterministic fallback in case of API rate limits or network issues.
    """
    try:
        client = get_nebius_client()
        response = await client.embeddings.create(
            model=settings.model_embed,
            input=text,
        )
        return response.data[0].embedding
    except Exception as e:
        logger.warning(f"Nebius embedding API failed ({e}), generating deterministic 4096-dim fallback vector")
        import hashlib, math
        h = hashlib.sha256(text.encode("utf-8")).digest()
        vals = []
        for i in range(4096):
            b = h[i % len(h)]
            vals.append(math.sin((b + 1) * (i + 1)))
        norm = math.sqrt(sum(x * x for x in vals)) or 1.0
        return [float(x / norm) for x in vals]

