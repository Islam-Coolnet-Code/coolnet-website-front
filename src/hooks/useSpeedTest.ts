import { useState, useCallback, useRef, useEffect } from 'react';

export interface SpeedTestConfig {
  downloadUrl?: string;
  uploadUrl?: string;
}

export interface SpeedTestProgress {
  phase: 'idle' | 'latency' | 'download' | 'upload' | 'complete';
  progress: number;
  currentSpeed?: number;
  message?: string;
}

export interface SpeedTestResults {
  latency: number | null;
  downloadSpeed: number | null;
  uploadSpeed: number | null;
}

interface UseSpeedTestReturn {
  isRunning: boolean;
  progress: SpeedTestProgress;
  results: SpeedTestResults;
  error: string | null;
  startTest: (config?: SpeedTestConfig) => void;
  stopTest: () => void;
}

export function useSpeedTest(): UseSpeedTestReturn {
  const workerRef = useRef<Worker | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<SpeedTestProgress>({
    phase: 'idle',
    progress: 0,
  });
  const [results, setResults] = useState<SpeedTestResults>({
    latency: null,
    downloadSpeed: null,
    uploadSpeed: null,
  });

  useEffect(() => {
    // Create worker on mount
    workerRef.current = new Worker('/speedtest-worker.js');

    workerRef.current.onmessage = (e) => {
      const { type, ...data } = e.data;

      switch (type) {
        case 'status':
          setProgress((prev) => ({
            ...prev,
            phase: data.phase,
            message: data.message,
          }));
          break;
        case 'progress':
          setProgress((prev) => ({
            ...prev,
            phase: data.phase,
            progress: data.progress,
            currentSpeed: data.currentSpeed,
          }));
          break;
        case 'latency':
          setResults((prev) => ({ ...prev, latency: data.value }));
          break;
        case 'download':
          setResults((prev) => ({ ...prev, downloadSpeed: data.value }));
          break;
        case 'upload':
          setResults((prev) => ({ ...prev, uploadSpeed: data.value }));
          break;
        case 'complete':
          setIsRunning(false);
          setProgress({ phase: 'complete', progress: 100 });
          setResults(data.results);
          break;
        case 'cancelled':
          setIsRunning(false);
          setProgress({ phase: 'idle', progress: 0 });
          break;
        case 'error':
          setIsRunning(false);
          setError(data.message);
          setProgress({ phase: 'idle', progress: 0 });
          break;
      }
    };

    workerRef.current.onerror = (e) => {
      setError(e.message);
      setIsRunning(false);
    };

    // Cleanup on unmount
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const startTest = useCallback((config?: SpeedTestConfig) => {
    if (!workerRef.current || isRunning) return;

    setError(null);
    setIsRunning(true);
    setProgress({ phase: 'idle', progress: 0 });
    setResults({ latency: null, downloadSpeed: null, uploadSpeed: null });

    workerRef.current.postMessage({ type: 'start', config });
  }, [isRunning]);

  const stopTest = useCallback(() => {
    if (!workerRef.current) return;
    workerRef.current.postMessage({ type: 'stop' });
  }, []);

  return {
    isRunning,
    progress,
    results,
    error,
    startTest,
    stopTest,
  };
}

export default useSpeedTest;
