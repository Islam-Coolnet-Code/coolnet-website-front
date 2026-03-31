// Re-export types and utilities from types module
export {
  TestType,
  TestSettings,
  TestResults,
  TestRefs,
  TestStateSetters,
  defaultSettings,
  stopTest,
} from './types';

import { TestSettings, TestRefs, TestStateSetters, stopTest } from './types';

// Main speed test orchestrator with dynamic imports for code-splitting
export const runSpeedTest = async (
  settings: TestSettings,
  refs: TestRefs,
  stateSetters: TestStateSetters,
) => {
  // Reset all states
  stateSetters.setIsRunning(true);
  stateSetters.setProgress(0);
  stateSetters.setCurrentSpeed(null);
  stateSetters.setTestType('idle');
  stateSetters.setResults({ download: null, upload: null, ping: null, jitter: null });

  // Create a new AbortController for this test run
  refs.abortController.current = new AbortController();
  refs.testState.current = 0; // Reset test state

  try {
    // Warm up connection first with a small request
    try {
      await fetch('https://test.jet.net.il/backend/empty.php?cors=true&warmup=1', {
        cache: 'no-store',
        signal: refs.abortController.current.signal
      });
    } catch {
      // Ignore warm-up errors
    }

    // Step 1: Measure ping and jitter (0-20% progress)
    stateSetters.setProgress(5);

    // Dynamically import ping test module
    const { measurePingAndJitter } = await import('./pingTest');
    const { ping, jitter } = await measurePingAndJitter(
      settings,
      refs,
      (pingProgress) => {
        stateSetters.setProgress(Math.floor(pingProgress));
      }
    );
    stateSetters.setResults(prev => ({ ...prev, ping, jitter }));
    stateSetters.setProgress(20);

    // Short delay between tests
    await new Promise(resolve => setTimeout(resolve, 200));

    // Step 2: Measure download speed (20-60% progress)
    try {
      // Dynamically import download test module
      const { measureDownloadSpeed } = await import('./downloadTest');
      const downloadResult = await measureDownloadSpeed(
        settings,
        refs,
        stateSetters,
        (downloadProgress) => {
          stateSetters.setProgress(Math.floor(downloadProgress));
        }
      );
      stateSetters.setResults(prev => ({ ...prev, download: downloadResult }));
    } catch (error) {
      console.error('Download test error:', error);
      stateSetters.setResults(prev => ({ ...prev, download: 0 }));
    }
    stateSetters.setProgress(60);

    // Short delay between tests
    await new Promise(resolve => setTimeout(resolve, 200));

    // Step 3: Measure upload speed (60-100% progress)
    try {
      // Dynamically import upload test module
      const { measureUploadSpeed } = await import('./uploadTest');
      const uploadResult = await measureUploadSpeed(
        settings,
        refs,
        stateSetters,
        (uploadProgress) => {
          stateSetters.setProgress(Math.floor(uploadProgress));
        }
      );
      stateSetters.setResults(prev => ({ ...prev, upload: uploadResult }));
    } catch (error) {
      console.error('Upload test error:', error);
      stateSetters.setResults(prev => ({ ...prev, upload: 0 }));
    }
    stateSetters.setProgress(100);

    // Mark test as complete
    stateSetters.setTestType('complete');
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Speed test error:', error);
    }
  } finally {
    stopTest(refs); // Make sure we clean up
    stateSetters.setIsRunning(false);
  }
};
