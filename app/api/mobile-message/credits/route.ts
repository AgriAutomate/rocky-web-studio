import { NextRequest, NextResponse } from "next/server";

const baseURL =
  process.env.MOBILE_MESSAGE_API_URL || "https://api.mobilemessage.com.au/v1";
const username = process.env.MOBILE_MESSAGE_API_USERNAME;
const password = process.env.MOBILE_MESSAGE_API_PASSWORD;

const authHeader = () => {
  const creds = `${username || ""}:${password || ""}`;
  return `Basic ${Buffer.from(creds).toString("base64")}`;
};

export async function GET(request: NextRequest) {
  if (!username || !password) {
    return NextResponse.json({
      success: false,
      error: "Mobile Message credentials not configured",
    });
  }

  try {
    const response = await fetch(`${baseURL}/credits`, {
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({
        success: false,
        error: `Credits fetch failed: ${text}`,
      });
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      balance: data.balance,
      response: data,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || "Failed to fetch credits",
    });
  }
}

