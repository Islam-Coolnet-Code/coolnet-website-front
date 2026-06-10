/**
 * Tiny in-memory token holder shared between the AuthContext and the API client.
 * Kept separate to avoid a circular import (api ⇄ context).
 *
 * The persisted copy lives in sessionStorage (see AuthContext); this is just the
 * fast in-memory accessor the axios interceptor reads on every request.
 */

let currentToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const tokenStore = {
  get(): string | null {
    return currentToken;
  },
  set(token: string | null): void {
    currentToken = token;
  },
  /** Register a callback fired when the API returns 401 UNAUTHORIZED. */
  setUnauthorizedHandler(handler: (() => void) | null): void {
    onUnauthorized = handler;
  },
  notifyUnauthorized(): void {
    onUnauthorized?.();
  },
};
