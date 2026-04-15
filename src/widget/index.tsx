import React from "react";
import { createRoot } from "react-dom/client";
import { InsuranceForm } from "./InsuranceForm";
import "./widget.css";

interface WidgetConfig {
  apiUrl: string;
  vertical?: string;
}

function mount(selector: string, config: WidgetConfig) {
  const container = document.querySelector(selector);
  if (!container) {
    console.error(`InsuranceForm: element "${selector}" not found`);
    return;
  }
  const root = createRoot(container);
  root.render(<InsuranceForm apiUrl={config.apiUrl} vertical={config.vertical} />);
}

// Expose globally
(window as any).InsuranceForm = { mount };

// Auto-init: if a div#insurance-form exists with data-api-url
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("insurance-form");
  if (el) {
    const apiUrl = el.dataset.apiUrl;
    const vertical = el.dataset.vertical;
    if (apiUrl) {
      mount("#insurance-form", { apiUrl, vertical });
    }
  }
});
