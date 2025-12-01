import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  try {
    // Get credentials from environment at runtime
    const username = process.env.MOBILE_MESSAGE_API_USERNAME;
    const password = process.env.MOBILE_MESSAGE_API_PASSWORD;
    const baseURL = process.env.MOBILE_MESSAGE_API_URL || "https://api.mobilemessage.com.au/v1";

    console.log("[TEST] Mobile Message Auth Test:");
    console.log("[TEST]   Base URL:", baseURL);
    console.log("[TEST]   Username:", username ? `${username.substring(0, 3)}...` : "UNDEFINED");
    console.log("[TEST]   Password exists:", !!password);
    console.log("[TEST]   Username type:", typeof username);
    console.log("[TEST]   Password type:", typeof password);

    if (!username || !password) {
      const missing = [];
      if (!username) missing.push("MOBILE_MESSAGE_API_USERNAME");
      if (!password) missing.push("MOBILE_MESSAGE_API_PASSWORD");
      return NextResponse.json(
        {
          success: false,
          error: `Missing credentials: ${missing.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Credentials must be strings",
        },
        { status: 400 }
      );
    }

    // Build credentials string
    const creds = `${username}:${password}`;
    console.log("[TEST]   Encoding string length:", creds.length);
    console.log("[TEST]   Username length:", username.length);
    console.log("[TEST]   Password length:", password.length);
    console.log("[TEST]   String starts with:", creds.substring(0, 10));
    console.log("[TEST]   Contains colon:", creds.includes(":"));

    // Encode to Base64
    const encoded = Buffer.from(creds).toString("base64");
    console.log("[TEST]   Base64 result (first 20 chars):", encoded.substring(0, 20));
    console.log("[TEST]   Base64 full length:", encoded.length);

    // Validate by decoding
    try {
      const decoded = Buffer.from(encoded, "base64").toString("utf-8");
      const isValid = decoded === creds;
      console.log("[TEST]   Decoded matches original:", isValid);
      if (!isValid) {
        console.error("[TEST]   WARNING: Base64 decode mismatch!");
      }
    } catch (decodeError) {
      console.error("[TEST]   ERROR: Failed to decode Base64:", decodeError);
    }

    // Build auth header
    const auth = `Basic ${encoded}`;
    console.log("[TEST]   Auth header (first 30 chars):", auth.substring(0, 30));
    console.log("[TEST]   Starts with 'Basic ':", auth.startsWith("Basic "));

    // Call account balance API
    const accountUrl = `${baseURL}/account`;
    console.log("[TEST]   Calling account API:", accountUrl);

    const response = await fetch(accountUrl, {
      method: "GET",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
    });

    const status = response.status;
    const statusText = response.statusText;
    const responseText = await response.text();

    console.log("[TEST]   Response status:", status);
    console.log("[TEST]   Response status text:", statusText);
    console.log("[TEST]   Response body:", responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          status,
          statusText,
          error: `HTTP ${status}: ${statusText}`,
          response: responseData,
          diagnostics: {
            baseURL,
            usernamePreview: username.substring(0, 3),
            passwordLength: password.length,
            authHeaderPreview: auth.substring(0, 30),
          },
        },
        { status: 200 } // Return 200 so we can see the error details
      );
    }

    return NextResponse.json({
      success: true,
      status,
      statusText,
      data: responseData,
      diagnostics: {
        baseURL,
        usernamePreview: username.substring(0, 3),
        passwordLength: password.length,
        authHeaderPreview: auth.substring(0, 30),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[TEST] Exception:", message);
    return NextResponse.json(
      {
        success: false,
        error: message,
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}






