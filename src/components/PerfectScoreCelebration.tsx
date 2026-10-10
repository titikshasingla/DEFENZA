import React, { useEffect, useRef, useState, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'shard' | 'spark' | 'hex' | 'binary';
  text?: string;
  gravity: number;
  friction: number;
  wobble: number;
  wobbleSpeed: number;
}

const CYBER_PALETTE = [
  '#22d3ee', // Cyan
  '#38bdf8', // Sky
  '#a855f7', // Purple
  '#c084fc', // Lilac
  '#22c55e', // Emerald
  '#4ade80', // Mint
  '#facc15', // Gold
  '#fbbf24', // Amber
  '#f43f5e', // Rose
  '#ffffff', // Core White
];

export interface PerfectScoreCelebrationProps {
  onDismiss?: () => void;
}

export const PerfectScoreCelebration: React.FC<PerfectScoreCelebrationProps> = ({ onDismiss }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const isRunningRef = useRef<boolean>(true);
  const [, setBurstCount] = useState<number>(1);

  // Spawn a cluster of celebration particles
  const spawnBurst = useCallback(
    (originX: number, originY: number, count = 70, spread = Math.PI * 2, baseAngle = 0, speedMult = 1) => {
      const newParticles: Particle[] = [];
      const shapes: Particle['shape'][] = ['shard', 'spark', 'hex', 'binary'];

      for (let i = 0; i < count; i++) {
        const color = CYBER_PALETTE[Math.floor(Math.random() * CYBER_PALETTE.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const angle = baseAngle + (Math.random() - 0.5) * spread;
        const speed = (Math.random() * 9 + 4) * speedMult;

        newParticles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: shape === 'spark' ? Math.random() * 3 + 2 : Math.random() * 6 + 4,
          color,
          alpha: 1,
          decay: Math.random() * 0.008 + 0.006, // lasts 2-3 seconds
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.12,
          shape,
          text: Math.random() > 0.5 ? '1' : '0',
          gravity: 0.16 + Math.random() * 0.08,
          friction: 0.982,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 0.08 + 0.04,
        });
      }

      particlesRef.current.push(...newParticles);
    },
    []
  );

  // Trigger celebration sequence
  const launchSequence = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Center big burst
    spawnBurst(width / 2, height * 0.42, 110, Math.PI * 2, 0, 1.2);

    // Left cannon angled upward
    setTimeout(() => {
      if (!isRunningRef.current) return;
      spawnBurst(width * 0.15, height * 0.75, 65, Math.PI * 0.45, -Math.PI / 3, 1.4);
    }, 240);

    // Right cannon angled upward
    setTimeout(() => {
      if (!isRunningRef.current) return;
      spawnBurst(width * 0.85, height * 0.75, 65, Math.PI * 0.45, (-2 * Math.PI) / 3, 1.4);
    }, 480);

    // Center sky fountain
    setTimeout(() => {
      if (!isRunningRef.current) return;
      spawnBurst(width / 2, height * 0.35, 75, Math.PI * 1.8, -Math.PI / 2, 1.1);
    }, 800);
  }, [spawnBurst]);

  // Main canvas animation loop
  useEffect(() => {
    isRunningRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Trigger initial celebration
    launchSequence();

    // Render loop
    const render = () => {
      if (!isRunningRef.current) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Apply physics
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * 0.6;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y > height + 50) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.alpha);

        if (p.shape === 'spark') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
        } else if (p.shape === 'shard') {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        } else if (p.shape === 'hex') {
          ctx.beginPath();
          const r = p.size;
          for (let s = 0; s < 6; s++) {
            const a = (Math.PI / 3) * s;
            const hx = r * Math.cos(a);
            const hy = r * Math.sin(a);
            if (s === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.8;
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
          ctx.stroke();
        } else if (p.shape === 'binary' && p.text) {
          ctx.font = `bold ${Math.round(p.size * 2)}px monospace`;
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
          ctx.fillText(p.text, -p.size / 2, p.size / 2);
        }

        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunningRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [launchSequence]);

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBurstCount((prev) => prev + 1);
    launchSequence();
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 998,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '78px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(8, 14, 26, 0.95))',
          border: '1px solid rgba(250, 204, 21, 0.65)',
          borderRadius: '999px',
          padding: '8px 20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 25px rgba(250, 204, 21, 0.35)',
          backdropFilter: 'blur(10px)',
          animation: 'slideDownFade 0.4s ease-out',
        }}
      >
        <span style={{ fontSize: '18px' }}>🏆</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: '12.5px',
              fontWeight: 900,
              letterSpacing: '1.2px',
              color: '#fef08a',
              textTransform: 'uppercase',
            }}
          >
            PERFECT ASSESSMENT 10/10
          </span>
          <span style={{ fontSize: '11px', color: '#93c5fd' }}>
            MAXIMUM CYBER DEFENSE COMMANDER RANK
          </span>
        </div>
        <button
          onClick={handleReplay}
          style={{
            background: 'rgba(250, 204, 21, 0.15)',
            border: '1px solid rgba(250, 204, 21, 0.45)',
            color: '#fef08a',
            fontSize: '11px',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: '999px',
            cursor: 'pointer',
            marginLeft: '6px',
            transition: 'all 0.2s',
          }}
          title="Launch another celebratory burst"
        >
          ✨ Fire Again
        </button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '2px 4px',
            }}
            title="Dismiss overlay banner"
          >
            ✕
          </button>
        )}
      </div>
    </>
  );
};
