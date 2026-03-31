// Re-export everything from the new code-split modules
// This file is kept for backwards compatibility

export {
  type TestType,
  type TestSettings,
  type TestResults,
  type TestRefs,
  type TestStateSetters,
  defaultSettings,
  stopTest,
  runSpeedTest,
} from './speedTestModules';

// Re-export individual test functions for direct use if needed
export { measureDownloadSpeed } from './speedTestModules/downloadTest';
export { measureUploadSpeed } from './speedTestModules/uploadTest';
export { measurePingAndJitter } from './speedTestModules/pingTest';
