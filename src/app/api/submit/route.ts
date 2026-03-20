import { NextRequest, NextResponse } from "next/server";
import { TrackClient, RegionUS } from "customerio-node";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function getCioClient() {
  return new TrackClient(
    process.env.CUSTOMERIO_SITE_ID || "",
    process.env.CUSTOMERIO_API_KEY || "",
    { region: RegionUS }
  );
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
      console.error("Missing CUSTOMERIO_SITE_ID or CUSTOMERIO_API_KEY env vars");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500, headers: corsHeaders });
    }

    const cio = getCioClient();

    // Identify (create or update) the person in Customer.io
    await cio.identify(email, {
      email,
      full_name: fullName,
      first_name: fullName.split(" ")[0],
      user_type: userType,
      insurance_type: insuranceType,
      city,
      state,
      industry: industry || undefined,
      employee_count: employeeCount || undefined,
      phone,
      comments: comments || undefined,
      source: "insurance_form_widget",
      created_at: Math.floor(Date.now() / 1000),
    });

    // Track the form submission event
    await cio.track(email, {
      name: "form_submitted",
      data: {
        insurance_type: insuranceType,
        user_type: userType,
      },
    });

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("Customer.io error:", error);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500, headers: corsHeaders });
  }
}
