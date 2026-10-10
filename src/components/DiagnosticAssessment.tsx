import React, { useState } from 'react';
import { DIAGNOSTIC_QUESTION_POOL } from '../data/diagnosticQuestions.ts';
import { DiagnosticQuestion, DOMAIN_METADATA, KnowledgeProfile, UserAnswerRecord } from '../types/adaptive.ts';

interface DiagnosticAssessmentProps {
  onProfileReady: (profile: KnowledgeProfile) => void;
  onCancel: () => void;
}

export const DiagnosticAssessment: React.FC<DiagnosticAssessmentProps> = ({
  onProfileReady,
  onCancel,
}) => {
  // Initial 10 diagnostic questions
  const [questionList, setQuestionList] = useState<DiagnosticQuestion[]>(() =>
    DIAGNOSTIC_QUESTION_POOL.slice(0, 10)
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<UserAnswerRecord[]>([]);

  // Current question interaction state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [validationAlert, setValidationAlert] = useState(false);

  // Profile analysis loading state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const currentQ = questionList[currentIdx];
  const domainInfo = currentQ ? DOMAIN_METADATA[currentQ.domain] : null;
  const totalQuestions = questionList.length;
  const progressPercent = Math.round(((currentIdx + 1) / totalQuestions) * 100);

  const handleSelectOption = (idx: number) => {
    if (!isLocked) {
      setSelectedOption(idx);
      setValidationAlert(false);
    }
  };

  const handleLockAnswer = () => {
    if (selectedOption === null) {
      setValidationAlert(true);
      return;
    }

    setIsLocked(true);
    const isNotSure = selectedOption === currentQ.options.length - 1; // "Not sure" is always the final option
    const isCorrect = selectedOption === currentQ.correctAnswer;

    const record: UserAnswerRecord = {
      questionId: currentQ.id,
      domain: currentQ.domain,
      difficulty: currentQ.difficulty,
      selectedOption,
      isNotSure,
      isCorrect,
      timestamp: Date.now(),
    };

    const updatedAnswers = [...answers, record];
    setAnswers(updatedAnswers);

    // Adaptive Check at question 10: If uncertainty was detected and we haven't expanded yet,
    // dynamically add up to 4 clarifying questions from the pool
    if (currentIdx === 9 && questionList.length === 10) {
      const notSureCount = updatedAnswers.filter((a) => a.isNotSure).length;
      const incorrectCount = updatedAnswers.filter((a) => !a.isCorrect && !a.isNotSure).length;
      if (notSureCount >= 1 || (incorrectCount >= 2 && incorrectCount <= 5)) {
        const extraQuestions = DIAGNOSTIC_QUESTION_POOL.slice(10, 14);
        setQuestionList((prev) => [...prev, ...extraQuestions]);
      }
    }
  };

  const handleNext = async () => {
    if (currentIdx < questionList.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsLocked(false);
      setValidationAlert(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Completed all questions! Send to profiling endpoint
      await submitForProfiling(answers);
    }
  };

  const submitForProfiling = async (finalAnswers: UserAnswerRecord[]) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/adaptive/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers }),
      });

      const data = await response.json();
      if (!response.ok || !data.success || !data.profile) {
        throw new Error(data.error || 'Failed to generate profile from assessment.');
      }

      onProfileReady(data.profile);
    } catch (err: any) {
      console.error('Profiling error:', err);
      setAnalysisError(
        err.message || 'Error communicating with intelligence engine. Please retry.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="py-20 text-center max-w-lg mx-auto">
        <div className="start-card p-10">
          <div
            style={{
              width: '44px',
              height: '44px',
              border: '4px solid rgba(34, 211, 238, 0.2)',
              borderTopColor: 'var(--cyan)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 20px auto',
            }}
          />
          <div className="text-xl font-bold text-white mb-2">
            Synthesizing Knowledge Profile
          </div>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            DEFENZA is evaluating your operational telemetry across all 8 cybersecurity domains to calibrate your personalized curriculum...
          </p>
          <div className="text-xs font-mono text-cyan-400">
            Analyzing {answers.length} decision telemetry points...
          </div>
        </div>
      </div>
    );
  }

  if (analysisError) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="start-card p-8 border-red-500/40">
          <div className="text-3xl mb-3">⚠️</div>
          <h2 className="text-lg font-bold text-red-400 mb-2">Analysis Interrupted</h2>
          <p className="text-xs text-slate-300 mb-6">{analysisError}</p>
          <div className="flex gap-3 justify-center">
            <button className="btn" onClick={() => submitForProfiling(answers)}>
              RETRY PROFILING
            </button>
            <button className="btn secondary" onClick={onCancel}>
              CANCEL
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isNotSureOption = selectedOption === currentQ.options.length - 1;
  const isCorrectChoice = selectedOption === currentQ.correctAnswer;

  return (
    <div className="diagnostic-view max-w-3xl mx-auto py-6 animate-fade">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <div className="text-xs font-black tracking-widest text-cyan-400 uppercase flex items-center gap-2">
            <span>DEFENZA ADAPTIVE DIAGNOSTIC</span>
            {questionList.length > 10 && currentIdx >= 10 && (
              <span className="text-[10px] bg-purple-900/50 border border-purple-500/40 text-purple-300 px-2 py-0.5 rounded">
                ADAPTIVE EXTENSION
              </span>
            )}
          </div>
          <div className="text-sm font-bold text-slate-300 mt-1">
            Question {currentIdx + 1} of {totalQuestions}
          </div>
        </div>
        <button
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          onClick={onCancel}
        >
          Exit Diagnostic
        </button>
      </div>

      {/* Progress Bar */}
      <div className="progress mb-6">
        <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Question Container Card */}
      <div className="quiz-box p-6 sm:p-8">
        {/* Domain Badge & Difficulty */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{domainInfo?.icon}</span>
            <span
              className="text-xs font-black tracking-wider uppercase"
              style={{ color: domainInfo?.color || 'var(--cyan)' }}
            >
              {domainInfo?.name}
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400 capitalize bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            Level: {currentQ.difficulty}
          </span>
        </div>

        {/* Realistic Scenario context (if present) */}
        {currentQ.scenario && (
          <div className="scenario my-4 bg-slate-950/80 border border-slate-800/90 p-4 rounded-xl">
            <div className="text-xs font-bold text-rose-400 tracking-wider mb-1.5 flex items-center gap-1.5">
              <span>🚨</span> OPERATIONAL SCENARIO
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {currentQ.scenario}
            </p>
          </div>
        )}

        {/* Question Text */}
        <div className="question text-lg sm:text-xl font-bold text-white my-4 leading-snug">
          {currentQ.question}
        </div>

        {/* Options */}
        <div className="options space-y-2.5 my-6">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isNotSureItem = idx === currentQ.options.length - 1;

            return (
              <label
                key={idx}
                className={`quiz-option transition-all ${
                  isSelected ? 'selected' : ''
                } ${isNotSureItem ? 'border-dashed border-slate-700/80 text-slate-400' : ''}`}
                onClick={() => handleSelectOption(idx)}
              >
                <input
                  type="radio"
                  name="diagnostic-option"
                  checked={isSelected}
                  disabled={isLocked}
                  onChange={() => handleSelectOption(idx)}
                />
                <span className="text-sm font-medium leading-relaxed">{option}</span>
              </label>
            );
          })}
        </div>

        {/* Validation Alert */}
        {validationAlert && (
          <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold mb-4">
            ⚠️ Please choose an answer or select "Not sure" before proceeding.
          </div>
        )}

        {/* Explanation Card (Revealed after locking decision) */}
        {isLocked && (
          <div
            className={`feedback my-6 p-4 rounded-xl border leading-relaxed text-sm ${
              isNotSureOption
                ? 'bg-sky-950/40 border-sky-500/40 text-sky-200'
                : isCorrectChoice
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}
            style={{ display: 'block' }}
          >
            <div className="font-black text-xs uppercase tracking-wider mb-1">
              {isNotSureOption
                ? 'ℹ️ Knowledge Boundary Recorded'
                : isCorrectChoice
                ? '🛡️ Correct Tactical Decision'
                : '⚠️ Defensive Gap Identified'}
            </div>
            <div>{currentQ.explanation}</div>
          </div>
        )}

        {/* Action Button */}
        <div className="actions mt-6 flex justify-end">
          {!isLocked ? (
            <button className="btn" onClick={handleLockAnswer}>
              LOCK DECISION
            </button>
          ) : (
            <button className="btn" onClick={handleNext}>
              {currentIdx === questionList.length - 1
                ? 'ANALYZE KNOWLEDGE PROFILE ➔'
                : 'NEXT QUESTION ➔'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
