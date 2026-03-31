import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpeedTestGaugeProps {
  value: number | null;
  maxValue?: number;
  phase: 'idle' | 'latency' | 'download' | 'upload' | 'complete';
  onStart?: () => void;
}

/**
 * Speedtest.net-style circular gauge with GO button.
 * Pure SVG — no canvas needed.
 */
const SpeedTestGauge: React.FC<SpeedTestGaugeProps> = ({
  value,
  maxValue = 500,
  phase,
  onStart,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const animRef = useRef<number>(0);

  // Animate the displayed value smoothly
  useEffect(() => {
    const target = value ?? 0;
    const start = displayValue;
    const startTime = performance.now();
    const duration = 600;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplayValue(start + (target - start) * ease);
      if (t < 1) animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [value]);

  const isIdle = phase === 'idle';
  const isRunning = phase === 'latency' || phase === 'download' || phase === 'upload';
  const isComplete = phase === 'complete';

  // Gauge geometry
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 130;
  const strokeWidth = 14;
  const startAngle = 135; // degrees
  const endAngle = 405;   // degrees (135 + 270)
  const totalAngle = endAngle - startAngle;

  const polarToCart = (angleDeg: number, r: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const describeArc = (startA: number, endA: number, r: number) => {
    const s = polarToCart(startA, r);
    const e = polarToCart(endA, r);
    const largeArc = endA - startA > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  const percentage = Math.min(displayValue / maxValue, 1);
  const valueAngle = startAngle + totalAngle * percentage;

  // Tick marks
  const ticks = [];
  const tickCount = 50;
  for (let i = 0; i <= tickCount; i++) {
    const angle = startAngle + (i / tickCount) * totalAngle;
    const isMajor = i % 10 === 0;
    const len = isMajor ? 14 : 7;
    const outer = polarToCart(angle, radius + strokeWidth / 2 + 4);
    const inner = polarToCart(angle, radius + strokeWidth / 2 + 4 + len);
    const filled = i / tickCount <= percentage && isRunning;
    ticks.push(
      <line
        key={i}
        x1={outer.x} y1={outer.y}
        x2={inner.x} y2={inner.y}
        stroke={filled ? '#ff6b35' : isRunning || isComplete ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)'}
        strokeWidth={isMajor ? 2.5 : 1.2}
        strokeLinecap="round"
      />
    );
  }

  // Scale labels
  const labels = [0, 100, 200, 300, 400, 500];
  const labelElements = labels.map((val) => {
    const angle = startAngle + (val / maxValue) * totalAngle;
    const pos = polarToCart(angle, radius + strokeWidth / 2 + 28);
    return (
      <text
        key={val}
        x={pos.x}
        y={pos.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(255,255,255,0.35)"
        fontSize="11"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="500"
      >
        {val}
      </text>
    );
  });

  // Colors based on phase
  const getArcColor = () => {
    if (phase === 'download') return 'url(#gaugeGradientDown)';
    if (phase === 'upload') return 'url(#gaugeGradientUp)';
    if (phase === 'complete') return 'url(#gaugeGradientComplete)';
    return 'rgba(255,255,255,0.1)';
  };

  const getPhaseColor = () => {
    if (phase === 'download') return '#ff6b35';
    if (phase === 'upload') return '#7c4dff';
    if (phase === 'complete') return '#ff6b35';
    return '#94a3b8';
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id="gaugeGradientDown" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b35" />
            <stop offset="100%" stopColor="#ff8c42" />
          </linearGradient>
          <linearGradient id="gaugeGradientUp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c4dff" />
            <stop offset="100%" stopColor="#9d7dff" />
          </linearGradient>
          <linearGradient id="gaugeGradientComplete" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b35" />
            <stop offset="50%" stopColor="#ff8c42" />
            <stop offset="100%" stopColor="#7c4dff" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Tick marks */}
        {ticks}

        {/* Scale labels */}
        {labelElements}

        {/* Background arc */}
        <path
          d={describeArc(startAngle, endAngle, radius)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Active arc */}
        {(isRunning || isComplete) && percentage > 0 && (
          <path
            d={describeArc(startAngle, Math.min(valueAngle, endAngle - 0.5), radius)}
            fill="none"
            stroke={getArcColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#glow)"
          />
        )}

        {/* Needle dot at the end of the active arc */}
        {isRunning && percentage > 0 && (
          <>
            <circle
              cx={polarToCart(valueAngle, radius).x}
              cy={polarToCart(valueAngle, radius).y}
              r={strokeWidth / 2 + 2}
              fill={getPhaseColor()}
              opacity={0.3}
            />
            <circle
              cx={polarToCart(valueAngle, radius).x}
              cy={polarToCart(valueAngle, radius).y}
              r={strokeWidth / 2 - 1}
              fill={getPhaseColor()}
            />
          </>
        )}
      </svg>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {isIdle && (
            <motion.button
              key="go"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="w-32 h-32 rounded-full flex items-center justify-center cursor-pointer select-none focus:outline-none"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                border: '3px solid rgba(255,255,255,0.15)',
                boxShadow: '0 0 40px rgba(255,107,53,0.15), inset 0 0 40px rgba(255,255,255,0.03)',
              }}
            >
              <span className="text-4xl font-bold tracking-wider text-white" style={{ textShadow: '0 0 20px rgba(255,107,53,0.5)' }}>
                GO
              </span>
            </motion.button>
          )}

          {isRunning && (
            <motion.div
              key="running"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <span
                className="text-5xl font-bold tabular-nums"
                style={{ color: getPhaseColor(), textShadow: `0 0 30px ${getPhaseColor()}40` }}
              >
                {displayValue < 1 && displayValue > 0 ? displayValue.toFixed(2) : displayValue.toFixed(1)}
              </span>
              <span className="text-sm text-white/40 mt-1 font-medium tracking-wide">Mbps</span>
            </motion.div>
          )}

          {isComplete && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <span
                className="text-5xl font-bold tabular-nums"
                style={{ color: '#ff6b35', textShadow: '0 0 30px rgba(255,107,53,0.3)' }}
              >
                {displayValue.toFixed(1)}
              </span>
              <span className="text-sm text-white/40 mt-1 font-medium tracking-wide">Mbps</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SpeedTestGauge;
