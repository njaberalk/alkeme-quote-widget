import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const CIO_BASE = "https://track.customer.io/api/v1";

function cioHeaders() {
  const siteId = process.env.CUSTOMERIO_SITE_ID || "";
  const apiKey = process.env.CUSTOMERIO_API_KEY || "";
  return {
    "Content-Type": "application/json",
    Authorization: "Basic " + Buffer.from(`${siteId}:${apiKey}`).toString("base64"),
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, fullName, userType, insuranceType, city, state, industry, employeeCount, phone, comments } = body;

    if (!email || !fullName) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400, headers: corsHeaders });
    }

    if (!process.env.CUSTOMERIO_SITE_ID || !process.env.CUSTOMERIO_API_KEY) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500, headers: corsHeaders });
    }

    // Identify (create or update) the person in Customer.io
    const identifyRes = await fetch(`${CIO_BASE}/customers/${encodeURIComponent(email)}`, {
      method: "PUT",
      headers: cioHeaders(),
      body: JSON.stringify({
        email,
        full_name: fullName,
        first_name: fullName.split(" ")[0],
        user_type: userType,
        insurance_type: insuranceType,
        city,
        state,
        ...(industry && { industry }),
        ...(employeeCount && { employee_count: employeeCount }),
        phone,
        ...(comments && { comments }),
        source: "insurance_form_widget",
        created_at: Math.floor(Date.now() / 1000),
      }),
    });

    if (!identifyRes.ok) {
      const text = await identifyRes.text();
      throw new Error(`Identify failed (${identifyRes.status}): ${text}`);
    }

    // Track the form submission event
    const trackRes = await fetch(`${CIO_BASE}/customers/${encodeURIComponent(email)}/events`, {
      method: "POST",
      headers: cioHeaders(),
      body: JSON.stringify({
        name: "form_submitted",
        data: {
          insurance_type: insuranceType,
          user_type: userType,
        },
      }),
    });

    if (!trackRes.ok) {
      const text = await trackRes.text();
      throw new Error(`Track failed (${trackRes.status}): ${text}`);
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Submit error:", message);
    return NextResponse.json({ error: "Failed to submit", detail: message }, { status: 500, headers: corsHeaders });
  }
}
