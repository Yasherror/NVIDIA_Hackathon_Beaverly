import asyncio
from models.nebius_client import get_embedding, chat_completion
from memory.lancedb_store import search_chunks
from config import settings

async def main():
    case_id = "case-8b0bb87e"
    # A draft clause that deliberately has errors:
    # 1. Salary claims $300,000 (actual is $420,000)
    # 2. Term claims ends on December 31, 2020 (actual is May 31, 2016)
    draft_clause = "The employee Ed Holloway shall receive an annual base salary of $300,000, and the term of employment shall end on December 31, 2020."
    
    print(f"Draft to verify against real contract:\n\"{draft_clause}\"\n")
    print("1. Generating query embedding via Nebius Qwen3-Embedding-8B...")
    q_vec = await get_embedding(draft_clause)
    
    print("2. Searching LanceDB case_case-8b0bb87e for closest clauses...")
    chunks = search_chunks(case_id, q_vec, top_k=3)
    print(f"Found {len(chunks)} relevant chunks from contract:")
    for i, c in enumerate(chunks):
        print(f"[{c['doc_name']}, p.{c['page']}]: {c['chunk'][:200]}...\n")

    facts = "\n\n".join([f"[{c['doc_name']}, Page {c['page']}]: {c['chunk']}" for c in chunks])
    
    prompt = f"""You are Beaverly's real legal fact verifier. Compare this draft clause against the retrieved contract text.
Draft clause: "{draft_clause}"

Retrieved Contract Text:
{facts}

Identify factual contradictions (dates, salary/money amounts, party names).
Return JSON with mismatches (draft_value, correct_value, source_doc, explanation)."""

    print("3. Reasoning with NVIDIA Nemotron Super 120B...")
    res = await chat_completion(
        messages=[{"role": "user", "content": prompt}],
        model=settings.model_super,
        temperature=0.1
    )
    print("\n=== Nemotron Super Verification Output ===")
    print(res)

if __name__ == "__main__":
    asyncio.run(main())
