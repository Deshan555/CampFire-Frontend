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
}> = ({ text, theme: forcedTheme, className = '' }) => {
  const theme = useTheme(forcedTheme);
  const colors = getThemeColor(theme);

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
}> = ({ children, onClick, theme: forcedTheme, variant = 'primary', className = '' }) => {
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
