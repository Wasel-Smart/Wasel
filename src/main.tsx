import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Performance monitoring
const startTime = performance.now();

function logPerformance() {
  const loadTime = performance.now() - startTime;
  console.log(`✅ Wasel App loaded in ${loadTime.toFixed(2)}ms`);
}

function handleRootError(error: Error) {
  console.error("❌ CRITICAL ERROR: Failed to mount Wasel App:", error);
  
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        padding: 20px; 
        color: #dc2626; 
        font-family: system-ui, -apple-system, sans-serif;
        max-width: 600px;
        margin: 50px auto;
        border: 1px solid #fecaca;
        border-radius: 8px;
        background: #fef2f2;
      ">
        <h2 style="margin-top: 0; color: #991b1b;">⚠️ Application Error</h2>
        <p>The Wasel application failed to load. Please try refreshing the page.</p>
        <details style="margin-top: 16px;">
          <summary style="cursor: pointer; font-weight: 600;">Technical Details</summary>
          <pre style="
            margin-top: 8px; 
            padding: 12px; 
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            overflow-x: auto;
            font-size: 12px;
          ">${error.message}\n\n${error.stack || 'No stack trace available'}</pre>
        </details>
        <button 
          onclick="window.location.reload()" 
          style="
            margin-top: 16px;
            padding: 8px 16px;
            background: #dc2626;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
          "
        >
          Refresh Page
        </button>
      </div>
    `;
  }
}

function initializeApp() {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    const error = new Error("Root element with id 'root' not found in DOM");
    console.error("❌ CRITICAL ERROR:", error.message);
    
    // Create error display in body if root is missing
    document.body.innerHTML = `
      <div style="
        padding: 20px; 
        color: #dc2626; 
        font-family: system-ui, -apple-system, sans-serif;
        text-align: center;
        margin-top: 50px;
      ">
        <h1>❌ Critical Error</h1>
        <p>Root element missing from HTML. Please check your index.html file.</p>
      </div>
    `;
    return;
  }

  console.log("✅ Root element found, initializing Wasel App...");
  
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    
    // Log successful mount
    console.log("✅ Wasel App mounted successfully!");
    logPerformance();
    
    // Set up global error handler for React errors
    window.addEventListener('error', (event) => {
      console.error('❌ Global error caught:', event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('❌ Unhandled promise rejection:', event.reason);
    });
    
  } catch (error) {
    handleRootError(error instanceof Error ? error : new Error(String(error)));
  }
}

// Initialize the app
initializeApp();
