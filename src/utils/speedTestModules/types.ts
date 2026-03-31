import { Dispatch, SetStateAction, MutableRefObject } from 'react';

export type TestType = 'idle' | 'download' | 'upload' | 'complete';

export interface TestSettings {
  time_dl_max: number;
  time_ul_max: number;
  time_auto: boolean;
  time_ulGraceTime: number;
  time_dlGraceTime: number;
  count_ping: number;
  xhr_dlMultistream: number;
  xhr_ulMultistream: number;
  xhr_multistreamDelay: number;
  xhr_ignoreErrors: number;
  xhr_dlUseBlob: boolean;
  overheadCompensationFactor: number;
  garbagePhp_chunkSize: number;
  useMebibits: boolean;
  url_dl: string;
  url_ul: string;
  url_ping: string;
  forceIE11Workaround: boolean;
}

export interface TestResults {
  download: number | null;
  upload: number | null;
  ping: number | null;
  jitter: number | null;
}

export interface TestRefs {
  abortController: MutableRefObject<AbortController | null>;
  testState: MutableRefObject<number>;
  xhr: MutableRefObject<XMLHttpRequest[]>;
  dlInterval: MutableRefObject<number | null>;
  ulInterval: MutableRefObject<number | null>;
  pingInterval: MutableRefObject<number | null>;
}

export interface TestStateSetters {
  setIsRunning: Dispatch<SetStateAction<boolean>>;
  setProgress: Dispatch<SetStateAction<number>>;
  setCurrentSpeed: Dispatch<SetStateAction<number | null>>;
  setTestType: Dispatch<SetStateAction<TestType>>;
  setResults: Dispatch<SetStateAction<TestResults>>;
}

// Default settings
export const defaultSettings: TestSettings = {
  time_dl_max: 15,
  time_ul_max: 15,
  time_auto: true,
  time_ulGraceTime: 3,
  time_dlGraceTime: 1.5,
  count_ping: 10,
  xhr_dlMultistream: 6,
  xhr_ulMultistream: 3,
  xhr_multistreamDelay: 300,
  xhr_ignoreErrors: 1,
  xhr_dlUseBlob: false,
  overheadCompensationFactor: 1.06,
  garbagePhp_chunkSize: 100,
  useMebibits: false,
  url_dl: 'https://test.jet.net.il/backend/garbage.php',
  url_ul: 'https://test.jet.net.il/backend/empty.php',
  url_ping: 'https://test.jet.net.il/backend/empty.php',
  forceIE11Workaround: false,
};

// Helper function to decide whether we need ? or & as a separator in URLs
export const url_sep = (url: string) => {
  return url.match(/\?/) ? "&" : "?";
};

// Clean up function to stop all tests
export const stopTest = (refs: TestRefs) => {
  refs.testState.current = 5; // Set test as aborted

  // Clear intervals if they exist
  if (refs.dlInterval.current !== null) {
    clearInterval(refs.dlInterval.current);
    refs.dlInterval.current = null;
  }

  if (refs.ulInterval.current !== null) {
    clearInterval(refs.ulInterval.current);
    refs.ulInterval.current = null;
  }

  if (refs.pingInterval.current !== null) {
    clearInterval(refs.pingInterval.current);
    refs.pingInterval.current = null;
  }

  // Cancel all XHR requests
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

  // Abort fetch requests
  if (refs.abortController.current) {
    refs.abortController.current.abort();
  }
};
