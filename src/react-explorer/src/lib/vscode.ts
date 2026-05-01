/**
 * Typed wrapper around the VS Code webview API. Supports hot-reload safely by
 * caching the single acquired instance on `window`.
 */

export interface VsCodeApi<TState = unknown> {
  postMessage(message: unknown): void
  getState(): TState | undefined
  setState(state: TState): void
}

declare global {
  interface Window {
    __vscodeApi?: VsCodeApi
    acquireVsCodeApi?: <T = unknown>() => VsCodeApi<T>
  }
}

export function getVsCodeApi<TState = unknown>(): VsCodeApi<TState> | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  if (window.__vscodeApi) {
    return window.__vscodeApi as VsCodeApi<TState>
  }

  if (typeof window.acquireVsCodeApi === 'function') {
    window.__vscodeApi = window.acquireVsCodeApi<TState>() as VsCodeApi
    return window.__vscodeApi as VsCodeApi<TState>
  }

  return undefined
}
