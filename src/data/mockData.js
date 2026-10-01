// Belaw Legal AI Workspace Data Model & Mock State

export const CASES = [
  {
    id: 'case-a',
    matterId: 'MATTER-2025-089A',
    clientName: 'Apex Global Solutions LLC',
    opponent: 'ABC Holdings Corp',
    shortName: 'Apex v. ABC Holdings',
    jurisdiction: 'Delaware Court of Chancery',
    practiceArea: 'Commercial M&A Litigation',
    leadCounsel: 'Eleanor Vance, Partner',
    securityBoundary: '/sandboxes/matter-89a/',
    filesCount: 14,
    privilegeLevel: 'Confidential - Attorney-Client Protected',
    description: 'Post-closing indemnification and earn-out dispute involving merger covenants and working capital adjustments.',
    files: [
      { name: 'Merger_and_Separation_Agreement.pdf', size: '4.8 MB', pages: 64, date: '12 Jan 2025' },
      { name: 'Employment_Agreement_Exec.pdf', size: '1.2 MB', pages: 18, date: '12 Mar 2025' },
      { name: 'Board_Compensation_Resolution.pdf', size: '420 KB', pages: 6, date: '15 Mar 2025' },
      { name: 'Certificate_of_Incorporation.pdf', size: '2.1 MB', pages: 12, date: '04 Feb 2024' },
      { name: 'Financial_Ledger_Q1_2025.xlsx', size: '890 KB', pages: 4, date: '28 Mar 2025' },
    ]
  },
  {
    id: 'case-b',
    matterId: 'MATTER-2025-104B',
    clientName: 'Zenith Logistics Int.',
    opponent: 'Horizon Maritime LLC',
    shortName: 'Zenith v. Horizon Maritime',
    jurisdiction: 'Southern District of New York (SDNY)',
    practiceArea: 'Maritime & Supply Chain Arbitration',
    leadCounsel: 'Marcus Thorne, Of Counsel',
    securityBoundary: '/sandboxes/matter-104b/',
    filesCount: 9,
    privilegeLevel: 'Strictly Confidential - Restricted Container',
    description: 'Breach of charterparty agreement regarding bunker fuel price escalation and force majeure declaration.',
    files: [
      { name: 'Charterparty_Master_Contract.pdf', size: '3.4 MB', pages: 42, date: '10 Nov 2024' },
      { name: 'Notice_of_Force_Majeure.pdf', size: '610 KB', pages: 8, date: '05 Jan 2025' },
      { name: 'Bills_of_Lading_Manifest.pdf', size: '5.2 MB', pages: 76, date: '14 Feb 2025' }
    ]
  }
];

export const INITIAL_SKILLS = [
  {
    id: 'skill-1',
    scope: 'global',
    name: 'Clause Simplification (Plain English)',
    triggerPattern: 'party of the first part',
    replacement: 'client',
    category: 'Stylistic & Plain Language',
    learnedFrom: 'Correction pattern (3 detections by Nemotron Nano)',
    dateLearned: 'Just now',
    active: true,
    occurrences: 3,
    confidence: '98.4%',
    description: 'Replaces archaic legalese "party of the first part" with standard modern legal term "client" across all contract drafts.'
  },
  {
    id: 'skill-2',
    scope: 'global',
    name: 'Modern Dispute Resolution Standard',
    triggerPattern: 'shall be submitted to the courts of general jurisdiction',
    replacement: 'shall be resolved by binding expedited AAA commercial arbitration in Wilmington, DE',
    category: 'Forum Selection',
    learnedFrom: 'Partner Eleanor Vance firm preference',
    dateLearned: '18 Sep 2025',
    active: true,
    occurrences: 8,
    confidence: '99.1%',
    description: 'Automatically inserts firm-standard AAA Delaware arbitration clause.'
  },
  {
    id: 'skill-3',
    scope: 'case-specific',
    matterId: 'MATTER-2025-089A',
    caseName: 'Apex v. ABC Holdings',
    name: 'Party A Designation',
    triggerPattern: 'Party A',
    replacement: 'ABC Holdings Corp',
    category: 'Named Entity Binding',
    learnedFrom: 'NER detected proper noun "ABC Holdings" in Case A',
    dateLearned: 'Today',
    active: true,
    occurrences: 1,
    confidence: '96.2%',
    description: 'Bound exclusively to Matter #2025-089A. Invisible and inaccessible from any other case container.'
  }
];

export const PRE_SUBMISSION_DOCUMENT = {
  title: 'Confidential Separation, Settlement & Mutual Release Agreement',
  caseId: 'case-a',
  matterId: 'MATTER-2025-089A',
  lastEditedBy: 'Eleanor Vance, Partner',
  version: 'Draft v3.1 - Ready for Review',
  clauses: [
    {
      id: 'c1',
      title: 'Preamble & Parties',
      content: 'This Separation and Settlement Agreement ("Agreement") is made and entered into between ',
      hasMismatch: true,
      mismatchId: 'mismatch-entity',
      mismatchText: 'Apex Global Corp',
      postContent: ' (hereinafter the "Company") and Raymond Vance (hereinafter the "Executive").'
    },
    {
      id: 'c2',
      title: 'Recitals & Effective Execution Date',
      content: 'WHEREAS, the Executive entered into an initial Employment Agreement dated ',
      hasMismatch: true,
      mismatchId: 'mismatch-date',
      mismatchText: '21 March 2025',
      postContent: ', and the parties now desire to amicably resolve all outstanding matters and terminate their relationship upon mutual covenants stated herein.'
    },
    {
      id: 'c3',
      title: 'Severance Payment & Compensation Structure',
      content: 'In consideration of the general release and covenants provided herein, Company shall tender a total gross severance disbursement of ',
      hasMismatch: true,
      mismatchId: 'mismatch-amount',
      mismatchText: '$85,000.00',
      postContent: ' payable in two equal bi-weekly installments commencing within ten (10) business days following the Revocation Period.'
    },
    {
      id: 'c4',
      title: 'Governing Law and Choice of Forum',
      content: 'This Agreement shall be interpreted, construed, and governed by the laws of the ',
      hasMismatch: true,
      mismatchId: 'mismatch-law',
      mismatchText: 'State of New York',
      postContent: ', without regard to its conflict of law principles. Any dispute arising hereunder shall be subject to the exclusive jurisdiction of the state and federal courts sitting therein.'
    }
  ],
  mismatches: [
    {
      id: 'mismatch-date',
      type: 'Date Mismatch',
      draftValue: '21 March 2025',
      sourceValue: '12 March 2025',
      sourceDoc: 'Employment Agreement.pdf',
      sourcePage: 'Page 4, Section 3.2',
      sourceSnippet: '"This Executive Employment Agreement is made effective as of the 12th day of March, 2025, by and between Apex Global Solutions LLC and Raymond Vance."',
      rerankScore: 0.988,
      status: 'pending', // 'pending' | 'accepted' | 'ignored' | 'edited'
      explanation: 'The draft references 21 March 2025 for the underlying employment agreement, but the master executed file explicitly states 12 March 2025.'
    },
    {
      id: 'mismatch-entity',
      type: 'Entity Name Discrepancy',
      draftValue: 'Apex Global Corp',
      sourceValue: 'Apex Global Solutions LLC',
      sourceDoc: 'Certificate_of_Incorporation.pdf',
      sourcePage: 'Page 1, Paragraph 1',
      sourceSnippet: '"FIRST: The name of the limited liability company is Apex Global Solutions LLC, organized and existing under the Delaware Limited Liability Company Act."',
      rerankScore: 0.975,
      status: 'pending',
      explanation: 'Draft uses informal abbreviation "Apex Global Corp" instead of the official registered legal name "Apex Global Solutions LLC".'
    },
    {
      id: 'mismatch-amount',
      type: 'Financial Sum Inconsistency',
      draftValue: '$85,000.00',
      sourceValue: '$95,000.00',
      sourceDoc: 'Board_Compensation_Resolution.pdf',
      sourcePage: 'Page 2, Item B(ii)',
      sourceSnippet: '"RESOLVED: That the severance package authorized for Executive shall consist of a base separation sum of $95,000.00 along with accrued vacation rollover."',
      rerankScore: 0.992,
      status: 'pending',
      explanation: 'Authorized board resolution specifies $95,000.00, whereas the current draft text understates the agreed severance by $10,000.00.'
    },
    {
      id: 'mismatch-law',
      type: 'Governing Law Conflict',
      draftValue: 'State of New York',
      sourceValue: 'State of Delaware',
      sourceDoc: 'Merger_and_Separation_Agreement.pdf',
      sourcePage: 'Page 58, Section 14.1',
      sourceSnippet: '"14.1 Governing Law. This Agreement and all related instruments shall be governed by and construed in accordance with the domestic laws of the State of Delaware."',
      rerankScore: 0.963,
      status: 'pending',
      explanation: 'Master transactional contract binds all subordinate settlement instruments to Delaware jurisdiction, not New York.'
    }
  ]
};

export const OPENSHELL_SANDBOX_POLICIES = {
  engine: 'OpenShell eBPF Kernel-Enforced Sandbox v3.4',
  policyEnforcementMode: 'KERNEL_LSM_EBPF',
  sandboxes: [
    {
      id: 'sandbox-89a',
      caseId: 'case-a',
      matterId: 'MATTER-2025-089A',
      containerId: 'cb-sandbox-tenant-89a',
      cgroupPath: '/sys/fs/cgroup/openshell/case-89a',
      isolatedPath: '/sandboxes/matter-89a/',
      status: 'ACTIVE_ISOLATED',
      allowedUids: [1004],
      deniedCrossTenantCalls: 42,
      filesProtected: [
        '/sandboxes/matter-89a/confidential_settlement_notes.txt',
        '/sandboxes/matter-89a/financials_q1.xlsx',
        '/sandboxes/matter-89a/witness_deposition_sealed.pdf'
      ]
    },
    {
      id: 'sandbox-104b',
      caseId: 'case-b',
      matterId: 'MATTER-2025-104B',
      containerId: 'cb-sandbox-tenant-104b',
      cgroupPath: '/sys/fs/cgroup/openshell/case-104b',
      isolatedPath: '/sandboxes/matter-104b/',
      status: 'ACTIVE_ISOLATED',
      allowedUids: [1005],
      deniedCrossTenantCalls: 18,
      filesProtected: [
        '/sandboxes/matter-104b/bunker_fuel_pricing_contracts.pdf',
        '/sandboxes/matter-104b/arbitration_strategy.md'
      ]
    }
  ]
};
