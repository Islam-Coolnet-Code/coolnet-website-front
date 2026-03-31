import { Download, Upload } from "lucide-react";
import React, { useRef, useEffect, useState } from "react";
import { COOLNET_COLORS } from "@/constants/colors";

interface PlanSpeedGaugeProps {
  downloadSpeed: number;
  // uploadSpeed: number;
  maxSpeed?: number;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  business?: boolean;
  showOnlyDownload?: boolean;
}

// Single gauge component
interface SingleGaugeProps {
  speed: number;
  maxSpeed: number;
  size: "sm" | "md" | "lg";
  color: string;
  animate: boolean;
  label: string;
//   majorMarks: number[];
  business?: boolean;
}

const SingleGauge: React.FC<SingleGaugeProps> = React.memo(({
  speed,
  maxSpeed,
  size,
  color,
  animate,
  label,
//   majorMarks,
  business = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const lastDrawnValue = useRef<number>(0);

  // Intersection Observer to detect when the gauge is visible
  useEffect(() => {
    const containerElement = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (!hasAnimated) {
              setHasAnimated(true);
            }
          }
        });
      },
      {
        threshold: 0.1, // Reduced threshold for better performance
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (containerElement) {
      observer.observe(containerElement);
    }

    return () => {
      if (containerElement) {
        observer.unobserve(containerElement);
      }
    };
  }, [hasAnimated]);

  // Animation effect for smooth transitions
  useEffect(() => {
    if (!animate) {
      setCurrentValue(speed);
      return;
    }

    // Only animate if visible and hasn't animated yet
    if (!isVisible) {
      return; // Keep current value, don't reset to 0
    }

    // If already at target speed, don't re-animate
    if (currentValue === speed) {
      return;
    }

    const start = currentValue; // Start from current value (0 initially, or maintained value)
    const end = speed;
    const duration = 2500; // Optimized duration for smooth effect
    const startTime = performance.now();
    let rafId: number;

    const animateValue = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Quintic ease-out - starts very fast, slows down gradually and smoothly
      const easedProgress = 1 - Math.pow(1 - progress, 5);

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
  }, [speed, animate, isVisible]);

  // Canvas drawing logic - optimized to reduce redraws
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Only redraw if value changed by at least 0.5 for smoothness
    const valueDiff = Math.abs(currentValue - lastDrawnValue.current);
    if (valueDiff < 0.5 && lastDrawnValue.current !== 0) return;

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
    const sizeMultiplier = size === "sm" ? 0.8 : size === "md" ? 1.0 : 1.2;
    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = (Math.min(width, height) / 2) * 0.85 * sizeMultiplier;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw gauge background
    const startAngle = Math.PI * 0.75; // Start at -135 degrees
    const endAngle = Math.PI * 2.25; // End at 135 degrees

    // Draw background track - simplified for performance
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = 24 * sizeMultiplier;
    ctx.strokeStyle = "#f0f0f0";
    ctx.stroke();

    // Calculate percentage filled - map speeds to exact thirds at 333, 666, 1000
    let speedTier = 1;
    if (currentValue >= 600) speedTier = 3;
    else if (currentValue >= 180) speedTier = 2;
    else speedTier = 1;
    const percentage = speedTier / 3;
    const valueAngle = startAngle + (endAngle - startAngle) * percentage;

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, color + "DD"); // Add some transparency

    // Draw gauge fill - simplified for smooth performance
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, valueAngle);
    ctx.lineWidth = 22 * sizeMultiplier;
    ctx.lineCap = "round";
    ctx.strokeStyle = gradient;
    ctx.stroke();

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 12 * sizeMultiplier, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Draw ticks for major marks
    // const majorMarksToUse = majorMarks;
    ctx.lineWidth = 1.5;

    // majorMarksToUse.forEach((value) => {
    //   const tickPercentage = value / maxSpeed;
    //   const tickAngle = startAngle + tickPercentage * (endAngle - startAngle);

    //   const innerRadius = radius - 15 * sizeMultiplier - 3;
    //   const outerRadius = innerRadius - 10 * sizeMultiplier;

    //   ctx.beginPath();
    //   ctx.moveTo(
    //     centerX + innerRadius * Math.cos(tickAngle),
    //     centerY + innerRadius * Math.sin(tickAngle)
    //   );
    //   ctx.lineTo(
    //     centerX + outerRadius * Math.cos(tickAngle),
    //     centerY + outerRadius * Math.sin(tickAngle)
    //   );
    //   ctx.strokeStyle = "#555";
    //   ctx.stroke();

    //   // Draw labels for major ticks (show marks for both download and upload gauges)
    //   if ([0, 500, 1000].includes(value) || [0, 10, 50, 100].includes(value)) {
    //     const labelRadius = outerRadius - 18 * sizeMultiplier;

    //     ctx.font = `bold ${12 * sizeMultiplier}px Arial`;
    //     ctx.fillStyle = "#777";
    //     ctx.textAlign = "center";
    //     ctx.textBaseline = "middle";

    //     const labelX = centerX + labelRadius * Math.cos(tickAngle);
    //     const labelY = centerY + labelRadius * Math.sin(tickAngle);

    //     ctx.fillText(value.toString(), labelX, labelY);
    //   }
    // });

    // Draw the needle - simplified for smooth animation
    if (currentValue >= 0) {
      const needleAngle = startAngle + (endAngle - startAngle) * percentage;
      const needleLength = radius - 22 * sizeMultiplier;
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
        centerX,
        centerY,
        centerX + needleLength * Math.cos(needleAngle),
        centerY + needleLength * Math.sin(needleAngle)
      );
      needleGradient.addColorStop(0, "#fff");
      needleGradient.addColorStop(1, color);

      // Fill needle
      ctx.fillStyle = needleGradient;
      ctx.fill();

      // Add border to needle
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw a simple circle at the base of the needle
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8 * sizeMultiplier, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Add inner circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4 * sizeMultiplier, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }, [currentValue, maxSpeed, size, color]);

  // Calculate dimensions based on size
  const getDimensions = () => {
    switch (size) {
      case "sm":
        return "w-32 h-32";
      case "md":
        return "w-44 h-44";
      case "lg":
      default:
        return "w-56 h-56";
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center -mx-3"
    >
      <div className={`relative ${getDimensions()}`}>
        <canvas
          ref={canvasRef}
          className="w-full h-full drop-shadow-lg"
          style={{
            willChange: isVisible ? 'transform' : 'auto',
            transform: 'translateZ(0)', // Force GPU acceleration
            backfaceVisibility: 'hidden',
            perspective: 1000
          }}
        />
      </div>

      {/* Speed value display */}
      <div className="mt-3 text-center">
        {/* <div
                    className="text-6xl font-black text-gray-800 drop-shadow-sm"
                    style={{ color }}
                >
                    {Math.round(currentValue)}
                </div> */}

        <div
          className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${
            label === "Download" &&
            "bg-gradient-to-r from-coolnet-orange to-coolnet-orange-light"
          }`}
        >
          <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
            {label === "Download" && (
              <Download className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="text-sm text-gray-200 font-bold">Mbps</div>
          <div className="text-4xl font-black text-white">
            {currentValue < speed && currentValue > 0
              ? currentValue.toFixed(1)
              : Math.round(currentValue)}
          </div>
        </div>
      </div>
    </div>
  );
});

const PlanSpeedGauge: React.FC<PlanSpeedGaugeProps> = ({
  downloadSpeed,
  // uploadSpeed,
  maxSpeed = 1000,
  size = "md",
  animate = true,
  business = false,
  showOnlyDownload = false,
}) => {
  // Coolnet brand colors from constants
  const coolnetOrange = COOLNET_COLORS.orange.DEFAULT;
  const coolnetOrangeLight = COOLNET_COLORS.orange.light;

  return (
    <div className="flex items-center justify-center gap-8 min-w-[300px]">
      {showOnlyDownload ? (
        // Single download gauge centered with same width as dual gauges
        <div className="flex items-center justify-center w-full">
          <SingleGauge
            speed={downloadSpeed}
            maxSpeed={maxSpeed}
            size={size}
            color={coolnetOrange}
            animate={animate}
            label="Download"
            // majorMarks={[0, 100, 500, 1000]}
          />
        </div>
      ) : (
        // Dual gauges layout
        <>
          <SingleGauge
            speed={downloadSpeed}
            maxSpeed={maxSpeed}
            size={size}
            color={coolnetOrange}
            animate={animate}
            label="Download"
            // majorMarks={[0, 100, 500, 1000]}
          />
          {/* <SingleGauge
                        speed={uploadSpeed}
                        maxSpeed={business ? 1000 : 100} // Use 1000 for business, 100 for personal
                        size={size}
                        color={coolnetOrange}
                        animate={animate}
                        label="Upload"
                        majorMarks={ business ? [0, 100, 500, 1000] : [0,10,50,100]}
                    /> */}
        </>
      )}
    </div>
  );
};

export default PlanSpeedGauge;
