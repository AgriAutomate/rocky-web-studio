/**
 * ElevenLabs TTS playback via /api/voice/tts
 */

export async function speakText(
  text: string,
  audioCtx: AudioContext,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  const res = await fetch("/api/voice/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok || !res.body) {
    throw new Error("TTS fetch failed");
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];

  onStart?.();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  const totalLength = chunks.reduce((sum, c) => sum + c.byteLength, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const arrayBuffer = merged.buffer.slice(
    merged.byteOffset,
    merged.byteOffset + merged.byteLength
  );
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioCtx.destination);

  await new Promise<void>((resolve) => {
    source.onended = () => {
      onEnd?.();
      resolve();
    };
    source.start();
  });
}
