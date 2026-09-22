(function () {
  "use strict";

  const ACCESS_KEY = "gamesAccessLastActivity";
  const ACCESS_TIMEOUT = 2 * 60 * 60 * 1000;
  const ACTIVITY_WRITE_INTERVAL = 30 * 1000;
  const script = document.currentScript;
  const indexUrl = new URL(script?.dataset.index || "index.html", window.location.href);

  function readLastActivity() {
    try {
      return Number(localStorage.getItem(ACCESS_KEY)) || 0;
    } catch {
      return 0;
    }
  }

  function writeLastActivity() {
    try {
      localStorage.setItem(ACCESS_KEY, String(Date.now()));
    } catch {
      redirectToIndex();
    }
  }

  function redirectToIndex() {
    window.location.replace(indexUrl.href);
  }

  function hasValidAccess() {
    const elapsed = Date.now() - readLastActivity();
    return elapsed >= 0 && elapsed < ACCESS_TIMEOUT;
  }

  if (!hasValidAccess()) {
    redirectToIndex();
    return;
  }

  let lastWrite = 0;
  function registerActivity() {
    const now = Date.now();
    if (now - lastWrite < ACTIVITY_WRITE_INTERVAL) return;

    if (!hasValidAccess()) {
      redirectToIndex();
      return;
    }

    writeLastActivity();
    lastWrite = now;
  }

  ["pointerdown", "keydown", "scroll", "touchstart"].forEach(eventName => {
    window.addEventListener(eventName, registerActivity, { passive: true });
  });

  window.addEventListener("pageshow", () => {
    if (!hasValidAccess()) redirectToIndex();
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) registerActivity();
  });

  window.setInterval(() => {
    if (!hasValidAccess()) redirectToIndex();
  }, 60 * 1000);
})();