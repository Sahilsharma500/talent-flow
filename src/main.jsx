import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { initializeJobs } from "./api/db/jobsDB.js";
import { initializeCandidates } from "./api/db/candidateDB.js";
import { initializeAssessments } from "./api/db/assessmentsDB.js";
import { Toaster } from "react-hot-toast";
import { initializeAnalytics } from "./api/db/analyticsDB.js";

const startApp = () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) return console.error("Root element not found");

  createRoot(rootElement).render(
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
  );
};

// Always start MSW (dev & prod)
import("./api/handlers/browser")
  .then(({ worker }) => {
    worker
      .start({
        onUnhandledRequest: "bypass", // or "warn"
        serviceWorker: {
          // explicitly tell it where the file is in prod
          url: "/mockServiceWorker.js",
        },
      })
      .then(() => {
        // Initialize your fake DBs after MSW is ready
        initializeJobs();
        initializeCandidates();
        initializeAssessments();
        initializeAnalytics();
        startApp();
      })
      .catch((error) => {
        console.error("MSW failed to start:", error);
        // fallback: still start app
        initializeJobs();
        initializeCandidates();
        initializeAssessments();
        startApp();
      });
  })
  .catch((error) => {
    console.error("Failed to import MSW:", error);
    initializeJobs();
    initializeCandidates();
    initializeAssessments();
    startApp();
  });
