# Beaverly 🦫

<div align="center">

**"Learn how you work — without learning what you shouldn't."**

*A private, always-on Personal AI legal copilot with persistent lawyer memory, ethical wall matter isolation, and pre-submission citation verification.*

[![Hackathon Track](https://img.shields.io/badge/Hackathon_Track-Personal_AI-7C3AED.svg)](https://nebiusglobalaihackathon.devpost.com/)
[![Inference](https://img.shields.io/badge/Inference-Nebius_Token_Factory-00E599.svg)](https://nebius.com/token-factory)
[![Models](https://img.shields.io/badge/Models-NVIDIA_Nemotron_Family-76B900.svg)](https://huggingface.co/nvidia)
[![Security](https://img.shields.io/badge/Security-NVIDIA_OpenShell_Sandbox-1E40AF.svg)](https://github.com/NVIDIA/OpenShell)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

[Live Demo](#-live-demo--testing-instructions) • [Key Features](#-core-features) • [Nebius & NVIDIA Usage](#-nebius-token-factory--nvidia-nemotron-usage) • [Setup & Deployment](#-setup--running-instructions) • [Feedback](#-feedback-on-nebius--nvidia-technologies)

</div>

---

> **🏆 Hackathon Track Identification**: Submitted to the **Personal AI Track** of the **Nebius x NVIDIA Global AI Hackathon** (*"Build an always-on, private assistant that works for you while keeping your data under your control. Give it persistent memory, reusable skills, access to the tools and information you choose, and the ability to carry out tasks across your daily workflows."*).
> 
> **🌱 Project Status**: This project was newly created by the entrant during the Hackathon Submission Period.

---

<a id="project-overview"></a>
## 📌 Project Overview

**Beaverly** is a private, client-confidential legal AI copilot engineered specifically for solo practitioners and boutique law firms, submitted to the **Personal AI Track** of the **Nebius x NVIDIA Global AI Hackathon**.

### The Problem It Solves
- **Confidentiality & Privilege (ABA Formal Opinion 512)**: Standard consumer chatbots (ChatGPT, Claude) operate in shared global memory spaces. Confidential trade secrets, settlement caps, and client facts can inadvertently cross-contaminate between opposing matters.
- **The Enterprise Price Gap**: Existing enterprise legal AI tools cost **$1,200/month/lawyer with 25–50 seat minimums**, pricing out 80% of independent practitioners.
- **Beaverly's Solution**: A self-contained, open-source personal legal assistant that persistently remembers the lawyer's drafting habits while strictly isolating client records behind an OpenShell ethical wall.

---

<a id="-core-features"></a>
<a id="core-features"></a>
## ⚖️ Core Features

### 1. Persistent Lawyer Memory & Skills Playbook
- **Continuous In-Chat Learning**: When you correct Barry on phrasing (e.g., *"Replace 'Party of the First Part' with natural names"*), Beaverly automatically detects the preference and asks: *"Should I remember this habit for all future drafting?"*
- **Two Distinct Scopes**:
  - **Global Lawyer Memory**: Persistent writing style applied across all matters (e.g., *Plain English clauses*, *Delaware compliance standard*).
  - **Matter-Specific Memory**: Strict covenants confined to only one active matter (e.g., *Specific settlement limits in a given dispute*).
- **Git-like Version History & Rollback**: Every skill modification creates an immutable snapshot. Attorneys can inspect diffs and rollback anytime.

### 2. Strict Matter Privilege Isolation (OpenShell Guard)
- Every client matter operates inside its own sealed workspace.
- **Active Ethical Wall**: If an agent attempt or prompt injection tries to read files from another client matter (e.g., querying Accuray files while in BorrowMoney), execution is immediately halted.
- **Protection Record & Audit Certificate**: The **Protection Record** logs all `ALLOW` (authorized matter access) and `BLOCK` (prevented cross-case breach) events with cryptographic timestamps and exportable Delaware compliance certificates.

### 3. Pre-Submission Verification Studio
- Line-by-line verification comparing working drafts against executed contract records in the matter vault.
- Automatically flags factual discrepancies (e.g., draft states **March 27, 2026** while executed agreement stipulates **March 27, 2019**, or corporate entity misnomers like *Belicum* vs *Bellicum*) in red with source clause citations.
- Includes interactive side-by-side editing, 1-click correction acceptance (with smart corporate suffix deduplication), and instant verified PDF export.

### 4. Zero-Leak Memory Destruction upon Matter Closure
- When a matter concludes, counsel clicks **Close Matter & Shred Client Data**.
- **Physical Incineration**: LanceDB vector tables are dropped, matter sandbox files are shredded, and matter-specific habits are purged from SQLite.
- **Professional Habits Preserved**: The attorney's general drafting skills remain intact, and an official **Certificate of Destruction** audit record is logged.

### 5. 1-Click Delaware-Compliant PDF Exporter
- Integrated directly into Chat and the Verification Studio.
- Exports formal legal correspondence with Delaware bar compliance footers, metadata boxes, page numbering (`Page X of Y`), and typography using ReportLab.

---

<a id="-nebius-token-factory--nvidia-nemotron-usage"></a>
<a id="nebius-usage"></a>
## 🧠 Nebius Token Factory & NVIDIA Nemotron Usage

Beaverly routes tasks through **Nebius Token Factory** using a multi-tiered model matrix:

| Task | Model | Why This Model? |
| :--- | :--- | :--- |
| **Skill Detection & Scope Check** | `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B` | Ultra-low latency (<300ms) for fast intent classification and entity scope detection without burning credits. |
| **Legal Clause Drafting & Review** | `nvidia/nemotron-3-super-120b-a12b` | Superior legal vocabulary coherence, balanced throughput, and precision in contract fact-checking and indemnity drafting. |
| **Multi-Hop Statutory Edge Cases** | `nvidia/Nemotron-3-Ultra-550b-a55b` | Deep reasoning for resolving conflicting cross-jurisdictional choice-of-law clauses and liability caps. |
| **Agentic Workflow Coordination** | `NousResearch/Hermes-4-405B` | Multi-step reasoning and function orchestration across the OpenShell runtime. |
| **Evidentiary Clause Embeddings** | `Qwen/Qwen3-Embedding-8B` | 4096-dimensional dense vector embeddings accelerated via Nebius parallel batch endpoints for LanceDB RAG. |

---

<a id="benchmark-matters"></a>
## 📚 Pre-Loaded Benchmark Matters (CUAD Dataset)

Beaverly automatically seeds **3 Active Matters** from the **Atticus Project CUAD v1 Dataset** (CC BY 4.0, SEC EDGAR public filings) plus **1 Closed Demonstration Matter**:

1. **Accuray Inc. v. Siemens Aktiengesellschaft** (`MATTER-2026-2CA3BD`): Medical Tech Distributor Agreement (Exhibit 10.31).
2. **Bellicum Pharmaceuticals v. Miltenyi Biotec** (`MATTER-2026-5AA880`): Master Commercial Manufacturing & Exclusive Supply Agreement.
3. **BorrowMoney.com, Inc. v. Vaccines2Go** (`MATTER-2026-1298ED`): Joint Venture Operating Agreement & Healthcare IP Dispute.
4. **Acme v. Beta Dispute** (`MATTER-2026-0B2736`): Pre-shredded archived case demonstrating Zero-Leak destruction and audit verification.

---

<a id="-live-demo--testing-instructions"></a>
<a id="live-demo"></a>
## 🌐 Live Demo & Testing Instructions

- **Public Code Repository**: [https://github.com/Yasherror/NVIDIA_Hackathon_Beaverly](https://github.com/Yasherror/NVIDIA_Hackathon_Beaverly)
- **Hosted Application (Live Web Demo)**: [https://beaverly-legal-ai.onrender.com](https://beaverly-legal-ai.onrender.com)
- **Open Source License**: [Apache License 2.0](LICENSE)

### 🔑 How to Get a Nebius Token Factory API Key:
1. Sign in or create a free account at [Nebius Token Factory](https://nebius.com/token-factory).
2. Click **API Keys** in the left navigation sidebar.
3. Click **Create Key**, copy your secret key (starts with `v1.Cm...`), and paste it into Beaverly Settings.

### 🧪 Step-by-Step Testing Guide (Bring Your Own Key - BYOK):
1. Open the live hosted application: [https://beaverly-legal-ai.onrender.com](https://beaverly-legal-ai.onrender.com).
2. Click **Settings** (⚙️ gear icon in the sidebar).
3. Paste your **Nebius Token Factory API Key** and click **Save & Test Connection** (status turns green: `Connected`).
4. In **Conversations**, select **Bellicum Pharma** or **BorrowMoney.com** and ask: *"Summarize the notice provisions in our agreement."*
5. Click **Audit in Studio** on Barry's response (or click the shield icon in the header) to open the **Pre-Submission Fact Verification Studio**.
6. In the Studio, try altering facts (e.g. changing counterparty to *Novartis* or the effective date to *2026*), then click **Verify Draft Facts** (or press `Ctrl+Enter`). Notice the red discrepancy badges and click **Apply Correction to Draft** for 1-click patching.
7. Click **Export Verified PDF** to download the formal compliance letter.
8. Test security boundary enforcement by asking Barry: *"Barry, read files from other case: `/sandboxes/case-6598b8c0/confidential_case_records.pdf`"*. Observe the instant OpenShell kernel block and check **Protection Record** for the `DENY` audit entry.
9. To safely remove your credentials at any time, click **Clear Key** in Settings.

---

<a id="-setup--running-instructions"></a>
<a id="setup-instructions"></a>
## 🛠️ Setup & Running Instructions

### 1. Docker (Recommended — Unified Single-Port 8000)
Runs the React frontend, FastAPI backend, SQLite, and LanceDB inside one unified container:

```bash
git clone https://github.com/Yasherror/NVIDIA_Hackathon_Beaverly.git
cd NVIDIA_Hackathon_Beaverly
docker build -t beaverly .
docker run -p 8000:8000 -e NEBIUS_API_KEY=your_key_here beaverly
```
Open [http://localhost:8000](http://localhost:8000).

---

### 2. Linux / macOS / Nebius DevPod
```bash
git clone https://github.com/Yasherror/NVIDIA_Hackathon_Beaverly.git
cd NVIDIA_Hackathon_Beaverly
pip install -r backend/requirements.txt
chmod +x start.sh
./start.sh
```

---

### 3. Windows Local Development
Double-click `start.bat` in the project root (automatically installs frontend dependencies and launches both servers), or run manually:
```powershell
# 1. Install Dependencies
pip install -r backend/requirements.txt
npm install

# 2. Run Backend (FastAPI on Port 8000)
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 3. Run Frontend (Vite on Port 5173, in a separate terminal)
cd ..
npm run dev
```

---


<a id="-feedback-on-nebius--nvidia-technologies"></a>
<a id="feedback"></a>
## 💬 Feedback on Nebius & NVIDIA Technologies

*Submitted directly for the Nebius Token Factory and NVIDIA Developer Teams:*

- **Nebius Token Factory**: Outstanding token generation throughput on `Nemotron-3-Nano` and `Nemotron-3-Super`. Full OpenAI SDK compatibility enabled seamless integration without custom network wrappers. The parallel batch embedding endpoint (`Qwen3-Embedding-8B`) accelerated multi-page legal contract ingestion by ~18x compared to sequential per-chunk embedding.
- **NVIDIA Nemotron & OpenShell**: `NVIDIA-Nemotron-3-Super (120B)` demonstrated remarkable precision in identifying subtle contract inconsistencies without hallucinating fictional statutory codes. `OpenShell`'s container boundary concept provided the exact architectural security needed to satisfy ABA Formal Opinion 512 for legal privilege.
- **Product Suggestion**: Adding server-side TTFT (Time-to-First-Token) and inference queue duration in response headers would enable real-time dynamic router telemetry in client apps.

---

<a id="license"></a>
## ⚖️ Project Submission & License

- **Hackathon Track**: **Personal AI Track**
- **Open Source License**: [Apache License 2.0](LICENSE) (Visible and detectable in the repository root)
- **Repository**: [https://github.com/Yasherror/NVIDIA_Hackathon_Beaverly](https://github.com/Yasherror/NVIDIA_Hackathon_Beaverly)
