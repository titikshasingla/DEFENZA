export type CybersecurityDomain =
  | 'cia_triad'
  | 'passwords_auth'
  | 'phishing_social'
  | 'malware_attacks'
  | 'network_security'
  | 'privacy_hygiene'
  | 'incident_response'
  | 'risk_analysis';

export interface DomainMeta {
  id: CybersecurityDomain;
  name: string;
  shortDesc: string;
  icon: string;
  color: string;
}

export const DOMAIN_METADATA: Record<CybersecurityDomain, DomainMeta> = {
  cia_triad: {
    id: 'cia_triad',
    name: 'Core Security Architecture',
    shortDesc: 'Data protection, verification, and resilience',
    icon: '🛡️',
    color: '#22d3ee', // cyan
  },
  passwords_auth: {
    id: 'passwords_auth',
    name: 'Authentication & Passwords',
    shortDesc: 'MFA, credential hygiene, and least privilege',
    icon: '🔑',
    color: '#38bdf8', // sky
  },
  phishing_social: {
    id: 'phishing_social',
    name: 'Web Application Security (OWASP)',
    shortDesc: 'OWASP Top 10, SQLi, XSS, Broken Access Control, and secure headers',
    icon: '🌐',
    color: '#f59e0b', // amber
  },
  malware_attacks: {
    id: 'malware_attacks',
    name: 'Advanced Cryptography',
    shortDesc: 'Symmetric & asymmetric ciphers, AEAD, PFS, and key management',
    icon: '🔐',
    color: '#f43f5e', // rose
  },
  network_security: {
    id: 'network_security',
    name: 'Network Security & Safe Browsing',
    shortDesc: 'TLS, firewalls, VPNs, and traffic inspection',
    icon: '🌐',
    color: '#a855f7', // purple
  },
  privacy_hygiene: {
    id: 'privacy_hygiene',
    name: 'Data Privacy & Digital Hygiene',
    shortDesc: 'Data exposure, encryption at rest, and permissions',
    icon: '🔒',
    color: '#4ade80', // green
  },
  incident_response: {
    id: 'incident_response',
    name: 'Incident Response & Triage',
    shortDesc: 'Containment, log forensics, and disaster recovery',
    icon: '🚨',
    color: '#fbbf24', // amber
  },
  risk_analysis: {
    id: 'risk_analysis',
    name: 'Risk & Threat Modeling',
    shortDesc: 'Impact vs likelihood, threat vectors, and trade-offs',
    icon: '⚖️',
    color: '#ec4899', // pink
  },
};

export type ProficiencyLevel = 'Beginner' | 'Developing' | 'Intermediate' | 'Advanced';

export interface DiagnosticQuestion {
  id: string;
  domain: CybersecurityDomain;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'multiple_choice' | 'scenario' | 'short_answer';
  scenario?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  conceptTested: string;
}

export interface UserAnswerRecord {
  questionId: string;
  domain: CybersecurityDomain;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  selectedOption: number;
  isNotSure: boolean;
  isCorrect: boolean;
  shortAnswerText?: string;
  timestamp: number;
}

export interface DomainProfile {
  domainId: CybersecurityDomain;
  domainName: string;
  proficiency: ProficiencyLevel;
  masteryScore: number; // 0 - 100
  conceptsDemonstrated: string[];
  misconceptionsOrGaps: string[];
  nextObjective: string;
  confidence: 'High' | 'Medium' | 'Low';
  needsFurtherAssessment: boolean;
}

export interface KnowledgeProfile {
  id: string;
  createdAt: number;
  overallProficiency: ProficiencyLevel;
  overallSummary: string;
  domains: Record<CybersecurityDomain, DomainProfile>;
  strongestAreas: string[];
  topImprovementConcepts: string[];
  recommendedStartingPoint: string;
  totalDiagnosticAnswered: number;
  uncertaintyDetected: boolean;
}

export interface ModuleLesson {
  id: string;
  title: string;
  readingMinutes: number;
  summary: string;
  conceptBreakdown: { heading: string; body: string; analogy?: string }[];
  keyTakeaways: string[];
}

export interface InteractiveExercise {
  id: string;
  title: string;
  context: string;
  prompt: string;
  options: { text: string; isCorrect: boolean; feedback: string }[];
}

export interface CheckpointQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface StudyModule {
  id: string;
  domainId: CybersecurityDomain;
  title: string;
  badge: string;
  targetProficiency: ProficiencyLevel;
  whyRelevant: string;
  objectives: string[];
  lessons: ModuleLesson[];
  interactiveExercise: InteractiveExercise;
  checkpointQuiz: CheckpointQuizQuestion[];
  masteryThreshold: number; // e.g. 75
  status: 'locked' | 'available' | 'in_progress' | 'mastered';
  currentScore?: number;
  lastAttemptAt?: number;
}

export interface LearningCurriculum {
  id: string;
  userId: string;
  generatedAt: number;
  targetProfileSummary: string;
  modules: StudyModule[];
  completedCount: number;
  overallProgress: number; // 0 - 100%
}
