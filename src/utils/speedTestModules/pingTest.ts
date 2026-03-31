import { TestSettings, TestRefs, url_sep } from './types';

// Ping and jitter test
export const measurePingAndJitter = (
  settings: TestSettings,
  refs: TestRefs,
  progressCallback: (p: number) => void
): Promise<{ ping: number; jitter: number }> => {
  return new Promise((resolve) => {
    refs.testState.current = 2; // Test is running ping+jitter
    refs.xhr.current = [];

    let ping = 0;
    let jitter = 0;
    let i = 0;
    let prevInstspd = 0; // Last ping time, used for jitter calculation

    // Function to perform a single ping
    const doPing = () => {
      // Update progress
      const pingProgress = i / settings.count_ping;
      progressCallback(20 + (pingProgress * 40)); // Scale to 20-60% range

      const prevTime = performance.now();
      const xhr = new XMLHttpRequest();
      refs.xhr.current[0] = xhr;

      xhr.onload = function () {
        if (refs.testState.current !== 2) return; // Test was aborted

        // Calculate ping time
        let instspd = performance.now() - prevTime;

        // Try to get more accurate timing using Performance API
        try {
          const p = performance.getEntriesByType('resource');
          if (p.length > 0) {
            const entry = p[p.length - 1] as PerformanceResourceTiming;
            const d = entry.responseStart - entry.requestStart;
            if (d > 0 && d < instspd) instspd = d;
          }
        } catch (e) {
          // If Performance API fails, use the estimate
        }

        // Sanity check - ensure we have valid ping time
        if (instspd < 1) instspd = prevInstspd > 0 ? prevInstspd : 1;

        // Calculate jitter
        const instjitter = Math.abs(instspd - prevInstspd);

        // Update ping and jitter values
        if (i === 0) {
          ping = instspd; // First ping measurement
        } else {
          if (instspd < ping) ping = instspd; // Keep the lowest ping value

          // Update jitter using weighted average
          if (i === 1) {
            jitter = instjitter; // Second ping - first jitter measurement
          } else {
            // Weighted jitter calculation - spikes get more weight
            jitter = instjitter > jitter
              ? jitter * 0.3 + instjitter * 0.7
              : jitter * 0.8 + instjitter * 0.2;
          }
        }

        prevInstspd = instspd;
        i++;

        // Check if we need more pings
        if (i < settings.count_ping) {
          doPing();
        } else {
          // Ping test complete
          progressCallback(60); // End of ping test = 60%
          resolve({
            ping: Math.floor(ping),
            jitter: Number(jitter.toFixed(2))
          });
        }
      };

      xhr.onerror = function () {
        // Ping failed
        if (settings.xhr_ignoreErrors === 0) {
          // Abort the test
          resolve({
            ping: 0,
            jitter: 0
          });
        } else if (settings.xhr_ignoreErrors === 1) {
          // Retry
          doPing();
        } else {
          // Ignore and continue
          i++;
          if (i < settings.count_ping) {
            doPing();
          } else {
            resolve({
              ping: Math.floor(ping),
              jitter: Number(jitter.toFixed(2))
            });
          }
        }
      };

      // Send the ping request
      xhr.open("GET", `${settings.url_ping}${url_sep(settings.url_ping)}cors=true&r=${Math.random()}`, true);
      xhr.send();
    };

    // Start the ping test
    doPing();
  });
};
