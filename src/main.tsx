import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import { preloadPage } from "@/app/pages";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// After first paint, quietly fetch the most likely next pages (skipped when Data Saver is on).
const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
if (!connection?.saveData) {
  const warm = () => { preloadPage("product"); preloadPage("collection"); };
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(warm);
  else window.setTimeout(warm, 2000);
}
