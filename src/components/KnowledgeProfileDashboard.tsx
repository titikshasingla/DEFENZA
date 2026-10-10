import React, { useState } from 'react';
import { DOMAIN_METADATA, KnowledgeProfile, LearningCurriculum } from '../types/adaptive.ts';

interface KnowledgeProfileDashboardProps {
  profile: KnowledgeProfile;
  onCurriculumReady: (curriculum: LearningCurriculum) => void;
  onRetakeDiagnostic: () => void;
}

export const KnowledgeProfileDashboard: React.FC<KnowledgeProfileDashboardProps> = ({
  profile,
  onCurriculumReady,
  onRetakeDiagnostic,
}) => {
  const [isGeneratingCurriculum, setIsGeneratingCurriculum] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerateCurriculum = async () => {
    setIsGeneratingCurriculum(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/adaptive/generate-curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.curriculum) {
        throw new Error(data.error || 'Failed to construct customized curriculum.');
      }
      onCurriculumReady(data.curriculum);
    } catch (err: any) {
      console.error('Curriculum error:', err);
      setErrorMsg(err.message || 'Error generating curriculum.');
    } finally {
      setIsGeneratingCurriculum(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Advanced':
        return '#4ade80'; // emerald
      case 'Intermediate':
        return '#22d3ee'; // cyan
      case 'Developing':
        return '#facc15'; // yellow/amber
      default:
        return '#fb7185'; // rose
    }
  };

  const domainsList = Object.values(profile.domains);

  return (
    <div className="profile-dashboard max-w-4xl mx-auto py-6 animate-fade">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between mb-4">
        <div className="tag">DEFENZA INTELLIGENCE // DIAGNOSTIC RESULTS</div>
        <div className="text-xs text-slate-400 font-mono">
          EVALUATED {new Date(profile.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Main Title */}
      <h1 className="page-title text-3xl sm:text-5xl font-black mb-3">
        YOUR CYBERSECURITY PROFILE
      </h1>
      <p className="page-desc text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
        {profile.overallSummary}
      </p>

      {/* Overall Tier Spotlight Card */}
      <div className="big-card p-6 sm:p-8 mb-8 border border-slate-700/80 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              ESTIMATED OPERATIONAL PROFICIENCY
            </div>
            <div
              className="text-3xl sm:text-4xl font-black tracking-tight"
              style={{ color: getTierColor(profile.overallProficiency) }}
            >
              {profile.overallProficiency.toUpperCase()} DEFENDER
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Based on {profile.totalDiagnosticAnswered} calibrated tactical decision scenarios
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-start sm:items-end gap-2">
            <button
              className="btn text-sm px-6 py-3.5 shadow-lg"
              disabled={isGeneratingCurriculum}
              onClick={handleGenerateCurriculum}
            >
              {isGeneratingCurriculum ? 'BUILDING MODULES...' : 'GENERATE MY LEARNING PATH ➔'}
            </button>
            {errorMsg && (
              <span className="text-xs text-rose-400 mt-1">{errorMsg}</span>
            )}
          </div>
        </div>
      </div>

      {/* Highlights & Top Improvements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Strongest Areas */}
        <div className="card p-5">
          <div className="text-xs font-bold text-emerald-400 tracking-wider mb-2 flex items-center gap-1.5">
            <span>🛡️</span> STRONGEST CAPABILITIES
          </div>
          <ul className="space-y-1.5 text-xs text-slate-200">
            {profile.strongestAreas.map((area, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Priority Improvement */}
        <div className="card p-5">
          <div className="text-xs font-bold text-amber-400 tracking-wider mb-2 flex items-center gap-1.5">
            <span>⚠️</span> TOP CONCEPTS TO HARDEN
          </div>
          <ul className="space-y-1.5 text-xs text-slate-200">
            {profile.topImprovementConcepts.map((concept, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-amber-400">⚡</span>
                <span>{concept}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Starting Point */}
        <div className="card p-5">
          <div className="text-xs font-bold text-cyan-400 tracking-wider mb-2 flex items-center gap-1.5">
            <span>🎯</span> RECOMMENDED STARTING POINT
          </div>
          <p className="text-xs text-slate-200 font-semibold mb-2">
            {profile.recommendedStartingPoint}
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Eliminating this foundational gap provides the fastest multiplier for defensive reasoning across all domains.
          </p>
        </div>
      </div>

      {/* Visual Domain Knowledge Map */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🗺️</span> DOMAIN READINESS KNOWLEDGE MAP
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {domainsList.map((d) => {
            const meta = DOMAIN_METADATA[d.domainId];
            return (
              <div
                key={d.domainId}
                className="card p-5 border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{meta?.icon}</span>
                    <span className="text-sm font-bold text-white truncate">{d.domainName}</span>
                  </div>
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      color: getTierColor(d.proficiency),
                      border: `1px solid ${getTierColor(d.proficiency)}40`,
                    }}
                  >
                    {d.proficiency}
                  </span>
                </div>

                {/* Score bar */}
                <div className="space-y-1 my-3">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Mastery Level</span>
                    <span className="text-slate-200 font-bold">{d.masteryScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${d.masteryScore}%`,
                        backgroundColor: meta?.color || 'var(--cyan)',
                      }}
                    />
                  </div>
                </div>

                {/* Concepts demonstrated / gaps */}
                <div className="text-[11px] text-slate-300 space-y-1 border-t border-slate-800/60 pt-2.5 mt-2">
                  {d.conceptsDemonstrated?.[0] && (
                    <div className="text-slate-300 line-clamp-1">
                      <span className="text-emerald-400 font-bold">Strong:</span> {d.conceptsDemonstrated[0]}
                    </div>
                  )}
                  {d.misconceptionsOrGaps?.[0] && (
                    <div className="text-slate-400 line-clamp-1">
                      <span className="text-amber-400 font-bold">Gap:</span> {d.misconceptionsOrGaps[0]}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-800">
        <button className="text-xs text-slate-400 hover:text-white" onClick={onRetakeDiagnostic}>
          ↺ Retake Diagnostic Assessment
        </button>
        <div className="flex gap-3">
          <button
            className="btn text-xs px-5 py-2.5"
            disabled={isGeneratingCurriculum}
            onClick={handleGenerateCurriculum}
          >
            {isGeneratingCurriculum ? 'Building Modules...' : 'Generate My Learning Path ➔'}
          </button>
        </div>
      </div>
    </div>
  );
};
