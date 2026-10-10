export type CybersecurityDomain =
  | 'cia_triad'
  | 'passwords_auth'
  | 'phishing_social'
  | 'malware_attacks'
  | 'network_security'
  | 'privacy_hygiene'
  | 'incident_response'
  | 'risk_analysis';

export type ProficiencyLevel = 'Beginner' | 'Developing' | 'Intermediate' | 'Advanced';

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
  masteryScore: number;
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
  masteryThreshold: number;
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
  overallProgress: number;
}

export const ALL_DOMAINS: CybersecurityDomain[] = [
  'cia_triad',
  'passwords_auth',
  'phishing_social',
  'malware_attacks',
  'network_security',
  'privacy_hygiene',
  'incident_response',
  'risk_analysis',
];

export const DOMAIN_TITLES: Record<CybersecurityDomain, string> = {
  cia_triad: 'Core Security Architecture',
  passwords_auth: 'Authentication & Credential Security',
  phishing_social: 'Web Application Security (OWASP Top 10)',
  malware_attacks: 'Advanced Cryptography & Modern Ciphers',
  network_security: 'Network Security & Safe Browsing',
  privacy_hygiene: 'Data Privacy & Digital Hygiene',
  incident_response: 'Incident Response & Threat Containment',
  risk_analysis: 'Risk Analysis & Threat Modeling',
};

// Generates an objective, deterministic baseline profile from raw answer telemetry
export function calculateBaselineDomainMetrics(answers: UserAnswerRecord[]): Record<CybersecurityDomain, {
  total: number;
  correct: number;
  notSure: number;
  wrong: number;
  score: number;
  proficiency: ProficiencyLevel;
  confidence: 'High' | 'Medium' | 'Low';
  needsFurther: boolean;
}> {
  const result: any = {};

  for (const domain of ALL_DOMAINS) {
    const domainAnswers = answers.filter((a) => a.domain === domain);
    const total = domainAnswers.length;
    const correct = domainAnswers.filter((a) => a.isCorrect).length;
    const notSure = domainAnswers.filter((a) => a.isNotSure).length;
    const wrong = domainAnswers.filter((a) => !a.isCorrect && !a.isNotSure).length;

    let score = 50; // default baseline if untested
    let proficiency: ProficiencyLevel = 'Developing';
    let confidence: 'High' | 'Medium' | 'Low' = 'Low';
    let needsFurther = false;

    if (total > 0) {
      if (total >= 2) {
        confidence = 'High';
      } else {
        confidence = 'Medium';
      }

      // Explicit "Not sure" receives 35 score with clear uncertainty flag, rather than treating as 0
      const pointSum = domainAnswers.reduce((acc, a) => {
        if (a.isCorrect) return acc + 100;
        if (a.isNotSure) return acc + 35;
        return acc + 10;
      }, 0);

      score = Math.round(pointSum / total);

      if (notSure > 0 || total < 2) {
        needsFurther = true;
      }

      if (score >= 85) proficiency = 'Advanced';
      else if (score >= 70) proficiency = 'Intermediate';
      else if (score >= 45) proficiency = 'Developing';
      else proficiency = 'Beginner';
    } else {
      needsFurther = true;
    }

    result[domain] = { total, correct, notSure, wrong, score, proficiency, confidence, needsFurther };
  }

  return result;
}

export { CURRICULUM_CATALOG } from './src/data/curriculumCatalog.ts';
