import React, { useState, useEffect } from 'react';
import { DOMAIN_METADATA, StudyModule } from '../types/adaptive.ts';

interface ModuleStudyViewProps {
  module: StudyModule;
  onModuleMastered: (moduleId: string, score: number) => void;
  onBackToRoadmap: () => void;
}

export const ModuleStudyView: React.FC<ModuleStudyViewProps> = ({
  module,
  onModuleMastered,
  onBackToRoadmap,
}) => {
  const [currentStep, setCurrentStep] = useState<'lessons' | 'exercise' | 'quiz' | 'result'>('lessons');
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);

  // Interactive exercise state
  const [selectedExerciseOption, setSelectedExerciseOption] = useState<number | null>(null);
  const [exerciseEvaluated, setExerciseEvaluated] = useState(false);

  // Checkpoint Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evalResult, setEvalResult] = useState<{
    compositeScore: number;
    quizScorePercent: number;
    mastered: boolean;
    feedback: string;
  } | null>(null);

  // Reset all module progress states whenever a different module is opened
  useEffect(() => {
    setCurrentStep('lessons');
    setActiveLessonIdx(0);
    setSelectedExerciseOption(null);
    setExerciseEvaluated(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setIsSubmitting(false);
    setEvalResult(null);
  }, [module.id]);

  const domainMeta = DOMAIN_METADATA[module.domainId];
  const activeLesson = module.lessons[activeLessonIdx];

  const handleSelectQuizOption = (qId: string, optionIdx: number) => {
    if (!quizSubmitted) {
      setQuizAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
    }
  };

  const handleCompleteQuiz = async () => {
    const unanswered = module.checkpointQuiz.some((q) => quizAnswers[q.id] === undefined);
    if (unanswered) {
      alert('Please select an answer for all checkpoint quiz questions.');
      return;
    }

    setIsSubmitting(true);
    try {
      const exercisePassed =
        selectedExerciseOption !== null &&
        module.interactiveExercise.options[selectedExerciseOption]?.isCorrect;

      const payload = {
        moduleId: module.id,
        exercisePassed: Boolean(exercisePassed),
        quizAnswers: Object.entries(quizAnswers).map(([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        })),
      };

      const res = await fetch('/api/adaptive/evaluate-lesson-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to evaluate quiz.');
      }

      setEvalResult(data);
      setQuizSubmitted(true);
      setCurrentStep('result');

      if (data.mastered) {
        onModuleMastered(module.id, data.compositeScore);
      }
    } catch (e: any) {
      alert(e.message || 'Error evaluating checkpoint quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="module-study-view max-w-4xl mx-auto py-6 animate-fade">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{domainMeta?.icon}</span>
            <span
              className="text-xs font-black tracking-wider uppercase"
              style={{ color: domainMeta?.color || 'var(--cyan)' }}
            >
              {module.badge} // {domainMeta?.name}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {module.title}
          </h1>
        </div>
        <button
          className="btn secondary text-xs px-3 py-1.5"
          onClick={onBackToRoadmap}
        >
          ← Return to Roadmap
        </button>
      </div>

      {/* Step Navigation Pill Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800 mb-6 overflow-x-auto text-xs">
        <button
          onClick={() => setCurrentStep('lessons')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
            currentStep === 'lessons' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          1. Core Lessons
        </button>
        <button
          onClick={() => setCurrentStep('exercise')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
            currentStep === 'exercise' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Scenario Exercise
        </button>
        <button
          onClick={() => setCurrentStep('quiz')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
            currentStep === 'quiz' || currentStep === 'result' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          3. Mastery Checkpoint
        </button>
      </div>

      {/* STEP 1: LESSONS VIEW */}
      {currentStep === 'lessons' && activeLesson && (
        <div className="space-y-6">
          <div className="big-card p-6 sm:p-8">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
              <span>LESSON {activeLessonIdx + 1} OF {module.lessons.length}</span>
              <span>~{activeLesson.readingMinutes} MIN READ</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              {activeLesson.title}
            </h2>

            <p className="text-sm text-cyan-200/90 leading-relaxed bg-cyan-950/30 p-3.5 rounded-xl border border-cyan-500/20 mb-6">
              💡 {activeLesson.summary}
            </p>

            {/* Concept Breakdown */}
            <div className="space-y-5 my-6">
              {activeLesson.conceptBreakdown.map((sec, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                  <h3 className="text-base font-bold text-white mb-2">
                    {sec.heading}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-3">
                    {sec.body}
                  </p>
                  {sec.analogy && (
                    <div className="text-xs text-amber-200/90 bg-amber-950/20 border border-amber-500/20 p-2.5 rounded-lg">
                      <span className="font-bold text-amber-400">Analogy:</span> {sec.analogy}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Key Takeaways */}
            <div className="border-t border-slate-800 pt-5 mt-6">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                KEY DEFENSIVE TAKEAWAYS
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {activeLesson.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-between items-center">
            {activeLessonIdx > 0 ? (
              <button
                className="btn secondary text-xs"
                onClick={() => setActiveLessonIdx((i) => i - 1)}
              >
                ← Previous Lesson
              </button>
            ) : <div />}

            {activeLessonIdx < module.lessons.length - 1 ? (
              <button
                className="btn text-xs"
                onClick={() => setActiveLessonIdx((i) => i + 1)}
              >
                Next Lesson ➔
              </button>
            ) : (
              <button
                className="btn text-xs"
                onClick={() => setCurrentStep('exercise')}
              >
                Proceed to Scenario Exercise ➔
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: INTERACTIVE SCENARIO EXERCISE */}
      {currentStep === 'exercise' && (
        <div className="space-y-6">
          <div className="big-card p-6 sm:p-8">
            <div className="tag mb-2">PRACTICAL TACTICAL EXERCISE</div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
              {module.interactiveExercise.title}
            </h2>

            {/* Context */}
            <div className="scenario my-4 bg-slate-950/90 border border-slate-800 p-5 rounded-xl">
              <div className="text-xs font-bold text-rose-400 tracking-wider mb-2 flex items-center gap-1.5">
                <span>🚨</span> INCIDENT CONTEXT
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {module.interactiveExercise.context}
              </p>
            </div>

            {/* Prompt */}
            <div className="text-base font-bold text-white my-4">
              {module.interactiveExercise.prompt}
            </div>

            {/* Options */}
            <div className="space-y-2.5 my-5">
              {(() => {
                const isCorrectDeclared =
                  exerciseEvaluated &&
                  selectedExerciseOption !== null &&
                  Boolean(module.interactiveExercise.options[selectedExerciseOption]?.isCorrect);

                return module.interactiveExercise.options.map((opt, idx) => {
                  const isSelected = selectedExerciseOption === idx;
                  return (
                    <label
                      key={idx}
                      className={`quiz-option transition-all ${
                        isSelected ? 'selected' : ''
                      } ${
                        isCorrectDeclared && isSelected
                          ? 'border-emerald-500/80 bg-emerald-950/40 text-emerald-200'
                          : isCorrectDeclared
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer'
                      }`}
                      onClick={() => {
                        // Once result is declared and is correct, do not allow to change the option
                        if (!isCorrectDeclared) {
                          setSelectedExerciseOption(idx);
                          // Do not show result while choosing or changing options
                          setExerciseEvaluated(false);
                        }
                      }}
                    >
                      <input
                        type="radio"
                        name="exercise-choice"
                        checked={isSelected}
                        disabled={isCorrectDeclared}
                        onChange={() => {
                          if (!isCorrectDeclared) {
                            setSelectedExerciseOption(idx);
                            setExerciseEvaluated(false);
                          }
                        }}
                      />
                      <span className="text-sm font-medium">{opt.text}</span>
                      {isCorrectDeclared && isSelected && (
                        <span className="ml-auto text-xs font-bold text-emerald-400">✓ Verified Correct</span>
                      )}
                    </label>
                  );
                });
              })()}
            </div>

            {/* Evaluated Feedback - only shown after clicking Submit at end of exercise */}
            {exerciseEvaluated && selectedExerciseOption !== null && (
              <div
                className={`feedback my-4 p-4 rounded-xl border leading-relaxed text-sm ${
                  module.interactiveExercise.options[selectedExerciseOption]?.isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
                style={{ display: 'block' }}
              >
                <div className="font-bold text-xs uppercase mb-1">
                  {module.interactiveExercise.options[selectedExerciseOption]?.isCorrect
                    ? '🛡️ Correct Tactical Decision'
                    : '⚠️ Sub-Optimal Defensive Response'}
                </div>
                {module.interactiveExercise.options[selectedExerciseOption]?.feedback}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <button className="btn secondary text-xs" onClick={() => setCurrentStep('lessons')}>
              ← Back to Lessons
            </button>
            {!exerciseEvaluated ? (
              <button
                className="btn text-xs"
                disabled={selectedExerciseOption === null}
                onClick={() => setExerciseEvaluated(true)}
              >
                SUBMIT EXERCISE
              </button>
            ) : selectedExerciseOption !== null && module.interactiveExercise.options[selectedExerciseOption]?.isCorrect ? (
              <button
                className="btn text-xs"
                onClick={() => setCurrentStep('quiz')}
              >
                Proceed to Checkpoint Quiz ➔
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  className="btn secondary text-xs"
                  onClick={() => setExerciseEvaluated(false)}
                  title="Try another option"
                >
                  ↺ Try Another Option
                </button>
                <button
                  className="btn text-xs"
                  onClick={() => setCurrentStep('quiz')}
                >
                  Proceed to Checkpoint Quiz ➔
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: CHECKPOINT QUIZ */}
      {currentStep === 'quiz' && (
        <div className="space-y-6">
          <div className="big-card p-6 sm:p-8">
            <div className="flex items-center justify-between mb-3">
              <div className="tag">MASTERY CHECKPOINT</div>
              <span className="text-xs font-mono text-cyan-400">
                PASS THRESHOLD: {module.masteryThreshold}%
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Prove Your Understanding
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Answer the checkpoint questions below. Passing validates your conceptual mastery and elevates your domain score.
            </p>

            <div className="space-y-6">
              {module.checkpointQuiz.map((q, qIndex) => (
                <div key={q.id} className="p-5 rounded-xl bg-slate-900/50 border border-slate-800">
                  <div className="text-xs font-mono text-slate-400 mb-2">
                    QUESTION {qIndex + 1} OF {module.checkpointQuiz.length}
                  </div>
                  <div className="text-base font-bold text-white mb-4">
                    {q.question}
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = quizAnswers[q.id] === optIdx;
                      return (
                        <label
                          key={optIdx}
                          className={`quiz-option transition-all ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectQuizOption(q.id, optIdx)}
                        >
                          <input
                            type="radio"
                            name={`quiz-${q.id}`}
                            checked={isSelected}
                            disabled={quizSubmitted}
                            onChange={() => handleSelectQuizOption(q.id, optIdx)}
                          />
                          <span className="text-sm">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button className="btn secondary text-xs" onClick={() => setCurrentStep('exercise')}>
              ← Back to Exercise
            </button>
            <button
              className="btn text-xs px-6 py-3"
              disabled={isSubmitting}
              onClick={handleCompleteQuiz}
            >
              {isSubmitting ? 'Evaluating...' : 'COMPLETE CHECKPOINT ➔'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: RESULT / MASTERY FEEDBACK */}
      {currentStep === 'result' && evalResult && (
        <div className="space-y-6">
          <div className="result p-8 sm:p-12 text-center">
            <div className="text-5xl mb-3">
              {evalResult.mastered ? '🎉' : '📚'}
            </div>
            <div className="tag mb-2">CHECKPOINT RESULTS</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
              {evalResult.mastered ? 'MODULE MASTERED!' : 'CHECKPOINT INCOMPLETE'}
            </h2>
            <div className="text-5xl font-black text-cyan-400 font-mono my-4">
              {evalResult.compositeScore}%
            </div>
            <p className="text-sm text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
              {evalResult.feedback}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {evalResult.mastered ? (
                <button className="btn" onClick={onBackToRoadmap}>
                  VIEW UPDATED LEARNING PATH ➔
                </button>
              ) : (
                <>
                  <button
                    className="btn"
                    onClick={() => {
                      setQuizSubmitted(false);
                      setCurrentStep('quiz');
                    }}
                  >
                    RETRY CHECKPOINT ↺
                  </button>
                  <button
                    className="btn secondary"
                    onClick={() => setCurrentStep('lessons')}
                  >
                    REVIEW LESSONS
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
