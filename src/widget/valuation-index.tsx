import { createRoot } from "react-dom/client";
import { ValuationCalculator } from "./ValuationCalculator";
import "./widget.css";

interface WidgetConfig {
  apiUrl: string;
}

function mount(selector: string, config: WidgetConfig) {
  const container = document.querySelector(selector);
  if (!container) {
    console.error(`AlkemeValuation: element "${selector}" not found`);
    return;
  }
  const root = createRoot(container);
  root.render(<ValuationCalculator apiUrl={config.apiUrl} />);
}

// Expose globally
(window as unknown as { AlkemeValuation: { mount: typeof mount } }).AlkemeValuation = { mount };

// Auto-init: if a div#alkeme-valuation exists
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("alkeme-valuation");
  if (el) {
    const params = new URLSearchParams(window.location.search);
    const apiUrl =
      (el as HTMLElement).dataset.apiUrl ||
      params.get("apiUrl") ||
      window.location.origin + "/api/valuation";
    mount("#alkeme-valuation", { apiUrl });
  }
});
