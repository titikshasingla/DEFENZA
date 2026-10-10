import React, { useState } from 'react';

export interface UserRegistrationProfile {
  name: string;
  age: number;
  gender: string;
  registeredAt: number;
}

interface RegistrationPortalProps {
  onComplete: (profile: UserRegistrationProfile) => void;
  onBack?: () => void;
}

export const RegistrationPortal: React.FC<RegistrationPortalProps> = ({
  onComplete,
  onBack,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<string>('');

  const [touched, setTouched] = useState<{
    name?: boolean;
    age?: boolean;
    gender?: boolean;
  }>({});

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Validation logic
  const validateName = (val: string): string | null => {
    const trimmed = val.trim();
    if (!trimmed) return 'Name is required';
    if (trimmed.length < 2) return 'Name must be at least 2 characters';
    if (trimmed.length > 50) return 'Name must be under 50 characters';
    return null;
  };

  const validateAge = (val: string): string | null => {
    if (!val || val.trim() === '') return 'Age is required';
    const num = Number(val);
    if (!Number.isInteger(num)) return 'Please enter a valid whole number';
    if (num < 10 || num > 100) return 'Please enter a sensible age between 10 and 100';
    return null;
  };

  const validateGender = (val: string): string | null => {
    if (!val) return 'Please select your gender';
    return null;
  };

  const nameError = validateName(name);
  const ageError = validateAge(age);
  const genderError = validateGender(gender);

  const showNameError = (touched.name || attemptedSubmit) && nameError;
  const showAgeError = (touched.age || attemptedSubmit) && ageError;
  const showGenderError = (touched.gender || attemptedSubmit) && genderError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    if (nameError || ageError || genderError) {
      return;
    }

    const profile: UserRegistrationProfile = {
      name: name.trim(),
      age: parseInt(age, 10),
      gender,
      registeredAt: Date.now(),
    };

    onComplete(profile);
  };

  const GENDER_OPTIONS = [
    { id: 'Male', label: 'Male', icon: '👨' },
    { id: 'Female', label: 'Female', icon: '👩' },
    { id: 'Other', label: 'Other', icon: '🧑' },
    { id: 'Prefer not to say', label: 'Prefer not to say', icon: '🔒' },
  ];

  return (
    <div className="registration-portal min-h-[85vh] flex items-center justify-center px-4 py-8 animate-fade">
      <div className="w-full max-w-xl p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-[#111722]/95 to-[#0b1019]/95 border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.5)] backdrop-blur-md">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]"></span>
            <span className="text-xs font-black tracking-widest text-cyan-400 uppercase">
              OPERATOR ENROLLMENT
            </span>
          </div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              ← Back to Overview
            </button>
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
          Create Your <span className="gradient">Defender Profile</span>
        </h2>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          Set up your operator credentials to begin your cybersecurity training and track your defense competencies.
        </p>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Field 1: Name */}
          <div>
            <label
              htmlFor="reg-name"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2"
            >
              Name or Codename <span className="text-pink-400">*</span>
            </label>
            <div className="relative">
              <input
                id="reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                placeholder="e.g. Alex Hunter"
                autoComplete="name"
                className={`w-full px-4 py-3.5 rounded-xl bg-slate-900/80 border text-white text-sm placeholder-slate-500 focus:outline-none transition-all ${
                  showNameError
                    ? 'border-red-500/80 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
                    : 'border-slate-800 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                }`}
              />
              <span className="absolute right-3.5 top-3.5 text-slate-500 text-sm">👤</span>
            </div>
            {showNameError && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-medium animate-fade">
                <span>⚠️</span> {showNameError}
              </p>
            )}
          </div>

          {/* Field 2: Age */}
          <div>
            <label
              htmlFor="reg-age"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2"
            >
              Age <span className="text-pink-400">*</span>
            </label>
            <div className="relative">
              <input
                id="reg-age"
                type="number"
                min="10"
                max="100"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, age: true }))}
                placeholder="e.g. 24"
                className={`w-full px-4 py-3.5 rounded-xl bg-slate-900/80 border text-white text-sm placeholder-slate-500 focus:outline-none transition-all ${
                  showAgeError
                    ? 'border-red-500/80 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
                    : 'border-slate-800 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                }`}
              />
              <span className="absolute right-3.5 top-3.5 text-slate-500 text-sm">🎂</span>
            </div>
            {showAgeError && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-medium animate-fade">
                <span>⚠️</span> {showAgeError}
              </p>
            )}
            <p className="mt-1 text-[11px] text-slate-500">
              Sensible range: 10 to 100 years. Used to tailor educational pacing.
            </p>
          </div>

          {/* Field 3: Gender */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Gender <span className="text-pink-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {GENDER_OPTIONS.map((opt) => {
                const isSelected = gender === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setGender(opt.id);
                      setTouched((prev) => ({ ...prev, gender: true }));
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/90'
                    }`}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    <span className="text-xs font-bold leading-tight">{opt.label}</span>
                  </button>
                );
              })}
            </div>
            {showGenderError && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-medium animate-fade">
                <span>⚠️</span> {showGenderError}
              </p>
            )}
          </div>

          {/* Submit button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider text-white cursor-pointer transition-all duration-200 shadow-[0_8px_30px_rgba(6,182,212,0.3)] hover:shadow-[0_12px_40px_rgba(168,85,247,0.4)] hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: 'linear-gradient(90deg, #0891b2, #7c3aed, #ec4899)',
              }}
            >
              CONTINUE ➔
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-3">
              🔒 Stored securely in your local profile. You will not be asked for these details again.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
