import { TestSettings, TestRefs, TestStateSetters, url_sep } from './types';

// Upload test implementation
export const measureUploadSpeed = (
  settings: TestSettings,
  refs: TestRefs,
  stateSetters: TestStateSetters,
  progressCallback: (p: number) => void
): Promise<number> => {
  return new Promise((resolve) => {
    const baseUrl = settings.url_ul;

    let ulStatus = 0;
    let ulProgress = 0;
    let totLoaded = 0;
    let startTime = performance.now();
    let bonusTime = 0;
    let graceTimeDone = false;
    let failed = false;

    refs.testState.current = 3; // Test is running upload
    refs.xhr.current = [];

    // Generate blob of garbage data for upload test
    const generateBlob = (size: number): Blob => {
      // Create an ArrayBuffer of random data
      const r = new ArrayBuffer(1048576); // 1 MB chunk
      try {
        const maxInt = Math.pow(2, 32) - 1;
        const view = new Uint32Array(r);
        for (let i = 0; i < view.length; i++) {
          view[i] = Math.floor(Math.random() * maxInt);
        }
      } catch (e) {
        console.error('Error generating random data:', e);
      }

      // Create blobs of the specified size
      const chunks = [];
      for (let i = 0; i < size; i++) {
        chunks.push(r);
      }
      return new Blob(chunks);
    };

    // Create large and small blob for the test
    const blob = generateBlob(4); // 4 MB blob for normal uploads
    const blobSmall = generateBlob(0.25); // 256 KB blob for IE11 workaround

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

    // Function to create an upload stream
    const createTestStream = (streamIndex: number, delay: number) => {
      setTimeout(() => {
        if (refs.testState.current !== 3) return; // Test was aborted or is not in upload state

        let prevLoaded = 0;
        const xhr = new XMLHttpRequest();
        refs.xhr.current[streamIndex] = xhr;

        // Detect if we need IE11 workaround
        let ie11workaround = settings.forceIE11Workaround;
        if (!ie11workaround) {
          try {
            // Check if xhr.upload is available
            xhr.upload.onprogress;
            ie11workaround = false;
          } catch (e) {
            ie11workaround = true;
          }
        }

        if (ie11workaround) {
          // IE11 workaround: use onload instead of upload.onprogress
          xhr.onload = xhr.onerror = function () {
            if (refs.testState.current !== 3) {
              try {
                xhr.abort();
              } catch (e) { /* ignore */ }
              return;
            }

            // Count the upload size for small blob
            totLoaded += blobSmall.size;

            // Start another request
            createTestStream(streamIndex, 0);
          };

          // Send the small blob
          xhr.open("POST", `${baseUrl}${url_sep(baseUrl)}cors=true&r=${Math.random()}`, true);
          try {
            xhr.setRequestHeader("Content-Encoding", "identity"); // Disable compression
          } catch (e) { /* ignore */ }
          xhr.send(blobSmall);
        } else {
          // Normal upload with progress event
          xhr.upload.onprogress = function (event) {
            if (refs.testState.current !== 3) {
              try {
                xhr.abort();
              } catch (e) { /* ignore */ }
              return;
            }

            // Calculate new loaded bytes
            const loadDiff = event.loaded <= 0 ? 0 : event.loaded - prevLoaded;
            if (isNaN(loadDiff) || !isFinite(loadDiff) || loadDiff < 0) return;

            totLoaded += loadDiff;
            prevLoaded = event.loaded;
          };

          xhr.upload.onload = function () {
            // Upload completed, start a new one
            createTestStream(streamIndex, 0);
          };

          xhr.upload.onerror = function () {
            // Error handling
            if (settings.xhr_ignoreErrors === 0) failed = true;

            try {
              xhr.abort();
            } catch (e) { /* ignore */ }

            // Restart stream if set to ignore errors
            if (settings.xhr_ignoreErrors === 1) {
              createTestStream(streamIndex, 0);
            }
          };

          // Send the large blob
          xhr.open("POST", `${baseUrl}${url_sep(baseUrl)}cors=true&r=${Math.random()}`, true);
          try {
            xhr.setRequestHeader("Content-Encoding", "identity"); // Disable compression
          } catch (e) { /* ignore */ }
          xhr.send(blob);
        }
      }, delay);
    };

    // Start multiple upload streams
    for (let i = 0; i < settings.xhr_ulMultistream; i++) {
      createTestStream(i, settings.xhr_multistreamDelay * i);
    }

    // Update progress and check test status every 200ms
    refs.ulInterval.current = window.setInterval(() => {
      const currentTime = performance.now();
      const elapsedTime = currentTime - startTime;

      // Handle grace time period
      if (!graceTimeDone) {
        if (elapsedTime > settings.time_ulGraceTime * 1000) {
          // Grace time is over
          if (totLoaded > 0) {
            // Reset counters
            startTime = performance.now();
            bonusTime = 0;
            totLoaded = 0.0;
          }
          graceTimeDone = true;
        }

        // Update progress during grace time (as a small percentage)
        progressCallback(Math.min(65, 60 + (elapsedTime / (settings.time_ulGraceTime * 1000)) * 5));
        return;
      }

      // Calculate speed in Mbps
      const durationSeconds = elapsedTime / 1000;
      if (durationSeconds <= 0) return;

      const speed = totLoaded / durationSeconds;
      // Convert to Mbps (bytes to bits, with overhead compensation)
      const speedMbps = ((speed * 8 * settings.overheadCompensationFactor) / (settings.useMebibits ? 1048576 : 1000000)).toFixed(2);
      ulStatus = parseFloat(speedMbps);

      // Update current speed for the gauge
      stateSetters.setCurrentSpeed(ulStatus);
      stateSetters.setTestType('upload');

      // Adaptive test duration - shorten test for fast connections
      if (settings.time_auto) {
        const bonus = (5.0 * speed) / 100000;
        bonusTime += bonus > 400 ? 400 : bonus;
      }

      // Calculate progress
      ulProgress = ((elapsedTime + bonusTime) / (settings.time_ul_max * 1000)) * 100;
      progressCallback(Math.min(60 + (ulProgress * 0.4), 100)); // Scale to 60-100% range

      // Check if test is complete
      if (
        elapsedTime + bonusTime >= settings.time_ul_max * 1000 ||
        failed ||
        refs.testState.current !== 3
      ) {
        // Test is complete
        clearInterval(refs.ulInterval.current!);
        clearRequests();

        if (failed || isNaN(ulStatus)) {
          resolve(0); // Test failed
        } else {
          resolve(Math.floor(ulStatus));
        }

        progressCallback(100); // Test complete
      }
    }, 200);
  });
};
