import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Which widget to build is controlled by vite's --mode flag:
//   vite build --mode insurance-form        (default)
//   vite build --mode valuation-calculator
// See package.json scripts.

const configs: Record<string, { entry: string; name: string; fileName: string }> = {
  "insurance-form": {
    entry: "src/widget/index.tsx",
    name: "InsuranceForm",
    fileName: "insurance-form",
  },
  "valuation-calculator": {
    entry: "src/widget/valuation-index.tsx",
    name: "AlkemeValuation",
    fileName: "valuation-calculator",
  },
};

export default defineConfig(({ mode }) => {
  const cfg = configs[mode] || configs["insurance-form"];
  return {
    plugins: [react()],
    build: {
      lib: {
        entry: cfg.entry,
        name: cfg.name,
        formats: ["iife"],
        fileName: () => `${cfg.fileName}.js`,
      },
      outDir: "dist-widget",
      emptyOutDir: false,
      copyPublicDir: false,
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
          assetFileNames: `${cfg.fileName}.[ext]`,
        },
      },
    },
  };
});
