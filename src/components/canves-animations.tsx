import React, { useState, useEffect } from 'react';
import './canves-animations.css';

// Types
type ThemeMode = 'light' | 'dark';
type AnimationType = 'loading' | 'thinking' | 'pulse' | 'shimmer' | 'wave' | 'orbit' | 'morph' | 'flow';

interface AnimationProps {
  type: AnimationType;
  theme?: ThemeMode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  speed?: 'slow' | 'normal' | 'fast';
}

interface LoadingSpinnerProps extends Omit<AnimationProps, 'type'> {
  message?: string;
}

interface ThinkingIndicatorProps extends Omit<AnimationProps, 'type'> {
  message?: string;
  dots?: number;
}

// Hook for theme detection
const useTheme = (forcedTheme?: ThemeMode): ThemeMode => {
  const [theme, setTheme] = useState<ThemeMode>(forcedTheme || 'light');

  useEffect(() => {
    if (forcedTheme) {
      setTheme(forcedTheme);
      return;
    }

    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');

    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [forcedTheme]);

  return theme;
};

// Utility function to get color based on theme
const getThemeColor = (theme: ThemeMode): { primary: string; secondary: string; accent: string } => {
  return theme === 'dark'
    ? {
      primary: '#e0e7ff', // indigo-100
      secondary: '#818cf8', // indigo-500
      accent: '#6366f1', // indigo-600
    }
    : {
      primary: '#4f46e5', // indigo-600
      secondary: '#818cf8', // indigo-500
      accent: '#c7d2fe', // indigo-200
    };
};

// ============================================================================
// LOADING SPINNER - Fluid rotating element
// ============================================================================
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading',
  theme: forcedTheme,
  className = '',
  size = 'md',
  speed = 'normal',
}) => {
  const theme = useTheme(forcedTheme);
  const colors = getThemeColor(theme);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const speedClasses = {
    slow: 'animate-spin-slow',
    normal: 'animate-spin',
    fast: 'animate-spin-fast',
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div
        className={`${sizeClasses[size]} ${speedClasses[speed]} relative`}
        style={{
          background: `conic-gradient(from 0deg, ${colors.secondary}, ${colors.primary}, ${colors.secondary})`,
          borderRadius: '50%',
          filter: 'blur(1px)',
        }}
      >
        <div
          className="absolute inset-2 rounded-full"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          }}
        />
      </div>
      {message && (
        <p
          className="text-sm font-medium"
          style={{
            color: theme === 'dark' ? '#e0e7ff' : '#4f46e5',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// THINKING INDICATOR - Animated dots with wave effect
// ============================================================================
export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
  message = 'Claude is thinking',
  theme: forcedTheme,
  className = '',
  size = 'md',
  speed = 'normal',
  dots = 3,
}) => {
  const theme = useTheme(forcedTheme);
  const colors = getThemeColor(theme);

  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5',
    lg: 'w-4 h-4',
  }[size];

  const speedDuration = {
    slow: '2s',
    normal: '1.4s',
    fast: '0.8s',
  }[speed];

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="flex gap-1.5 items-center">
        {Array.from({ length: dots }).map((_, i) => (
          <div
            key={i}
            className={`${dotSize} rounded-full`}
            style={{
              backgroundColor: colors.secondary,
              animation: `thinking-bounce ${speedDuration} infinite ease-in-out`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
      {message && (
        <p
          className="text-sm font-medium"
          style={{
            color: theme === 'dark' ? '#d1d5db' : '#6b7280',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// SHIMMER EFFECT - Elegant loading skeleton animation
// ============================================================================
export const ShimmerEffect: React.FC<{ theme?: ThemeMode; className?: string }> = ({
  theme: forcedTheme,
  className = '',
}) => {
  const theme = useTheme(forcedTheme);

  return (
    <div
      className={`animate-shimmer rounded-lg ${className}`}
      style={{
        background:
          theme === 'dark'
            ? 'linear-gradient(90deg, #374151 0%, #4b5563 50%, #374151 100%)'
            : 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s infinite',
      }}
    />
  );
};

// ============================================================================
// PULSE EFFECT - Subtle breathing animation
// ============================================================================
export const PulseEffect: React.FC<{ theme?: ThemeMode; children: React.ReactNode }> = ({
  theme: forcedTheme,
  children,
}) => {
  const theme = useTheme(forcedTheme);

  return (
    <div className="animate-pulse" style={{ '--pulse-color': getThemeColor(theme).secondary } as React.CSSProperties}>
      {children}
    </div>
  );
};

// ============================================================================
// WAVE EFFECT - Text reveal wave animation
// ============================================================================
export const WaveEffect: React.FC<{
  text: string;
  theme?: ThemeMode;
  className?: string;
}> = ({ text, className = '' }) => {

  return (
    <div className={`inline-flex ${className}`}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            animation: `wave 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
};

// ============================================================================
// ORBIT ANIMATION - Rotating elements in orbit
// ============================================================================
export const OrbitAnimation: React.FC<{
  children: React.ReactNode;
  theme?: ThemeMode;
  count?: number;
  speed?: 'slow' | 'normal' | 'fast';
}> = ({ children, theme: forcedTheme, count = 3, speed = 'normal' }) => {
  const theme = useTheme(forcedTheme);
  const colors = getThemeColor(theme);

  const speedDuration = {
    slow: '8s',
    normal: '6s',
    fast: '4s',
  }[speed];

  const angle = 360 / count;

  return (
    <div className="relative w-32 h-32 mx-auto">
      <div
        className="absolute inset-0"
        style={{
          animation: `orbit ${speedDuration} linear infinite`,
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              backgroundColor: colors.secondary,
              top: '0',
              left: '50%',
              transform: `translateX(-50%) rotate(${i * angle}deg) translateY(-60px)`,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
};

// ============================================================================
// MORPH ANIMATION - Shape-shifting blob effect
// ============================================================================
export const MorphAnimation: React.FC<{
  theme?: ThemeMode;
  size?: 'sm' | 'md' | 'lg';
}> = ({ theme: forcedTheme, size = 'md' }) => {
  const theme = useTheme(forcedTheme);
  const colors = getThemeColor(theme);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }[size];

  return (
    <div className={`flex items-center justify-center ${sizeClasses}`}>
      <style>{`
        @keyframes morph {
          0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }
      `}</style>
      <div
        className={sizeClasses}
        style={{
          background: `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})`,
          animation: 'morph 8s ease-in-out infinite',
          filter: 'blur(0.5px)',
        }}
      />
    </div>
  );
};

// ============================================================================
// FLOW ANIMATION - Flowing particles effect
// ============================================================================
export const FlowAnimation: React.FC<{
  theme?: ThemeMode;
  particleCount?: number;
  speed?: 'slow' | 'normal' | 'fast';
}> = ({ theme: forcedTheme, particleCount = 20, speed = 'normal' }) => {
  const theme = useTheme(forcedTheme);
  const colors = getThemeColor(theme);

  const speedDuration = {
    slow: '6s',
    normal: '4s',
    fast: '2s',
  }[speed];

  return (
    <div className="relative w-full h-32 overflow-hidden rounded-lg">
      <style>{`
        @keyframes flow {
          0% {
            transform: translateY(100%) translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-100%) translateX(50px);
            opacity: 0;
          }
        }
      `}</style>
      {Array.from({ length: particleCount }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            backgroundColor: colors.secondary,
            left: `${(i / particleCount) * 100}%`,
            animation: `flow ${speedDuration} linear infinite`,
            animationDelay: `${(i / particleCount) * parseFloat(speedDuration)}s`,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// ANIMATED BUTTON - Button with ripple effect
// ============================================================================
export const AnimatedButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  theme?: ThemeMode;
  variant?: 'primary' | 'secondary';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}> = ({ children, onClick, theme: forcedTheme, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const theme = useTheme(forcedTheme);
  const colors = getThemeColor(theme);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples([...ripples, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);

    onClick?.();
  };

  const bgColor = variant === 'primary' ? colors.primary : colors.secondary;
  const textColor = theme === 'dark' ? '#000' : '#fff';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={`relative overflow-hidden rounded-lg px-6 py-2 font-medium transition-all hover:scale-105 ${className}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '20px',
            height: '20px',
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)',
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.2)',
            animation: 'ripple 0.6s ease-out',
          }}
        />
      ))}
      {children}
    </button>
  );
};

// ============================================================================
// PARTICLE GLOBE - 3D rotating globe made of 1000+ interactive particles
// ============================================================================
export const ParticleGlobe: React.FC<{
  theme?: ThemeMode;
  particleCount?: number;
  size?: number;
  message?: string;
}> = ({ theme: forcedTheme, particleCount = 800, size = 300, message }) => {
  const theme = useTheme(forcedTheme);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const colors = getThemeColor(theme);

  // Mouse interactivity state
  const mouseRef = React.useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isHovering: false, canvasX: 0, canvasY: 0 });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rx = 0.002; // Base rotation speed X
    let ry = 0.004; // Base rotation speed Y
    let currentAngleX = 0;
    let currentAngleY = 0;
    let time = 0;

    // Generate particles on a sphere surface
    interface Point3D {
      ox: number; // Original x
      oy: number; // Original y
      oz: number; // Original z
      // Current displacement offset
      dx: number;
      dy: number;
      dz: number;
      // Velocity for spring effect
      vx: number;
      vy: number;
      vz: number;
      phase: number; // For organic thinking wave pulse
    }
    const particles: Point3D[] = [];
    const radius = size * 0.42;

    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / particleCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      particles.push({
        ox: x,
        oy: y,
        oz: z,
        dx: 0,
        dy: 0,
        dz: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      
      mouseRef.current.canvasX = mx;
      mouseRef.current.canvasY = my;
      mouseRef.current.targetX = (mx - cx) / cx;
      mouseRef.current.targetY = (my - cy) / cy;
    };

    const handleMouseEnter = () => { mouseRef.current.isHovering = true; };
    const handleMouseLeave = () => {
      mouseRef.current.isHovering = false;
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      time += 1.5;

      // Smooth mouse tracking interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      // Adjust rotation angles based on mouse drag/hover
      const speedMultiplier = mouseRef.current.isHovering ? 1.5 : 1.0;
      currentAngleX += rx * speedMultiplier + mouseRef.current.y * 0.005;
      currentAngleY += ry * speedMultiplier + mouseRef.current.x * 0.005;

      const cosX = Math.cos(currentAngleX);
      const sinX = Math.sin(currentAngleX);
      const cosY = Math.cos(currentAngleY);
      const sinY = Math.sin(currentAngleY);

      // Center of canvas
      const cx = size / 2;
      const cy = size / 2;

      // 1. Calculate positions and project them
      const projected = particles.map((p, index) => {
        // Thinking organic pulse wave
        const wave = Math.sin(time * 0.02 + p.phase) * (mouseRef.current.isHovering ? 1.5 : 3.5);
        const waveX = (p.ox / radius) * wave;
        const waveY = (p.oy / radius) * wave;
        const waveZ = (p.oz / radius) * wave;

        // Apply 3D rotation to original position + breathing wave
        const rx_orig = p.ox + waveX;
        const ry_orig = p.oy + waveY;
        const rz_orig = p.oz + waveZ;

        // Rotate Y
        let x1 = rx_orig * cosY - rz_orig * sinY;
        let z1 = rx_orig * sinY + rz_orig * cosY;

        // Rotate X
        let y2 = ry_orig * cosX - z1 * sinX;
        let z2 = ry_orig * sinX + z1 * cosX;

        // Perspective factor
        const scale = (radius * 1.5 + z2) / (radius * 2.5);
        
        // Base projected coordinates
        const basePx = x1 * scale + cx;
        const basePy = y2 * scale + cy;

        // Mouse interaction: damage displacement
        if (mouseRef.current.isHovering) {
          const dx2D = basePx - mouseRef.current.canvasX;
          const dy2D = basePy - mouseRef.current.canvasY;
          const dist2D = Math.sqrt(dx2D * dx2D + dy2D * dy2D);
          const forceRadius = 75;

          if (dist2D < forceRadius) {
            const force = (forceRadius - dist2D) / forceRadius;
            const pushFactor = force * force * 15;
            
            p.vx += (dx2D / (dist2D || 1)) * pushFactor + (Math.random() - 0.5) * 5;
            p.vy += (dy2D / (dist2D || 1)) * pushFactor + (Math.random() - 0.5) * 5;
            p.vz += (z2 > 0 ? 1 : -1) * pushFactor + (Math.random() - 0.5) * 5;
          }
        }

        // Spring feedback to return back to globe shape
        p.vx *= 0.85;
        p.vy *= 0.85;
        p.vz *= 0.85;

        p.vx += -p.dx * 0.08;
        p.vy += -p.dy * 0.08;
        p.vz += -p.dz * 0.08;

        p.dx += p.vx;
        p.dy += p.vy;
        p.dz += p.vz;

        // Displaced projected position
        const finalX1 = x1 + p.dx;
        const finalY2 = y2 + p.dy;
        const finalZ2 = z2 + p.dz;

        const finalScale = (radius * 1.5 + finalZ2) / (radius * 2.5);
        const px = finalX1 * finalScale + cx;
        const py = finalY2 * finalScale + cy;

        const isDamaged = Math.abs(p.dx) + Math.abs(p.dy) > 5;

        return {
          index,
          px,
          py,
          pz: finalZ2,
          scale: finalScale,
          isDamaged,
          opacity: Math.max(0.08, (finalZ2 + radius) / (radius * 2)),
        };
      });

      // Draw a soft glowing active core in the center of the globe (Thinking Vibe Core)
      const corePulse = 0.4 + Math.sin(time * 0.03) * 0.12; // Pulse intensity
      const gradient = ctx.createRadialGradient(cx, cy, 5, cx, cy, radius * 0.85);
      gradient.addColorStop(0, colors.accent + Math.floor(corePulse * 45).toString(16).padStart(2, '0'));
      gradient.addColorStop(0.4, colors.secondary + '08');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.85, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();

      // 2. Draw neural connections (Thinking Vibe)
      ctx.lineWidth = 0.5;
      for (let i = 0; i < projected.length; i++) {
        for (let j = 1; j <= 3; j++) {
          const targetIndex = (i + j) % projected.length;
          const p1 = projected[i];
          const p2 = projected[targetIndex];

          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 28) {
            const avgOpacity = (p1.opacity + p2.opacity) / 2;
            const lineOpacity = Math.max(0, avgOpacity * 0.18 * (1 - distance / 28));
            
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            
            if (p1.isDamaged || p2.isDamaged) {
              ctx.strokeStyle = colors.accent + Math.floor(lineOpacity * 255).toString(16).padStart(2, '0');
            } else {
              ctx.strokeStyle = colors.secondary + Math.floor(lineOpacity * 255).toString(16).padStart(2, '0');
            }
            ctx.stroke();

            // Synaptic sparks/pulses traveling along connection line
            const sparkSpeed = 0.025;
            const sparkPos = (time * sparkSpeed + (i * 0.08)) % 1.0;
            const sx = p1.px + (p2.px - p1.px) * sparkPos;
            const sy = p1.py + (p2.py - p1.py) * sparkPos;
            
            ctx.beginPath();
            ctx.arc(sx, sy, 0.75, 0, 2 * Math.PI);
            ctx.fillStyle = theme === 'dark' ? '#ffffff' : colors.primary;
            ctx.fill();
          }
        }
      }

      // Sort by depth (pz) so back particles are drawn first
      const drawSorted = [...projected].sort((a, b) => a.pz - b.pz);

      // 3. Draw particles
      drawSorted.forEach(p => {
        const dotSize = Math.max(0.5, p.scale * (p.isDamaged ? 2.5 : 1.6));
        
        ctx.beginPath();
        ctx.arc(p.px, p.py, dotSize, 0, 2 * Math.PI);
        
        if (p.isDamaged) {
          ctx.fillStyle = colors.accent + Math.floor(p.opacity * 255).toString(16).padStart(2, '0');
        } else if (p.pz > 0) {
          ctx.fillStyle = colors.primary + Math.floor(p.opacity * 255).toString(16).padStart(2, '0');
        } else {
          ctx.fillStyle = colors.secondary + Math.floor(p.opacity * 255).toString(16).padStart(2, '0');
        }
        ctx.fill();

        // Extra glowing aura for damaged points
        if (p.isDamaged) {
          ctx.beginPath();
          ctx.arc(p.px, p.py, dotSize * 3, 0, 2 * Math.PI);
          ctx.fillStyle = colors.accent + '22';
          ctx.fill();
        } else if (p.pz > radius * 0.7 && mouseRef.current.isHovering) {
          ctx.beginPath();
          ctx.arc(p.px, p.py, dotSize * 2.5, 0, 2 * Math.PI);
          ctx.fillStyle = colors.secondary + '15';
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [colors, particleCount, size]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="cursor-crosshair max-w-full select-none"
      />
      {message && (
        <p
          className="text-xs font-semibold tracking-widest uppercase mt-4 animate-pulse"
          style={{
            color: theme === 'dark' ? colors.primary : colors.accent,
            fontFamily: 'monospace',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// GLOWING FLUID ORB - Siri/Gemini style organic thinking aura sphere
// ============================================================================
export const GlowingFluidOrb: React.FC<{
  theme?: ThemeMode;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}> = ({ size = 'md', message = 'AI is processing...' }) => {

  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <style>{`
        @keyframes float-fluid-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(10px, -15px) scale(1.1); }
          66% { transform: translate(-15px, 10px) scale(0.9); }
        }
        @keyframes float-fluid-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-12px, 12px) scale(1.15); }
        }
        @keyframes float-fluid-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(15px, 15px) scale(0.95); }
        }
      `}</style>
      <div className={`relative ${sizeClasses} rounded-full overflow-hidden flex items-center justify-center filter saturate-150`}>
        {/* Soft back aura */}
        <div className="absolute inset-0 bg-neutral-100/50 dark:bg-black/10 rounded-full filter blur-xl" />

        {/* Blob 1: Blue Center */}
        <div
          className="absolute w-[80%] h-[80%] rounded-full mix-blend-screen"
          style={{
            background: `radial-gradient(circle, #2563eb 0%, rgba(37,99,235,0) 70%)`,
            animation: 'float-fluid-1 6s ease-in-out infinite',
            filter: 'blur(30px)',
          }}
        />

        {/* Blob 2: Magenta Edge Shift */}
        <div
          className="absolute w-[75%] h-[75%] rounded-full mix-blend-screen"
          style={{
            background: `radial-gradient(circle, #ec4899 0%, rgba(236,72,153,0) 70%)`,
            animation: 'float-fluid-2 8s ease-in-out infinite',
            filter: 'blur(28px)',
            animationDelay: '-2s',
          }}
        />

        {/* Blob 3: Cyan/Purple glow */}
        <div
          className="absolute w-[70%] h-[70%] rounded-full mix-blend-screen"
          style={{
            background: `radial-gradient(circle, #8b5cf6 0%, rgba(139,92,246,0) 70%)`,
            animation: 'float-fluid-3 7s ease-in-out infinite',
            filter: 'blur(25px)',
            animationDelay: '-4s',
          }}
        />

        {/* Blob 4: Soft White core for depth */}
        <div
          className="absolute w-[35%] h-[35%] rounded-full mix-blend-screen bg-white/40"
          style={{
            filter: 'blur(15px)',
            animation: 'float-fluid-1 5s ease-in-out infinite alternate',
          }}
        />
      </div>

      {message && (
        <p
          className="text-sm font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 mt-6 animate-pulse"
          style={{ fontFamily: 'sans-serif' }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// DEMO COMPONENT - Showcase all animations
// ============================================================================
export const CanvesAnimationShowcase: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>('light');

  return (
    <div
      className="min-h-screen p-8 transition-colors duration-300"
      style={{
        backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
      }}
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-4xl font-bold mb-2"
              style={{
                color: theme === 'dark' ? '#e0e7ff' : '#4f46e5',
              }}
            >
              Canves Animations
            </h1>
            <p
              className="text-lg"
              style={{
                color: theme === 'dark' ? '#d1d5db' : '#6b7280',
              }}
            >
              Fluid animations for your AI art & craft companion
            </p>
          </div>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              color: theme === 'dark' ? '#e0e7ff' : '#1f2937',
            }}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>

        {/* Grid of animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Loading Spinner */}
          <div
            className="p-6 rounded-xl transition-all"
            style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              borderWidth: '1px',
            }}
          >
            <h3
              className="text-sm font-semibold mb-6"
              style={{
                color: theme === 'dark' ? '#e0e7ff' : '#4f46e5',
              }}
            >
              Loading Spinner
            </h3>
            <div className="flex justify-center mb-4">
              <LoadingSpinner theme={theme} size="md" speed="normal" />
            </div>
            <div className="text-xs space-y-1">
              <p style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>✓ Smooth rotation</p>
              <p style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>✓ Adjustable size & speed</p>
            </div>
          </div>

          {/* Thinking Indicator */}
          <div
            className="p-6 rounded-xl transition-all"
            style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              borderWidth: '1px',
            }}
          >
            <h3
              className="text-sm font-semibold mb-6"
              style={{
                color: theme === 'dark' ? '#e0e7ff' : '#4f46e5',
              }}
            >
              Thinking Indicator
            </h3>
            <div className="flex justify-center mb-4">
              <ThinkingIndicator theme={theme} size="md" speed="normal" dots={3} />
            </div>
            <div className="text-xs space-y-1">
              <p style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>✓ Wave bounce effect</p>
              <p style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>✓ Customizable dots</p>
            </div>
          </div>

          {/* Shimmer Effect */}
          <div
            className="p-6 rounded-xl transition-all"
            style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              borderWidth: '1px',
            }}
          >
            <h3
              className="text-sm font-semibold mb-6"
              style={{
                color: theme === 'dark' ? '#e0e7ff' : '#4f46e5',
              }}
            >
              Shimmer Effect
            </h3>
            <div className="space-y-3 mb-4">
              <ShimmerEffect theme={theme} className="h-12 w-full" />
              <ShimmerEffect theme={theme} className="h-12 w-3/4" />
            </div>
            <div className="text-xs space-y-1">
              <p style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>✓ Skeleton loading</p>
              <p style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>✓ Theme-aware colors</p>
            </div>
          </div>

          {/* Morph Animation */}
          <div
            className="p-6 rounded-xl transition-all"
            style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              borderWidth: '1px',
            }}
          >
            <h3
              className="text-sm font-semibold mb-6"
              style={{
                color: theme === 'dark' ? '#e0e7ff' : '#4f46e5',
              }}
            >
              Morph Effect
            </h3>
            <div className="flex justify-center mb-4">
              <MorphAnimation theme={theme} size="md" />
            </div>
            <div className="text-xs space-y-1">
              <p style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>✓ Fluid blob shape</p>
              <p style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>✓ Organic movement</p>
            </div>
          </div>

          {/* Orbit Animation */}
          <div
            className="p-6 rounded-xl transition-all"
            style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              borderWidth: '1px',
            }}
          >
            <h3
              className="text-sm font-semibold mb-6"
              style={{
                color: theme === 'dark' ? '#e0e7ff' : '#4f46e5',
              }}
            >
              Orbit Animation
            </h3>
            <div className="flex justify-center mb-4">
              <OrbitAnimation theme={theme} count={3} speed="normal">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: getThemeColor(theme).secondary }}
                />
              </OrbitAnimation>
            </div>
            <div className="text-xs space-y-1">
              <p style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>✓ Circular motion</p>
              <p style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>✓ Configurable elements</p>
            </div>
          </div>

          {/* Flow Animation */}
          <div
            className="p-6 rounded-xl transition-all"
            style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              borderWidth: '1px',
            }}
          >
            <h3
              className="text-sm font-semibold mb-6"
              style={{
                color: theme === 'dark' ? '#e0e7ff' : '#4f46e5',
              }}
            >
              Flow Animation
            </h3>
            <div className="mb-4">
              <FlowAnimation theme={theme} particleCount={15} speed="normal" />
            </div>
            <div className="text-xs space-y-1">
              <p style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>✓ Particle effects</p>
              <p style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>✓ Stream animation</p>
            </div>
          </div>

          {/* Interactive Particle Globe */}
          <div
            className="p-6 rounded-xl transition-all md:col-span-2 lg:col-span-3 flex flex-col items-center justify-between"
            style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              borderWidth: '1px',
            }}
          >
            <div className="w-full text-left">
              <h3
                className="text-sm font-semibold mb-2"
                style={{
                  color: theme === 'dark' ? '#e0e7ff' : '#4f46e5',
                }}
              >
                Interactive 3D Particle Globe
              </h3>
              <p style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: '11px', marginBottom: '16px' }}>
                A 3D rotating globe constructed from 1000+ interactive particles using Canvas 2D depth buffers. Hover over the globe to accelerate rotation, tilt orbit, and unlock interactive glowing effects.
              </p>
            </div>
            <div className="flex justify-center w-full py-4 bg-black/5 dark:bg-black/35 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50">
              <ParticleGlobe theme={theme} particleCount={1000} size={300} message="Syncing synapses..." />
            </div>
          </div>

          {/* Glowing Fluid Orb */}
          <div
            className="p-6 rounded-xl transition-all md:col-span-2 lg:col-span-3 flex flex-col items-center justify-between animate-fade-in"
            style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              borderWidth: '1px',
            }}
          >
            <div className="w-full text-left">
              <h3
                className="text-sm font-semibold mb-2"
                style={{
                  color: theme === 'dark' ? '#e0e7ff' : '#4f46e5',
                }}
              >
                Glowing Fluid Aura Orb
              </h3>
              <p style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: '11px', marginBottom: '16px' }}>
                An organic, glassy Siri/Gemini style thinking animation. Layered mix-blended radial gradients shift, float, and scale independently behind a soft blur filter to create a glowing fluid energy sphere.
              </p>
            </div>
            <div className="flex justify-center w-full py-6 bg-black/5 dark:bg-black/35 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50">
              <GlowingFluidOrb theme={theme} size="md" message="AI is processing..." />
            </div>
          </div>
        </div>

        {/* Button Demo */}
        <div
          className="mt-12 p-6 rounded-xl"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            borderWidth: '1px',
          }}
        >
          <h3
            className="text-sm font-semibold mb-4"
            style={{
              color: theme === 'dark' ? '#e0e7ff' : '#4f46e5',
            }}
          >
            Interactive Button with Ripple Effect
          </h3>
          <div className="flex gap-4">
            <AnimatedButton theme={theme} variant="primary">
              Primary Action
            </AnimatedButton>
            <AnimatedButton theme={theme} variant="secondary">
              Secondary Action
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvesAnimationShowcase;
