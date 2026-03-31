import { TestSettings, TestRefs, TestStateSetters, url_sep } from './types';

// Download test implementation
export const measureDownloadSpeed = (
  settings: TestSettings,
  refs: TestRefs,
  stateSetters: TestStateSetters,
  progressCallback: (p: number) => void
): Promise<number> => {
  return new Promise((resolve) => {
    const baseUrl = settings.url_dl;

    let dlStatus = 0;
    let dlProgress = 0;
    let totLoaded = 0;
    let startTime = performance.now();
    let bonusTime = 0;
    let graceTimeDone = false;
    let failed = false;

    refs.testState.current = 1; // Test is running download
    refs.xhr.current = [];

    // Clear any existing XHR requests
    const clearRequests = () => {
      if (refs.xhr.current && refs.xhr.current.length) {
        for (let i = 0; i < refs.xhr.current.length; i++) {
          try {
            refs.xhr.current[i].abort();
          } catch (e) {
            console.error('Error aborting XHR:', e);
          }
        }
        refs.xhr.current = [];
      }
    };

    // Function to create a download stream
    const createTestStream = (streamIndex: number, delay: number) => {
      setTimeout(() => {
        if (refs.testState.current !== 1) return; // Test was aborted

        let prevLoaded = 0;
        const xhr = new XMLHttpRequest();
        refs.xhr.current[streamIndex] = xhr;

        xhr.onprogress = (event) => {
          if (refs.testState.current !== 1) {
            try {
              xhr.abort();
            } catch (e) { /* ignore */ }
            return;
          }

          // Calculate how much new data was loaded since last progress event
          const loadDiff = event.loaded <= 0 ? 0 : event.loaded - prevLoaded;
          if (isNaN(loadDiff) || !isFinite(loadDiff) || loadDiff < 0) return;

          totLoaded += loadDiff;
          prevLoaded = event.loaded;
        };

        xhr.onload = () => {
          // File has been loaded entirely, start again
          try {
            xhr.abort();
          } catch (e) { /* ignore */ }

          // Start a new stream if test is still running
          if (refs.testState.current === 1) {
            createTestStream(streamIndex, 0);
          }
        };

        xhr.onerror = () => {
          // Error handling
          console.error(`Download stream ${streamIndex} failed`);

          if (settings.xhr_ignoreErrors === 0) {
            failed = true;
          }

          try {
            xhr.abort();
          } catch (e) { /* ignore */ }

          // Restart stream if set to ignore errors
          if (settings.xhr_ignoreErrors === 1) {
            createTestStream(streamIndex, 0);
          }
        };

        // Send XHR request
        try {
          xhr.responseType = settings.xhr_dlUseBlob ? "blob" : "arraybuffer";
          const cacheBuster = Math.random();
          xhr.open(
            "GET",
            `${baseUrl}${url_sep(baseUrl)}cors=true&r=${cacheBuster}&ckSize=${settings.garbagePhp_chunkSize}`,
            true
          );
          xhr.send();
        } catch (error) {
          console.error(`Error starting download stream ${streamIndex}:`, error);
          if (settings.xhr_ignoreErrors === 0) failed = true;

          // Restart stream if set to ignore errors
          if (settings.xhr_ignoreErrors === 1) {
            setTimeout(() => createTestStream(streamIndex, 0), 100);
          }
        }
      }, delay);
    };

    // Start multiple download streams with delay
    for (let i = 0; i < settings.xhr_dlMultistream; i++) {
      createTestStream(i, settings.xhr_multistreamDelay * i);
    }

    // Update progress and check test status every 200ms
    refs.dlInterval.current = window.setInterval(() => {
      const currentTime = performance.now();
      const elapsedTime = currentTime - startTime;

      // Handle grace time period
      if (!graceTimeDone) {
        if (elapsedTime > settings.time_dlGraceTime * 1000) {
          // Grace time is over
          if (totLoaded > 0) {
            // If data was loaded during grace time, reset counters
            startTime = performance.now();
            bonusTime = 0;
            totLoaded = 0.0;
          }
          graceTimeDone = true;
        }

        // Update progress during grace time (as a small percentage)
        progressCallback(Math.min(5, (elapsedTime / (settings.time_dlGraceTime * 1000)) * 5));
        return;
      }

      // Calculate speed in Mbps
      const durationSeconds = elapsedTime / 1000;
      if (durationSeconds <= 0) return;

      const speed = totLoaded / durationSeconds;
      // Convert to Mbps (bytes to bits, with overhead compensation)
      const speedMbps = ((speed * 8 * settings.overheadCompensationFactor) / (settings.useMebibits ? 1048576 : 1000000)).toFixed(2);
      dlStatus = parseFloat(speedMbps);

      // Update current speed for the gauge
      stateSetters.setCurrentSpeed(dlStatus);
      stateSetters.setTestType('download');

      // Adaptive test duration - shorten test for fast connections
      if (settings.time_auto) {
        const bonus = (5.0 * speed) / 100000;
        bonusTime += bonus > 400 ? 400 : bonus;
      }

      // Calculate progress
      dlProgress = ((elapsedTime + bonusTime) / (settings.time_dl_max * 1000)) * 100;
      progressCallback(Math.min(20 + (dlProgress * 0.4), 60)); // Scale to 20-60% range

      // Check if test is complete
      if (
        elapsedTime + bonusTime >= settings.time_dl_max * 1000 ||
        failed ||
        refs.testState.current !== 1
      ) {
        // Test is complete
        clearInterval(refs.dlInterval.current!);
        clearRequests();

        if (failed || isNaN(dlStatus)) {
          resolve(0); // Test failed
        } else {
          resolve(Math.floor(dlStatus));
        }

        progressCallback(60); // Ensure progress is at 60% (end of download phase)
      }
    }, 200);
  });
};
