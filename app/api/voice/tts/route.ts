import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;

export async function POST(req: NextRequest) {
  if (!VOICE_ID || !ELEVEN_API_KEY) {
    return NextResponse.json(
      { error: "TTS not configured. Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID." },
      { status: 503 }
    );
  }

  const { text } = await req.json();

  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVEN_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: "eleven_turbo_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
        optimize_streaming_latency: 3,
      }),
    }
  );

  if (!response.ok) {
    console.error("[voice/tts] ElevenLabs error:", response.status, await response.text());
    return new Response("TTS failed", { status: 500 });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Transfer-Encoding": "chunked",
    },
  });
}
