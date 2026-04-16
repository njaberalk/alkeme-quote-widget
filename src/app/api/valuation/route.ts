import { NextRequest, NextResponse } from "next/server";
import { computeValuation } from "@/widget/valuation/multiples-table";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const CIO_BASE = "https://track.customer.io/api/v1";

function cioHeaders() {
  const siteId = (process.env.CUSTOMERIO_SITE_ID || "").trim();
  const apiKey = (process.env.CUSTOMERIO_API_KEY || "").trim();
  return {
    "Content-Type": "application/json",
    Authorization: "Basic " + Buffer.from(`${siteId}:${apiKey}`).toString("base64"),
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

interface ValuationRequest {
  agencyName: unknown;
  agencyWebsite: unknown;
  revenue: unknown;
  cagrPct: unknown;
  lineOfBusiness: unknown;
  ebitdaMarginPct: unknown;
  state: unknown;
  employees: unknown;
  firstName: unknown;
  lastName: unknown;
  email: unknown;
  phone: unknown;
}

function asNumber(v: unknown): number | null {
  if (typeof v === "number" && !isNaN(v) && isFinite(v)) return v;
  return null;
}

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ValuationRequest;

    const agencyName = asString(body.agencyName);
    const agencyWebsite = asString(body.agencyWebsite);
    const revenue = asNumber(body.revenue);
    const cagrPct = asNumber(body.cagrPct);
    const ebitdaMarginPct = asNumber(body.ebitdaMarginPct);
    const employees = asNumber(body.employees);
    const firstName = asString(body.firstName);
    const lastName = asString(body.lastName);
    const email = asString(body.email);
    const phone = asString(body.phone);
    const lineOfBusiness = asString(body.lineOfBusiness);
    const state = asString(body.state);

    // Validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400, headers: corsHeaders });
    }
    if (!firstName || !lastName) {
      return NextResponse.json({ error: "Name required" }, { status: 400, headers: corsHeaders });
    }
    if (!agencyName) {
      return NextResponse.json({ error: "Agency name required" }, { status: 400, headers: corsHeaders });
    }
    if (revenue === null || revenue < 0 || revenue > 1_000_000_000) {
      return NextResponse.json({ error: "Valid revenue required" }, { status: 400, headers: corsHeaders });
    }
    if (cagrPct === null || cagrPct < -50 || cagrPct > 500) {
      return NextResponse.json({ error: "Valid CAGR required" }, { status: 400, headers: corsHeaders });
    }
    if (ebitdaMarginPct === null || ebitdaMarginPct < 0 || ebitdaMarginPct > 100) {
      return NextResponse.json({ error: "Valid EBITDA margin required" }, { status: 400, headers: corsHeaders });
    }

    // Authoritative server-side compute
    const result = computeValuation({ revenue, cagrPct, ebitdaMarginPct });

    if (!process.env.CUSTOMERIO_SITE_ID || !process.env.CUSTOMERIO_API_KEY) {
      // Dev fallback: log and return success so the UI flow works locally without CIO creds.
      console.warn("[valuation] CIO creds missing — skipping CIO, logging only.");
      console.log("[valuation] result", { email, firstName, lastName, agencyName, agencyWebsite, ...result });
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // Identify lead
    const identifyRes = await fetch(`${CIO_BASE}/customers/${encodeURIComponent(email)}`, {
      method: "PUT",
      headers: cioHeaders(),
      body: JSON.stringify({
        email,
        full_name: `${firstName} ${lastName}`,
        first_name: firstName,
        last_name: lastName,
        phone,
        agency_name: agencyName,
        ...(agencyWebsite && { agency_website: agencyWebsite }),
        state,
        line_of_business: lineOfBusiness,
        employees,
        annual_revenue: revenue,
        cagr_pct: cagrPct,
        ebitda_margin_pct: ebitdaMarginPct,
        ebitda: result.ebitda,
        ebitda_multiple: result.multiple,
        base_valuation: result.baseValuation,
        revenue_bucket: result.revenueBucket,
        cagr_bucket: result.cagrBucket,
        source: "valuation_calculator",
        created_at: Math.floor(Date.now() / 1000),
      }),
    });

    if (!identifyRes.ok) {
      const text = await identifyRes.text();
      throw new Error(`CIO identify failed (${identifyRes.status}): ${text}`);
    }

    // Track valuation event — downstream CIO campaign will trigger the email off this event.
    const trackRes = await fetch(`${CIO_BASE}/customers/${encodeURIComponent(email)}/events`, {
      method: "POST",
      headers: cioHeaders(),
      body: JSON.stringify({
        name: "valuation_requested",
        data: {
          agency_name: agencyName,
          agency_website: agencyWebsite || null,
          annual_revenue: revenue,
          cagr_pct: cagrPct,
          ebitda_margin_pct: ebitdaMarginPct,
          ebitda: result.ebitda,
          ebitda_multiple: result.multiple,
          base_valuation: result.baseValuation,
          revenue_bucket: result.revenueBucket,
          cagr_bucket: result.cagrBucket,
          line_of_business: lineOfBusiness,
          state,
          employees,
        },
      }),
    });

    if (!trackRes.ok) {
      const text = await trackRes.text();
      throw new Error(`CIO track failed (${trackRes.status}): ${text}`);
    }

    // TODO: TECH-TEAM HOOK — Send transactional email with the valuation.
    // Options (decide with tech team):
    //   1. CIO transactional API (preferred if template is in CIO):
    //      POST https://api.customer.io/v1/send/email  with message_data { base_valuation, first_name, ... }
    //   2. Resend / SES / SendGrid direct send with a hardcoded HTML template.
    //   3. Rely on a CIO campaign triggered by the `valuation_requested` event (already firing above).
    // Until one of the above is wired up, the lead + computed valuation are captured in CIO profile.

    // Intentionally do NOT return the valuation — keeps the number off the wire to the browser.
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[valuation] error:", message);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500, headers: corsHeaders });
  }
}
