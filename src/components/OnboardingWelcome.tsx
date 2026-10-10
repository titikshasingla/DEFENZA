import React from 'react';
import { DOMAIN_METADATA } from '../types/adaptive.ts';

interface OnboardingWelcomeProps {
  onStartDiagnostic: () => void;
  hasExistingProfile?: boolean;
  onViewExistingProfile?: () => void;
}

export const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({
  onStartDiagnostic,
  hasExistingProfile,
  onViewExistingProfile,
}) => {
  const domains = Object.values(DOMAIN_METADATA);

  return (
    <div className="onboarding-welcome py-6 animate-fade">
      <div className="start-card max-w-4xl mx-auto p-8 sm:p-12 text-center">
        {/* Status Tag */}
        <div className="status mb-6">
          <span className="dot"></span>
          DEFENZA ADAPTIVE INTELLIGENCE
        </div>

        {/* Shield Icon */}
        <div className="shield text-6xl my-6">🛡️</div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 leading-tight">
          Every defender starts somewhere. <br className="hidden sm:inline" />
          <span className="gradient">Let's discover your cybersecurity skills.</span>
        </h1>

        {/* Subtitle */}
        <p className="subtitle text-base sm:text-lg max-w-2xl mx-auto mb-8 text-slate-300">
          Take a short diagnostic assessment so DEFENZA can build a learning path designed specifically for you.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <button
            className="btn text-base px-8 py-4 font-black shadow-lg"
            onClick={onStartDiagnostic}
          >
            DISCOVER MY LEVEL ➔
          </button>
          {hasExistingProfile && onViewExistingProfile && (
            <button
              className="btn secondary text-base px-6 py-4"
              onClick={onViewExistingProfile}
            >
              📊 VIEW SAVED PROFILE
            </button>
          )}
        </div>

        {/* 8 Domains Grid Overview */}
        <div className="border-t border-slate-800/80 pt-8 mt-8 text-left">
          <div className="text-xs font-bold tracking-widest text-cyan-400 uppercase mb-4 text-center">
            DIAGNOSTIC DOMAINS EVALUATED
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {domains.map((dom) => (
              <div
                key={dom.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{dom.icon}</span>
                  <span className="text-xs font-bold text-slate-200 truncate">{dom.name}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {dom.shortDesc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-8">
          🔒 Private & Adaptive: Diagnostic answers calibrate difficulty in real time. Assessment runs independently from the timed Threat Assessment game.
        </p>
      </div>
    </div>
  );
};
