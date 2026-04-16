"use client";

import { ValuationCalculator } from "@/widget/ValuationCalculator";
import "@/widget/widget.css";

export default function ValuationPage() {
  return <ValuationCalculator apiUrl="/api/valuation" />;
}
