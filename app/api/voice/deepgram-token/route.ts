import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  const projectId = process.env.DEEPGRAM_PROJECT_ID;

  if (!apiKey || !projectId) {
    return NextResponse.json(
      {
        error: "Voice service not configured",
        message: "DEEPGRAM_API_KEY and DEEPGRAM_PROJECT_ID must be set.",
      },
      { status: 503 }
    );
  }

  const response = await fetch(
    `https://api.deepgram.com/v1/projects/${projectId}/keys`,
    {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: "voice-widget-temp",
        scopes: ["usage:write"],
        time_to_live_in_seconds: 10,
      }),
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    console.error("[voice/deepgram-token] Deepgram error:", response.status, detail);
    return NextResponse.json({ error: "Failed to create token" }, { status: 500 });
  }

  const data = (await response.json()) as { key?: string };

  if (!data.key) {
    return NextResponse.json({ error: "Failed to create token" }, { status: 500 });
  }

  return NextResponse.json({
    key: data.key,
    url: "wss://api.deepgram.com/v1/listen?model=nova-2&language=en&smart_format=true&interim_results=true&vad_events=true&endpointing=300",
  });
}
