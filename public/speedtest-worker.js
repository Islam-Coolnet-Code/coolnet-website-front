/**
 * Speed Test Web Worker
 * Measures latency, download, and upload speed against the Coolnet API server.
 *
 * Endpoints used:
 *   GET  /api/speed-test/ping              → 204 (latency measurement)
 *   GET  /api/speed-test/download?bytes=N  → N zero-filled bytes
 *   POST /api/speed-test/upload            → accepts & discards body
 */

var API_BASE = '/api/speed-test';

var DOWNLOAD_SIZES = [
  { bytes: 1000000,  label: '1MB'  },
  { bytes: 5000000,  label: '5MB'  },
  { bytes: 10000000, label: '10MB' },
];

var UPLOAD_SIZES = [
  { bytes: 500000,  label: '500KB' },
  { bytes: 1000000, label: '1MB'   },
  { bytes: 2000000, label: '2MB'   },
];

var LATENCY_SAMPLES = 10;

var isRunning = false;
var abortController = null;

self.onmessage = async function (e) {
  var msg = e.data;

  switch (msg.type) {
    case 'start':
      if (!isRunning) {
        isRunning = true;
        abortController = new AbortController();
        await runSpeedTest(msg.config);
      }
      break;
    case 'stop':
      if (abortController) abortController.abort();
      isRunning = false;
      self.postMessage({ type: 'cancelled' });
      break;
  }
};

async function runSpeedTest(config) {
  var base = (config && config.apiBase) || API_BASE;

  var latency = null;
  var downloadSpeed = null;
  var uploadSpeed = null;

  try {
    // Warmup request — establishes the TCP/TLS connection so subsequent
    // measurements reflect pure network throughput, not handshake overhead.
    await fetch(base + '/ping?warmup=1', { cache: 'no-store' }).catch(function () {});

    // Phase 1: Latency
    self.postMessage({ type: 'status', phase: 'latency', message: 'Testing latency...' });
    latency = await measureLatency(base);
    self.postMessage({ type: 'latency', value: latency });

    // Phase 2: Download
    self.postMessage({ type: 'status', phase: 'download', message: 'Testing download speed...' });
    downloadSpeed = await measureDownload(base);
    self.postMessage({ type: 'download', value: downloadSpeed });

    // Phase 3: Upload
    self.postMessage({ type: 'status', phase: 'upload', message: 'Testing upload speed...' });
    uploadSpeed = await measureUpload(base);
    self.postMessage({ type: 'upload', value: uploadSpeed });

    self.postMessage({
      type: 'complete',
      results: { latency: latency, downloadSpeed: downloadSpeed, uploadSpeed: uploadSpeed },
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      self.postMessage({ type: 'cancelled' });
    } else {
      self.postMessage({ type: 'error', message: error.message });
    }
  } finally {
    isRunning = false;
    abortController = null;
  }
}

/**
 * Measure latency using the lightweight /ping endpoint.
 * Takes 10 samples, drops the highest and lowest, returns the median of the rest.
 */
async function measureLatency(base) {
  var samples = [];
  var url = base + '/ping';

  for (var i = 0; i < LATENCY_SAMPLES; i++) {
    checkAborted();

    var start = performance.now();
    try {
      await fetch(url + '?_=' + Date.now() + '-' + i, {
        cache: 'no-store',
        signal: abortController.signal,
      });
      samples.push(performance.now() - start);
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      // skip failed sample
    }

    self.postMessage({
      type: 'progress',
      phase: 'latency',
      progress: ((i + 1) / LATENCY_SAMPLES) * 33,
    });
  }

  if (samples.length === 0) return 0;

  // Sort ascending, drop the best and worst, take median of the rest
  samples.sort(function (a, b) { return a - b; });
  if (samples.length > 2) {
    samples = samples.slice(1, samples.length - 1);
  }
  return Math.round(samples[Math.floor(samples.length / 2)]);
}

/**
 * Measure download speed by fetching increasing payloads from the server.
 */
async function measureDownload(base) {
  var speeds = [];

  for (var i = 0; i < DOWNLOAD_SIZES.length; i++) {
    checkAborted();

    var bytes = DOWNLOAD_SIZES[i].bytes;
    var url = base + '/download?bytes=' + bytes + '&_=' + Date.now();

    try {
      var start = performance.now();
      var response = await fetch(url, {
        cache: 'no-store',
        signal: abortController.signal,
      });
      // Read entire response to ensure all bytes are received
      var blob = await response.blob();
      var elapsed = (performance.now() - start) / 1000;

      var speedMbps = (blob.size * 8) / elapsed / 1000000;
      speeds.push(speedMbps);

      self.postMessage({
        type: 'progress',
        phase: 'download',
        progress: 33 + ((i + 1) / DOWNLOAD_SIZES.length) * 34,
        currentSpeed: Math.round(speedMbps * 100) / 100,
      });
    } catch (e) {
      if (e.name === 'AbortError') throw e;
    }
  }

  return averageTopHalf(speeds);
}

/**
 * Measure upload speed by POSTing data to the server.
 */
async function measureUpload(base) {
  var speeds = [];
  var url = base + '/upload';

  for (var i = 0; i < UPLOAD_SIZES.length; i++) {
    checkAborted();

    var bytes = UPLOAD_SIZES[i].bytes;
    var data = new Uint8Array(bytes);
    // Fill with pseudo-random bytes so gzip/compression can't cheat
    for (var j = 0; j < bytes; j += 4) {
      var r = (Math.random() * 0xFFFFFFFF) >>> 0;
      data[j]     = r & 0xFF;
      if (j + 1 < bytes) data[j + 1] = (r >> 8) & 0xFF;
      if (j + 2 < bytes) data[j + 2] = (r >> 16) & 0xFF;
      if (j + 3 < bytes) data[j + 3] = (r >> 24) & 0xFF;
    }

    try {
      var start = performance.now();
      var response = await fetch(url, {
        method: 'POST',
        body: data.buffer,
        signal: abortController.signal,
        headers: { 'Content-Type': 'application/octet-stream' },
      });
      // Wait for the server to acknowledge receipt
      await response.json();
      var elapsed = (performance.now() - start) / 1000;

      var speedMbps = (bytes * 8) / elapsed / 1000000;
      speeds.push(speedMbps);

      self.postMessage({
        type: 'progress',
        phase: 'upload',
        progress: 67 + ((i + 1) / UPLOAD_SIZES.length) * 33,
        currentSpeed: Math.round(speedMbps * 100) / 100,
      });
    } catch (e) {
      if (e.name === 'AbortError') throw e;
    }
  }

  return averageTopHalf(speeds);
}

function checkAborted() {
  if (abortController && abortController.signal.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }
}

/** Average the top half of speed samples (drops the slowest readings). */
function averageTopHalf(speeds) {
  if (speeds.length === 0) return 0;
  speeds.sort(function (a, b) { return b - a; });
  var top = speeds.slice(0, Math.max(1, Math.ceil(speeds.length * 0.7)));
  var sum = 0;
  for (var i = 0; i < top.length; i++) sum += top[i];
  return Math.round((sum / top.length) * 100) / 100;
}
