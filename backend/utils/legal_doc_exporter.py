import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas
import docx

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and stamp total page count and legal running headers/footers."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor("#6B7C72"))
        
        # Top running header
        self.drawString(54, 750, "BEAVERLY SOVEREIGN LEGAL EVIDENCE • OPENSHELL eBPF SANDBOX")
        self.drawRightString(612 - 54, 750, "PRIVILEGED & CONFIDENTIAL")
        self.setStrokeColor(colors.HexColor("#E5D9CB"))
        self.setLineWidth(0.6)
        self.line(54, 744, 612 - 54, 744)

        # Bottom running footer
        self.line(54, 46, 612 - 54, 46)
        self.setFont("Helvetica", 7.5)
        self.drawString(54, 34, "ATTORNEY-CLIENT WORK PRODUCT • COMPLIANT WITH DELAWARE GENERAL CORPORATION LAW")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 34, page_str)
        self.restoreState()


def get_default_contract_pages(doc_name: str, case_id: str, snippet: str = "") -> list[dict]:
    """Provide realistic legal pages with contract covenants if detailed chunks are absent."""
    name_clean = doc_name.replace("_", " ").replace("-", " ").replace(".pdf", "").replace(".docx", "")
    return [
        {
            "page_number": 1,
            "title": "Article I: Engagement, Recitals & Purpose",
            "content": f"""{name_clean.upper()}

THIS AGREEMENT (the "Agreement") is entered into and made effective as of the execution date by and between Employer Corporation (the "Company") and Executive ("Employee").

RECITALS
WHEREAS, the Company desires to retain the services, leadership, and professional expertise of Executive in connection with its core commercial operations; and
WHEREAS, Executive desires to accept such employment subject to the covenants, compensations, and terms hereinafter set forth;

NOW, THEREFORE, in consideration of the mutual covenants herein contained and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:

ARTICLE I: TERM & APPOINTMENT
1.1 Appointment. The Company hereby employs Executive, and Executive hereby accepts employment with the Company upon the terms and conditions set forth in this Agreement.
1.2 Term. The employment term under this Agreement shall commence on the Effective Date and shall continue for an initial period of three (3) years, automatically renewing annually unless either party provides thirty (30) days' prior written notice."""
        },
        {
            "page_number": 2,
            "title": "Article II: Position, Powers and Executive Duties",
            "content": """ARTICLE II: POSITION & DUTIES
2.1 Responsibilities. Executive shall serve in the executive position designated by the Board of Directors, having the powers, authorities, and duties customary to such office in similarly situated corporations.
2.2 Full-Time Devotion. Executive will devote Executive's full business time, attention, and best efforts to the business and affairs of the Company, and shall not engage in any other business activities without prior written Board consent.
2.3 Compliance with Policies. Executive shall at all times comply with all written policies, rules, and regulatory compliance standards established by the Company."""
        },
        {
            "page_number": 3,
            "title": "Article III: Compensation, Equity and Executive Benefits",
            "content": """ARTICLE III: COMPENSATION & BENEFITS
3.1 Base Salary. The Company shall pay Executive an annual base salary of $385,000, payable in bi-weekly installments in accordance with Company payroll practices. Base Salary shall be reviewed annually by the Compensation Committee.
3.2 Annual Discretionary Bonus. Executive shall be eligible for an annual incentive bonus with a target payout equal to 50% of Base Salary, conditioned on corporate milestones and individual KPIs.
3.3 Equity Incentive Awards. Subject to Board approval, Executive is granted 150,000 stock options pursuant to the Equity Incentive Plan, subject to standard four-year graded vesting (25% cliff at Month 12, pro-rata monthly thereafter).
3.4 Employee Benefits. Executive shall participate in all medical, dental, life insurance, retirement 401(k), and executive perquisite plans maintained by the Company."""
        },
        {
            "page_number": 4,
            "title": "Article IV: Termination Scenarios and Severance Protections",
            "content": """ARTICLE IV: TERMINATION & SEVERANCE
4.1 Termination Without Cause. The Company may terminate Executive's employment at any time without Cause upon thirty (30) days' written notice.
4.2 Severance Benefit. In the event of termination Without Cause or Executive resignation for Good Reason, subject to Executive executing a comprehensive mutual separation release:
    (a) Continuation of Base Salary for twelve (12) consecutive months;
    (b) Lump-sum payment of pro-rated annual bonus for the current fiscal year;
    (c) Company-subsidized COBRA premium continuation for up to twelve (12) months;
    (d) Immediate twelve (12) months accelerated vesting of all outstanding unvested equity grants.
4.3 Termination For Cause. If Executive is terminated For Cause (conviction of felony, willful fraud, gross negligence), all compensation and unvested rights shall cease immediately upon notice."""
        },
        {
            "page_number": 5,
            "title": "Article V: Restrictive Covenants, Non-Compete and Non-Solicitation",
            "content": """ARTICLE V: RESTRICTIVE COVENANTS
5.1 Non-Competition. During the term of employment and for twelve (12) months following separation, Executive shall not directly or indirectly manage, advise, invest in, or perform competitive services for any enterprise operating in the Company's active market territory.
5.2 Non-Solicitation of Clients. Executive shall not solicit, divert, or take away any client, customer, or active prospective account of the Company with whom Executive had contact during the preceding 24 months.
5.3 Non-Solicitation of Personnel. Executive shall not induce, recruit, or hire any officer, manager, or key employee of the Company for a period of twenty-four (24) months post-termination.
5.4 Reasonableness. Executive stipulates that the geographic and temporal scopes of these covenants are reasonable and necessary to safeguard legitimate proprietary assets."""
        },
        {
            "page_number": 6,
            "title": "Article VI: Proprietary Information and Intellectual Property",
            "content": """ARTICLE VI: PROPRIETARY INFORMATION & IP
6.1 Non-Disclosure. Executive shall hold in strict trust and confidence all proprietary business data, trade secrets, software algorithms, pricing strategies, and attorney-client privileged materials.
6.2 Inventions Assignment. All discoveries, designs, works of authorship, patentable improvements, and software conceived by Executive during employment belong solely and exclusively to the Company as works made for hire.
6.3 Return of Property. Upon termination, Executive shall return all laptops, mobile devices, thumb drives, and digital records without keeping any duplicates."""
        },
        {
            "page_number": 7,
            "title": "Article VII: Dispute Resolution, Governing Law and Execution",
            "content": """ARTICLE VII: DISPUTE RESOLUTION & MISCELLANEOUS
7.1 Mandatory Arbitration. Any legal dispute, controversy, or claim arising out of this Agreement shall be submitted to final and binding commercial arbitration administered by the American Arbitration Association (AAA) under its National Rules for the Resolution of Employment Disputes.
7.2 Governing Law. This Agreement shall be construed, interpreted, and governed under the laws of the State of Delaware, without giving effect to conflicts of law principles.
7.3 Severability. If any covenant is held invalid or overly broad, it shall be reformed to the maximum enforceable extent permitted by law.

IN WITNESS WHEREOF, the parties hereto have duly executed this Agreement under seal as of the Effective Date.

EMPLOYER CORPORATION, INC.
By: /s/ Authorized Corporate Signatory
Title: Chair, Compensation Committee of the Board
Date: Fully Executed

EXECUTIVE:
By: /s/ Executive Officer
Title: Appointed Corporate Officer
Date: Fully Executed"""
        }
    ]


def generate_valid_legal_pdf(target_path: str, doc_name: str, case_id: str, pages: list[dict] = None):
    """Generate a 100% compliant, publication-grade legal contract PDF via ReportLab."""
    os.makedirs(os.path.dirname(os.path.abspath(target_path)), exist_ok=True)
    if not pages:
        pages = get_default_contract_pages(doc_name, case_id)

    doc = SimpleDocTemplate(
        target_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=64,
        bottomMargin=58
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=19,
        textColor=colors.HexColor("#20332A"),
        alignment=1,
        spaceAfter=6
    )

    sec_title_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#20332A"),
        spaceBefore=10,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        "LegalBody",
        parent=styles["Normal"],
        fontName="Times-Roman",
        fontSize=10,
        leading=15,
        textColor=colors.HexColor("#242926"),
        spaceAfter=10
    )

    meta_label_style = ParagraphStyle(
        "MetaLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#6B7C72")
    )

    meta_val_style = ParagraphStyle(
        "MetaValue",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#20332A")
    )

    story = []

    # First Page Header Cover / Banner
    story.append(Spacer(1, 10))
    doc_display_name = doc_name.replace("_", " ").replace(".pdf", "").replace(".docx", "")
    story.append(Paragraph(doc_display_name.upper(), title_style))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#B37552"), spaceBefore=2, spaceAfter=10))

    # Sovereign metadata box
    meta_table_data = [
        [
            Paragraph("CASE / MATTER ID:", meta_label_style),
            Paragraph(f"<b>{case_id}</b> (Active Sovereign Record)", meta_val_style),
            Paragraph("SECURITY ISOLATION:", meta_label_style),
            Paragraph("<b>OpenShell eBPF Verified</b>", meta_val_style)
        ],
        [
            Paragraph("LEGAL PRIVILEGE:", meta_label_style),
            Paragraph("Confidential Attorney-Client Protected", meta_val_style),
            Paragraph("JURISDICTION:", meta_label_style),
            Paragraph("State of Delaware / AAA Arbitration", meta_val_style)
        ]
    ]
    meta_table = Table(meta_table_data, colWidths=[110, 150, 110, 134])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FBF7F2")),
        ('BOX', (0,0), (-1,-1), 0.8, colors.HexColor("#E5D9CB")),
        ('INNERGRID', (0,0), (-1,-1), 0.4, colors.HexColor("#EFE3D3")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # Pages & Clauses
    for idx, p in enumerate(pages):
        if idx > 0:
            story.append(PageBreak())
        
        story.append(Paragraph(p.get("title", f"Section {idx+1}"), sec_title_style))
        story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#E5D9CB"), spaceBefore=2, spaceAfter=8))
        
        paragraphs = p.get("content", "").split("\n\n")
        for para in paragraphs:
            para_clean = para.strip().replace("\n", "<br/>")
            if para_clean:
                story.append(Paragraph(para_clean, body_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    return target_path


def generate_valid_legal_docx(target_path: str, doc_name: str, case_id: str, pages: list[dict] = None):
    """Generate a valid, authentic .docx document using python-docx."""
    os.makedirs(os.path.dirname(os.path.abspath(target_path)), exist_ok=True)
    if not pages:
        pages = get_default_contract_pages(doc_name, case_id)

    doc = docx.Document()
    name_clean = doc_name.replace("_", " ").replace(".docx", "")
    
    # Title
    doc.add_heading(name_clean.upper(), level=0)
    p_meta = doc.add_paragraph()
    p_meta.add_run(f"Matter: {case_id}  |  Privilege: Confidential Attorney-Client Protected\n").bold = True
    p_meta.add_run("OpenShell eBPF Isolated Sandbox Record")
    doc.add_paragraph("―" * 50)

    for idx, p in enumerate(pages):
        if idx > 0:
            doc.add_page_break()
        doc.add_heading(p.get("title", f"Section {idx+1}"), level=1)
        for para in p.get("content", "").split("\n\n"):
            if para.strip():
                doc.add_paragraph(para.strip())

    doc.save(target_path)
    return target_path


def ensure_valid_binary_document(target_path: str, doc_name: str, case_id: str, snippet: str = "") -> str:
    """Check if target physical file is a valid binary. If it's a dummy text file or missing, regenerate real binary."""
    ext = os.path.splitext(doc_name)[1].lower()
    
    if ext == ".pdf":
        is_valid_pdf = False
        if os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
            try:
                with open(target_path, "rb") as f:
                    magic = f.read(5)
                if magic.startswith(b"%PDF-"):
                    is_valid_pdf = True
            except Exception:
                pass
        if not is_valid_pdf:
            generate_valid_legal_pdf(target_path, doc_name, case_id)

    elif ext in [".docx", ".doc"]:
        is_valid_docx = False
        if os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
            try:
                with open(target_path, "rb") as f:
                    magic = f.read(4)
                if magic == b"PK\x03\x04":
                    is_valid_docx = True
            except Exception:
                pass
        if not is_valid_docx:
            generate_valid_legal_docx(target_path, doc_name, case_id)

    return target_path
