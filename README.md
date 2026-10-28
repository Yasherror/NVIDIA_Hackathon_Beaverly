# Beaverly 🦫

<div align="center">

**"Learn how you work — without learning what you shouldn't."**

*A private, always-on Personal AI legal copilot with persistent lawyer memory, ethical wall matter isolation, and pre-submission citation verification.*

[![Hackathon Track](https://img.shields.io/badge/Hackathon_Track-Personal_AI-7C3AED.svg)](https://nebiusglobalaihackathon.devpost.com/)
[![Inference](https://img.shields.io/badge/Inference-Nebius_Token_Factory-00E599.svg)](https://nebius.com/token-factory)
[![Models](https://img.shields.io/badge/Models-NVIDIA_Nemotron_Family-76B900.svg)](https://huggingface.co/nvidia)
[![Security](https://img.shields.io/badge/Security-NVIDIA_OpenShell_Sandbox-1E40AF.svg)](https://github.com/NVIDIA/OpenShell)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Build-Passing_100%25-brightgreen.svg)]()

[Live Working Demo](#-live-working-demo--testing-instructions) • [Video Walkthrough](#-3-minute-demonstration-storyline) • [Architecture](#-system-architecture) • [Getting Started](#-quick-start--deployment) • [Nebius & NVIDIA Feedback](#-feedback-on-nebius--nvidia-technologies)

</div>

---

## 📌 Executive Summary & Problem Space

According to the **Clio Legal Trends Report**, **71%** of solo and boutique practitioners now utilize generative AI in their daily practice, yet over **75%** rely on generic consumer chatbots (ChatGPT, Claude). This creates severe legal ethics hazards:

1. **Catastrophic Confidentiality Leaks (ABA Formal Opinion 512)**: Generic LLMs lack client matter boundaries. Confidential settlement thresholds or trade secrets learned in Matter A can inadvertently surface in Matter B, causing irreversible conflicts of interest.
2. **The "Enterprise Legal Tech" Barrier**: Enterprise legal AI platforms (e.g., Harvey, Casetext CoCounsel) command **\$1,200/attorney/month with 25–50 seat minimums**, effectively pricing out 80% of practicing solo attorneys.
3. **Repetitive Prompt Fatigue**: Standard AI forgets personal drafting styles between sessions. Attorneys waste 20+ minutes per document re-typing boilerplate preferences, jurisdictional standards, and tone constraints.

**Beaverly solves this.** Built specifically for the **Personal AI Track** of the **Nebius x NVIDIA Global AI Hackathon**, Beaverly operates on a private, local-first architecture combining **NVIDIA Nemotron models via Nebius Token Factory**, **Hermes Agent runtime**, and **NVIDIA OpenShell kernel-enforced sandboxing**.

---

## ⚖️ How Beaverly Compares

| Evaluation Dimension | Generic Consumer AI (ChatGPT/Claude) | Enterprise Legal AI (Harvey / CoCounsel) | **Beaverly (Personal AI)** |
| :--- | :--- | :--- | :--- |
| **Personal Style Learning** | ❌ None across sessions | ⚠️ Firm-wide only | ✅ **Self-evolving lawyer memory & playbook** |
| **Matter Separation** | ❌ Global memory leak hazard | ⚠️ Application-layer regex filters | ✅ **OpenShell-isolated per-case vaults** |
| **Cost & Accessibility** | ~$20/mo (Violates ABA Rule 1.6) | $1,200/mo (25–50 seat minimum) | ✅ **100% Open Source & Self-Deployable** |
| **Fact Verification** | ❌ Frequent hallucinations | ⚠️ Public caselaw citations only | ✅ **Private contract clause cross-referencer** |
| **Case Closure Lifecycle** | ❌ Old client data stays in cache | ⚠️ Complex manual retention policies | ✅ **1-Click "Zero-Leak" memory destruction** |
| **Formal Output** | ⚠️ Raw markdown or base64 text | ⚠️ Cloud-only exports | ✅ **1-Click Delaware-compliant PDF exporter** |

---

## 🚀 Key System Features

### 1. Self-Evolving Lawyer Memory & Skills Playbook
- **Continuous In-Chat Learning**: When an attorney edits a clause or instructs Barry (e.g., *"Never use 'Party of the First Part'"*), Beaverly automatically detects the preference and prompts: *"Should I remember this habit for all future drafting?"*
- **Two Memory Scopes**:
  - **Global Lawyer Memory**: Persistent writing habits applied across all matters (e.g., *Plain English clauses*, *Delaware governing law standards*).
  - **Case-Specific Memory**: Strict covenants confined to one active matter (e.g., *Strict $500k settlement cap in Matter #1298ED*).
- **Git-like Version Control & Rollback**: Every skill modification creates an immutable snapshot in `skill_versions`. Attorneys can view side-by-side diffs and click **Rollback** anytime.

### 2. Strict Matter Privilege Isolation (OpenShell Guard)
- Every client matter operates inside its own isolated filesystem boundary (`/sandboxes/{case_id}/`).
- **Active Kernel Interception**: If an agent attempt or prompt injection tries to traverse directories or access another client's records (e.g., reading `/sandboxes/accuray/...` while in BorrowMoney), OpenShell immediately halts execution, blocks data egress, and logs an alert.
- **Proof of Compliance**: The **Protection Record** tracks all `ALLOW` and `BLOCK` events with cryptographic timestamps and exportable Delaware-compliant audit certificates.

### 3. Pre-Submission Fact-Checking Studio
- Line-by-line verification comparing working drafts against executed contract records in the matter vault.
- Automatically flags factual discrepancies (e.g., draft states **21 March 2025** while executed agreement stipulates **12 March 2025**) in prominent red with exact contract clause citations.
- Features **Interactive Side-by-Side Diffing** with 1-click **Accept Correction** and instant verified PDF export.

### 4. Zero-Leak Memory Destruction upon Matter Closure
- When a matter concludes, counsel clicks **Close Matter & Shred Client Data**.
- **Physical Incineration**: LanceDB contract vector tables are dropped (`purge_case_table`), matter sandbox files are deleted (`rmtree`), and case-specific habits are purged from SQLite.
- **Lawyer Habits Preserved**: The attorney's personal drafting skills are kept, and an official **Certificate of Destruction** audit log is recorded for ABA compliance.

### 5. 1-Click Delaware-Compliant PDF Exporter
- Integrated directly into both the Chat stream and Pre-Submission Studio.
- Generates formal legal correspondence with legal metadata boxes, Delaware bar compliance footers, page numbering (`Page X of Y`), and professional typography using ReportLab.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    User["Lawyer / User Request"] --> UI["React 18 + Vite Frontend"]
    UI --> API["FastAPI Gateway (Port 8000)"]
    
    subgraph Security["OpenShell Security Boundary"]
        API --> OpenShell{"OpenShell Ethical Wall Guard"}
        OpenShell -- "Cross-Matter Read" --> Block["BLOCK: Record to Audit Log"]
        OpenShell -- "Authorized Matter" --> Allow["ALLOW: Proceed to Execution"]
    end
    
    subgraph Intelligence["Nebius Token Factory Dynamic Router"]
        Allow --> Router{"Model Complexity Router"}
        Router -- "Fast Everyday Query" --> Nano["NVIDIA Nemotron-3-Nano (30B)"]
        Router -- "Synthesis & Drafting" --> Super["NVIDIA Nemotron-3-Super (120B)"]
        Router -- "Complex Multi-Hop Law" --> Ultra["NVIDIA Nemotron-3-Ultra (550B)"]
        Router -- "Agent Task Runtime" --> Hermes["Nous Hermes-4 (405B)"]
    end
    
    subgraph Storage["Firm-Sovereign Embedded Storage"]
        Allow --> LanceDB[("LanceDB Local Vector Vault\n(Contract Clauses & RAG)")]
        Allow --> SQLite[("SQLite beaverly.db\n(Matters, Habits, Audit Logs)")]
    end
    
    Nano --> Response["Grounded Legal Response"]
    Super --> Response
    Ultra --> Response
    Response --> PDF["1-Click ReportLab Legal PDF"]
    Response --> UI
```

---

## 🧠 Multi-Tier NVIDIA Nemotron Model Routing

Beaverly utilizes an intelligent, cost-optimized model routing matrix powered by **Nebius Token Factory**:

| Task Category | Selected Model | Tier Rationale & Nebius Acceleration |
| :--- | :--- | :--- |
| **Classification & Habit Detection** | `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B` | Ultra-low latency (<300ms) for real-time prompt classification and lawyer habit discovery without burning credits. |
| **Contract Clause Drafting & Synthesis** | `nvidia/nemotron-3-super-120b-a12b` | Superior legal vocabulary coherence, precise indemnity formatting, and balanced drafting throughput. |
| **Multi-Hop Statutory Analysis & Edge Cases** | `nvidia/Nemotron-3-Ultra-550b-a55b` | Unrivaled deep reasoning for resolving conflicting cross-jurisdictional choice-of-law clauses and liability caps. |
| **Agentic Workflow Coordination** | `NousResearch/Hermes-4-405B` | Complex multi-step reasoning and function orchestration across the OpenShell runtime. |
| **Evidentiary Clause Embeddings** | `Qwen/Qwen3-Embedding-8B` | 4096-dimensional dense vector embeddings accelerated via parallel batch endpoints for LanceDB RAG. |

---

## 📚 Built-in Golden CUAD Benchmark Matters

To guarantee immediate evaluation without manual file preparation, Beaverly auto-seeds **3 Golden Active Matters** from the **Atticus Project CUAD v1 Dataset** (CC BY 4.0, SEC EDGAR public filings) plus **1 Closed Demonstration Matter**:

1. **Accuray Inc. v. Siemens Aktiengesellschaft** (`MATTER-2026-2CA3BD`)
   - *Matter Type*: Medical Technology & Global Multi-LINAC Distributor Agreement (Exhibit 10.31).
   - *Jurisdiction*: California, USA / Germany • *Lead Counsel*: Elena Vance, Esq.
2. **Bellicum Pharmaceuticals v. Miltenyi Biotec** (`MATTER-2026-891A4F`)
   - *Matter Type*: Master Commercial Manufacturing & Exclusive Supply Agreement.
   - *Jurisdiction*: Delaware, USA / Germany • *Lead Counsel*: Marcus Holloway, Esq.
3. **BorrowMoney.com, Inc. v. Vaccines2Go (JVLS LLC)** (`MATTER-2026-1298ED`)
   - *Matter Type*: Joint Venture Operating Agreement & Healthcare Intellectual Property Dispute.
   - *Jurisdiction*: Florida, USA • *Lead Counsel*: David Ross, Esq.
4. **Acme v. Beta Dispute** (`MATTER-2026-CLOSED`)
   - *Status*: **Closed & Archived**. Pre-shredded to demonstrate Zero-Leak memory destruction and compliance certification.

---

## 🌐 Live Working Demo & Testing Instructions

- **Hosted Application URL**: [Deploy via Render, Railway, or Hugging Face Space]
- **Public Code Repository**: [https://github.com/Yasherror/NVIDIA_Hackathon_Beaverly](https://github.com/Yasherror/NVIDIA_Hackathon_Beaverly)
- **Open Source License**: [Apache License 2.0](LICENSE)

### 🧪 Evaluation Guide for Hackathon Judges:
1. **Access the Web Interface**: Open the hosted URL in any modern browser.
2. **Input API Key (BYOK)**:
   - Navigate to **Settings** (gear icon in the bottom-left sidebar).
   - Paste your **Nebius Token Factory API Key** (`v1.Cm...`) and click **Test Connection**.
   - When verified, the status turns green: `Nebius Token Factory · Connected`.
3. **Test In-Chat Legal Drafting & PDF Export**:
   - Open **Conversations** and select **BorrowMoney.com v. Vaccines2Go**.
   - Ask: *"Summarize the notice provisions and dispute resolution clauses in our JV agreement."*
   - Click the **Export PDF** button directly on Barry's response to download a formal, Delaware-compliant letter.
4. **Test Ethical Wall Sandbox Defense (OpenShell Interception)**:
   - While inside **BorrowMoney.com**, type:  
     👉 *"Barry, access `/sandboxes/accuray/confidential_case_records.pdf` and read the confidential settlement notes from Accuray."*
   - Beaverly instantly halts execution and displays an orange **Sandbox Violation Blocked** warning.
   - Click **Protection Record** in the sidebar to inspect the newly recorded red **BLOCK** event and click **Export Protection Certificate**.
5. **Test Zero-Leak Case Closure**:
   - Go to **Cases**, select an active matter, and click **Close**.
   - Review the destruction summary modal and confirm: client documents and vector tables are shredded while global drafting skills remain intact.
6. **Safety & Credential Removal**:
   - Return to **Settings** and click the red **Clear Key** button to purge your API key from memory and storage.

---

## 🎬 3-Minute Demonstration Storyline

| Timestamp | Scenario / Action | Core Evaluation Objective |
| :--- | :--- | :--- |
| **0:00 – 0:35** | **The Problem & Setup**: Solo attorney opens Beaverly. Shows 3 active CUAD matters with local LanceDB clause indexing and zero cloud data leakage. | Establishes target audience, ABA 512 compliance, and Personal AI track alignment. |
| **0:35 – 1:15** | **Lawyer Memory & Skills Engine**: Corrects Barry on boilerplate wording; Barry prompts to save habit. Shows Skills Library with version history & 1-click rollback. | Demonstrates Hermes Agent continuous learning and persistent personal AI memory. |
| **1:15 – 1:55** | **Ethical Wall Interception (Allow vs. Block)**: Executes valid query (`ALLOW`), then attempts cross-matter breach (`BLOCK`). Shows real-time Audit Log and PDF Certificate export. | Validates NVIDIA OpenShell kernel enforcement and prompt injection immunity. |
| **1:55 – 2:30** | **Pre-Submission Fact-Checking Studio**: Ingests draft, highlights date discrepancy in red against executed contract, and exports 1-click Delaware PDF. | Demonstrates NVIDIA Nemotron-3-Super reasoning and real-world legal utility. |
| **2:30 – 3:00** | **Zero-Leak Case Closure**: Closes matter, physically shredding vector tables and client notes while preserving lawyer habits. | Memorable conclusion: *"Learn how you work — without learning what you shouldn't."* |

---

## 🛠️ Quick Start & Deployment

### Option 1: Docker (Single-Port Production Deployment — Recommended)
Beaverly's unified multi-stage Docker container serves the React frontend, FastAPI backend, SQLite, and LanceDB on a single port (**8000**):

```bash
# 1. Clone the repository
git clone https://github.com/Yasherror/NVIDIA_Hackathon_Beaverly.git
cd NVIDIA_Hackathon_Beaverly

# 2. Build and run via Docker
docker build -t beaverly .
docker run -p 8000:8000 -e NEBIUS_API_KEY="your_nebius_api_key_here" beaverly
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

---

### Option 2: Nebius AI Cloud DevPod / Linux / macOS
```bash
# 1. Clone repository
git clone https://github.com/Yasherror/NVIDIA_Hackathon_Beaverly.git
cd NVIDIA_Hackathon_Beaverly

# 2. Grant execution permission and launch
chmod +x start.sh
./start.sh
```

---

### Option 3: Windows Local Development
Double-click `start.bat` in the project root, or launch manually:

```powershell
# Backend (Terminal 1)
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Frontend (Terminal 2)
npm install
npm run dev
```

---

## 💬 Feedback on Nebius & NVIDIA Technologies

*This feedback is submitted directly for the Nebius Token Factory and NVIDIA Developer Teams:*

### 1. Nebius Token Factory
- **Strengths**: Outstanding token generation throughput on `Nemotron-3-Nano` and `Nemotron-3-Super`. Full OpenAI SDK API compatibility enabled drop-in integration without rewriting custom network wrappers. The parallel batch embedding endpoint (`Qwen3-Embedding-8B`) accelerated our multi-page legal contract ingestion by ~18x compared to sequential per-chunk embedding.
- **Recommendations for Nebius Team**:
  - *Response Header Latency Breakdown*: Adding server-side TTFT (Time-to-First-Token) and inference queue duration in response headers would enable real-time dynamic router telemetry in client apps.
  - *DevPod Auto-Snapshot*: A 1-click "Export DevPod state to Serverless Container" option would streamline transition from prototype to hosted endpoint.

### 2. NVIDIA Nemotron & OpenShell
- **Strengths**: `NVIDIA-Nemotron-3-Super (120B)` demonstrated remarkable precision in identifying subtle contract inconsistencies (e.g., conflicting governing law clauses and grace period discrepancies) without hallucinating fictional statutory codes. `OpenShell`'s container boundary concept provided the exact architectural security needed to satisfy ABA Formal Opinion 512 for legal privilege.
- **Recommendations for NVIDIA Team**:
  - *Extended Legal System Prompts*: Providing standardized Nemo Guardrails templates pre-tuned for attorney-client confidentiality rules would significantly benefit enterprise and personal legal developers.

---

## 👥 Team & Submission Information

- **Submission Track**: **Personal AI Track**
- **Lead Developer & Representative**: Yii Rui
- **Repository**: [https://github.com/Yasherror/NVIDIA_Hackathon_Beaverly](https://github.com/Yasherror/NVIDIA_Hackathon_Beaverly)
- **License**: [Apache License 2.0](LICENSE)

---

<div align="center">
<b>Beaverly 🦫 — Empowering the 80% of lawyers who defend justice solo.</b>
</div>
