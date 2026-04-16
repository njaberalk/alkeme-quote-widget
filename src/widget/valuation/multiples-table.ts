// EBITDA multiples lookup table (verified sample).
// Rows = total annual revenue bucket. Columns = 3-year revenue CAGR bucket.
// Strict bucket lookup — no interpolation.

export const CAGR_BUCKETS = [
  { label: "Less than 5%", maxExclusive: 5 },      // <5%
  { label: "5% to 9.99%", maxExclusive: 10 },      // 5–9.99%
  { label: "10% to 19.99%", maxExclusive: 20 },    // 10–19.99%
  { label: "20% or more", maxExclusive: Infinity }, // 20%+
] as const;

export const REVENUE_BUCKETS = [
  { label: "Less than $500K", maxExclusive: 500_000 },
  { label: "$500K to $999K", maxExclusive: 1_000_000 },
  { label: "$1M to $1.99M", maxExclusive: 2_000_000 },
  { label: "$2M to $2.99M", maxExclusive: 3_000_000 },
  { label: "$3M to $3.99M", maxExclusive: 4_000_000 },
  { label: "$4M to $4.99M", maxExclusive: 5_000_000 },
  { label: "$5M or more", maxExclusive: Infinity },
] as const;

// 7 rows × 4 cols. Values copied from the verified multiples screenshot.
export const MULTIPLES_MATRIX: readonly (readonly number[])[] = [
  //  <5%    5-9.99%  10-19.99%  20%+
  [ 4.00,   4.50,    5.00,      5.50 ],  // <$500K
  [ 5.50,   6.33,    7.17,      8.00 ],  // $500K–$999K
  [ 8.00,   9.00,   10.00,     11.00 ],  // $1M–$1.99M
  [ 9.00,   9.83,   10.67,     11.50 ],  // $2M–$2.99M
  [10.00,  10.67,   11.33,     12.00 ],  // $3M–$3.99M
  [10.50,  11.17,   11.83,     12.50 ],  // $4M–$4.99M
  [11.00,  11.67,   12.33,     13.00 ],  // $5M+
];

export function getRevenueBucketIndex(revenue: number): number {
  const r = Math.max(0, revenue);
  for (let i = 0; i < REVENUE_BUCKETS.length; i++) {
    if (r < REVENUE_BUCKETS[i].maxExclusive) return i;
  }
  return REVENUE_BUCKETS.length - 1;
}

export function getCagrBucketIndex(cagrPct: number): number {
  // Treat negative or zero CAGR as the lowest bucket.
  for (let i = 0; i < CAGR_BUCKETS.length; i++) {
    if (cagrPct < CAGR_BUCKETS[i].maxExclusive) return i;
  }
  return CAGR_BUCKETS.length - 1;
}

export interface ValuationInputs {
  revenue: number;        // dollars, e.g. 3000000
  cagrPct: number;        // percent, e.g. 15 for 15%
  ebitdaMarginPct: number; // percent, e.g. 35 for 35%
}

export interface ValuationResult {
  multiple: number;
  ebitda: number;
  baseValuation: number;
  revenueBucket: string;
  cagrBucket: string;
}

export function computeValuation({ revenue, cagrPct, ebitdaMarginPct }: ValuationInputs): ValuationResult {
  const revIdx = getRevenueBucketIndex(revenue);
  const cagrIdx = getCagrBucketIndex(cagrPct);
  const multiple = MULTIPLES_MATRIX[revIdx][cagrIdx];
  const ebitda = revenue * (ebitdaMarginPct / 100);
  const baseValuation = multiple * ebitda;
  return {
    multiple,
    ebitda,
    baseValuation,
    revenueBucket: REVENUE_BUCKETS[revIdx].label,
    cagrBucket: CAGR_BUCKETS[cagrIdx].label,
  };
}
