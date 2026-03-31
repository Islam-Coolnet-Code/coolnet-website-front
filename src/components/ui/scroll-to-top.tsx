import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollToTopProps {
  threshold?: number;
  className?: string;
  showProgress?: boolean;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  threshold = 400,
  className = '',
  showProgress = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      // Update visibility
      setIsVisible(scrollY > threshold);

      // Calculate scroll progress (0-100)
      if (showProgress && docHeight > 0) {
        const progress = Math.min((scrollY / docHeight) * 100, 100);
        setScrollProgress(progress);
      }
    };

    // Add scroll listener
    window.addEventListener('scroll', toggleVisibility, { passive: true });

    // Check initial state
    toggleVisibility();

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [threshold, showProgress]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  // Calculate the circumference and stroke-dashoffset for the progress ring
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'w-12 h-12 rounded-full',
        'bg-coolnet-purple hover:bg-coolnet-purple-dark',
        'text-white shadow-lg',
        'flex items-center justify-center',
        'transition-all duration-300 ease-in-out',
        'hover:scale-110 hover:shadow-xl',
        'focus:outline-none focus:ring-2 focus:ring-coolnet-purple focus:ring-offset-2',
        'animate-fade-in',
        className
      )}
      aria-label="Scroll to top"
    >
      {showProgress && (
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 48 48"
        >
          {/* Background circle */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="3"
          />
          {/* Progress circle */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-150"
          />
        </svg>
      )}
      <ArrowUp className="w-5 h-5 relative z-10" />
    </button>
  );
};

export default ScrollToTop;
