import { CybersecurityDomain, StudyModule } from '../types/adaptive.ts';

export const CURRICULUM_CATALOG: Record<CybersecurityDomain, StudyModule> = {
  cia_triad: {
    id: 'mod-cia-triad',
    domainId: 'cia_triad',
    title: 'Core Security Architecture',
    badge: 'MISSION FOUNDATIONS',
    targetProficiency: 'Developing',
    whyRelevant: 'Establishes the fundamental mental model for distinguishing disclosure, tampering, and denial of service.',
    objectives: [
      'Master the distinction between Confidentiality, Integrity, and Availability',
      'Understand how cryptographic key exposure compromises confidentiality despite ciphertext on disk',
      'Analyze real-world trade-offs between strict security controls and business availability',
    ],
    lessons: [
      {
        id: 'cia-l1',
        title: 'Deconstructing the Triad Beyond Memorization',
        readingMinutes: 3,
        summary: 'Security controls do not protect "systems" in abstract; they protect three distinct operational invariants.',
        conceptBreakdown: [
          {
            heading: 'Confidentiality vs Privacy',
            body: 'Confidentiality ensures that only authorized entities can view data. Having strong AES-256 encryption on disk does nothing if authorization checks are missing on the API layer or if keys are exposed in client bundles.',
            analogy: 'A titanium bank vault with the combination written on the front door.',
          },
          {
            heading: 'Integrity: Tamper-Evident Certainty',
            body: 'Integrity is about accuracy and non-tampering. An attack that modifies bank ledger balances from $10,000 to $90,000 does not need to steal passwords or crash the server — it destroys data integrity.',
            analogy: 'Wax seals on historic royal decrees that reveal any tampering.',
          },
          {
            heading: 'Availability: The Uptime Invariant',
            body: 'Authorized users must be able to access the resource when needed. High availability requires redundancy, automated failover, and DDoS mitigation.',
            analogy: 'Emergency 911 dispatch lines equipped with dual power generators and satellite backups.',
          },
        ],
        keyTakeaways: [
          'Confidentiality protects against unauthorized disclosure.',
          'Integrity protects against unauthorized modification.',
          'Availability protects against unauthorized denial or downtime.',
        ],
      },
      {
        id: 'cia-l2',
        title: 'The Inevitable Security Trade-Off',
        readingMinutes: 2,
        summary: 'Every security control imposes friction. True architecture balances risk against usability.',
        conceptBreakdown: [
          {
            heading: 'The Friction Trap',
            body: 'If a plant operator must enter 3 passwords and wait for a 20-minute SMS code during an industrial chemical leak, availability and human safety fail. Security must empower legitimate operations while repelling adversaries.',
          },
        ],
        keyTakeaways: [
          'Controls that break legitimate workflows create shadow IT and dangerous workarounds.',
        ],
      },
    ],
    interactiveExercise: {
      id: 'cia-ex-1',
      title: 'Operational Impact Triad Analysis',
      context: 'An adversary intercepts a municipal water filtration PLC controller. They do not shut down the pumps, but silently modify the chemical chlorination dosage formula from 2 PPM to 40 PPM while modifying telemetry dashboard values so operators see a normal reading.',
      prompt: 'Which primary security property was exploited to create this critical physical safety threat?',
      options: [
        {
          text: 'Confidentiality — because chemical recipe ratios were observed during transit',
          isCorrect: false,
          feedback: 'Observation was incidental; the lethal threat was caused by unauthorized modification of the chemical ratio.',
        },
        {
          text: 'Integrity — because command parameters and sensor telemetry were manipulated',
          isCorrect: true,
          feedback: 'Correct! Modifying the dosage formula and falsifying sensor readings attacks data and operational integrity.',
        },
        {
          text: 'Availability — because physical plant pumps were halted from running entirely',
          isCorrect: false,
          feedback: 'The pumps continued running; the hazard stemmed from untrustworthy, corrupted data values.',
        },
      ],
    },
    checkpointQuiz: [
      {
        id: 'cia-q1',
        question: 'A primary database server fails and an active standby replica automatically takes over traffic in 800ms. Which property is preserved?',
        options: [
          'Confidentiality of customer records',
          'Integrity of historical transactions',
          'Availability via automated failover',
          'Non-repudiation of remote requests',
        ],
        correctAnswer: 2,
        explanation: 'Automated failover eliminates single points of failure to keep services accessible to users.',
      },
      {
        id: 'cia-q2',
        question: 'An attacker modifies syslog files on Linux to erase records of their SSH login. Which security property did they target?',
        options: [
          'Integrity of the system audit trail',
          'Availability of computing processors',
          'Entropy of secret cryptographic keys',
          'Bandwidth capacity of network routes',
        ],
        correctAnswer: 0,
        explanation: 'Altering log files attacks their integrity, destroying their reliability as forensic evidence.',
      },
    ],
    masteryThreshold: 75,
    status: 'available',
  },
  phishing_social: {
    id: 'mod-webapp-security',
    domainId: 'phishing_social',
    title: 'Web Application Security (OWASP Top 10)',
    badge: 'APPLICATION DEFENSE',
    targetProficiency: 'Intermediate',
    whyRelevant: 'Web applications interface directly with the public internet, making vulnerabilities like Broken Access Control, SQL Injection, and Cross-Site Scripting (XSS) critical attack vectors.',
    objectives: [
      'Master the OWASP Top 10 risks: Broken Access Control, Injection, and Insecure Design',
      'Prevent SQL Injection and Command Injection through Parameterized Queries and ORM bindings',
      'Mitigate Cross-Site Scripting (XSS) and CSRF through Content Security Policy (CSP), Contextual Output Encoding, and SameSite cookies',
    ],
    lessons: [
      {
        id: 'owasp-l1',
        title: 'Broken Access Control & Insecure Direct Object References (IDOR)',
        readingMinutes: 3,
        summary: 'Broken Access Control is ranked #1 in the OWASP Top 10, allowing adversaries to manipulate direct resource identifiers and act as unauthorized users.',
        conceptBreakdown: [
          {
            heading: 'Insecure Direct Object References (IDOR)',
            body: 'When a web application fetches records using direct database keys (such as /api/invoices?id=102) without validating that the authenticated user owns record 102, an attacker can simply increment the ID to view every customer\'s confidential invoices.',
            analogy: 'A hotel giving every guest a master key that unlocks any door in the hallway simply by reading the room number engraved on it.',
          },
          {
            heading: 'Enforcing Server-Side Invariants',
            body: 'Never rely on client-side controls (such as hiding an Admin button with CSS or disabling an HTML input) for security. Adversaries bypass the browser UI entirely using curl or Postman. Access control and ownership validation must be strictly enforced on the server for every single API endpoint.',
          },
        ],
        keyTakeaways: [
          'Broken Access Control is the #1 web application threat on the modern internet.',
          'Always verify on the backend server that the authenticated session user has ownership or authorization for the requested resource ID.',
          'Client-side UI disabling provides zero security against direct API manipulation.',
        ],
      },
      {
        id: 'owasp-l2',
        title: 'Injection Neutralization & Cross-Site Scripting (XSS) Defense',
        readingMinutes: 3,
        summary: 'Injection attacks occur when untrusted user data is concatenated directly into query interpreters or rendered into browser DOM contexts without escaping.',
        conceptBreakdown: [
          {
            heading: 'SQL Injection (SQLi) & Parameterized Queries',
            body: 'Concatenating strings like "\' OR \'1\'=\'1" modifies backend database query logic, enabling authentication bypasses or complete database extraction. Parameterized queries (prepared statements) ensure user inputs are treated strictly as literal data parameters, mathematically eliminating SQL injection.',
            analogy: 'Passing an encrypted sealed envelope into a mail slot versus handing an open megaphone to a pilot to shout flight control instructions.',
          },
          {
            heading: 'Cross-Site Scripting (XSS) & Content Security Policy (CSP)',
            body: 'XSS injects malicious client-side JavaScript that executes within a victim\'s browser session, stealing session cookies or session tokens. Defend against XSS using contextual output encoding, modern UI frameworks that escape HTML by default, HttpOnly cookie flags, and strict Content Security Policies (CSP).',
          },
        ],
        keyTakeaways: [
          'Always use parameterized queries or ORM parameter binding; never concatenate untrusted strings into SQL statements.',
          'Store sensitive authentication tokens in HttpOnly, SameSite cookies to mitigate XSS token exfiltration.',
          'Deploy Content-Security-Policy (CSP) headers to restrict unauthorized script execution.',
        ],
      },
    ],
    interactiveExercise: {
      id: 'owasp-ex-1',
      title: 'Mitigate Critical Insecure Direct Object Reference (IDOR)',
      context: 'A healthcare portal allows patients to view their lab test results at /api/patient/records?reportId=8492. An attacker discovers that altering the reportId parameter to 8491 returns the medical diagnosis of another patient without triggering an access error.',
      prompt: 'What is the correct server-side architectural remedy to eliminate this OWASP Broken Access Control flaw?',
      options: [
        {
          text: 'Obfuscate the report ID into an MD5 hash or Base64 string on client interfaces',
          isCorrect: false,
          feedback: 'Encoding or obfuscating values on the client is security through obscurity; attackers can easily reverse, replay, or brute-force encoded IDs.',
        },
        {
          text: 'Validate server-side session ownership of the requested record before delivery',
          isCorrect: true,
          feedback: 'Correct! The backend server must authenticate the session and authorize access by verifying record ownership against the database before returning sensitive resources.',
        },
        {
          text: 'Disable browser developer tools and right-click menus with frontend scripts',
          isCorrect: false,
          feedback: 'Client-side event blocking provides zero security against direct API requests executed via Postman, curl, or Python scripts.',
        },
      ],
    },
    checkpointQuiz: [
      {
        id: 'owasp-q1',
        question: 'Which backend implementation technique mathematically prevents SQL Injection regardless of user input?',
        options: [
          'Restricting user input form field lengths to thirty characters maximum',
          'Using parameterized queries that separate data parameters from SQL syntax',
          'Relocating database listening ports from default configurations to port 9999',
          'Encrypting underlying storage drive volumes with full-disk BitLocker tools',
        ],
        correctAnswer: 1,
        explanation: 'Parameterized queries keep SQL code and data parameters completely separate, ensuring untrusted user input can never alter query logic or syntax.',
      },
      {
        id: 'owasp-q2',
        question: 'What is the primary defensive benefit of configuring session cookies with the HttpOnly and SameSite=Strict attributes?',
        options: [
          'It accelerates client browser asset decompression and cache retrieval speed',
          'HttpOnly blocks script cookie theft while SameSite prevents cross-site forgery',
          'It permits public web crawlers to index private dashboard profile sections',
          'It eliminates the requirement to enforce TLS encryption on incoming packets',
        ],
        correctAnswer: 1,
        explanation: 'HttpOnly prevents client-side scripts from reading authentication cookies during XSS attacks, while SameSite ensures cookies are never dispatched along with cross-site requests, mitigating CSRF.',
      },
    ],
    masteryThreshold: 75,
    status: 'locked',
  },
  passwords_auth: {
    id: 'mod-passwords-auth',
    domainId: 'passwords_auth',
    title: 'Authentication Hardening & Least Privilege',
    badge: 'ACCESS CONTROL',
    targetProficiency: 'Intermediate',
    whyRelevant: 'Weak passwords and over-privileged accounts turn minor workstation compromises into total enterprise takeovers.',
    objectives: [
      'Understand Multi-Factor Authentication (MFA) factors: Something you know, have, and are',
      'Defend against MFA push fatigue and SIM swapping',
      'Implement Least Privilege to minimize blast radius',
    ],
    lessons: [
      {
        id: 'auth-l1',
        title: 'MFA Architecture & Modern Bypass Attacks',
        readingMinutes: 3,
        summary: 'Passwords alone are obsolete. But not all MFA implementations offer equal protection.',
        conceptBreakdown: [
          {
            heading: 'The Three Factors',
            body: 'Knowledge factor (password/PIN), Possession factor (FIDO2 security key, authenticator app token), Inherence factor (biometrics). SMS codes are vulnerable to SIM swaps; hardware FIDO2 keys provide phishing-resistant authentication.',
          },
          {
            heading: 'The Blast Radius Principle',
            body: 'If an intern account has Domain Admin rights, compromising that intern grants access to everything. Under Least Privilege and Role-Based Access Control (RBAC), users only receive permissions required for their daily tasks.',
          },
        ],
        keyTakeaways: [
          'FIDO2 / WebAuthn passkeys are phishing-resistant.',
          'Never approve unexpected MFA push notifications.',
          'Least privilege contains the blast radius of any credential breach.',
        ],
      },
    ],
    interactiveExercise: {
      id: 'auth-ex-1',
      title: 'Contain the Compromised Contractor Account',
      context: 'A third-party contractor finishes their 2-week website design engagement. Their domain account was inadvertently assigned full database write permissions.',
      prompt: 'What defensive IAM action should be taken?',
      options: [
        {
          text: 'Leave the contractor account open in case they return for upcoming quarterly tasks',
          isCorrect: false,
          feedback: 'Dormant over-privileged accounts are prime targets for credential spray attacks.',
        },
        {
          text: 'Immediately revoke account access and audit permissions per offboarding standards',
          isCorrect: true,
          feedback: 'Correct! Timely offboarding and credential revocation prevents privilege creep and unauthorized persistent access.',
        },
        {
          text: 'Rename their account handle to inactive while leaving operational privileges valid',
          isCorrect: false,
          feedback: 'Renaming the account does not revoke its active permissions or tokens.',
        },
      ],
    },
    checkpointQuiz: [
      {
        id: 'auth-q1',
        question: 'Which authentication method provides the strongest protection against adversary-in-the-middle phishing proxies?',
        options: [
          'SMS one-time verification text passcode',
          'FIDO2 / WebAuthn hardware security key',
          'Mother maiden name security question answer',
          'Complex sixteen-character symbol password',
        ],
        correctAnswer: 1,
        explanation: 'FIDO2 keys bind credentials cryptographically to the exact browser URL domain, making proxy phishing mathematically impossible.',
      },
    ],
    masteryThreshold: 75,
    status: 'locked',
  },
  malware_attacks: {
    id: 'mod-malware',
    domainId: 'malware_attacks',
    title: 'Advanced Cryptography & Modern Ciphers',
    badge: 'CRYPTOGRAPHIC DEFENSE',
    targetProficiency: 'Intermediate',
    whyRelevant: 'Modern cybersecurity guarantees rest upon mathematical confidentiality, forward secrecy, and tamper-proof authenticated encryption.',
    objectives: [
      'Master symmetric vs asymmetric primitives and hybrid cryptosystems',
      'Understand Authenticated Encryption with Associated Data (AEAD, e.g. AES-GCM) and nonce security',
      'Implement Perfect Forward Secrecy (PFS), key rotation lifecycles, and cryptographic agility',
    ],
    lessons: [
      {
        id: 'crypto-l1',
        title: 'Symmetric, Asymmetric & Hybrid Architectures',
        readingMinutes: 3,
        summary: 'No single cryptographic primitive does everything: modern high-speed systems combine symmetric bulk throughput with asymmetric key exchange.',
        conceptBreakdown: [
          {
            heading: 'Symmetric Throughput vs Asymmetric Key Distribution',
            body: 'Symmetric ciphers (such as AES-256) use a single shared key for encryption and decryption, offering extreme hardware-accelerated throughput. Asymmetric ciphers (such as RSA and ECC) use key pairs (public for encryption/verification, private for decryption/signing), resolving the dangerous key distribution problem.',
            analogy: 'A heavy titanium deposit box locked with a combination (symmetric), whose combination is securely delivered in a personalized lockbox that only the recipient holds the physical key to unlock (asymmetric).',
          },
          {
            heading: 'The TLS 1.3 Hybrid Handshake',
            body: 'Because asymmetric encryption is computationally demanding, protocols like TLS negotiate a temporary symmetric session key using Elliptic Curve Diffie-Hellman (ECDHE), then encrypt high-bandwidth application traffic using AES-GCM.',
          },
          {
            heading: 'Authenticated Encryption (AEAD) & Nonce Replay Danger',
            body: 'AEAD ciphers like AES-256-GCM guarantee both Confidentiality and Integrity by generating an authentication tag alongside the ciphertext. However, reusing an Initialization Vector (IV) or Nonce with the same key destroys the mathematical guarantees and leaks plaintext.',
          },
        ],
        keyTakeaways: [
          'Symmetric ciphers encrypt bulk data at line rate; asymmetric algorithms securely establish shared session keys.',
          'Never reuse an Initialization Vector (IV) or Nonce with the same key in AES-GCM mode.',
          'Always use AEAD (Authenticated Encryption with Associated Data) to prevent chosen-ciphertext attacks.',
        ],
      },
      {
        id: 'crypto-l2',
        title: 'Perfect Forward Secrecy & Key Governance',
        readingMinutes: 2,
        summary: 'Static master keys expose all historical traffic to retrospective decryption; ephemeral keys protect past communications permanently.',
        conceptBreakdown: [
          {
            heading: 'Perfect Forward Secrecy (PFS)',
            body: 'With PFS (such as Ephemeral Diffie-Hellman), session keys are generated dynamically per connection and discarded immediately afterward. Even if an adversary steals the server long-term private key in 5 years, previously captured traffic sessions can never be decrypted.',
            analogy: 'Burning the temporary codebook page after each single conversation so yesterday words can never be unlocked if today notebook is stolen.',
          },
          {
            heading: 'Hardware Security Modules (HSMs) & Zeroization',
            body: 'Production cryptographic master keys must never reside in plaintext on application servers. They are stored in Hardware Security Modules (HSMs) that zeroize (erase) keys if physical tampering or unauthorized extraction is detected.',
          },
        ],
        keyTakeaways: [
          'Ephemeral key exchange guarantees that a future key compromise does not compromise past network captures.',
          'Cryptographic keys require systematic rotation, hardware security module (HSM) storage, and strict destruction protocols.',
        ],
      },
    ],
    interactiveExercise: {
      id: 'crypto-ex-1',
      title: 'Triage Cryptographic Flaw in Payment API',
      context: 'A payment gateway encrypts credit card numbers in its database using AES in Electronic Codebook (ECB) mode with a hardcoded static key in the application source code.',
      prompt: 'What is the critical cryptographic vulnerability in this implementation?',
      options: [
        {
          text: 'ECB mode incurs excessive computing latency and slows down web servers',
          isCorrect: false,
          feedback: 'ECB mode is actually computationally fast, but catastrophically insecure.',
        },
        {
          text: 'ECB mode preserves structural data patterns and leaks confidential bytes',
          isCorrect: true,
          feedback: 'Correct! ECB preserves data patterns (the famous ECB penguin) and lacks an initialization vector. Production encryption must use AEAD modes like AES-GCM with secure Key Management Services (KMS).',
        },
        {
          text: 'AES algorithms are obsolete legacy ciphers deprecated by NIST standards',
          isCorrect: false,
          feedback: 'AES remains the global gold standard NIST cipher; the flaw lies in the cipher block mode (ECB) and static key management.',
        },
      ],
    },
    checkpointQuiz: [
      {
        id: 'crypto-q1',
        question: 'Why does TLS 1.3 require Ephemeral Diffie-Hellman (ECDHE) instead of static RSA key exchange?',
        options: [
          'To provide Perfect Forward Secrecy preventing decryption of past captured traffic',
          'Because legacy RSA algorithms cannot encrypt plaintext records containing spaces',
          'To compress application network payloads and minimize external internet bandwidth',
          'Because ephemeral cryptographic cipher suites run exclusively on select weekdays',
        ],
        correctAnswer: 0,
        explanation: 'PFS generates short-lived session keys that are erased after the session, ensuring historical captured traffic remains permanently encrypted even if long-term private keys leak later.',
      },
      {
        id: 'crypto-q2',
        question: 'What crucial property does Authenticated Encryption with Associated Data (AEAD, e.g. AES-GCM) provide that simple AES-CBC lacks on its own?',
        options: [
          'Simultaneous validation of data integrity and confidentiality to reject tampering',
          'Automated hardware failover recovery from catastrophic server hard drive crashes',
          'Total elimination of master administrative user authentication passwords on disk',
          'Lossless mathematical compression of application network payload packets in transit',
        ],
        correctAnswer: 0,
        explanation: 'AEAD cryptographically authenticates the ciphertext with an authentication tag (MAC), immediately rejecting tampered ciphertext before decryption can execute padding oracle attacks.',
      },
    ],
    masteryThreshold: 75,
    status: 'locked',
  },
  network_security: {
    id: 'mod-network',
    domainId: 'network_security',
    title: 'Network Defense & Encrypted Transit',
    badge: 'NETWORK INFRASTRUCTURE',
    targetProficiency: 'Intermediate',
    whyRelevant: 'Data in transit is subject to packet sniffing, DNS hijacking, and untrusted network tampering.',
    objectives: [
      'Understand TLS 1.3 encryption and certificate authority hierarchies',
      'Identify Man-in-the-Middle (MitM) indicators on untrusted networks',
      'Apply network segmentation to prevent lateral attack traversal',
    ],
    lessons: [
      {
        id: 'net-l1',
        title: 'Encryption in Transit & Public Networks',
        readingMinutes: 3,
        summary: 'Transport Layer Security (TLS) protects data over untrusted wires, but depends on certificate validation.',
        conceptBreakdown: [
          {
            heading: 'The Certificate Anchor',
            body: 'When your browser connects via HTTPS, the server presents a digital certificate signed by a trusted Root Certificate Authority. If a rogue proxy intercepts traffic, the certificate fingerprint mismatches, triggering a browser security alert.',
          },
        ],
        keyTakeaways: [
          'Never bypass red certificate invalidity warnings on public Wi-Fi.',
          'Always use trusted enterprise VPNs when transmitting business data over untrusted links.',
        ],
      },
    ],
    interactiveExercise: {
      id: 'net-ex-1',
      title: 'Public Wi-Fi Certificate Alert Response',
      context: 'Connecting to your company intranet while on coffee shop Wi-Fi produces an alert: "The certificate presented is self-signed by rogue-gateway.local".',
      prompt: 'What does this alert tell you?',
      options: [
        {
          text: 'The public hotspot offers high-speed bandwidth connectivity for web browsing',
          isCorrect: false,
          feedback: 'Speed is unrelated to cryptographic trust.',
        },
        {
          text: 'An unauthorized proxy is attempting to intercept and decrypt your connection',
          isCorrect: true,
          feedback: 'Correct! An untrusted local self-signed certificate proves traffic is being actively rerouted and inspected.',
        },
        {
          text: 'The remote web server has temporarily exhausted available connection threads',
          isCorrect: false,
          feedback: 'Continuing sends your credentials in plaintext to the interceptor.',
        },
      ],
    },
    checkpointQuiz: [
      {
        id: 'net-q1',
        question: 'What is the primary security function of network segmentation?',
        options: [
          'Confining adversaries to isolated subnets to prevent lateral movement',
          'Eliminating the operational necessity of enforcing user passwords',
          'Forcing all internal corporate workstations to share one IP address',
          'Encrypting local portable storage media drives using hardware chips',
        ],
        correctAnswer: 0,
        explanation: 'Network segmentation creates firewall boundaries between subnets, drastically limiting attacker lateral traversal.',
      },
    ],
    masteryThreshold: 75,
    status: 'locked',
  },
  incident_response: {
    id: 'mod-incident-response',
    domainId: 'incident_response',
    title: 'Incident Triage & Breach Containment',
    badge: 'INCIDENT RESPONSE',
    targetProficiency: 'Advanced',
    whyRelevant: 'Breaches are inevitable; organizational survival depends on containment speed and forensic integrity.',
    objectives: [
      'Master the NIST Incident Response Lifecycle (Preparation, Detection, Containment, Eradication, Recovery, Lessons Learned)',
      'Preserve volatile digital forensic evidence during triage',
      'Establish clear communication boundaries during active emergencies',
    ],
    lessons: [
      {
        id: 'ir-l1',
        title: 'Triage Without Contaminating the Crime Scene',
        readingMinutes: 3,
        summary: 'First responders often make mistakes by formatting disks prematurely, destroying RAM artifacts.',
        conceptBreakdown: [
          {
            heading: 'Order of Volatility',
            body: 'RAM and active network connections disappear the moment power is cut. Forensic analysts capture memory dumps before isolating or shutting down systems.',
          },
        ],
        keyTakeaways: [
          'Contain first, preserve evidence second, eradicate third.',
          'Document every command executed with timestamps.',
        ],
      },
    ],
    interactiveExercise: {
      id: 'ir-ex-1',
      title: 'Live Breach Triage Decision',
      context: 'A production payment server is actively exfiltrating cardholder numbers to a suspicious cloud storage bucket in Eastern Europe.',
      prompt: 'What is the priority sequence for the response team?',
      options: [
        {
          text: 'Reboot the operating system immediately to flush runtime volatile RAM contents',
          isCorrect: false,
          feedback: 'Rebooting wipes volatile RAM and uncommitted logs needed to identify how the intruder gained access.',
        },
        {
          text: 'Isolate server network links to halt exfiltration while dumping volatile memory',
          isCorrect: true,
          feedback: 'Correct! Stops data leakage immediately while preserving critical in-memory forensic evidence.',
        },
        {
          text: 'Postpone response actions until after business hours to avoid service downtime',
          isCorrect: false,
          feedback: 'Waiting allows the adversary to exfiltrate all remaining customer records and deploy destructive ransomware.',
        },
      ],
    },
    checkpointQuiz: [
      {
        id: 'ir-q1',
        question: 'What is the goal of the "Lessons Learned" phase following a cybersecurity incident?',
        options: [
          'Assign personal disciplinary blame to the employee who made the mistake',
          'Analyze root causes, patch defensive gaps, and refine response runbooks',
          'Conceal the forensic incident report from executive leadership auditors',
          'Purge all system log traces to prevent public regulatory investigations',
        ],
        correctAnswer: 1,
        explanation: 'Post-incident reviews objectively harden detection and response runbooks, preventing recurrent compromises.',
      },
    ],
    masteryThreshold: 75,
    status: 'locked',
  },
  privacy_hygiene: {
    id: 'mod-privacy',
    domainId: 'privacy_hygiene',
    title: 'Data Hygiene, Classification & Privacy',
    badge: 'DIGITAL HYGIENE',
    targetProficiency: 'Developing',
    whyRelevant: 'Data sprawl and unclassified assets represent unmonitored liabilities in modern cloud environments.',
    objectives: [
      'Classify data by sensitivity: Public, Internal, Confidential, Restricted',
      'Implement least privilege on mobile and SaaS app integrations',
      'Safeguard personally identifiable information (PII) against accidental disclosure',
    ],
    lessons: [
      {
        id: 'priv-l1',
        title: 'Minimizing Your Attack Surface',
        readingMinutes: 2,
        summary: 'Data that you do not collect or store cannot be breached.',
        conceptBreakdown: [
          {
            heading: 'Data Minimization',
            body: 'Only retain customer data required for active legal and operational requirements. Encrypt all databases at rest using managed KMS keys.',
          },
        ],
        keyTakeaways: [
          'Label and restrict sensitive PII and financial records.',
          'Regularly purge obsolete credentials and stale backups.',
        ],
      },
    ],
    interactiveExercise: {
      id: 'priv-ex-1',
      title: 'Cloud Storage Bucket Exposure',
      context: 'An AWS S3 bucket containing 100,000 PDF invoices with customer home addresses and credit balances is configured with "Read: Public World Access".',
      prompt: 'What is the immediate defensive remediation?',
      options: [
        {
          text: 'Embed a secret access passphrase inside the cloud storage bucket domain name',
          isCorrect: false,
          feedback: 'Bucket names are public strings and do not restrict object access policies.',
        },
        {
          text: 'Enable Block Public Access and restrict permissions via strict IAM policies',
          isCorrect: true,
          feedback: 'Correct! Blocking public access immediately seals the exposure while access logs reveal breach extent.',
        },
        {
          text: 'Terminate the entire corporate cloud subscription account without review',
          isCorrect: false,
          feedback: 'Extreme and counterproductive; proper IAM policy configuration fixes the vulnerability.',
        },
      ],
    },
    checkpointQuiz: [
      {
        id: 'priv-q1',
        question: 'What is the benefit of encrypting data at rest on enterprise laptops?',
        options: [
          'Stolen physical laptops cannot reveal customer files without the decryption key',
          'Laptop hardware screens automatically display higher contrast visual clarity',
          'Operating systems autonomously purge polymorphic malware strains from memory',
          'Employees can transmit confidential documents without requiring credentials',
        ],
        correctAnswer: 0,
        explanation: 'Full disk encryption (BitLocker/FileVault) protects confidentiality against physical device theft.',
      },
    ],
    masteryThreshold: 75,
    status: 'locked',
  },
  risk_analysis: {
    id: 'mod-risk-analysis',
    domainId: 'risk_analysis',
    title: 'Threat Modeling & Risk-Based Prioritization',
    badge: 'STRATEGIC DEFENSE',
    targetProficiency: 'Advanced',
    whyRelevant: 'Security teams possess finite resources; understanding risk prevents under-defending critical crown jewels.',
    objectives: [
      'Calculate Risk = Threat Likelihood × Business Impact',
      'Identify crown jewels and single points of failure in technical architecture',
      'Balance security controls against operational usability and latency',
    ],
    lessons: [
      {
        id: 'risk-l1',
        title: 'Strategic Threat Prioritization',
        readingMinutes: 3,
        summary: 'Not all vulnerabilities pose equal danger. Context determines real-world exploitability.',
        conceptBreakdown: [
          {
            heading: 'Prioritizing Real Attack Paths',
            body: 'An unauthenticated remote code execution flaw on an internet-facing web server represents urgent high risk. The same flaw on an offline isolated lab workstation represents low immediate risk.',
          },
        ],
        keyTakeaways: [
          'Focus defensive investments where threat likelihood and organizational impact intersect.',
        ],
      },
    ],
    interactiveExercise: {
      id: 'risk-ex-1',
      title: 'Security Budget Allocation',
      context: 'You have budget for one major project: Defend against theoretical quantum decryption in 2035, or deploy automated phishing-resistant MFA across all employee accounts handling customer records today.',
      prompt: 'How should risk analysis guide your decision?',
      options: [
        {
          text: 'Fund the 2035 theoretical project because futuristic algorithms sound elite',
          isCorrect: false,
          feedback: 'Fails to address active high-probability threats occurring right now.',
        },
        {
          text: 'Deploy phishing-resistant MFA today to neutralize active high-impact attacks',
          isCorrect: true,
          feedback: 'Correct! Risk management prioritizes active, high-probability threats that cause immediate organizational devastation.',
        },
        {
          text: 'Split financial capital equally and leave both defensive initiatives halfway',
          isCorrect: false,
          feedback: 'Partial implementations often fail to secure either threat vector.',
        },
      ],
    },
    checkpointQuiz: [
      {
        id: 'risk-q1',
        question: 'In threat modeling, what does the term "Attack Surface" refer to?',
        options: [
          'The total sum of all vulnerabilities, network entry points, APIs, and people',
          'The diagonal dimension of physical monitors installed in security centers',
          'The total count of third-party antivirus utilities installed on a workstation',
          'The manufacturer brand and physical model of perimeter hardware routers used',
        ],
        correctAnswer: 0,
        explanation: 'Attack surface encompasses all exposed touchpoints — code, ports, APIs, and people — reachable by an adversary.',
      },
    ],
    masteryThreshold: 75,
    status: 'locked',
  },
};
