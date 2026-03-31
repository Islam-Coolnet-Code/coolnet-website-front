import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { COOLNET_COLORS } from '@/constants/colors';

interface SpeedGaugeProps {
    value: number | null;
    maxValue: number;
    unit: string;
    testType: 'download' | 'upload' | 'idle' | 'complete';
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
    animate?: boolean;
}

export const SpeedGauge: React.FC<SpeedGaugeProps> = React.memo(({
    value,
    maxValue = 1000,
    unit = 'Mbps',
    testType = 'idle',
    showLabel = true,
    size = 'lg',
    animate = true,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { t } = useLanguage();
    const [currentValue, setCurrentValue] = useState<number>(0);
    const lastDrawnValue = useRef<number>(0);

    // Animation effect for smooth transitions
    useEffect(() => {
        if (!animate) {
            setCurrentValue(value || 0);
            return;
        }

        if (value !== null) {
            const start = currentValue;
            const end = value;
            const duration = 800; // Increased for smoother, more natural feel
            const startTime = performance.now();
            let rafId: number;

            const animateValue = (timestamp: number) => {
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Smoother easing function - Exponential ease out for fluid motion
                const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

                const newValue = start + (end - start) * easedProgress;
                setCurrentValue(newValue);

                if (progress < 1) {
                    rafId = requestAnimationFrame(animateValue);
                }
            };

            rafId = requestAnimationFrame(animateValue);

            // Cleanup: cancel animation frame if component unmounts or dependencies change
            return () => {
                if (rafId) {
                    cancelAnimationFrame(rafId);
                }
            };
        }
    }, [value, animate]);

    // Canvas drawing logic - optimized for smooth performance
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Throttle redraws - only redraw if value changed significantly
        const valueDiff = Math.abs(currentValue - lastDrawnValue.current);
        if (valueDiff < 1 && lastDrawnValue.current !== 0) return;

        lastDrawnValue.current = currentValue;

        // Set proper canvas dimensions for high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        // Enable smoother rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Set dimensions based on size prop
        const sizeMultiplier = size === 'sm' ? 0.7 : size === 'md' ? 0.85 : 1;
        const width = rect.width;
        const height = rect.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 * 0.85 * sizeMultiplier;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw gauge background
        const startAngle = Math.PI * 0.75; // Start at -135 degrees
        const endAngle = Math.PI * 2.25; // End at 135 degrees

        // Draw background track - simplified for smooth performance
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.lineWidth = 22 * sizeMultiplier;
        ctx.strokeStyle = '#f0f0f0';
        ctx.stroke();

        // Calculate percentage filled
        const percentage = Math.min(currentValue / maxValue, 1);
        const valueAngle = startAngle + (endAngle - startAngle) * percentage;

        // Determine color based on test type using Coolnet orange
        let gradientColor: string[] = [];

        if (testType === 'download') {
            gradientColor = [COOLNET_COLORS.orange.DEFAULT, COOLNET_COLORS.orange.light];
        } else if (testType === 'upload') {
            gradientColor = [COOLNET_COLORS.orange.DEFAULT, COOLNET_COLORS.orange.light];
        } else if (testType === 'complete') {
            gradientColor = [COOLNET_COLORS.orange.DEFAULT, COOLNET_COLORS.orange.light];
        } else {
            gradientColor = ['#94a3b8', '#64748b']; // Grey for idle
        }

        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, gradientColor[0]);
        gradient.addColorStop(1, gradientColor[1]);

        // Draw gauge fill - simplified for smooth animation
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, valueAngle);
        ctx.lineWidth = 20 * sizeMultiplier;
        ctx.lineCap = 'round';
        ctx.strokeStyle = gradient;
        ctx.stroke();

        // Draw center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10 * sizeMultiplier, 0, Math.PI * 2);
        ctx.fillStyle = gradientColor[1];
        ctx.fill();

        // Draw ticks
        const numTicks = 10;
        ctx.lineWidth = 2;

        for (let i = 0; i <= numTicks; i++) {
            const tickAngle = startAngle + (i / numTicks) * (endAngle - startAngle);
            const isMajorTick = i % 2 === 0;

            const innerRadius = radius - (20 * sizeMultiplier) - 5;
            const outerRadius = innerRadius - (isMajorTick ? 15 : 8) * sizeMultiplier;

            ctx.beginPath();
            ctx.moveTo(
                centerX + innerRadius * Math.cos(tickAngle),
                centerY + innerRadius * Math.sin(tickAngle)
            );
            ctx.lineTo(
                centerX + outerRadius * Math.cos(tickAngle),
                centerY + outerRadius * Math.sin(tickAngle)
            );
            ctx.strokeStyle = isMajorTick ? '#555' : '#888';
            ctx.stroke();

            // Draw labels for major ticks
            if (isMajorTick) {
                const tickValue = (i / numTicks) * maxValue;
                const labelRadius = outerRadius - 15 * sizeMultiplier;

                ctx.font = `${12 * sizeMultiplier}px Arial`;
                ctx.fillStyle = '#777';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const labelX = centerX + labelRadius * Math.cos(tickAngle);
                const labelY = centerY + labelRadius * Math.sin(tickAngle);

                ctx.fillText(
                    tickValue.toFixed(0),
                    labelX,
                    labelY
                );
            }
        }

        // Draw the needle - simplified for smooth animation
        if (value !== null) {
            const needleAngle = startAngle + (endAngle - startAngle) * percentage;
            const needleLength = radius - 20 * sizeMultiplier;
            const needleBaseWidth = 8 * sizeMultiplier;

            // Create needle path - triangular shape
            ctx.beginPath();

            // Base of needle
            ctx.moveTo(
                centerX + (needleBaseWidth / 2) * Math.cos(needleAngle + Math.PI / 2),
                centerY + (needleBaseWidth / 2) * Math.sin(needleAngle + Math.PI / 2)
            );

            // Tip of needle
            ctx.lineTo(
                centerX + needleLength * Math.cos(needleAngle),
                centerY + needleLength * Math.sin(needleAngle)
            );

            // Other side of base
            ctx.lineTo(
                centerX + (needleBaseWidth / 2) * Math.cos(needleAngle - Math.PI / 2),
                centerY + (needleBaseWidth / 2) * Math.sin(needleAngle - Math.PI / 2)
            );

            // Close path
            ctx.closePath();

            // Create gradient for needle
            const needleGradient = ctx.createLinearGradient(
                centerX, centerY,
                centerX + needleLength * Math.cos(needleAngle),
                centerY + needleLength * Math.sin(needleAngle)
            );
            needleGradient.addColorStop(0, '#fff');
            needleGradient.addColorStop(1, gradientColor[1]);

            // Fill needle
            ctx.fillStyle = needleGradient;
            ctx.fill();

            // Add border to needle
            ctx.strokeStyle = gradientColor[1];
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw simple base circle
            ctx.beginPath();
            ctx.arc(centerX, centerY, 7 * sizeMultiplier, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.strokeStyle = gradientColor[1];
            ctx.lineWidth = 2;
            ctx.stroke();

            // Add inner circle
            ctx.beginPath();
            ctx.arc(centerX, centerY, 3 * sizeMultiplier, 0, Math.PI * 2);
            ctx.fillStyle = gradientColor[0];
            ctx.fill();
        }

        // Draw the value in the center - simplified for smooth rendering
        ctx.textAlign = 'center';

        if (value !== null) {
            // Draw the unit
            ctx.font = `${16 * sizeMultiplier}px 'Inter', sans-serif`;
            ctx.fillStyle = '#64748b';
            ctx.fillText(
                unit,
                centerX,
                centerY + (105 * sizeMultiplier)
            );

            // Draw the value
            ctx.font = `bold ${28 * sizeMultiplier}px 'Inter', sans-serif`;
            ctx.fillStyle = gradientColor[1];

            // Show decimal during animation for smoother visual
            const displayValue = (value !== null && currentValue < value && currentValue > 0)
                ? currentValue.toFixed(1)
                : currentValue.toFixed(0);

            ctx.fillText(
                displayValue,
                centerX,
                centerY + (85 * sizeMultiplier)
            );
        }

    }, [currentValue, maxValue, unit, size, testType, t]);

    // Calculate dimensions based on size
    const getDimensions = () => {
        switch (size) {
            case 'sm':
                return 'w-48 h-48';
            case 'md':
                return 'w-64 h-64';
            case 'lg':
            default:
                return 'w-80 h-80';
        }
    };

    // Get label text based on test type
    const getLabelText = () => {
        switch (testType) {
            case 'download':
                return t('speedTest.download');
            case 'upload':
                return t('speedTest.upload');
            case 'complete':
                return t('speedTest.complete');
            default:
                return t('speedTest.ready');
        }
    };

    // Get label color based on test type - using Coolnet orange
    const getLabelColor = () => {
        switch (testType) {
            case 'download':
                return 'text-coolnet-orange'; // Coolnet orange
            case 'upload':
                return 'text-coolnet-orange'; // Coolnet orange
            case 'complete':
                return 'text-coolnet-orange'; // Coolnet orange for completion
            default:
                return 'text-gray-600';
        }
    };

    // Calculate width and height for indicator dot positioning
    const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
    }, [size]);

    const width = dimensions.width;
    const height = dimensions.height;

    return (
        <div className="flex flex-col items-center justify-center">
            <div className={`relative ${getDimensions()}`}>
                <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{
                        willChange: (animate && value !== null && testType !== 'complete') ? 'transform' : 'auto',
                        transform: 'translateZ(0)', // Force GPU acceleration
                        backfaceVisibility: 'hidden',
                        perspective: 1000
                    }}
                />

                {/* Animated indicator dot that follows the gauge value with improved visual */}
                {animate && value !== null && testType !== 'complete' && (
                    <motion.div
                        className="absolute rounded-full shadow-lg"
                        initial={false}
                        animate={{
                            x: "-50%",
                            y: "-50%",
                            scale: [1, 1.2, 1],
                            transition: {
                                duration: 0.5,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut"
                            }
                        }}
                        style={{
                            willChange: 'transform',
                            transformOrigin: '0 0',
                            left: `50%`,
                            top: `50%`,
                            width: `${6 * (size === 'sm' ? 0.7 : size === 'md' ? 0.85 : 1)}px`,
                            height: `${6 * (size === 'sm' ? 0.7 : size === 'md' ? 0.85 : 1)}px`,
                            background: COOLNET_COLORS.orange.DEFAULT,
                            boxShadow: '0 0 10px rgba(255, 107, 53, 0.7)',
                            transform: `rotate(${210 + ((currentValue / maxValue) * 300)
                                }deg) translate(${Math.min(width || 0, height || 0) / 2 * 0.85}px, 0)`
                        }}
                    />
                )}

                {/* Static completion indicator when test is complete */}
                {animate && value !== null && testType === 'complete' && (
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Static circular background with Coolnet orange */}
                        <div
                            className="relative rounded-full flex items-center justify-center"
                            style={{
                                width: `${80 * (size === 'sm' ? 0.7 : size === 'md' ? 0.85 : 1)}px`,
                                height: `${80 * (size === 'sm' ? 0.7 : size === 'md' ? 0.85 : 1)}px`,
                                background: `linear-gradient(135deg, ${COOLNET_COLORS.orange.DEFAULT}, ${COOLNET_COLORS.orange.light})`,
                                boxShadow: '0 0 15px rgba(255, 107, 53, 0.3)'
                            }}
                        >
                            {/* Inner circle and static checkmark */}
                            <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    strokeWidth="3"
                                    stroke={COOLNET_COLORS.orange.DEFAULT}
                                    className="w-12 h-12"
                                >
                                    <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Add status indicator text */}
                {value === null && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            className="text-slate-500 text-lg font-medium bg-white/80 px-4 py-2 rounded-full shadow-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {t('speedTest.ready')}
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Improved label with pulse animation during tests */}
            {showLabel && (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={testType}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className={`mt-4 text-xl font-semibold ${getLabelColor()} ${testType !== 'idle' && testType !== 'complete' ? 'relative' : ''}`}
                    >
                        {getLabelText()}

                        {/* Add pulsing animation for active tests */}
                        {(testType === 'download' || testType === 'upload') && (
                            <motion.span
                                className="absolute -right-6 top-1/2 w-3 h-3 rounded-full -mt-1.5"
                                style={{
                                    background: COOLNET_COLORS.orange.DEFAULT
                                }}
                                animate={{
                                    opacity: [0.5, 1, 0.5],
                                    scale: [0.8, 1.2, 0.8]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
});

export default SpeedGauge;