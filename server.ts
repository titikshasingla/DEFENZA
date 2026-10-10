import express, { type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  ALL_DOMAINS,
  DOMAIN_TITLES,
  calculateBaselineDomainMetrics,
  CURRICULUM_CATALOG,
  type CybersecurityDomain,
  type DomainProfile,
  type KnowledgeProfile,
  type LearningCurriculum,
  type ProficiencyLevel,
  type StudyModule,
  type UserAnswerRecord,
} from './serverAdaptive.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.on('uncaughtException', (err) => {
  console.error('[DEFENZA] Uncaught exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[DEFENZA] Unhandled rejection:', reason);
});

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Dedicated healthcheck endpoints
app.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'defenza-server', uptime: process.uptime() });
});

// Initialize GoogleGenAI SDK strictly server-side using GEMINI_API_KEY
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory cache for term explanations to eliminate duplicate LLM latency (0ms response)
const termExplanationCache = new Map<string, { meaning: string; whyItMatters: string; realWorldExample: string; technicalNote: string }>();

// Pre-seed core curriculum terms so initial clicks on any security card respond instantly
const CORE_PRESEEDED_TERMS: Record<string, { meaning: string; whyItMatters: string; realWorldExample: string; technicalNote: string }> = {
  'encryption': {
    meaning: 'Encryption converts readable plaintext into unreadable ciphertext using mathematical cryptographic algorithms and secret keys.',
    whyItMatters: 'Guarantees Confidentiality by ensuring intercepted or stolen data cannot be read without the authorized decryption key.',
    realWorldExample: 'Like sending a secure locked deposit box through the postal mail; anyone can see the box in transit, but only the intended recipient holds the physical key to unlock it.',
    technicalNote: 'Commonly implemented via AES-GCM (symmetric for bulk data) and RSA/ECC (asymmetric for key exchange), integrated into TLS 1.3.'
  },
  'iam': {
    meaning: 'Identity and Access Management (IAM) is the security framework that governs user identities and controls their permissions across resources.',
    whyItMatters: 'Prevents unauthorized access and limits blast radius by verifying identity and enforcing least privilege policies.',
    realWorldExample: 'Like an electronic hotel keycard that only unlocks your specific room and elevator floor, but denies entry to the hotel vaults or manager office.',
    technicalNote: 'Enforced through authentication (MFA, passwordless) and authorization protocols like OAuth 2.0, SAML, and OIDC.'
  },
  'rbac': {
    meaning: 'Role-Based Access Control (RBAC) grants system permissions based on user organizational roles rather than individual account assignments.',
    whyItMatters: 'Protects Confidentiality and Integrity by avoiding privilege creep and ensuring accounts only possess permissions necessary for their duties.',
    realWorldExample: 'A hospital receptionist can view appointment times and patient names, while only attending physicians can view diagnostic clinical notes.',
    technicalNote: 'Implemented using role-to-permission mappings in directory services such as LDAP, Azure AD, or AWS IAM Role Policies.'
  },
  'least privilege': {
    meaning: 'The Principle of Least Privilege states that users, applications, and processes must only be granted the minimum necessary access to complete their jobs.',
    whyItMatters: 'Minimizes the potential damage (blast radius) if an account, token, or service is compromised by an adversary.',
    realWorldExample: 'Giving a contractor a temporary visitor guest badge rather than a master administrator key that opens every door in the building.',
    technicalNote: 'Enforced via granular access control lists (ACLs), privilege separation, sudo permissions, and ephemeral Just-In-Time (JIT) access.'
  },
  'hashing': {
    meaning: 'A cryptographic hash is a one-way mathematical function that converts arbitrary data into a fixed-length digital fingerprint.',
    whyItMatters: 'Protects Integrity by allowing detection of any unauthorized modification, corruption, or tampering of data.',
    realWorldExample: 'Like checking the tamper-evident seal on a medicine bottle; if the seal does not match the factory code, you know it was altered.',
    technicalNote: 'Algorithms like SHA-256 or SHA-3 produce deterministic, collision-resistant output; modifying even one bit changes the entire hash digest.'
  },
  'digital signatures': {
    meaning: 'A cryptographic mechanism that binds an identity to a document or message, providing authenticity, integrity, and non-repudiation.',
    whyItMatters: 'Guarantees Integrity and Authenticity by proving who authored the data and confirming that it has not been modified since signing.',
    realWorldExample: 'Like a wax seal stamped with an emperor signet ring; if the seal is broken or the ring design differs, the decree is invalid.',
    technicalNote: 'Created by encrypting the document hash with the sender private key and verified by recipients using the sender public key.'
  },
  'audit logs': {
    meaning: 'Chronological security records detailing system events, user logins, data access, and administrative actions.',
    whyItMatters: 'Maintains Integrity and Accountability by providing tamper-evident forensic evidence needed to investigate incidents and detect intrusion.',
    realWorldExample: 'Like a high-security bank vault sign-in ledger with timestamped video surveillance tracking every person who opened the vault door.',
    technicalNote: 'Aggregated via SIEM platforms (Splunk, Elastic) and secured using write-once-read-many (WORM) storage and append-only forward hashing.'
  },
  'mac': {
    meaning: 'Mandatory Access Control (MAC) or Message Authentication Code (depending on context) enforces strict security labels or cryptographic integrity tags.',
    whyItMatters: 'Protects Integrity and Confidentiality by preventing unauthorized modifications and enforcing classification clearance boundaries.',
    realWorldExample: 'In military classified facilities, Top Secret documents cannot be read or declassified by staff with only Secret clearance.',
    technicalNote: 'Implemented through kernel-level security modules like SELinux or AppArmor using Bell-LaPadula rules and HMAC integrity tags.'
  },
  'failover': {
    meaning: 'An operational redundancy mechanism that automatically redirects traffic to a standby system when the primary component fails.',
    whyItMatters: 'Preserves Availability by preventing downtime and single points of failure during hardware or network outages.',
    realWorldExample: 'A hospital backup power generator that automatically kicks in within milliseconds when the city electric grid loses power.',
    technicalNote: 'Configured in Active-Passive or Active-Active topologies with health check probes, VRRP, or global server load balancers (GSLB).'
  },
  'redundancy': {
    meaning: 'The intentional duplication of critical components (servers, disks, power, networks) to maintain continuous uptime.',
    whyItMatters: 'Directly supports Availability and resilience by eliminating single points of failure across infrastructure.',
    realWorldExample: 'Commercial airplanes having two or more engines so that if one engine fails in mid-air, the plane continues flying safely.',
    technicalNote: 'Implemented using RAID disk arrays, multi-availability zone database replicas, dual NICs, and redundant cloud regions.'
  },
  'rto': {
    meaning: 'Recovery Time Objective (RTO) is the maximum acceptable duration of downtime following a disruption before service is restored.',
    whyItMatters: 'Guides Availability and disaster recovery planning by defining the business target speed for system recovery.',
    realWorldExample: 'A payment gateway establishing an RTO of 15 minutes, meaning backup systems must restore transactions within 15 minutes of a failure.',
    technicalNote: 'Achieved through automated orchestration, warm standby replicas, container failover, and documented runbooks.'
  },
  'rpo': {
    meaning: 'Recovery Point Objective (RPO) is the maximum acceptable amount of data loss measured in time backward from a disruption.',
    whyItMatters: 'Protects Integrity and Availability by setting the required frequency of data backups and replication intervals.',
    realWorldExample: 'An RPO of 5 minutes means the organization can afford to lose at most 5 minutes of transaction data during a catastrophic outage.',
    technicalNote: 'Maintained using continuous synchronous/asynchronous database replication, continuous log shipping, and frequent snapshotting.'
  },
  'confidentiality': {
    meaning: 'The core security pillar ensuring that information is disclosed only to authorized individuals, entities, or processes.',
    whyItMatters: 'Protects privacy, intellectual property, and compliance by preventing unauthorized data exposure and espionage.',
    realWorldExample: 'Sealing private medical health records so only authorized doctors and the patient can read them.',
    technicalNote: 'Protected using AES encryption, TLS network security, RBAC permissions, and strict key management.'
  },
  'integrity': {
    meaning: 'The core security pillar ensuring that data remains accurate, complete, and protected against unauthorized modification or tampering.',
    whyItMatters: 'Ensures systems and business decisions can trust the authenticity and validity of stored records and messages.',
    realWorldExample: 'Ensuring bank account ledger transfers cannot be silently inflated or manipulated while in transit between accounts.',
    technicalNote: 'Enforced via SHA-256 hashing, HMACs, digital signatures, version control, and tamper-evident audit logs.'
  },
  'availability': {
    meaning: 'The core security pillar ensuring that authorized users have prompt, uninterrupted access to critical systems and data.',
    whyItMatters: 'Prevents business shutdown, lost revenue, and operational failure caused by outages, hardware crashes, or DDoS attacks.',
    realWorldExample: 'Ensuring 911 emergency dispatch phone lines remain operational 24/7/365, even during severe storms or network cutovers.',
    technicalNote: 'Achieved through high availability clustering, DDoS mitigation (Cloudflare), auto-scaling, and geo-redundant backups.'
  },
};

for (const [k, v] of Object.entries(CORE_PRESEEDED_TERMS)) {
  termExplanationCache.set(k.toLowerCase().trim(), v);
}

const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
];

// Helper for calling models with resilient waterfall fallback
async function callGemma(contents: any): Promise<string> {
  for (const model of CANDIDATE_MODELS) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents,
        config: {
          maxOutputTokens: 600,
        },
      });
      const candidate = res.candidates?.[0];
      const parts = candidate?.content?.parts || [];
      const text = parts.find((p: any) => !p.thought)?.text || res.text || '';
      if (text && text.trim()) return text;
    } catch (err: any) {
      console.warn(`Model ${model} call issue:`, err?.message);
    }
  }
  return 'A vital cybersecurity mechanism for defensive system protection.';
}

// 1. HELP BUDDY: Click-To-Explain Term Endpoint (With Instant Caching)
app.post('/api/help-buddy/explain-term', async (req: Request, res: Response) => {
  try {
    const { term, context } = req.body;
    if (!term || typeof term !== 'string' || !term.trim()) {
      return res.status(400).json({ error: 'A cybersecurity term is required.' });
    }

    const normalizedKey = term.trim().toLowerCase();
    if (termExplanationCache.has(normalizedKey)) {
      const cached = termExplanationCache.get(normalizedKey)!;
      return res.json({
        success: true,
        term: term.trim(),
        cached: true,
        data: cached,
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const prompt = `You are the DEFENZA Cybersecurity Help Buddy. Explain this cybersecurity term clearly, concisely, and educationally for a student. Do not use asterisks (**) in your output:
Term: "${term.trim()}"
${context ? `Context: "${context.trim()}"` : ''}

Provide a JSON object with exactly these 4 concise fields:
1. "meaning": Simple explanation of what it means (2 short sentences).
2. "whyItMatters": Why it matters for security architecture (1-2 sentences).
3. "realWorldExample": A practical real-world analogy.
4. "technicalNote": Short technical mechanism or protocol note.

Return ONLY a JSON object:
{
  "meaning": "...",
  "whyItMatters": "...",
  "realWorldExample": "...",
  "technicalNote": "..."
}`;

    const rawResponse = await callGemma(prompt);
    let parsed: any = null;
    try {
      const cleanJson = rawResponse
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      const match = rawResponse.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          parsed = null;
        }
      }
    }

    const cleanResult = {
      meaning: (parsed?.meaning || rawResponse || '').replace(/\*\*/g, '').trim(),
      whyItMatters: (parsed?.whyItMatters || 'Essential for defense and core security architecture.').replace(/\*\*/g, '').trim(),
      realWorldExample: (parsed?.realWorldExample || '').replace(/\*\*/g, '').trim(),
      technicalNote: (parsed?.technicalNote || '').replace(/\*\*/g, '').trim(),
    };

    termExplanationCache.set(normalizedKey, cleanResult);
    return res.json({
      success: true,
      term: term.trim(),
      cached: false,
      data: cleanResult,
    });
  } catch (error: any) {
    console.error('Help Buddy explain term error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to explain cybersecurity term.',
    });
  }
});

// 2. HELP BUDDY: Cybersecurity Chat Endpoint (Supporting Fast Streaming & Standard JSON)
app.post('/api/help-buddy/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, stream } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'A question or message is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    let formattedHistory = '';
    if (Array.isArray(history) && history.length > 0) {
      formattedHistory = history
        .slice(-4)
        .map((h: any) => `${h.role === 'user' ? 'User' : 'Help Buddy'}: ${h.content}`)
        .join('\n');
    }

    const prompt = `You are the "DEFENZA Cybersecurity Help Buddy" — a friendly, concise educational mentor in DEFENZA.
GUIDELINES:
- Answer clearly, defensively, and concisely (2 to 3 focused paragraphs max).
- Use simple analogies and clear bullet points.
- Never claim to have scanned the user device or hardware.
- Do NOT use asterisks (**) in your answer; write clean plain text.

${formattedHistory ? `Recent Context:\n${formattedHistory}\n` : ''}
User: ${message.trim()}
Help Buddy:`;

    const isStreamingRequested = Boolean(stream) || req.headers.accept?.includes('text/event-stream');

    if (isStreamingRequested) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      let streamSucceeded = false;
      for (const model of CANDIDATE_MODELS) {
        try {
          const streamResponse = await ai.models.generateContentStream({
            model,
            contents: prompt,
            config: {
              maxOutputTokens: 750,
            },
          });

          let chunkCount = 0;
          for await (const chunk of streamResponse) {
            const parts = chunk.candidates?.[0]?.content?.parts || [];
            const text = parts.find((p: any) => !p.thought)?.text || chunk.text || '';
            if (text) {
              chunkCount++;
              const cleanText = text.replace(/\*\*/g, '');
              res.write(`data: ${JSON.stringify({ chunk: cleanText })}\n\n`);
            }
          }

          if (chunkCount > 0) {
            streamSucceeded = true;
            break;
          }
        } catch (streamErr: any) {
          console.warn(`Streaming with ${model} issue:`, streamErr?.message);
        }
      }

      if (!streamSucceeded) {
        const fallbackText = await callGemma(prompt);
        const cleanFallback = fallbackText.replace(/\*\*/g, '');
        res.write(`data: ${JSON.stringify({ chunk: cleanFallback })}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      return res.end();
    }

    const reply = await callGemma(prompt);
    const cleanReply = reply.replace(/\*\*/g, '').trim();
    return res.json({
      success: true,
      reply: cleanReply,
    });
  } catch (error: any) {
    console.error('Help Buddy chat error:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: error?.message || 'Failed to process chat message.',
      });
    }
    res.end();
  }
});

// 3. KNOWLEDGE PROFILING: Generates deep cybersecurity profile
app.post('/api/adaptive/profile', async (req: Request, res: Response) => {
  try {
    const { answers } = req.body as { answers: UserAnswerRecord[] };
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Valid diagnostic assessment answers are required.' });
    }

    const baselineMetrics = calculateBaselineDomainMetrics(answers);
    const totalAnswered = answers.length;
    const totalCorrect = answers.filter((a) => a.isCorrect).length;
    const totalNotSure = answers.filter((a) => a.isNotSure).length;
    const overallPercentage = Math.round((totalCorrect / totalAnswered) * 100);

    let overallProficiency: ProficiencyLevel = 'Developing';
    if (overallPercentage >= 80) overallProficiency = 'Advanced';
    else if (overallPercentage >= 65) overallProficiency = 'Intermediate';
    else if (overallPercentage >= 40) overallProficiency = 'Developing';
    else overallProficiency = 'Beginner';

    const telemetryReport = ALL_DOMAINS.map((domain) => {
      const m = baselineMetrics[domain];
      return `- Domain: ${DOMAIN_TITLES[domain]} (${domain}) | Questions: ${m.total}, Correct: ${m.correct}, Not Sure: ${m.notSure}, Incorrect: ${m.wrong} | Calculated Score: ${m.score}/100, Baseline Tier: ${m.proficiency}`;
    }).join('\n');

    let gemmaAnalysis: any = null;
    if (process.env.GEMINI_API_KEY) {
      const gemmaPrompt = `You are the DEFENZA Adaptive Cybersecurity Intelligence engine. Analyze this user's diagnostic assessment performance across 8 cybersecurity domains and generate an executive cybersecurity knowledge profile.

DIAGNOSTIC TELEMETRY:
Overall: ${totalCorrect}/${totalAnswered} correct (${overallPercentage}%), ${totalNotSure} marked "Not sure".
${telemetryReport}

GUIDELINES:
- Distinguish between explicitly "Not sure" answers vs incorrect answers.
- For each domain provide 1-2 demonstrated concepts, 1-2 gaps, and next learning objective.
- Provide "overallSummary" (2 clean sentences, no asterisks), "strongestAreas" (top 2 domain names), "topImprovementConcepts" (top 3 concepts needing improvement), and "recommendedStartingPoint" (specific domain name to begin).

Return ONLY valid JSON:
{
  "overallSummary": "...",
  "strongestAreas": ["...", "..."],
  "topImprovementConcepts": ["...", "...", "..."],
  "recommendedStartingPoint": "...",
  "domainDetails": {
    "cia_triad": { "conceptsDemonstrated": ["..."], "misconceptionsOrGaps": ["..."], "nextObjective": "..." },
    "passwords_auth": { "conceptsDemonstrated": ["..."], "misconceptionsOrGaps": ["..."], "nextObjective": "..." },
    "phishing_social": { "conceptsDemonstrated": ["..."], "misconceptionsOrGaps": ["..."], "nextObjective": "..." },
    "malware_attacks": { "conceptsDemonstrated": ["..."], "misconceptionsOrGaps": ["..."], "nextObjective": "..." },
    "network_security": { "conceptsDemonstrated": ["..."], "misconceptionsOrGaps": ["..."], "nextObjective": "..." },
    "privacy_hygiene": { "conceptsDemonstrated": ["..."], "misconceptionsOrGaps": ["..."], "nextObjective": "..." },
    "incident_response": { "conceptsDemonstrated": ["..."], "misconceptionsOrGaps": ["..."], "nextObjective": "..." },
    "risk_analysis": { "conceptsDemonstrated": ["..."], "misconceptionsOrGaps": ["..."], "nextObjective": "..." }
  }
}`;

      try {
        const rawResponse = await callGemma(gemmaPrompt);
        const cleanJson = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
        gemmaAnalysis = JSON.parse(cleanJson);
      } catch (e) {
        console.warn('Gemma parsing fallback used for knowledge profile:', e);
      }
    }

    const domainProfiles: Record<CybersecurityDomain, DomainProfile> = {} as any;
    for (const domain of ALL_DOMAINS) {
      const base = baselineMetrics[domain];
      const gemmaDetail = gemmaAnalysis?.domainDetails?.[domain];

      const defaultDemonstrated = base.correct > 0
        ? ['Correctly recognized standard defense protocols and threat markers']
        : ['Basic intuition present, further scenario training required'];

      const defaultGaps = base.notSure > 0
        ? ['Indicated uncertainty regarding specific architectural invariants']
        : base.wrong > 0
        ? ['Confused defensive trade-offs or attack indicators']
        : ['Advanced threat edge-cases yet to be evaluated'];

      domainProfiles[domain] = {
        domainId: domain,
        domainName: DOMAIN_TITLES[domain],
        proficiency: base.proficiency,
        masteryScore: base.score,
        conceptsDemonstrated: gemmaDetail?.conceptsDemonstrated || defaultDemonstrated,
        misconceptionsOrGaps: gemmaDetail?.misconceptionsOrGaps || defaultGaps,
        nextObjective: gemmaDetail?.nextObjective || `Master foundational principles of ${DOMAIN_TITLES[domain]}`,
        confidence: base.confidence,
        needsFurtherAssessment: base.needsFurther,
      };
    }

    const sortedByScore = [...ALL_DOMAINS].sort(
      (a, b) => domainProfiles[b].masteryScore - domainProfiles[a].masteryScore
    );

    const strongest = gemmaAnalysis?.strongestAreas || [
      DOMAIN_TITLES[sortedByScore[0]],
      DOMAIN_TITLES[sortedByScore[1]],
    ];

    const weakestDomains = sortedByScore.slice(-3).reverse();
    const topImprovements = gemmaAnalysis?.topImprovementConcepts || weakestDomains.map(
      (d) => `${DOMAIN_TITLES[d]} fundamentals`
    );

    const profile: KnowledgeProfile = {
      id: `prof-${Date.now()}`,
      createdAt: Date.now(),
      overallProficiency,
      overallSummary:
        gemmaAnalysis?.overallSummary ||
        `Based on your diagnostic assessment, you demonstrate ${overallProficiency.toLowerCase()} operational cybersecurity readiness. Focus first on strengthening your core defensive invariants before tackling advanced multi-stage attack scenarios.`,
      domains: domainProfiles,
      strongestAreas: strongest,
      topImprovementConcepts: topImprovements,
      recommendedStartingPoint:
        gemmaAnalysis?.recommendedStartingPoint || DOMAIN_TITLES[weakestDomains[0]],
      totalDiagnosticAnswered: totalAnswered,
      uncertaintyDetected: totalNotSure > 0,
    };

    return res.json({ success: true, profile });
  } catch (error: any) {
    console.error('Error generating knowledge profile:', error);
    return res.status(500).json({ error: error?.message || 'Failed to construct knowledge profile.' });
  }
});

// 4. DYNAMIC CURRICULUM GENERATION
app.post('/api/adaptive/generate-curriculum', async (req: Request, res: Response) => {
  try {
    const { profile } = req.body as { profile: KnowledgeProfile };
    if (!profile || !profile.domains) {
      return res.status(400).json({ error: 'Valid knowledge profile is required to generate curriculum.' });
    }

    const sortedDomains = ALL_DOMAINS.map((d) => ({
      domain: d,
      score: profile.domains[d]?.masteryScore ?? 50,
      proficiency: profile.domains[d]?.proficiency ?? 'Developing',
    })).sort((a, b) => a.score - b.score);

    const selectedDomains = sortedDomains.slice(0, 5).map((s) => s.domain);
    if (!selectedDomains.includes('cia_triad') && (profile.domains.cia_triad?.masteryScore || 0) < 75) {
      selectedDomains.unshift('cia_triad');
    }

    const modules: StudyModule[] = selectedDomains.map((dom, index) => {
      const template = CURRICULUM_CATALOG[dom];
      const domainScore = profile.domains[dom]?.masteryScore ?? 50;
      const status: StudyModule['status'] = index === 0 ? 'available' : 'locked';

      return {
        ...template,
        whyRelevant: `Your diagnostic scored ${domainScore}/100 in ${DOMAIN_TITLES[dom]}. Mastering this module directly eliminates your identified knowledge gaps.`,
        status,
      };
    });

    const curriculum: LearningCurriculum = {
      id: `curr-${Date.now()}`,
      userId: 'local-defender',
      generatedAt: Date.now(),
      targetProfileSummary: `Personalized curriculum targeted at elevating your readiness from ${profile.overallProficiency} to advanced defensive operational mastery.`,
      modules,
      completedCount: 0,
      overallProgress: 0,
    };

    return res.json({ success: true, curriculum });
  } catch (error: any) {
    console.error('Error generating adaptive curriculum:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate personalized curriculum.' });
  }
});

// 5. EVALUATE LESSON QUIZ
app.post('/api/adaptive/evaluate-lesson-quiz', async (req: Request, res: Response) => {
  try {
    const { moduleId, exercisePassed, quizAnswers } = req.body as {
      moduleId: string;
      exercisePassed: boolean;
      quizAnswers: { questionId: string; selectedOption: number }[];
    };

    const matchingDomain = Object.keys(CURRICULUM_CATALOG).find(
      (k) => CURRICULUM_CATALOG[k as CybersecurityDomain].id === moduleId
    ) as CybersecurityDomain | undefined;

    if (!matchingDomain) {
      return res.status(404).json({ error: 'Study module not found.' });
    }

    const moduleData = CURRICULUM_CATALOG[matchingDomain];
    let correctCount = 0;
    const totalQuiz = moduleData.checkpointQuiz.length;

    moduleData.checkpointQuiz.forEach((q) => {
      const userAns = quizAnswers?.find((a) => a.questionId === q.id);
      if (userAns && userAns.selectedOption === q.correctAnswer) {
        correctCount++;
      }
    });

    const quizScorePercent = totalQuiz > 0 ? Math.round((correctCount / totalQuiz) * 100) : 100;
    const compositeScore = Math.round(
      (exercisePassed ? 40 : 10) + (quizScorePercent * 0.6)
    );
    const mastered = compositeScore >= moduleData.masteryThreshold;

    return res.json({
      success: true,
      domainId: matchingDomain,
      compositeScore,
      quizScorePercent,
      mastered,
      exercisePassed,
      feedback: mastered
        ? `Checkpoint Passed! You demonstrated ${compositeScore}% operational mastery on ${moduleData.title}. Domain mastery increased.`
        : `Score: ${compositeScore}%. Mastery threshold is ${moduleData.masteryThreshold}%. Review the conceptual breakdown and retry the checkpoint.`,
    });
  } catch (error: any) {
    console.error('Error evaluating quiz:', error);
    return res.status(500).json({ error: error?.message || 'Failed to evaluate checkpoint quiz.' });
  }
});

export { app };

async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  let hasDist = fs.existsSync(path.resolve(distPath, 'index.html'));
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.K_SERVICE !== undefined ||
    (hasDist && process.env.NODE_ENV !== 'development');

  if (isProduction) {
    if (!hasDist) {
      console.warn('[DEFENZA] Production mode detected but dist/index.html not found. Building bundle...');
      try {
        const { execSync } = await import('child_process');
        execSync('npx vite build', { stdio: 'inherit' });
        hasDist = fs.existsSync(path.resolve(distPath, 'index.html'));
      } catch (err) {
        console.error('[DEFENZA] Dynamic build failed:', err);
      }
    }

    if (hasDist) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    } else {
      app.get('*', (_req: Request, res: Response) => {
        res.status(200).send('<!doctype html><html lang="en"><head><title>DEFENZA</title></head><body><div id="root">DEFENZA is starting up...</div></body></html>');
      });
    }
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.use('*', async (req: Request, res: Response, next) => {
      const url = req.originalUrl;
      try {
        const indexHtmlPath = path.resolve(__dirname, 'index.html');
        if (fs.existsSync(indexHtmlPath)) {
          let template = fs.readFileSync(indexHtmlPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } else {
          next();
        }
      } catch (e: any) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`DEFENZA server running at http://0.0.0.0:${PORT} [${isProduction ? 'production' : 'development'}]`);
  });

  const shutdown = () => {
    console.log('[DEFENZA] Gracefully shutting down server...');
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

// Start if executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  startServer();
}
