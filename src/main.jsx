import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { initializeJobs } from "./api/db/jobsDB.js";
import { initializeCandidates } from "./api/db/candidateDB.js";
import { initializeAssessments } from "./api/db/assessmentsDB.js";
import { Toaster } from "react-hot-toast";

const startApp = () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) return console.error("Root element not found");
  
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
    </StrictMode>
  );
};

if (process.env.NODE_ENV === "development") {
  import("./api/handlers/browser")
    .then(({ worker }) => {
      worker
        .start({
          onUnhandledRequest: "warn",
        })
        .then(() => {
          // Initialize databases after MSW is ready
          initializeJobs();
          initializeCandidates();
          initializeAssessments();
          startApp();
        })
        .catch((error) => console.error("MSW failed to start:", error));
    })
    .catch((error) => {
      console.error("Failed to import MSW:", error);
      // Fallback: start app without MSW if import fails
      initializeJobs();
      initializeCandidates();
      initializeAssessments();
      startApp();
    });
} else {
  // In production, initialize databases immediately and start app
  initializeJobs();
  initializeCandidates();
  initializeAssessments();
  startApp();
}
