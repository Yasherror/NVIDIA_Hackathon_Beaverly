# Beaverly — Product Requirement Document (PRD)

**Product:** Beaverly  
**Mascot:** Barry the Beaver  
**Hackathon Track:** Personal AI  
**Target Users:** Solo Legal Practitioners / Boutique Law Firms  
**Core Technologies:** Hermes Agent + NVIDIA OpenShell + NVIDIA Nemotron + Nebius Token Factory + Nebius Serverless Jobs  
**Version:** v7.0 (Final Integrated Edition)  

---

## 1. One-Sentence Definition

> **Beaverly is a local-first, private personal AI legal copilot that progressively adapts to an attorney's personalized drafting habits while strictly discerning what can be remembered globally versus what must remain confined to an individual client matter.**

* Standard AI: *"Tell me what you need."*
* **Beaverly:** *"I learn how you work — but I know what I shouldn't remember."*

**Core Formula: `Learn → Scope → Remember → Apply → Verify`**

---

## 2. Problem Statement

### Pain Point 1: Attorneys are using AI, but they are using the wrong AI
* **Clio 2026 Legal Trends Report**: 71% of solo practitioners and 75% of boutique firms use AI. However, their primary tools are **generic consumer chatbots** (ChatGPT, Claude), not domain-specific legal systems. This introduces severe confidentiality risks and fragments daily workflows.
* **8am 2026 Legal Industry Report**: General consumer AI adoption sits at 68%, while specialized legal AI adoption is only 40%. Independent lawyers frequently take risks with consumer tools because enterprise legal suites like Harvey remain commercially inaccessible (**$1,200/attorney/month with mandatory 25–50 seat minimums**).

### Pain Point 2: Lawyers distrust generic AI outputs & citations
* **Smokeball Industry Survey**: Only 33% of lawyers feel confident in AI-generated legal research; 39% openly distrust it, and 53% harbor ethical concerns. Over 20 prominent sanctions have been handed down by courts worldwide regarding hallucinated judicial citations.

### Pain Point 3: Conflict of interest isolation is a bar licensing issue
* Information from Client A must **never** be recalled while working on a matter for Client B. This is not a personal preference—it is a non-delegable ethical red line that can result in disbarment. **ABA Formal Opinion 512** explicitly warns that submitting client data to multi-tenant generative AI tools risks involuntary disclosure and waiver of attorney-client privilege.

### Pain Point 4: Lawyers have zero time to learn complex new platforms
* 27%–33% of solo practitioners cite "finding time to learn new technology" as their single greatest adoption bottleneck. From first launch to the first verified draft, onboarding must be as frictionless as opening a basic browser tab.

---

## 3. Core Product Insight

Generic AI suffers from two fundamental contradictions in legal practice:
1. **AI does not know the lawyer well enough**: The attorney must repeatedly re-prompt formatting preferences, stylistic tone, and clause structures.
2. **AI remembers too much across clients**: If the model turns *"Party of the First Part = ABC Holdings"* into a global habit, it will contaminate work for opposing clients.

> **Beaverly's Fundamental Thesis: An AI assistant should understand the lawyer more and more over time, without ever understanding all clients collectively.**

---

## 4. Product Core: The Two-Tier Memory Architecture

```
                    Beaverly Memory Engine
                             │
              ┌──────────────┴──────────────┐
              ↓                             ↓
        Lawyer Memory                  Case Memory
   (Persistent Writing Habits)     (Matter-Specific Records)
              │                             │
    Available Across All Cases     Confined Strictly to Active Case
```

* **Lawyer Memory**: *"I prefer modern, concise contract phrasing without archaic legalese."* → Available across all client files.
* **Case Memory**: *"ABC Holdings is the primary indemnitor under Section 14.2."* → Strictly sealed within Case A.

---

## 5. MVP Feature Scope

### P0 — Mandatory Core (Delivered in Hackathon MVP)

| # | Feature | Specification |
| :--- | :--- | :--- |
| 1 | **Self-Evolving Lawyer Memory** | When counsel corrects Barry in chat, Beaverly prompts: *"Should I remember this habit for future drafting?"* and persists it as a reusable skill. |
| 2 | **Memory Scope Detection** | Automated evaluation determines whether an edit contains matter-specific identifiers → Barry asks: *"Store as Global Skill or Case-Specific Memory?"* |
| 3 | **Strict Case Privilege Isolation** | Every client matter runs within its own sealed workspace, enforced at the sandbox boundary via **NVIDIA OpenShell**. |
| 4 | **Pre-Submission Fact Verification** | Line-by-line cross-examination comparing outgoing drafts against executed vault agreements; flags discrepancies in red with clause citations and 1-click patching. |

### P1 — Post-MVP Roadmap
* Skill version trees with Git-style diff inspection and instant rollback.
* Zero-Leak memory destruction and cryptographic audit certification upon case closure.
* High-concurrency batch contract ingestion via Nebius Token Factory embedding endpoints.

### P2 — Future Explorations
* Full offline edge deployment on quantized local TensorRT-LLM weights.
* Multi-jurisdiction compliance packs (California, New York, UK SRA).

---

## 6. Core Scoping Decision Logic

```
Attorneys Submits Drafting Correction
                 │
                 ↓
      Is the correction reusable?
             /        \
           No          Yes
           ↓            ↓
      Do not save   Check Scope
                        │
                        ↓
             Contains case identifiers?
                    /        \
                  Yes         No
                  ↓            ↓
              Case Memory  Global Skill
```

This decision loop bridges the self-learning engine and the ethical wall, ensuring zero cross-matter contamination.

---

## 7. Why NVIDIA OpenShell Enforcement is Mandatory

Ethical isolation cannot rely on fragile application-level logic (e.g., `if current_case == case_A: allow()`). Autonomous agents can be tricked via prompt injection, hallucinated tool calls, or rogue file path requests.

```
Hermes Agent Runtime → NVIDIA OpenShell Boundary → Policy Enforcement
```

OpenShell enforces policy at the **operating system and filesystem kernel layer**, strictly restricting what the agent can read and where network traffic can travel:
* **The agent has zero technical permission to move data outside its sandbox unless explicitly authorized by the security policy.**
* **Beaverly's Security Philosophy:** Do not merely instruct the AI what it *should not* do—enforce at the boundary what it is *physically permitted* to do.

---

## 8. Competitive Landscape & Differentiation

| Platform | Core Capability | Key Limitation | Accessibility |
| :--- | :--- | :--- | :--- |
| **Harvey II** | Learns attorney style; ethical walls | Cloud SaaS; \$1,200/mo, 25–50 seat minimum | Inaccessible to solos |
| **August Personas** | Client/matter-level memory | Cloud multi-tenant SaaS for large law firms | Subscription required |
| **Elephas** | Local Mac runner; per-case isolation | Generic AI; does not learn habits dynamically | Accessible but limited |
| **Clearbrief** | Judicial citation verification | Verifies public caselaw; cannot audit private executed vaults | Partially accessible |
| **Beaverly** | **Self-learning habits + OpenShell ethical wall + executed vault verification** | **Designed specifically for independent solo practitioners** | **Fully open-source & accessible** |

### Why not Harvey?
Harvey is commercially inaccessible to boutique attorneys (\$1,200/month/lawyer with 25–50 seat minimums). Furthermore, Harvey's ethical walls operate at the application layer, whereas Beaverly enforces isolation at the **OpenShell container boundary layer**.

### Why not standard ChatGPT?
Consumer chatbots transmit confidential client data off-premises, violating ABA Formal Opinion 512. They lack private RAG verification, and their memory models are global and cannot isolate matter records.

---

## 9. Unique Value Proposition

| Capability | Harvey | August | Elephas | Beaverly |
| :--- | :---: | :---: | :---: | :---: |
| Self-Learning Drafting Habits | ✅ | ✅ | ❌ | ✅ |
| Matter-Specific Memory Scoping | Roadmap | ✅ | ✅ | ✅ |
| Infrastructure-Enforced Ethical Walls | ❌ | ❌ | ❌ | ✅ |
| Pre-Submission Verification against Private Vaults | ❌ | ❌ | ❌ | ✅ |
| Independent Self-Deployment by Solo Attorneys | ❌ | ❌ | ✅ | ✅ |

> **Everything Harvey can do, Beaverly delivers. What Beaverly guarantees, Harvey cannot match—because data remains under counsel's absolute sovereign control.**

---

## 10. Technical Architecture

```
                           ATTORNEY
                              │
                              ↓
                      Beaverly UI (React)
                              │
                      Hermes Agent Engine
                              │
                 ┌────────────┴────────────┐
                 ↓                         ↓
           Memory Manager            Tool Manager
                 │
                 ↓
        Memory Scope Check (Nemotron Nano 30B)
                 │
                 ↓
        NVIDIA OpenShell Security Boundary
                 │
        ┌────────┴────────┐
        ↓                 ↓
   Local Files       Allowed APIs (Nebius Token Factory)
        │                 │
        ↓                 ↓
    Matter RAG      Nemotron Super 120B / Ultra 550B
   (LanceDB)              │
        │                 │
        └────────┬────────┘
                 ↓
        Draft Generation / Fact Audit
                 │
                 ↓
    Pre-Submission Verification Studio
                 │
                 ↓
             ATTORNEY
```

### Infrastructure Component Mapping

| Technology | Architectural Role |
| :--- | :--- |
| **Hermes Agent** | Agent runtime, skill discovery, and multi-step reasoning. |
| **NVIDIA Nemotron-3-Nano (30B)** | High-speed intent classification, habit detection, and memory scoping (<300ms). |
| **NVIDIA Nemotron-3-Super (120B)** | Primary legal reasoning engine for drafting, contract cross-examination, and fact verification. |
| **NVIDIA Nemotron-3-Ultra (550B)** | Frontier fallback for multi-hop statutory disputes and cross-jurisdictional choice-of-law conflicts. |
| **NVIDIA OpenShell** | Kernel-level sandbox boundary enforcing matter privilege and preventing cross-case leakage. |
| **NemoClaw** | Reference deployment blueprint packaging OpenShell, Hermes, and Nemotron. |
| **Nebius Token Factory** | High-throughput serverless inference API and parallel batch embeddings (`Qwen3-Embedding-8B`). |
| **LanceDB** | Embedded, serverless vector database providing isolated per-matter vector partitions. |
| **SQLite** | Relational metadata store for habit versioning, audit certificates, and matter records. |

---

## 11. Settings Architecture (Zero Administrative Overhead)

Beaverly requires **no dedicated admin console**. The attorney is both the sole user and the system administrator. All controls are centralized in the top-right **Settings (⚙️)** panel:

* **API Key Management**: Secure client-side configuration for Nebius Token Factory.
* **Security & Privacy Policies**: Clear, plain-language toggles (*"Restrict access strictly to active matter"* and *"Enforce zero external data sharing"* enabled by default).
* **Model Matrix Routing**: Transparent oversight of Nano 30B, Super 120B, and Ultra 550B model assignments.
* **Local Data Residency**: Visual confirmation of local filesystem and vector storage paths.
* **Export Audit Record**: 1-click export of the **Protection Record** for Delaware Bar ethical compliance.

---

## 12. Success Criteria & Verification Goals

The Hackathon MVP validates four primary capabilities:
1. **Can Beaverly Learn?** When an attorney corrects phrasing, future outputs faithfully reflect the preference.
2. **Can Beaverly Scope?** Global writing skills and matter-specific factual records are properly partitioned without user confusion.
3. **Can Beaverly Enforce?** Information from Matter A cannot be accessed or leaked when operating inside Matter B under any adversarial prompt attempt.
4. **Can Beaverly Verify?** The Verification Studio accurately catches planted date mismatches (e.g., 2026 vs. 2019) and corporate entity misnomers (*Belicum* vs. *Bellicum*), citing verified clauses.

---

## 13. Non-Goals (What Beaverly Intentionally Avoids)

* ❌ Not a generic case law search engine (e.g., Lexis/Westlaw competitor).
* ❌ Does not dispense unassisted, autonomous legal opinions.
* ❌ Does not file court pleadings automatically.
* ❌ Does not make speculative claims of "100% unbreakable security" without verified cryptographic audits.

**Beaverly is an expert legal AI assistant, not an autonomous lawyer.**

---

## 14. Final Product Positioning

> **Beaverly: The AI that learns how you work — without learning what it shouldn't.**

A self-evolving Personal AI legal copilot for independent counsel providing:
* 🧠 **Personalized In-Chat Learning**: Progressively masters the attorney's drafting style.
* 🔒 **Cryptographic Memory Boundaries**: Cleanly separates reusable skills from privileged client facts.
* 🛡️ **Kernel-Enforced Isolation**: NVIDIA OpenShell actively prevents cross-matter breaches.
* 🔍 **Pre-Submission Fact Verification**: Clause-level contract corroboration before documents leave the firm.

**Personal AI + Persistent Memory + Ethical Boundaries + Agentic Security**
