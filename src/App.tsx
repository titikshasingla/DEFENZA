import React, { useState, useEffect, useRef } from 'react';
import { LandingHero } from './components/LandingHero.tsx';
import { RegistrationPortal, UserRegistrationProfile } from './components/RegistrationPortal.tsx';
import { OnboardingWelcome } from './components/OnboardingWelcome.tsx';
import { DiagnosticAssessment } from './components/DiagnosticAssessment.tsx';
import { KnowledgeProfileDashboard } from './components/KnowledgeProfileDashboard.tsx';
import { LearningPathDashboard } from './components/LearningPathDashboard.tsx';
import { ModuleStudyView } from './components/ModuleStudyView.tsx';
import { CURRICULUM_CATALOG } from './data/curriculumCatalog.ts';
import type { KnowledgeProfile, LearningCurriculum, StudyModule } from './types/adaptive.ts';

const PerfectScoreCelebration = React.lazy(() =>
  import('./components/PerfectScoreCelebration').then((m) => ({
    default: m.PerfectScoreCelebration,
  }))
);

interface Question {
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

const QUESTIONS: Question[] = [
  {
    q: "A hospital receptionist can access every patient's medical record, even though their job only requires access to appointment information. What is the primary security weakness?",
    options: [
      "Degraded operational availability",
      "Excessive rights breaching confidentiality",
      "Inadequate automated failover recovery",
      "Cryptographic hash function collision",
    ],
    answer: 1,
    explain: "The account has more permissions than necessary. Least privilege and RBAC can reduce unnecessary access.",
  },
  {
    q: "A bank transaction changes from $10,000 to $90,000 without authorization. Which security property is primarily affected?",
    options: [
      "Confidentiality",
      "Integrity",
      "Availability",
      "Redundancy",
    ],
    answer: 1,
    explain: "The data has been modified without authorization, so integrity has been compromised.",
  },
  {
    q: "A primary database server fails and a standby server automatically takes over. Which security property is being supported?",
    options: [
      "Confidentiality",
      "Integrity",
      "Availability",
      "Authentication",
    ],
    answer: 2,
    explain: "Failover keeps the service accessible when the primary component fails.",
  },
  {
    q: "You download a file and its SHA-256 hash does not match the hash published by the trusted source. What does this indicate?",
    options: [
      "The file was intentionally fabricated by an attacker",
      "The file may have been altered or corrupted in transit",
      "The host server has encountered complete offline failure",
      "The cryptographic encryption key matched expected values",
    ],
    answer: 1,
    explain: "A hash mismatch indicates the data is not identical to the expected data. It does not by itself prove who changed it.",
  },
  {
    q: "An organization states that a critical service must be restored within 30 minutes after a major outage. Which concept describes this target?",
    options: [
      "RPO",
      "RBAC",
      "RTO",
      "MAC",
    ],
    answer: 2,
    explain: "Recovery Time Objective defines the target time for restoring a service.",
  },
  {
    q: "A company can tolerate losing at most 15 minutes of recent data after a major incident. Which concept is this?",
    options: [
      "RPO",
      "RTO",
      "IAM",
      "RBAC",
    ],
    answer: 0,
    explain: "Recovery Point Objective describes the acceptable amount of data loss measured in time.",
  },
  {
    q: "An encryption key for confidential company files is available to every employee, including employees who never need those files. What is the main concern?",
    options: [
      "Availability",
      "Confidentiality",
      "Redundancy",
      "Failover",
    ],
    answer: 1,
    explain: "Unnecessary access to sensitive decryption keys increases confidentiality risk.",
  },
  {
    q: "A security team creates extremely restrictive access rules. During an emergency, authorized operators cannot access a critical system. Which security property may have been negatively affected?",
    options: [
      "Availability",
      "Authentication",
      "Data integrity",
      "Non-repudiation",
    ],
    answer: 0,
    explain: "A control can be secure but still harm availability if legitimate users cannot access required resources.",
  },
  {
    q: "An attacker modifies security logs to hide evidence of their activity. Which security property is directly targeted?",
    options: [
      "Integrity",
      "Availability",
      "Confidentiality",
      "Authentication",
    ],
    answer: 0,
    explain: "The logs have been deliberately altered, compromising their integrity and reducing their reliability as evidence.",
  },
  {
    q: "An attacker encrypts a company's systems and also steals customer information. Which security properties are affected?",
    options: [
      "Operational availability only",
      "Customer confidentiality only",
      "Availability and confidentiality",
      "Database record integrity only",
    ],
    answer: 2,
    explain: "Encrypted systems may become unavailable, while stolen customer information creates a confidentiality breach.",
  },
];

type PageId =
  | 'landing'
  | 'registration'
  | 'start'
  | 'briefing'
  | 'confidentiality'
  | 'integrity'
  | 'availability'
  | 'tradeoffs'
  | 'facts'
  | 'quiz'
  | 'result'
  | 'gameover'
  | 'onboarding-welcome'
  | 'onboarding-diagnostic'
  | 'adaptive-profile'
  | 'learning-path'
  | 'module-study';

const PAGES: PageId[] = [
  'start',
  'briefing',
  'confidentiality',
  'integrity',
  'availability',
  'tradeoffs',
  'facts',
  'quiz',
  'result',
];

interface TermExplanation {
  term: string;
  meaning: string;
  whyItMatters: string;
  realWorldExample: string;
  technicalNote: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'buddy';
  content: string;
  timestamp: string;
  termData?: TermExplanation;
}

const QUICK_QUESTIONS = [
  "What is OWASP Top 10?",
  "How does a firewall work?",
  "What is a zero-day vulnerability?",
  "Explain core security architecture in simple terms",
  "How to prevent SQL Injection in web apps?",
];

// Supported working time presets in minutes
const WORKING_TIME_PRESETS = [
  { label: '1 Min (Blitz)', minutes: 1, desc: 'Ultra-fast pace' },
  { label: '2 Min (Rapid)', minutes: 2, desc: 'Fast tactical' },
  { label: '3 Min (Tactical)', minutes: 3, desc: 'Standard reduced' },
  { label: '5 Min (Standard)', minutes: 5, desc: 'Balanced pace' },
];

export default function App() {
  // User Registration Profile State & LocalStorage Persistence
  const [userProfile, setUserProfile] = useState<UserRegistrationProfile | null>(() => {
    try {
      const saved = localStorage.getItem('defenza_user_profile');
      if (saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch {
      return null;
    }
  });

  // Adaptive Intelligence State & LocalStorage Persistence
  const [profile, setProfile] = useState<KnowledgeProfile | null>(() => {
    try {
      const saved = localStorage.getItem('defenza_adaptive_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.domains && parsed.domains.malware_attacks) {
          parsed.domains.malware_attacks.domainName = 'Advanced Cryptography & Modern Ciphers';
        }
        if (parsed && parsed.domains && parsed.domains.phishing_social) {
          parsed.domains.phishing_social.domainName = 'Web Application Security (OWASP Top 10)';
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [curriculum, setCurriculum] = useState<LearningCurriculum | null>(() => {
    try {
      const saved = localStorage.getItem('defenza_adaptive_curriculum');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Sanity check: Ensure modules without attempt score aren't mistakenly marked mastered
        if (parsed && Array.isArray(parsed.modules)) {
          parsed.modules = parsed.modules.map((m: StudyModule, idx: number) => {
            // Automatically upgrade old malware module to Advanced Cryptography module
            if (m.domainId === 'malware_attacks' && (m.title.includes('Malware') || m.title.includes('Ransomware'))) {
              const freshCrypto = CURRICULUM_CATALOG.malware_attacks;
              return {
                ...freshCrypto,
                status: m.status,
                currentScore: m.currentScore,
                lastAttemptAt: m.lastAttemptAt,
                whyRelevant: m.whyRelevant.replace(/Malware|malware/g, 'Advanced Cryptography'),
              };
            }
            // Automatically upgrade old phishing module to Web Application Security (OWASP) module
            if (m.domainId === 'phishing_social' && (m.title.includes('Phishing') || m.title.includes('Human Factor'))) {
              const freshOwasp = CURRICULUM_CATALOG.phishing_social;
              return {
                ...freshOwasp,
                status: m.status,
                currentScore: m.currentScore,
                lastAttemptAt: m.lastAttemptAt,
                whyRelevant: freshOwasp.whyRelevant,
              };
            }
            if (m.status === 'mastered' && (m.currentScore === undefined || m.currentScore === null)) {
              return { ...m, status: idx === 0 ? 'available' : 'locked' };
            }
            return m;
          });
          const masteredCount = parsed.modules.filter((m: StudyModule) => m.status === 'mastered').length;
          parsed.completedCount = masteredCount;
          parsed.overallProgress = parsed.modules.length > 0 ? Math.round((masteredCount / parsed.modules.length) * 100) : 0;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [activeStudyModule, setActiveStudyModule] = useState<StudyModule | null>(null);

  // Initial page: if first-time visitor (no user profile), default to 'landing'
  // Returning users skip landing and registration and go straight to the existing flow ('start')
  const [currentPage, setCurrentPage] = useState<PageId>(() => {
    try {
      const savedUser = localStorage.getItem('defenza_user_profile');
      if (!savedUser) {
        return 'landing';
      }
    } catch {
      // ignore
    }
    return 'start';
  });

  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [correct, setCorrect] = useState(0);

  // Quiz working time state: Default reduced to 3 minutes (from previous 10 minutes)
  const [workingTimeMinutes, setWorkingTimeMinutes] = useState(3);
  const [remainingSeconds, setRemainingSeconds] = useState(3 * 60);
  const [assessmentActive, setAssessmentActive] = useState(false);
  const assessmentDeadlineRef = useRef<number | null>(null);

  // Quiz progression state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [validationAlert, setValidationAlert] = useState(false);

  // Mini threat scenario state in Integrity page
  const [integrityScenarioChoice, setIntegrityScenarioChoice] = useState<number | null>(null);

  // Perfect score celebration overlay state
  const [showCelebration, setShowCelebration] = useState(true);

  // DEFENZA Cybersecurity Help Buddy state
  const [isHelpBuddyOpen, setIsHelpBuddyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'term' | 'chat'>('chat');
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [termExplanation, setTermExplanation] = useState<TermExplanation | null>(null);
  const [termLoading, setTermLoading] = useState(false);
  const [termError, setTermError] = useState<string | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'buddy',
      content:
        "👋 Hi! I'm your DEFENZA Cybersecurity Help Buddy, powered by AI. Ask me any cybersecurity question, or click any term (like Encryption, IAM, or RTO) anywhere in the mission to get an instant explanation!",
      timestamp: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Timed assessment countdown with exact deadline tracking
  useEffect(() => {
    if (!assessmentActive) return;

    const updateCountdown = () => {
      const deadline = assessmentDeadlineRef.current;
      if (deadline === null) return;
      const secondsLeft = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemainingSeconds(secondsLeft);

      if (secondsLeft <= 0) {
        setAssessmentActive(false);
        setCurrentPage('gameover');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    updateCountdown();
    const timerId = window.setInterval(updateCountdown, 250);
    return () => window.clearInterval(timerId);
  }, [assessmentActive]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'chat' && isHelpBuddyOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab, isHelpBuddyOpen]);

  const clientTermCache = useRef<Map<string, TermExplanation>>(new Map());
  const activeTermAbortController = useRef<AbortController | null>(null);

  // Click-To-Explain on any element with the .term class with instant 0ms cache
  const explainTerm = async (termText: string) => {
    const cleanTerm = termText.trim();
    if (!cleanTerm) return;

    const termKey = cleanTerm.toLowerCase();

    // 1. Return immediately (0ms) if in client memory cache
    if (clientTermCache.current.has(termKey)) {
      const cached = clientTermCache.current.get(termKey)!;
      setIsHelpBuddyOpen(true);
      setActiveTab('term');
      setSelectedTerm(cleanTerm);
      setTermExplanation(cached);
      setTermLoading(false);
      setTermError(null);
      return;
    }

    // 2. Abort previous inflight term request
    if (activeTermAbortController.current) {
      activeTermAbortController.current.abort();
    }
    const abortController = new AbortController();
    activeTermAbortController.current = abortController;

    setIsHelpBuddyOpen(true);
    setActiveTab('term');
    setSelectedTerm(cleanTerm);
    setTermLoading(true);
    setTermError(null);

    try {
      const response = await fetch('/api/help-buddy/explain-term', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: cleanTerm }),
        signal: abortController.signal,
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to explain term.');
      }

      const explanationData: TermExplanation = {
        term: cleanTerm,
        meaning: (json.data.meaning || '').replace(/\*\*/g, ''),
        whyItMatters: (json.data.whyItMatters || '').replace(/\*\*/g, ''),
        realWorldExample: (json.data.realWorldExample || '').replace(/\*\*/g, ''),
        technicalNote: (json.data.technicalNote || '').replace(/\*\*/g, ''),
      };

      // Store in client-side cache
      clientTermCache.current.set(termKey, explanationData);
      setTermExplanation(explanationData);

      // Also log into chat thread
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'user',
          content: `Explain term: ${cleanTerm}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: (Date.now() + 1).toString(),
          role: 'buddy',
          content: `💡 **${cleanTerm} Explained**\n\n🔹 **Definition:** ${explanationData.meaning}\n\n🛡️ **Why It Matters:** ${explanationData.whyItMatters}${
            explanationData.realWorldExample ? `\n\n🏢 **Example:** ${explanationData.realWorldExample}` : ''
          }`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          termData: explanationData,
        },
      ]);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setTermError(err.message || 'Could not fetch explanation. Please try again.');
    } finally {
      if (activeTermAbortController.current === abortController) {
        setTermLoading(false);
      }
    }
  };

  // Global click delegate for any element with the `.term` class
  useEffect(() => {
    const handleGlobalTermClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.term');
      if (target && target.textContent) {
        e.preventDefault();
        e.stopPropagation();
        explainTerm(target.textContent.trim());
      }
    };

    document.addEventListener('click', handleGlobalTermClick);
    return () => {
      document.removeEventListener('click', handleGlobalTermClick);
    };
  }, []);

  // Submit question in Chat with fast SSE streaming and graceful fallback
  const handleSendChat = async (questionText?: string) => {
    const textToSend = (questionText !== undefined ? questionText : chatInput).trim();
    if (!textToSend || chatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const buddyMsgId = (Date.now() + 1).toString();
    const buddyPlaceholder: ChatMessage = {
      id: buddyMsgId,
      role: 'buddy',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg, buddyPlaceholder]);
    setChatInput('');
    setChatLoading(true);

    try {
      const historyPayload = chatMessages
        .slice(-4)
        .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));

      const response = await fetch('/api/help-buddy/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ message: textToSend, history: historyPayload, stream: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to Help Buddy.');
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;
            const dataStr = trimmed.slice(5).trim();
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.chunk) {
                accumulated += parsed.chunk.replace(/\*\*/g, '');
                setChatMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === buddyMsgId ? { ...msg, content: accumulated } : msg
                  )
                );
              }
            } catch {
              // Ignore partial JSON
            }
          }
        }

        if (!accumulated.trim()) {
          setChatMessages((prev) =>
            prev.map((msg) =>
              msg.id === buddyMsgId
                ? { ...msg, content: 'I am here to help answer your cybersecurity questions.' }
                : msg
            )
          );
        }
      } else {
        const json = await response.json();
        const cleanReply = (json.reply || '').replace(/\*\*/g, '');
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === buddyMsgId ? { ...msg, content: cleanReply } : msg
          )
        );
      }
    } catch (err: any) {
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === buddyMsgId
            ? {
                ...msg,
                content: `⚠️ Sorry, I ran into an issue answering that: ${err.message || 'Please try again.'}`,
              }
            : msg
        )
      );
    } finally {
      setChatLoading(false);
    }
  };

  const goToPage = (page: PageId) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProfile = (newProfile: KnowledgeProfile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem('defenza_adaptive_profile', JSON.stringify(newProfile));
    } catch {}
    goToPage('adaptive-profile');
  };

  const handleSaveCurriculum = (newCurriculum: LearningCurriculum) => {
    setCurriculum(newCurriculum);
    try {
      localStorage.setItem('defenza_adaptive_curriculum', JSON.stringify(newCurriculum));
    } catch {}
    goToPage('learning-path');
  };

  const handleModuleMastered = (moduleId: string, score: number) => {
    if (!curriculum) return;
    const modIndex = curriculum.modules.findIndex((m) => m.id === moduleId);
    if (modIndex === -1) return;

    const targetDomain = curriculum.modules[modIndex].domainId;

    const updatedModules = curriculum.modules.map((m, idx) => {
      if (m.id === moduleId) {
        return { ...m, status: 'mastered' as const, currentScore: score, lastAttemptAt: Date.now() };
      }
      if (idx === modIndex + 1 && m.status === 'locked') {
        return { ...m, status: 'available' as const };
      }
      return m;
    });

    const masteredCount = updatedModules.filter((m) => m.status === 'mastered').length;
    const progress = Math.round((masteredCount / updatedModules.length) * 100);

    const updatedCurriculum: LearningCurriculum = {
      ...curriculum,
      modules: updatedModules,
      completedCount: masteredCount,
      overallProgress: progress,
    };

    setCurriculum(updatedCurriculum);
    try {
      localStorage.setItem('defenza_adaptive_curriculum', JSON.stringify(updatedCurriculum));
    } catch {}

    // Also update activeStudyModule in memory if currently selected
    setActiveStudyModule((prev) =>
      prev && prev.id === moduleId
        ? { ...prev, status: 'mastered', currentScore: score, lastAttemptAt: Date.now() }
        : prev
    );

    // Update domain mastery in profile
    if (profile && profile.domains[targetDomain]) {
      const prevDomain = profile.domains[targetDomain];
      const newScore = Math.min(100, Math.max(prevDomain.masteryScore, score));
      let newTier = prevDomain.proficiency;
      if (newScore >= 85) newTier = 'Advanced';
      else if (newScore >= 70) newTier = 'Intermediate';
      else if (newScore >= 45) newTier = 'Developing';

      const updatedProfile: KnowledgeProfile = {
        ...profile,
        domains: {
          ...profile.domains,
          [targetDomain]: {
            ...prevDomain,
            masteryScore: newScore,
            proficiency: newTier,
          },
        },
      };
      setProfile(updatedProfile);
      try {
        localStorage.setItem('defenza_adaptive_profile', JSON.stringify(updatedProfile));
      } catch {}
    }

    setXp((prev) => prev + 150);
    setCombo((prev) => prev + 1);
  };

  const handleResetLearningData = () => {
    try {
      localStorage.removeItem('defenza_adaptive_profile');
      localStorage.removeItem('defenza_adaptive_curriculum');
    } catch {}
    setProfile(null);
    setCurriculum(null);
    setActiveStudyModule(null);
    goToPage('onboarding-welcome');
  };

  // Start threat assessment with chosen working time duration
  const startQuiz = (customMinutes?: number) => {
    const minutes = customMinutes ?? workingTimeMinutes;
    const totalDurationSeconds = minutes * 60;
    assessmentDeadlineRef.current = Date.now() + totalDurationSeconds * 1000;
    setRemainingSeconds(totalDurationSeconds);
    setAssessmentActive(true);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setValidationAlert(false);
    setCorrect(0);
    setXp(0);
    setCombo(0);
    goToPage('quiz');
  };

  const resetAll = () => {
    setAssessmentActive(false);
    assessmentDeadlineRef.current = null;
    setRemainingSeconds(workingTimeMinutes * 60);
    setXp(0);
    setCombo(0);
    setCorrect(0);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIntegrityScenarioChoice(null);
    setShowCelebration(true);
    goToPage('start');
  };

  const handleLockAnswer = () => {
    if (!assessmentActive || remainingSeconds <= 0) return;
    if (selectedOption === null) {
      setValidationAlert(true);
      return;
    }
    setValidationAlert(false);
    if (isAnswered) return;

    setIsAnswered(true);
    const q = QUESTIONS[currentQuestionIdx];

    if (selectedOption === q.answer) {
      setCorrect((prev) => prev + 1);
      const newCombo = combo + 1;
      setCombo(newCombo);
      const earned = newCombo >= 3 ? 125 : 100;
      setXp((prev) => prev + earned);
    } else {
      setCombo(0);
    }
  };

  const handleNextQuestion = () => {
    if (!assessmentActive || remainingSeconds <= 0) return;

    if (currentQuestionIdx === QUESTIONS.length - 1) {
      setAssessmentActive(false);
      assessmentDeadlineRef.current = null;
      setShowCelebration(true);
      goToPage('result');
      return;
    }

    setCurrentQuestionIdx((prev) => prev + 1);
    setSelectedOption(null);
    setIsAnswered(false);
    setValidationAlert(false);
  };

  // Progress bar calculation
  const pageIndex = PAGES.indexOf(currentPage);
  const progressPercent = Math.max(0, Math.min(100, (pageIndex / (PAGES.length - 1)) * 100));

  // Level calculation
  const level = Math.floor(xp / 300) + 1;

  // Final Results calculation
  const percentage = Math.round((correct / QUESTIONS.length) * 100);

  let rank = '🛡️ SECURITY RECRUIT';
  let resultText =
    'Every analyst starts somewhere. Review the Intel Files and run the mission again to strengthen your security reasoning.';
  let skill = 'Security Fundamentals';

  if (percentage === 100) {
    rank = '👑 CYBER DEFENSE COMMANDER';
    resultText =
      'Outstanding analysis. You correctly identified the relationship between confidentiality, integrity, availability, and the security controls used to protect them.';
    skill = 'Advanced Threat Identification';
  } else if (percentage >= 80) {
    rank = '⚡ SECURITY ANALYST';
    resultText =
      'Strong performance. You understand core security architecture and can identify common security impacts in realistic scenarios.';
    skill = 'Advanced Threat Identification';
  } else if (percentage >= 60) {
    rank = '🔍 CYBER DEFENDER';
    resultText =
      'Good work. Your fundamentals are developing. Review defensive trade-offs and security controls to improve your threat analysis.';
    skill = 'Security Fundamentals';
  } else if (percentage >= 40) {
    rank = '🎯 SECURITY OPERATIVE';
    resultText =
      'You have the foundation. Revisit the Intel Files and focus on distinguishing confidentiality, integrity, and availability.';
    skill = 'Security Fundamentals';
  }

  const currentQ = QUESTIONS[currentQuestionIdx];

  return (
    <div className="app">
      {/* HEADER */}
      {!['landing', 'registration'].includes(currentPage) && (
        <header>
          <div className="logo cursor-pointer" onClick={() => goToPage('start')}>
            DEFENZA <span>SEC</span>
          </div>
          <div className="hud">
            {userProfile && (
              <div
                className="hud-box"
                style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.35)' }}
                title={`Operator: ${userProfile.name} (Age: ${userProfile.age}, Gender: ${userProfile.gender})`}
              >
                <span>👤</span> <b style={{ color: '#e0f2fe' }}>{userProfile.name}</b>
              </div>
            )}
            <div className="hud-box">
              XP <b>{xp}</b>
            </div>
            <div className="hud-box">
              LEVEL <b>{level}</b>
            </div>
            <div className="hud-box">
              COMBO <b>{combo}</b>
            </div>

            {/* Quick Trigger for Adaptive Intelligence / Learning Path */}
            <button
              className="hud-box"
              style={{
                cursor: 'pointer',
                background: ['onboarding-welcome', 'onboarding-diagnostic', 'adaptive-profile', 'learning-path', 'module-study'].includes(currentPage)
                  ? 'rgba(168, 85, 247, 0.25)'
                  : '#0b1019',
                borderColor: 'rgba(168, 85, 247, 0.55)',
                color: '#c084fc',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onClick={() => {
                if (curriculum) {
                  goToPage('learning-path');
                } else if (profile) {
                  goToPage('adaptive-profile');
                } else {
                  goToPage('onboarding-welcome');
                }
              }}
              title="Open DEFENZA Adaptive Intelligence"
            >
              <span>🧭</span> {curriculum ? `LEARNING PATH (${curriculum.completedCount}/${curriculum.modules.length})` : profile ? 'MY PROFILE' : 'ADAPTIVE AI'}
            </button>

            {/* Quick Trigger for Help Buddy */}
            <button
              className="hud-box"
              style={{
                cursor: 'pointer',
                background: isHelpBuddyOpen ? 'rgba(34, 211, 238, 0.22)' : '#0b1019',
                borderColor: 'rgba(34, 211, 238, 0.55)',
                color: '#38bdf8',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onClick={() => setIsHelpBuddyOpen((prev) => !prev)}
              title="Open DEFENZA Cybersecurity Help Buddy"
            >
              <span>🤖</span> HELP BUDDY
            </button>
          </div>
        </header>
      )}

      {/* PROGRESS BAR */}
      {!['landing', 'registration'].includes(currentPage) && (
        <div className="progress">
          <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
        </div>
      )}

      {/* LANDING PAGE (Shown only to new users) */}
      <section className={`page ${currentPage === 'landing' ? 'active' : ''}`} id="landing">
        {currentPage === 'landing' && (
          <LandingHero onGetStarted={() => goToPage('registration')} />
        )}
      </section>

      {/* REGISTRATION PORTAL */}
      <section className={`page ${currentPage === 'registration' ? 'active' : ''}`} id="registration">
        {currentPage === 'registration' && (
          <RegistrationPortal
            onBack={() => goToPage('landing')}
            onComplete={(newProfile) => {
              try {
                localStorage.setItem('defenza_user_profile', JSON.stringify(newProfile));
                localStorage.setItem('defenza_visited', 'true');
              } catch {
                // ignore
              }
              setUserProfile(newProfile);
              goToPage('start');
            }}
          />
        )}
      </section>

      {/* START PAGE */}
      <section className={`page ${currentPage === 'start' ? 'active' : ''}`} id="start">
        <div className="start">
          <div className="start-card">
            <div className="status">
              <span className="dot"></span>
              SYSTEM READY
            </div>
            <div className="shield">🛡️</div>
            <h1>
              <span className="gradient">DEFENZA</span>
            </h1>
            <p className="subtitle">
              Welcome to the security operations briefing. Prepare for realistic security incident analysis,
              defensive controls, and interactive threat assessment.
            </p>

            {/* Configurable Working Time Selector */}
            <div className="working-time-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '1.5px', color: 'var(--cyan)' }}>
                  ⏱️ MISSION WORKING TIME: {workingTimeMinutes} MINUTES ({workingTimeMinutes * 60}s)
                </span>
                <span style={{ fontSize: '11px', color: '#86efac', fontWeight: 700 }}>
                  ⚡ Fast-Paced Threat Assessment
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {WORKING_TIME_PRESETS.map((preset) => (
                  <button
                    key={preset.minutes}
                    className={`working-time-pill ${workingTimeMinutes === preset.minutes ? 'active' : ''}`}
                    onClick={() => {
                      setWorkingTimeMinutes(preset.minutes);
                      setRemainingSeconds(preset.minutes * 60);
                    }}
                    title={preset.desc}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="page-desc">
              Your mission is not just to memorize definitions. You will investigate realistic incidents,
              understand security controls, identify attack impact, and make defensive decisions.
              <br />
              <span style={{ color: 'var(--cyan)', fontSize: '13.5px', marginTop: '6px', display: 'inline-block' }}>
                💡 Tip: Working time is set to <b>{workingTimeMinutes} minutes</b> for a quick, focused evaluation. Click any term at any time for instant Help Buddy explanations!
              </span>
            </p>

            <br />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn"
                style={{
                  background: 'linear-gradient(90deg, #7c3aed, #ec4899)',
                  boxShadow: '0 8px 30px rgba(168, 85, 247, 0.25)',
                }}
                onClick={() => {
                  if (curriculum) goToPage('learning-path');
                  else if (profile) goToPage('adaptive-profile');
                  else goToPage('onboarding-welcome');
                }}
              >
                {curriculum ? 'MY LEARNING PATH ➔' : 'DISCOVER MY LEVEL (ADAPTIVE AI)'}
              </button>
              <button
                className="btn"
                style={{
                  background: 'linear-gradient(90deg, #0891b2, #059669)',
                }}
                onClick={() => startQuiz()}
              >
                QUICK THREAT RUN ({workingTimeMinutes}m) ➔
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BRIEFING PAGE */}
      <section className={`page ${currentPage === 'briefing' ? 'active' : ''}`} id="briefing">
        <div className="topline">
          <div>
            <div className="tag">MISSION 01 / SECURITY FUNDAMENTALS</div>
            <h1 className="page-title">Core Security Architecture</h1>
            <p className="page-desc">
              Security architecture defines the foundational model used in cybersecurity. It describes three
              properties that security controls are designed to protect: who can access information, whether
              information can be trusted, and whether systems remain usable.
            </p>
          </div>
        </div>

        <div className="grid">
          <div className="card">
            <h3 className="cyan">🔒 Confidentiality</h3>
            <p>
              Information should only be accessible to authorized people, systems, or processes. A
              confidentiality failure occurs when sensitive information is exposed to someone who should not
              have access to it.
            </p>
            <div className="term" title="Click to explain Encryption with Help Buddy">Encryption</div>
            <div className="term" title="Click to explain IAM with Help Buddy">IAM</div>
            <div className="term" title="Click to explain RBAC with Help Buddy">RBAC</div>
            <div className="term" title="Click to explain Least Privilege with Help Buddy">Least Privilege</div>
          </div>

          <div className="card">
            <h3 className="purple">🛡️ Integrity</h3>
            <p>
              Information must remain accurate, complete, and trustworthy. Attackers may attempt to modify
              records, configurations, logs, transactions, or software without authorization.
            </p>
            <div className="term" title="Click to explain Hashing with Help Buddy">Hashing</div>
            <div className="term" title="Click to explain Digital Signatures with Help Buddy">Digital Signatures</div>
            <div className="term" title="Click to explain Audit Logs with Help Buddy">Audit Logs</div>
            <div className="term" title="Click to explain MAC with Help Buddy">MAC</div>
          </div>

          <div className="card">
            <h3 className="green">⚡ Availability</h3>
            <p>
              Authorized users should be able to access systems and information when they need them.
              Availability is strongly connected with reliability, resilience, recovery, and infrastructure
              design.
            </p>
            <div className="term" title="Click to explain Failover with Help Buddy">Failover</div>
            <div className="term" title="Click to explain Redundancy with Help Buddy">Redundancy</div>
            <div className="term" title="Click to explain RTO with Help Buddy">RTO</div>
            <div className="term" title="Click to explain RPO with Help Buddy">RPO</div>
          </div>

          <div className="card">
            <h3 className="orange">⚖️ Security is a balance</h3>
            <p>
              Security is not simply about blocking everything. A control that is too restrictive can prevent
              legitimate users from doing their jobs. Good security balances risk, usability, business
              requirements, and resilience.
            </p>
            <div className="term" title="Click to explain Risk with Help Buddy">Risk</div>
            <div className="term" title="Click to explain Threat Model with Help Buddy">Threat Model</div>
            <div className="term" title="Click to explain Controls with Help Buddy">Controls</div>
          </div>
        </div>

        <div className="big-card">
          <h2>🎯 Think Like a Security Analyst</h2>
          <p>
            When investigating an incident, don't immediately ask only{' '}
            <strong>"Was the system hacked?"</strong> Ask three deeper questions:
          </p>
          <ul className="info-list">
            <li>
              <b>Confidentiality:</b> Did someone see or obtain information they were not authorized to access?
            </li>
            <li>
              <b>Integrity:</b> Was any information, configuration, transaction, or log modified?
            </li>
            <li>
              <b>Availability:</b> Were legitimate users prevented from accessing the system or service?
            </li>
          </ul>
        </div>

        <div className="actions">
          <button className="btn secondary" onClick={() => goToPage('start')}>
            ← Back
          </button>
          <button className="btn" onClick={() => goToPage('confidentiality')}>
            OPEN INTEL FILE 01 ➔
          </button>
        </div>
      </section>

      {/* CONFIDENTIALITY PAGE */}
      <section className={`page ${currentPage === 'confidentiality' ? 'active' : ''}`} id="confidentiality">
        <div className="tag">INTEL FILE 01 / CONFIDENTIALITY</div>
        <h1 className="page-title">🔒 Protecting Secrets</h1>
        <p className="page-desc">
          Confidentiality is about preventing unauthorized disclosure. Encryption is important, but
          confidentiality is much broader than encryption alone.
        </p>

        <div className="big-card">
          <h2>What actually protects confidentiality?</h2>
          <ul className="info-list">
            <li>
              <span className="term" style={{ display: 'inline', padding: '2px 8px', marginRight: '6px' }}>Least Privilege</span>
              users receive only the permissions required for their role. A receptionist does not automatically need administrator access.
            </li>
            <li>
              <span className="term" style={{ display: 'inline', padding: '2px 8px', marginRight: '6px' }}>RBAC</span>
              Role-Based Access Control assigns permissions according to job roles. For example, an HR employee may access employee records while a network technician may not.
            </li>
            <li>
              <span className="term" style={{ display: 'inline', padding: '2px 8px', marginRight: '6px' }}>IAM</span>
              Identity and Access Management handles identities, authentication, authorization, and access policies.
            </li>
            <li>
              <span className="term" style={{ display: 'inline', padding: '2px 8px', marginRight: '6px' }}>Encryption</span>
              data is transformed so unauthorized parties cannot understand it without the appropriate cryptographic key.
            </li>
            <li>
              <span className="term" style={{ display: 'inline', padding: '2px 8px', marginRight: '6px' }}>Data Classification</span>
              organizations label information according to sensitivity, such as public, internal, confidential, or restricted.
            </li>
            <li>
              <span className="term" style={{ display: 'inline', padding: '2px 8px', marginRight: '6px' }}>Key Management</span>
              strong encryption becomes much less useful if cryptographic keys are poorly stored, shared, or protected.
            </li>
          </ul>
        </div>

        <div className="grid">
          <div className="fact">
            <strong>CYBER FACT</strong>
            <p>
              A database can be encrypted and still suffer a confidentiality breach if an attacker obtains
              valid credentials and accesses the decrypted data.
            </p>
          </div>
          <div className="fact">
            <strong>ANALYST QUESTION</strong>
            <p>
              Don't only ask "Is the data encrypted?" Ask "Who can access it, why can they access it, and what
              happens if their account is compromised?"
            </p>
          </div>
        </div>

        <div className="actions">
          <button className="btn secondary" onClick={() => goToPage('briefing')}>
            ← Back
          </button>
          <button className="btn" onClick={() => goToPage('integrity')}>
            OPEN INTEL FILE 02 ➔
          </button>
        </div>
      </section>

      {/* INTEGRITY PAGE */}
      <section className={`page ${currentPage === 'integrity' ? 'active' : ''}`} id="integrity">
        <div className="tag">INTEL FILE 02 / INTEGRITY</div>
        <h1 className="page-title">🛡️ Can You Trust the Data?</h1>
        <p className="page-desc">
          Integrity means information remains accurate and has not been modified without authorization. A
          system can remain online and private while its integrity is completely compromised.
        </p>

        <div className="grid">
          <div className="card">
            <h3 className="purple"># Hashing</h3>
            <p>
              A cryptographic hash creates a fixed-size value from data. If the data changes, the resulting
              hash will normally change as well.
            </p>
            <div className="term">SHA-256</div>
          </div>

          <div className="card">
            <h3 className="cyan">🔑 Digital Signatures</h3>
            <p>
              Digital signatures can provide evidence that data was signed by the holder of a private key and
              that the signed content was not altered.
            </p>
            <div className="term">Asymmetric Keys</div>
          </div>

          <div className="card">
            <h3 className="orange">📜 Audit Logs</h3>
            <p>
              Logs record important actions such as authentication attempts, configuration changes,
              administrative actions, and transactions.
            </p>
            <div className="term">Log Integrity</div>
          </div>

          <div className="card">
            <h3 className="green">🔁 Version Control</h3>
            <p>
              Maintaining previous versions allows teams to identify unexpected changes and recover
              known-good configurations or files.
            </p>
            <div className="term">Rollback</div>
          </div>
        </div>

        <div className="big-card">
          <h2>💡 Important Hashing Concept</h2>
          <p>
            Suppose a software vendor publishes a file together with its SHA-256 hash. You download the file
            and calculate the hash yourself. If the values do not match, the file may have been modified or
            corrupted.
          </p>
          <br />
          <p>
            But a hash alone does <b>not automatically prove who created the file</b>. For authenticity and
            stronger trust, mechanisms such as digital signatures can be used.
          </p>
        </div>

        <div className="scenario">
          <div className="scenario-title">THREAT SCENARIO</div>
          <p>
            A bank transaction originally records a payment of $10,000. An attacker changes the database value
            to $90,000. The website is still online and the attacker may never see the customer's password.
            Which security property has primarily been attacked?
          </p>
          <div
            className={`choice ${integrityScenarioChoice === 0 ? 'correct' : ''}`}
            onClick={() => setIntegrityScenarioChoice(0)}
          >
            <input
              type="radio"
              name="scenarioChoice"
              checked={integrityScenarioChoice === 0}
              onChange={() => setIntegrityScenarioChoice(0)}
            />
            <b>Integrity</b> — the information has been altered.{' '}
            {integrityScenarioChoice === 0 && (
              <span style={{ color: '#4ade80', marginLeft: '8px', fontWeight: 'bold' }}>
                ✓ Correct! Unauthorized modification targets integrity.
              </span>
            )}
          </div>
          <div
            className={`choice ${integrityScenarioChoice === 1 ? 'wrong' : ''}`}
            onClick={() => setIntegrityScenarioChoice(1)}
          >
            <input
              type="radio"
              name="scenarioChoice"
              checked={integrityScenarioChoice === 1}
              onChange={() => setIntegrityScenarioChoice(1)}
            />
            <b>Confidentiality</b> — the information was exposed.{' '}
            {integrityScenarioChoice === 1 && (
              <span style={{ color: '#fb7185', marginLeft: '8px', fontWeight: 'bold' }}>
                ✗ Not quite. The primary impact was data alteration, not disclosure.
              </span>
            )}
          </div>
          <div
            className={`choice ${integrityScenarioChoice === 2 ? 'wrong' : ''}`}
            onClick={() => setIntegrityScenarioChoice(2)}
          >
            <input
              type="radio"
              name="scenarioChoice"
              checked={integrityScenarioChoice === 2}
              onChange={() => setIntegrityScenarioChoice(2)}
            />
            <b>Availability</b> — the system became unreachable.{' '}
            {integrityScenarioChoice === 2 && (
              <span style={{ color: '#fb7185', marginLeft: '8px', fontWeight: 'bold' }}>
                ✗ The system stayed online; it is an integrity breach.
              </span>
            )}
          </div>
        </div>

        <div className="actions">
          <button className="btn secondary" onClick={() => goToPage('confidentiality')}>
            ← Back
          </button>
          <button className="btn" onClick={() => goToPage('availability')}>
            OPEN INTEL FILE 03 ➔
          </button>
        </div>
      </section>

      {/* AVAILABILITY PAGE */}
      <section className={`page ${currentPage === 'availability' ? 'active' : ''}`} id="availability">
        <div className="tag">INTEL FILE 03 / AVAILABILITY</div>
        <h1 className="page-title">⚡ Keep Systems Running</h1>
        <p className="page-desc">
          Availability means authorized users can access systems and information when required. Modern
          availability engineering focuses on resilience, redundancy, monitoring, recovery, and eliminating
          single points of failure.
        </p>

        <div className="grid">
          <div className="card">
            <h3 className="green">🔁 Redundancy</h3>
            <p>
              Critical components can have backups so one failed component does not immediately bring down the
              entire service.
            </p>
            <div className="term">High Availability</div>
          </div>

          <div className="card">
            <h3 className="cyan">🔀 Failover</h3>
            <p>
              When a primary server fails, another system can automatically or manually take over operations.
            </p>
            <div className="term">Active-Passive</div>
          </div>

          <div className="card">
            <h3 className="orange">⏱️ RTO</h3>
            <p>
              Recovery Time Objective defines the target amount of time within which a service should be
              restored after disruption.
            </p>
            <div className="term">RTO Target</div>
          </div>

          <div className="card">
            <h3 className="purple">💾 RPO</h3>
            <p>
              Recovery Point Objective defines the maximum acceptable amount of data loss measured in time.
            </p>
            <div className="term">RPO Threshold</div>
          </div>
        </div>

        <div className="big-card">
          <h2>Example: RTO vs RPO</h2>
          <ul className="info-list">
            <li>
              <b>RTO = 30 minutes:</b> the organization aims to restore the service within 30 minutes.
            </li>
            <li>
              <b>RPO = 15 minutes:</b> the organization accepts at most around 15 minutes of data loss,
              depending on the recovery design.
            </li>
            <li>
              <b>Monitoring:</b> systems need telemetry and alerts so failures can be detected quickly.
            </li>
            <li>
              <b>Disaster Recovery:</b> organizations need tested procedures for recovering critical services
              after major disruptions.
            </li>
          </ul>
        </div>

        <div className="fact">
          <strong>REAL SECURITY THINKING</strong>
          <p>
            Availability is not simply "the server is turned on." Power failures, hardware failures, software
            bugs, network problems, DDoS attacks, dependency failures, and natural disasters can all affect
            availability.
          </p>
        </div>

        <div className="actions">
          <button className="btn secondary" onClick={() => goToPage('integrity')}>
            ← Back
          </button>
          <button className="btn" onClick={() => goToPage('tradeoffs')}>
            OPEN INTEL FILE 04 ➔
          </button>
        </div>
      </section>

      {/* TRADEOFFS PAGE */}
      <section className={`page ${currentPage === 'tradeoffs' ? 'active' : ''}`} id="tradeoffs">
        <div className="tag">INTEL FILE 04 / SECURITY ARCHITECTURE</div>
        <h1 className="page-title">⚖️ Security Architecture Trade-Offs</h1>
        <p className="page-desc">
          Real cybersecurity is rarely about maximizing one property in isolation. Controls can create
          trade-offs between confidentiality, integrity, availability, cost, performance, and usability.
        </p>

        <div className="grid">
          <div className="card">
            <h3 className="cyan">🛑 More Restriction</h3>
            <p>
              Very strict access policies can improve confidentiality, but if legitimate users cannot access
              critical information, availability and usability may suffer.
            </p>
            <div className="term">Usability Trade-Off</div>
          </div>

          <div className="card">
            <h3 className="green">⚡ Faster Access</h3>
            <p>
              Removing security checks can make systems easier and faster to use, but it may increase
              unauthorized access risk.
            </p>
            <div className="term">Friction vs Security</div>
          </div>

          <div className="card">
            <h3 className="purple">🔍 More Validation</h3>
            <p>
              Strong integrity checks can improve trust in data, but additional verification may introduce
              processing overhead.
            </p>
            <div className="term">Verification Latency</div>
          </div>

          <div className="card">
            <h3 className="orange">🎯 Risk-Based Security</h3>
            <p>
              Security teams choose controls based on threats, impact, business requirements, attack surface,
              and acceptable risk.
            </p>
            <div className="term">Defense in Depth</div>
          </div>
        </div>

        <div className="big-card">
          <h2>💥 One Incident Can Break Multiple Properties</h2>
          <p>
            Imagine ransomware enters an organization's network. The attacker encrypts important systems,
            making them unavailable. At the same time, the attacker steals customer information. If the
            attacker also modifies system files or records, integrity can be affected too.
          </p>
          <br />
          <div className="chips">
            <div className="chip green" onClick={() => explainTerm('Availability Attack')}>
              AVAILABILITY • Systems inaccessible
            </div>
            <div className="chip cyan" onClick={() => explainTerm('Data Breach')}>
              CONFIDENTIALITY • Data stolen
            </div>
            <div className="chip purple" onClick={() => explainTerm('Data Tampering')}>
              INTEGRITY • Data modified
            </div>
          </div>
        </div>

        <div className="scenario">
          <div className="scenario-title">INCIDENT ANALYSIS</div>
          <p>
            A company's attacker gains access to an employee account. They download customer records, modify
            several records, and disable a service used by customers.
          </p>
          <ul className="info-list">
            <li>
              Downloading customer records ➔ <b>Confidentiality impact</b>
            </li>
            <li>
              Modifying records ➔ <b>Integrity impact</b>
            </li>
            <li>
              Disabling the service ➔ <b>Availability impact</b>
            </li>
          </ul>
          <p style={{ marginTop: '15px', color: '#cbd5e1' }}>
            This is why security analysts should examine the entire incident, not just label an attack with a
            single category.
          </p>
        </div>

        <div className="actions">
          <button className="btn secondary" onClick={() => goToPage('availability')}>
            ← Back
          </button>
          <button className="btn" onClick={() => goToPage('facts')}>
            ENTER CYBER FACTS ➔
          </button>
        </div>
      </section>

      {/* FACTS PAGE */}
      <section className={`page ${currentPage === 'facts' ? 'active' : ''}`} id="facts">
        <div className="tag">INTEL FILE 05 / CYBER KNOWLEDGE</div>
        <h1 className="page-title">🧠 Cyber Facts</h1>
        <p className="page-desc">
          Before the threat assessment, check these concepts. Some of them are easy to overlook.
        </p>

        <div className="grid">
          <div className="fact">
            <strong>01 • ENCRYPTION ≠ ACCESS CONTROL</strong>
            <p>
              Encryption protects data from being understood without the key. Access control decides who should
              be allowed to access the resource. You often need both.
            </p>
            <div className="term">Access Control</div>
          </div>

          <div className="fact">
            <strong>02 • HASHING ≠ ENCRYPTION</strong>
            <p>
              A cryptographic hash is designed as a one-way transformation for integrity and verification use
              cases. Encryption is designed for reversible protection when the appropriate key is available.
            </p>
            <div className="term">Cryptographic Hash</div>
          </div>

          <div className="fact">
            <strong>03 • BACKUPS ≠ COMPLETE SECURITY</strong>
            <p>
              Backups help recovery, but they do not automatically prevent data theft, credential compromise,
              or malicious modification of the live environment.
            </p>
            <div className="term">Disaster Recovery</div>
          </div>

          <div className="fact">
            <strong>04 • LOGS ARE SECURITY EVIDENCE</strong>
            <p>
              Authentication logs, administrative activity, network events, and application logs can help
              analysts reconstruct what happened.
            </p>
            <div className="term">SIEM</div>
          </div>

          <div className="fact">
            <strong>05 • LEAST PRIVILEGE REDUCES BLAST RADIUS</strong>
            <p>
              If an account is compromised, unnecessary permissions can increase the number of systems and
              resources the attacker can reach.
            </p>
            <div className="term">Blast Radius</div>
          </div>

          <div className="fact">
            <strong>06 • AVAILABILITY NEEDS TESTING</strong>
            <p>
              A backup or disaster recovery plan that has never been tested may fail when an actual incident
              occurs.
            </p>
            <div className="term">Failover Drill</div>
          </div>
        </div>

        {/* Working Time Config Card */}
        <div className="working-time-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '1.5px', color: 'var(--cyan)' }}>
              ⏱️ SELECT WORKING TIME BEFORE COMMENCING
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              Working Time: {workingTimeMinutes}m ({workingTimeMinutes * 60}s)
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {WORKING_TIME_PRESETS.map((preset) => (
              <button
                key={preset.minutes}
                className={`working-time-pill ${workingTimeMinutes === preset.minutes ? 'active' : ''}`}
                onClick={() => {
                  setWorkingTimeMinutes(preset.minutes);
                  setRemainingSeconds(preset.minutes * 60);
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="big-card">
          <h2>🔍 Your Analyst Rule</h2>
          <p>
            For every security incident, think:
            <br />
            <strong>WHO accessed it?</strong>
            <br />
            <strong>WHAT changed?</strong>
            <br />
            <strong>WHAT became unavailable?</strong>
          </p>
          <br />
          <p>
            If you can answer those three questions, you are already thinking like a security analyst.
          </p>
        </div>

        <div className="actions">
          <button className="btn secondary" onClick={() => goToPage('tradeoffs')}>
            ← Back
          </button>
          <button className="btn" onClick={() => startQuiz(workingTimeMinutes)}>
            START THREAT ASSESSMENT ({workingTimeMinutes}m WORKING TIME) ➔
          </button>
        </div>
      </section>

      {/* QUIZ PAGE */}
      <section className={`page ${currentPage === 'quiz' ? 'active' : ''}`} id="quiz">
        <div className="tag">THREAT ASSESSMENT / SINGLE CHOICE</div>
        <h1 className="page-title">🎯 Identify the Threat</h1>
        <p className="page-desc">
          Choose the best answer. Analyze the scenario before locking your decision.
        </p>

        {/* Timed Assessment Header with Dynamic Working Time */}
        <div className={`assessment-timer ${remainingSeconds <= Math.min(60, workingTimeMinutes * 20) ? 'critical' : ''}`} role="timer" aria-live="polite">
          <div>
            <span className="timer-label">WORKING TIME REMAINING</span>
            <strong>{String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:{String(remainingSeconds % 60).padStart(2, '0')}</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <span className="timer-hint">
              Target Working Time: {workingTimeMinutes}m total
            </span>
            <span style={{ fontSize: '11px', color: remainingSeconds <= 30 ? '#fb7185' : 'var(--cyan)', fontWeight: 700 }}>
              {remainingSeconds <= 30 ? 'CRITICAL TIME WARNING ⚠️' : '⚡ Tactical Speed Test'}
            </span>
          </div>
        </div>

        <div className="quiz-box">
          <div className="question-number" id="qnum">
            THREAT {currentQuestionIdx + 1} / {QUESTIONS.length}
          </div>
          <div className="question" id="question">
            {currentQ.q}
          </div>
          <div id="options">
            {currentQ.options.map((option, idx) => (
              <label
                key={idx}
                className={`quiz-option ${selectedOption === idx ? 'selected' : ''}`}
                onClick={() => {
                  if (!isAnswered) {
                    setSelectedOption(idx);
                    setValidationAlert(false);
                  }
                }}
              >
                <input
                  type="radio"
                  name="answer"
                  value={idx}
                  checked={selectedOption === idx}
                  disabled={isAnswered}
                  onChange={() => {
                    if (!isAnswered) {
                      setSelectedOption(idx);
                      setValidationAlert(false);
                    }
                  }}
                />
                {option}
              </label>
            ))}
          </div>

          {validationAlert && (
            <div
              style={{
                marginTop: '15px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                color: '#fda4af',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              ⚠️ Please select one answer before locking your decision.
            </div>
          )}

          {isAnswered && (
            <div className={`feedback ${selectedOption === currentQ.answer ? 'correct' : 'wrong'}`}>
              <b>
                {selectedOption === currentQ.answer
                  ? `✓ CORRECT • +${combo >= 3 ? 125 : 100} XP`
                  : '✗ INCORRECT'}
              </b>
              <br />
              {currentQ.explain}
            </div>
          )}

          <div className="actions">
            {!isAnswered ? (
              <button className="btn" id="submitBtn" onClick={handleLockAnswer}>
                LOCK ANSWER
              </button>
            ) : (
              <button className="btn" id="submitBtn" onClick={handleNextQuestion}>
                {currentQuestionIdx === QUESTIONS.length - 1 ? 'VIEW SECURITY REPORT ➔' : 'NEXT THREAT ➔'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* GAME OVER PAGE */}
      <section className={`page ${currentPage === 'gameover' ? 'active' : ''}`} id="gameover">
        <div className="gameover-screen">
          <div className="gameover-scanline" aria-hidden="true" />
          <div className="gameover-icon" aria-hidden="true">⏱️</div>
          <div className="tag gameover-tag">DEFENZA // INCIDENT RESPONSE FAILURE</div>
          <h1 className="gameover-title">GAME OVER</h1>
          <h2 className="gameover-subtitle">WORKING TIME EXPIRED ({workingTimeMinutes}m LIMIT)</h2>
          <p className="gameover-copy">
            The allotted {workingTimeMinutes}-minute response window has elapsed. The incident remains unresolved.
            Reset the simulation to attempt the speed run again, Analyst.
          </p>

          <div className="gameover-status-grid">
            <div className="gameover-status"><span>01</span><b>WORKING TIME</b><strong>EXCEEDED</strong></div>
            <div className="gameover-status"><span>02</span><b>THREAT ASSESSMENT</b><strong>INCOMPLETE</strong></div>
            <div className="gameover-status"><span>03</span><b>MISSION STATUS</b><strong>FAILED</strong></div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn gameover-restart" onClick={resetAll}>
              ↺&nbsp; START OVER ({workingTimeMinutes}m)
            </button>
            <button
              className="btn secondary"
              onClick={() => {
                const nextMins = workingTimeMinutes < 5 ? 5 : 3;
                setWorkingTimeMinutes(nextMins);
                resetAll();
              }}
            >
              ⏱️ SWITCH TO {workingTimeMinutes < 5 ? '5 MIN' : '3 MIN'}
            </button>
          </div>

          <p className="gameover-footnote">SYSTEM LOCKED • RESET TO REINITIALIZE SIMULATION</p>
        </div>
      </section>

      {/* RESULT PAGE */}
      <section className={`page ${currentPage === 'result' ? 'active' : ''}`} id="result">
        {currentPage === 'result' && percentage === 100 && showCelebration && (
          <React.Suspense fallback={null}>
            <PerfectScoreCelebration onDismiss={() => setShowCelebration(false)} />
          </React.Suspense>
        )}

        <div className="result">
          <div className="tag">MISSION COMPLETE</div>
          <h1 className="page-title">SECURITY REPORT</h1>
          <div className="score" id="finalScore">
            {percentage}%
          </div>
          <div className="meter">
            <span id="finalMeter" style={{ width: `${percentage}%` }}></span>
          </div>
          <div className="rank" id="rank">
            {rank}
          </div>
          <p className="page-desc" id="resultText">
            {resultText}
          </p>

          <div className="grid">
            <div className="card">
              <h3 className="cyan">XP EARNED</h3>
              <p id="finalXP">{xp} XP</p>
            </div>
            <div className="card">
              <h3 className="purple">CORRECT ANSWERS</h3>
              <p id="correctCount">
                {correct} / {QUESTIONS.length}
              </p>
            </div>
            <div className="card">
              <h3 className="green">WORKING TIME PACE</h3>
              <p>{workingTimeMinutes} Min Allotted</p>
            </div>
            <div className="card">
              <h3 className="orange">ANALYST SKILL</h3>
              <p id="skill">{skill}</p>
            </div>
          </div>

          <br />
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn" onClick={resetAll}>
              RUN MISSION AGAIN ↺
            </button>
            {percentage === 100 && (
              <button
                className="btn secondary"
                style={{
                  border: '1px solid rgba(250, 204, 21, 0.45)',
                  color: '#fef08a',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onClick={() => setShowCelebration(true)}
              >
                ✨ REPLAY CELEBRATION
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ONBOARDING WELCOME PAGE */}
      <section className={`page ${currentPage === 'onboarding-welcome' ? 'active' : ''}`} id="onboarding-welcome">
        <OnboardingWelcome
          onStartDiagnostic={() => goToPage('onboarding-diagnostic')}
          hasExistingProfile={Boolean(profile)}
          onViewExistingProfile={() => {
            if (curriculum) goToPage('learning-path');
            else if (profile) goToPage('adaptive-profile');
          }}
        />
      </section>

      {/* ONBOARDING DIAGNOSTIC ASSESSMENT */}
      <section className={`page ${currentPage === 'onboarding-diagnostic' ? 'active' : ''}`} id="onboarding-diagnostic">
        {currentPage === 'onboarding-diagnostic' && (
          <DiagnosticAssessment
            onProfileReady={handleSaveProfile}
            onCancel={() => goToPage(profile ? 'adaptive-profile' : 'start')}
          />
        )}
      </section>

      {/* ADAPTIVE KNOWLEDGE PROFILE DASHBOARD */}
      <section className={`page ${currentPage === 'adaptive-profile' ? 'active' : ''}`} id="adaptive-profile">
        {profile ? (
          <KnowledgeProfileDashboard
            profile={profile}
            onCurriculumReady={handleSaveCurriculum}
            onRetakeDiagnostic={() => goToPage('onboarding-diagnostic')}
          />
        ) : (
          <div className="py-12 text-center text-slate-400">
            <p className="mb-4">No diagnostic profile found yet.</p>
            <button className="btn" onClick={() => goToPage('onboarding-welcome')}>
              START DIAGNOSTIC ASSESSMENT ➔
            </button>
          </div>
        )}
      </section>

      {/* MY LEARNING PATH ROADMAP DASHBOARD */}
      <section className={`page ${currentPage === 'learning-path' ? 'active' : ''}`} id="learning-path">
        {profile && curriculum ? (
          <LearningPathDashboard
            profile={profile}
            curriculum={curriculum}
            onSelectModule={(mod) => {
              const freshMod = curriculum.modules.find((m) => m.id === mod.id) || mod;
              setActiveStudyModule(freshMod);
              goToPage('module-study');
            }}
            onGoToHome={() => goToPage('start')}
            onRetakeDiagnostic={() => goToPage('onboarding-diagnostic')}
            onResetLearningData={handleResetLearningData}
          />
        ) : (
          <div className="py-12 text-center text-slate-400">
            <p className="mb-4">No personalized learning path generated yet.</p>
            <button
              className="btn"
              onClick={() => {
                if (profile) goToPage('adaptive-profile');
                else goToPage('onboarding-welcome');
              }}
            >
              DISCOVER MY LEVEL ➔
            </button>
          </div>
        )}
      </section>

      {/* INTERACTIVE MODULE STUDY VIEW */}
      <section className={`page ${currentPage === 'module-study' ? 'active' : ''}`} id="module-study">
        {activeStudyModule ? (
          <ModuleStudyView
            key={activeStudyModule.id}
            module={activeStudyModule}
            onModuleMastered={handleModuleMastered}
            onBackToRoadmap={() => {
              setActiveStudyModule(null);
              goToPage('learning-path');
            }}
          />
        ) : (
          <div className="py-12 text-center text-slate-400">
            <p className="mb-4">No module currently selected.</p>
            <button className="btn" onClick={() => goToPage('learning-path')}>
              RETURN TO LEARNING PATH ➔
            </button>
          </div>
        )}
      </section>

      {/* FLOATING LAUNCHER BUTTON FOR HELP BUDDY */}
      <button
        className="help-buddy-launcher"
        onClick={() => setIsHelpBuddyOpen((prev) => !prev)}
        aria-label="Toggle Cybersecurity Help Buddy"
      >
        <span style={{ fontSize: '18px' }}>🤖</span>
        <span>Help Buddy</span>
        <span
          style={{
            fontSize: '10px',
            background: 'rgba(34, 211, 238, 0.2)',
            color: '#38bdf8',
            padding: '2px 6px',
            borderRadius: '10px',
            border: '1px solid rgba(34, 211, 238, 0.3)',
          }}
        >
          AI Assistant
        </span>
      </button>

      {/* HELP BUDDY DRAWER PANEL */}
      {isHelpBuddyOpen && (
        <div className="help-buddy-panel" role="dialog" aria-label="DEFENZA Cybersecurity Help Buddy">
          <div className="help-buddy-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🛡️</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.5px' }}>
                  Cybersecurity Help Buddy
                </div>
                <div style={{ fontSize: '11px', color: 'var(--cyan)' }}>
                  AI Assistant • Educational Mentor
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsHelpBuddyOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                borderRadius: '8px',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                transition: 'all 0.2s',
              }}
              title="Close Help Buddy"
            >
              ✕
            </button>
          </div>

          <div className="help-buddy-tabs">
            <button
              className={`help-buddy-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              💬 Ask Buddy
            </button>
            <button
              className={`help-buddy-tab-btn ${activeTab === 'term' ? 'active' : ''}`}
              onClick={() => setActiveTab('term')}
            >
              🔍 Term Explainer {selectedTerm ? `(${selectedTerm})` : ''}
            </button>
          </div>

          {activeTab === 'term' && (
            <div className="help-buddy-body">
              {termLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      border: '3px solid rgba(34, 211, 238, 0.2)',
                      borderTopColor: 'var(--cyan)',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      margin: '0 auto 12px auto',
                    }}
                  />
                  <div style={{ fontWeight: 700, color: 'var(--cyan)', fontSize: '14px' }}>
                    Consulting AI Assistant...
                  </div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    Deconstructing "{selectedTerm}" for you
                  </div>
                </div>
              ) : termError ? (
                <div
                  style={{
                    background: 'rgba(244, 63, 94, 0.15)',
                    border: '1px solid rgba(244, 63, 94, 0.4)',
                    padding: '12px',
                    borderRadius: '10px',
                    color: '#fca5a5',
                    fontSize: '13px',
                  }}
                >
                  ⚠️ {termError}
                </div>
              ) : termExplanation ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      paddingBottom: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: 900,
                        color: 'var(--cyan)',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {termExplanation.term}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        background: 'rgba(34,211,238,0.15)',
                        color: '#67e8f9',
                        padding: '3px 8px',
                        borderRadius: '10px',
                        fontWeight: 800,
                      }}
                    >
                      CYBER TERM
                    </span>
                  </div>

                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(34, 211, 238, 0.2)',
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--cyan)', letterSpacing: '1px', marginBottom: '4px' }}>
                      📖 WHAT IT MEANS
                    </div>
                    <div style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.55 }}>
                      {termExplanation.meaning}
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(168, 85, 247, 0.2)',
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--purple)', letterSpacing: '1px', marginBottom: '4px' }}>
                      🛡️ WHY IT MATTERS
                    </div>
                    <div style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.55 }}>
                      {termExplanation.whyItMatters}
                    </div>
                  </div>

                  {termExplanation.realWorldExample && (
                    <div
                      style={{
                        background: 'rgba(15, 23, 42, 0.7)',
                        padding: '12px',
                        borderRadius: '10px',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--green)', letterSpacing: '1px', marginBottom: '4px' }}>
                        🏢 REAL-WORLD EXAMPLE
                      </div>
                      <div style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.55 }}>
                        {termExplanation.realWorldExample}
                      </div>
                    </div>
                  )}

                  {termExplanation.technicalNote && (
                    <div
                      style={{
                        background: 'rgba(15, 23, 42, 0.7)',
                        padding: '12px',
                        borderRadius: '10px',
                        border: '1px solid rgba(251, 146, 60, 0.2)',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--orange)', letterSpacing: '1px', marginBottom: '4px' }}>
                        ⚙️ TECHNICAL DETAIL
                      </div>
                      <div style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.55 }}>
                        {termExplanation.technicalNote}
                      </div>
                    </div>
                  )}

                  <button
                    className="prompt-chip"
                    style={{ marginTop: '6px', textAlign: 'center', borderColor: 'var(--cyan)' }}
                    onClick={() => {
                      setActiveTab('chat');
                      handleSendChat(`Can you tell me more about ${termExplanation.term} and how it relates to core security principles?`);
                    }}
                  >
                    💬 Ask follow-up question in chat ➔
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 14px', color: 'var(--muted)' }}>
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>🔍</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>
                    Click Any Cybersecurity Term
                  </div>
                  <p style={{ fontSize: '12.5px', marginTop: '6px', lineHeight: 1.5 }}>
                    Click any highlighted term in the mission (like <b>Encryption</b>, <b>IAM</b>, or <b>RTO</b>) to view its definition, importance, and real-world example here.
                  </p>
                  <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                    {['Encryption', 'IAM', 'RBAC', 'Hashing', 'Failover', 'RTO'].map((t) => (
                      <button
                        key={t}
                        className="prompt-chip"
                        onClick={() => explainTerm(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <>
              <div className="help-buddy-body">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`chat-msg ${msg.role}`}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {msg.content.replace(/\*\*/g, '')}
                    </div>
                    <span
                      style={{
                        fontSize: '10px',
                        color: msg.role === 'user' ? '#94a3b8' : 'var(--cyan)',
                        marginTop: '4px',
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {chatLoading && (
                  <div className="chat-msg buddy" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '12px',
                        height: '12px',
                        border: '2px solid var(--cyan)',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                    <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                      AI Assistant is thinking...
                    </span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div
                style={{
                  padding: '8px 12px',
                  background: 'rgba(10, 16, 28, 0.9)',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  gap: '6px',
                  overflowX: 'auto',
                }}
              >
                {QUICK_QUESTIONS.slice(0, 3).map((qq, i) => (
                  <button
                    key={i}
                    className="prompt-chip"
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() => handleSendChat(qq)}
                    disabled={chatLoading}
                  >
                    {qq}
                  </button>
                ))}
              </div>

              <div className="chat-input-area">
                <input
                  type="text"
                  className="chat-input-field"
                  placeholder="Ask any cybersecurity question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                  disabled={chatLoading}
                />
                <button
                  className="chat-send-btn"
                  onClick={() => handleSendChat()}
                  disabled={chatLoading || !chatInput.trim()}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
