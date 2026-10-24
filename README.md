# Beaverly 🦫

> **"Beaverly learns how you work — without learning what it shouldn't."**  
> *A locally-hosted, private AI assistant with persistent lawyer memory and kernel-enforced case isolation.*

- **Product:** Beaverly
- **Mascot:** Barry the Beaver
- **Track:** Personal AI
- **Target Users:** Solo-practice lawyers / small law firms
- **Version:** v7.0 (Final Integrated Version)
- **Core Formula:** `Learn → Scope → Remember → Apply → Verify`

---

## 🏛️ Why Beaverly?

| Pain Point | General AI (ChatGPT/Claude) | Enterprise Legal AI (Harvey II) | **Beaverly** |
| :--- | :--- | :--- | :--- |
| **Personal Style Learning** | ❌ None across sessions | ✅ Learns firm style | ✅ **Hermes Agent self-evolving habit memory** |
| **Matter Isolation** | ❌ Global memory leak risk | ⚠️ App-layer filters | 🛡️ **Kernel-enforced OpenShell eBPF sandbox** |
| **Cost & Accessibility** | ~$20/mo (Not legal-safe) | $1,200/mo (25-50 seat min) | 🚀 **Free & open source, self-deployable** |
| **Pre-Submission Audit** | ❌ Hallucination prone | ⚠️ Public citations only | 🔍 **Private case file verification (dates/amounts)** |
| **Data Privacy** | ❌ Leaves machine | ❌ Cloud SaaS multi-tenant | 🔒 **100% physically sandboxed on local device** |

---

## ⚡ Core P0 Features (PRD v7.0)

1. **Self-Evolving Lawyer Memory**
   - Lawyer corrects AI drafts. Hermes Agent detects recurring patterns (3x threshold) via Nemotron Nano.
   - Beaverly proactively asks: *"Should I always do this from now on across all cases?"*
   - Once confirmed, persisted as a Global Skill and automatically applied to future outputs.

2. **Memory Scope Detection (NER)**
   - Distinguishes between global style habits (e.g., plain English clause simplification) and confidential case entities (e.g., `"Change Party A to ABC Holdings"`).
   - Prompts lawyer: *"Contains case-specific entity. Store only in this matter or Global memory?"*

3. **Strict Case Isolation (OpenShell Kernel Sandbox)**
   - Independent data space per matter, strictly enforced at the Linux LSM / eBPF kernel layer (`security_file_open()`).
   - Cross-case read attempts are immediately blocked: `❌ DENIED` and logged to the local **Protection Record**.
   - When switching to Case B and asking *"Who is Party A?"*, Beaverly strictly returns: *"This case doesn't have that information."*

4. **Pre-Submission Fact Verification**
   - Scans drafts line-by-line against master executed case records using LanceDB RAG and Nemotron Super.
   - Flags factual mismatches (e.g., draft says **21 March 2025** vs executed contract **12 March 2025**) in prominent red with exact source citations (`Employment_Agreement.pdf, §4.2`).
   - Long documents batch-processed in background via Nebius Serverless Jobs.

---

## ⏱️ 3-Minute Demo Storyline (PRD Section 12)

| Time | Scenario | Purpose |
| :--- | :--- | :--- |
| **0:00–0:30** | Lawyer teaches Beaverly a habit (`"party of the first part"` → `"client"`) → Global skill created | **Proves it learns** |
| **0:30–1:00** | Lawyer says in Case A, `"Change Party A to ABC Holdings"` → Beaverly detects case entity → Asks *"Store only in Case A?"* | **Proves it knows boundaries** |
| **1:00–1:30** | Switch to Case B → Ask *"Who is Party A?"* → Beaverly: *"This case doesn't have that information."* | **Proves isolation works** |
| **1:30–2:00** | Agent attempts to read Case A files from Case B → OpenShell: **❌ DENIED** | **Proves kernel-level blocking** |
| **2:00–2:40** | Draft document → Beaverly finds draft date **21 March** vs case file **12 March** → Highlights in red + source | **Proves it verifies** |
| **2:40–3:00** | Wrap-up: *"Beaverly learns how you work — without learning what it shouldn't."* | **Memorable takeaway** |

---

## 🛠️ Technology Architecture

- **Agent Runtime:** Hermes Agent
- **Lightweight Reasoning & Scope Check:** NVIDIA Nemotron Nano (`nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`)
- **Primary Reasoning & Verification:** NVIDIA Nemotron Super (`nvidia/nemotron-3-super-120b-a12b`)
- **Fallback Reasoning:** NVIDIA Nemotron Ultra (`nvidia/Nemotron-3-Ultra-550b-a55b`)
- **Container Sandbox & Kernel Enforcement:** NVIDIA OpenShell
- **Inference & Rerank:** Nebius Token Factory
- **Background Batch Processing:** Nebius Serverless Jobs
- **Vector Storage:** LanceDB Local Embedded
- **Relational Storage:** SQLite (`beaverly.db`)
- **Deployment Blueprint:** Compatible with NVIDIA NemoClaw blueprint

---

## 🚀 Quick Start

### 1. Launch Everything with 1 Click
Double click `start.bat` in the project root:
```bat
start.bat
```
This automatically starts:
- **FastAPI Backend:** `http://localhost:8000`
- **React Frontend:** `http://localhost:5173`

### 2. Manual Launch (if preferred)
**Backend:**
```bash
cd backend
.\.venv312\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
npm run dev
```

---

## 📋 Hackathon Compliance Checklist

- [x] **Runs on Nebius Token Factory / AI Cloud:** Active Nebius connection verified.
- [x] **At least one NVIDIA open-source model:** Nemotron Nano, Nemotron Super, Nemotron Ultra.
- [x] **Always-on, private assistant:** Local-first, persistently learning.
- [x] **Data under your control:** Zero cloud telemetry; stored on local machine.
- [x] **Persistent memory:** Global Lawyer Memory + Case-Specific Memory.
- [x] **Reusable skills:** Hermes Agent self-generated skills library.
- [x] **OpenShell Security Enforcement:** eBPF kernel isolation and audit logging.
- [x] **Pre-Submission Verification:** Compares drafts vs case records with red highlight and citations.
