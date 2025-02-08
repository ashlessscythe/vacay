export {}

declare global {
  interface Window {
    dashboardRefresh?: () => Promise<void>;
  }
}
