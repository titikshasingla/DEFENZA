import React from 'react';

interface LandingHeroProps {
  onGetStarted: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onGetStarted }) => {
  return (
    <div className="landing-hero min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-12 relative animate-fade">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden -z-10">
        <div className="w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
        <div className="w-[450px] h-[450px] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none -ml-40 mt-20" />
      </div>

      <div className="max-w-3xl mx-auto flex flex-col items-center">
        {/* Security Status Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-black tracking-widest uppercase mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]"></span>
          DEFENSIVE CYBERSECURITY SIMULATION
        </div>

        {/* Big centered Shield & Lock Logo (SVG) */}
        <div className="relative mb-6 group cursor-default">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-cyan-500/20 via-purple-600/20 to-pink-500/10 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.2)] backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
            <svg
              className="w-16 h-16 sm:w-20 sm:h-20 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Outer Shield */}
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              {/* Inner Lock */}
              <rect x="9" y="11" width="6" height="5" rx="1" fill="currentColor" fillOpacity="0.25" stroke="currentColor" />
              <path d="M10 11V9a2 2 0 1 1 4 0v2" />
              <circle cx="12" cy="13.5" r="0.75" fill="currentColor" />
            </svg>
          </div>
          {/* Subtle glow ring */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500/30 to-purple-600/30 blur-md -z-10 opacity-70 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Large Centered DEFENZA Logo */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-4 leading-none">
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-sm">
            DEFENZA
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-200 tracking-tight max-w-xl mb-4">
          Learn cybersecurity. Defend like a pro.
        </p>

        {/* Supporting description */}
        <p className="text-sm sm:text-base text-slate-400 max-w-lg mb-10 leading-relaxed">
          Master real-world threat analysis, incident response, and web defense through adaptive missions and tactical simulations.
        </p>

        {/* Call to action "Get Started" button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-base text-white tracking-wide cursor-pointer transition-all duration-200 shadow-[0_10px_35px_rgba(168,85,247,0.35)] hover:shadow-[0_15px_45px_rgba(34,211,238,0.45)] hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899)',
            }}
          >
            GET STARTED ➔
          </button>
        </div>

        {/* Features highlight pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-16 max-w-2xl w-full text-left">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="text-cyan-400 text-lg mb-1">🛡️</div>
            <div className="text-xs font-bold text-slate-200">Real Incident Scenarios</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Explore authentic attack vectors and defensive mitigations.</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="text-purple-400 text-lg mb-1">🧠</div>
            <div className="text-xs font-bold text-slate-200">Adaptive Profiling</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Custom learning pathways calibrated to your skill level.</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="text-emerald-400 text-lg mb-1">⚡</div>
            <div className="text-xs font-bold text-slate-200">Timed Threat Drills</div>
            <div className="text-[11px] text-slate-400 mt-0.5">High-speed tactical evaluations and score milestones.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
