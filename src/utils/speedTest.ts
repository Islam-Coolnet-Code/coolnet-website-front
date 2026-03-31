/**
 * Speed Test Utility
 * Provides functionality to test download and upload speeds
 */

export interface SpeedTestResult {
  download: number; // Mbps
  upload: number; // Mbps
  ping: number; // ms
  jitter: number; // ms
}

export interface SpeedTestProgress {
  type: 'download' | 'upload' | 'ping';
  progress: number; // 0-100
  currentSpeed: number; // Current speed in Mbps
}

export type SpeedTestCallback = (progress: SpeedTestProgress) => void;

/**
 * Performs a ping test to measure latency
 */
export async function measurePing(iterations: number = 5): Promise<{ ping: number; jitter: number }> {
  const pings: number[] = [];

  // Use a reliable public endpoint for ping tests
  const endpoint = 'https://www.google.com/favicon.ico';

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();

    try {
      await fetch(endpoint, {
        method: 'HEAD',
        cache: 'no-cache',
        mode: 'no-cors', // Avoid CORS issues
      });

      const end = performance.now();
      pings.push(end - start);
    } catch (error) {
      console.warn('Ping test iteration failed:', error);
      // Use a fallback value if fetch fails
      pings.push(100);
    }

    // Small delay between pings
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;

  // Calculate jitter (standard deviation of pings)
  const variance = pings.reduce((sum, ping) => sum + Math.pow(ping - avgPing, 2), 0) / pings.length;
  const jitter = Math.sqrt(variance);

  return {
    ping: Math.round(avgPing),
    jitter: Math.round(jitter)
  };
}

/**
 * Measures download speed by downloading test data
 */
export async function measureDownloadSpeed(
  onProgress?: SpeedTestCallback,
  duration: number = 10000 // Test duration in ms
): Promise<number> {
  const testFiles = [
    // Using publicly available test files
    'https://speed.cloudflare.com/__down?bytes=10000000', // 10MB
    'https://speed.cloudflare.com/__down?bytes=25000000', // 25MB
    'https://speed.cloudflare.com/__down?bytes=50000000', // 50MB
  ];

  let totalBytes = 0;
  let maxSpeed = 0;
  const startTime = performance.now();
  const speeds: number[] = [];

  try {
    // Try downloading multiple files in sequence
    for (const fileUrl of testFiles) {
      const fileStartTime = performance.now();

      if (performance.now() - startTime > duration) {
        break; // Stop if we've exceeded test duration
      }

      const response = await fetch(fileUrl, { cache: 'no-cache' });

      if (!response.body) {
        throw new Error('Response body is not available');
      }

      const reader = response.body.getReader();
      let receivedBytes = 0;
      let lastUpdate = performance.now();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        receivedBytes += value.length;
        totalBytes += value.length;

        // Update progress every 100ms
        const now = performance.now();
        if (now - lastUpdate > 100) {
          const elapsed = (now - fileStartTime) / 1000; // seconds
          const currentSpeed = (receivedBytes * 8) / (elapsed * 1000000); // Mbps

          speeds.push(currentSpeed);
          maxSpeed = Math.max(maxSpeed, currentSpeed);

          if (onProgress) {
            const progress = Math.min((now - startTime) / duration * 100, 100);
            onProgress({
              type: 'download',
              progress,
              currentSpeed: Math.round(currentSpeed * 10) / 10
            });
          }

          lastUpdate = now;
        }

        // Stop if we've exceeded test duration
        if (performance.now() - startTime > duration) {
          break;
        }
      }
    }

    const totalTime = (performance.now() - startTime) / 1000; // seconds
    const avgSpeed = (totalBytes * 8) / (totalTime * 1000000); // Mbps

    // Return the average of top speeds for more accurate measurement
    const topSpeeds = speeds.sort((a, b) => b - a).slice(0, Math.ceil(speeds.length * 0.3));
    const result = topSpeeds.length > 0
      ? topSpeeds.reduce((a, b) => a + b, 0) / topSpeeds.length
      : avgSpeed;

    return Math.round(result * 10) / 10;
  } catch (error) {
    console.error('Download speed test failed:', error);
    // Return a fallback value based on partial data
    if (totalBytes > 0) {
      const totalTime = (performance.now() - startTime) / 1000;
      return Math.round(((totalBytes * 8) / (totalTime * 1000000)) * 10) / 10;
    }
    return 0;
  }
}

/**
 * Measures upload speed by uploading test data
 */
export async function measureUploadSpeed(
  onProgress?: SpeedTestCallback,
  duration: number = 10000 // Test duration in ms
): Promise<number> {
  // Generate test data to upload
  const generateTestData = (size: number): Blob => {
    const data = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      data[i] = Math.floor(Math.random() * 256);
    }
    return new Blob([data]);
  };

  const testSizes = [
    1000000,   // 1MB
    5000000,   // 5MB
    10000000,  // 10MB
  ];

  let totalBytes = 0;
  const startTime = performance.now();
  const speeds: number[] = [];

  try {
    // Use Cloudflare speed test endpoint for uploads
    const uploadUrl = 'https://speed.cloudflare.com/__up';

    for (const size of testSizes) {
      if (performance.now() - startTime > duration) {
        break;
      }

      const testData = generateTestData(size);
      const uploadStartTime = performance.now();

      try {
        // Create FormData for upload
        const formData = new FormData();
        formData.append('file', testData, 'test.bin');

        await fetch(uploadUrl, {
          method: 'POST',
          body: testData,
          cache: 'no-cache',
        });

        const uploadTime = (performance.now() - uploadStartTime) / 1000; // seconds
        const currentSpeed = (size * 8) / (uploadTime * 1000000); // Mbps

        speeds.push(currentSpeed);
        totalBytes += size;

        if (onProgress) {
          const progress = Math.min((performance.now() - startTime) / duration * 100, 100);
          onProgress({
            type: 'upload',
            progress,
            currentSpeed: Math.round(currentSpeed * 10) / 10
          });
        }
      } catch (error) {
        console.warn('Upload iteration failed:', error);
      }

      // Small delay between uploads
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Calculate average speed
    if (speeds.length > 0) {
      const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
      return Math.round(avgSpeed * 10) / 10;
    }

    // Fallback calculation
    const totalTime = (performance.now() - startTime) / 1000;
    return Math.round(((totalBytes * 8) / (totalTime * 1000000)) * 10) / 10;
  } catch (error) {
    console.error('Upload speed test failed:', error);
    return 0;
  }
}

/**
 * Runs a complete speed test (ping, download, upload)
 */
export async function runSpeedTest(
  onProgress?: SpeedTestCallback
): Promise<SpeedTestResult> {
  // Step 1: Measure ping
  if (onProgress) {
    onProgress({ type: 'ping', progress: 0, currentSpeed: 0 });
  }

  const { ping, jitter } = await measurePing(5);

  if (onProgress) {
    onProgress({ type: 'ping', progress: 100, currentSpeed: 0 });
  }

  // Small delay before download test
  await new Promise(resolve => setTimeout(resolve, 500));

  // Step 2: Measure download speed
  const downloadSpeed = await measureDownloadSpeed(onProgress, 10000);

  // Small delay before upload test
  await new Promise(resolve => setTimeout(resolve, 500));

  // Step 3: Measure upload speed
  const uploadSpeed = await measureUploadSpeed(onProgress, 10000);

  return {
    download: downloadSpeed,
    upload: uploadSpeed,
    ping,
    jitter
  };
}

/**
 * Runs a simple speed test (download only, faster)
 */
export async function runQuickSpeedTest(
  onProgress?: SpeedTestCallback
): Promise<Partial<SpeedTestResult>> {
  const { ping, jitter } = await measurePing(3);
  const downloadSpeed = await measureDownloadSpeed(onProgress, 5000);

  return {
    download: downloadSpeed,
    ping,
    jitter
  };
}
