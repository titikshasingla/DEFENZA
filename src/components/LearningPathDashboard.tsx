import React from 'react';
import { DOMAIN_METADATA, KnowledgeProfile, LearningCurriculum, StudyModule } from '../types/adaptive.ts';

interface LearningPathDashboardProps {
  profile: KnowledgeProfile;
  curriculum: LearningCurriculum;
  onSelectModule: (module: StudyModule) => void;
  onGoToHome: () => void;
  onRetakeDiagnostic: () => void;
  onResetLearningData: () => void;
}

export const LearningPathDashboard: React.FC<LearningPathDashboardProps> = ({
  profile,
  curriculum,
  onSelectModule,
  onGoToHome,
  onRetakeDiagnostic,
  onResetLearningData,
}) => {
  const masteredCount = curriculum.modules.filter((m) => m.status === 'mastered').length;
  const totalModules = curriculum.modules.length;
  const progressPercent = totalModules > 0 ? Math.round((masteredCount / totalModules) * 100) : 0;

  // Find next module to study
  const nextModule = curriculum.modules.find(
    (m) => m.status === 'available' || m.status === 'in_progress'
  );

  return (
    <div className="learning-path-dashboard max-w-4xl mx-auto py-6 animate-fade">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="tag">DEFENZA ADAPTIVE ROADMAP</div>
          <h1 className="page-title text-2xl sm:text-4xl font-black mt-1">
            MY LEARNING PATH
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn secondary text-xs px-3.5 py-2"
            onClick={onGoToHome}
          >
            ← Back to Mission Hub
          </button>
        </div>
      </div>

      <p className="page-desc text-sm text-slate-300 leading-relaxed mb-6">
        Curriculum tailored to your diagnostic baseline ({profile.overallProficiency} Tier). Complete each lesson, interactive scenario, and checkpoint quiz to demonstrate mastery.
      </p>

      {/* Progress & Overview Card */}
      <div className="big-card p-6 mb-8 border border-slate-800 bg-slate-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              CURRICULUM COMPLETION
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono tabular-nums">
              {masteredCount} OF {totalModules} MODULES MASTERED ({progressPercent}%)
            </div>
            <p className="text-xs text-slate-400">
              Proficiency: <span className="font-bold text-white">{profile.overallProficiency}</span> • Progression requires proven checkpoint mastery.
            </p>
          </div>
          {nextModule && (
            <div className="shrink-0">
              <button
                className="btn text-xs sm:text-sm px-5 py-3 shadow-md"
                onClick={() => onSelectModule(nextModule)}
              >
                RESUME: {nextModule.title} ➔
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden mt-5 border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Modules Roadmap Sequence */}
      <div className="space-y-4 mb-8">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🎯</span> RECOMMENDED MODULE SEQUENCE
        </h2>

        {curriculum.modules.map((mod, idx) => {
          const domainMeta = DOMAIN_METADATA[mod.domainId];
          const isLocked = mod.status === 'locked';
          const isMastered = mod.status === 'mastered';

          return (
            <div
              key={mod.id}
              className={`p-5 rounded-2xl border transition-all ${
                isMastered
                  ? 'bg-slate-900/40 border-emerald-500/40'
                  : isLocked
                  ? 'bg-slate-950/40 border-slate-900 opacity-60'
                  : 'bg-slate-900/90 border-cyan-500/50 shadow-lg'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      STEP {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="text-[11px] font-black px-2 py-0.5 rounded tracking-wider"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        color: domainMeta?.color || 'var(--cyan)',
                      }}
                    >
                      {mod.badge}
                    </span>
                    {isMastered && (
                      <span className="text-[11px] bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold px-2 py-0.5 rounded">
                        ✓ MASTERED
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{domainMeta?.icon}</span>
                    <span>{mod.title}</span>
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {mod.whyRelevant}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400">
                    <span>{mod.lessons.length} Lesson{mod.lessons.length > 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>1 Tactical Exercise</span>
                    <span>•</span>
                    <span>Checkpoint Quiz ({mod.masteryThreshold}% Pass)</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {isLocked ? (
                    <span className="text-xs text-slate-500 font-mono px-3 py-1.5 rounded border border-slate-800 bg-slate-950">
                      🔒 Complete Step {idx} First
                    </span>
                  ) : (
                    <button
                      className={`btn text-xs px-4 py-2.5 ${
                        isMastered ? 'secondary' : ''
                      }`}
                      onClick={() => onSelectModule(mod)}
                    >
                      {isMastered ? 'REVIEW MODULE ➔' : 'START MODULE ➔'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Controls & Data Reset */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-800 text-xs text-slate-400">
        <button
          className="hover:text-white transition-colors"
          onClick={onRetakeDiagnostic}
        >
          ↺ Retake Diagnostic Assessment
        </button>
        <button
          className="text-rose-400 hover:text-rose-300 transition-colors"
          onClick={() => {
            if (window.confirm('Are you sure you want to reset your adaptive learning profile and curriculum progress?')) {
              onResetLearningData();
            }
          }}
        >
          Reset Learning Profile
        </button>
      </div>
    </div>
  );
};
