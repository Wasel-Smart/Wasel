import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("❌ ERROR: Root element not found!");
  document.body.innerHTML = "<h1>ERROR: Root element missing</h1>";
} else {
  console.log("✅ Root element found, mounting Wasel App...");
  
  try {
    createRoot(rootElement).render(<App />);
    console.log("✅ Wasel App mounted successfully!");
  } catch (error) {
    console.error("❌ ERROR mounting app:", error);
    rootElement.innerHTML = `<div style="padding: 20px; color: red;"><h2>Error Loading App</h2><pre>${error instanceof Error ? error.message : String(error)}</pre></div>`;
  }
}
