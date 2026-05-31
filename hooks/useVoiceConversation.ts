"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { speakText } from "@/lib/tts";

type Message = { role: "user" | "assistant"; content: string };
type Status = "idle" | "listening" | "thinking" | "speaking" | "error";

const KEEPALIVE_MS = 8000;

function getRecorderMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
    return "audio/webm;codecs=opus";
  }
  if (MediaRecorder.isTypeSupported("audio/mp4")) {
    return "audio/mp4";
  }
  return "";
}

export function useVoiceConversation() {
  const [status, setStatus] = useState<Status>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [conversationId] = useState(() => crypto.randomUUID());

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const statusRef = useRef<Status>("idle");
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const clearKeepAlive = useCallback(() => {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }, []);

  const pauseMic = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
    }
  }, []);

  const resumeMic = useCallback(() => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
    }
  }, []);

  const captureLead = useCallback(async (email: string) => {
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Voice User",
          email,
          message: `Lead captured from voice widget. Conversation ID: ${conversationId}`,
          source: "voice widget",
          website: "",
        }),
      });
    } catch (err) {
      console.error("[voice] Lead capture failed:", err);
    }
  }, [conversationId]);

  const handleFinalTranscript = useCallback(
    async (transcript: string) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      pauseMic();
      setStatus("thinking");
      setInterimTranscript("");

      const updatedMessages: Message[] = [
        ...messagesRef.current,
        { role: "user", content: transcript },
      ];
      setMessages(updatedMessages);
      messagesRef.current = updatedMessages;

      try {
        const res = await fetch("/api/voice/respond", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript,
            messages: updatedMessages,
            conversationId,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || err.message || `HTTP ${res.status}`);
        }

        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";
        let sentenceBuffer = "";

        setStatus("speaking");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6);

            try {
              const parsed = JSON.parse(payload) as {
                chunk?: string;
                done?: boolean;
                error?: string;
              };

              if (parsed.error) throw new Error(parsed.error);
              if (parsed.done) continue;
              if (!parsed.chunk) continue;

              fullResponse += parsed.chunk;
              sentenceBuffer += parsed.chunk;

              const match = sentenceBuffer.match(/[.!?](?:\s|$)/);
              if (match && match.index !== undefined && audioCtxRef.current) {
                const end = match.index + 1;
                const sentence = sentenceBuffer.slice(0, end).trim();
                sentenceBuffer = sentenceBuffer.slice(end).trimStart();
                if (sentence.length > 3) {
                  await speakText(sentence, audioCtxRef.current);
                }
              }
            } catch (parseErr) {
              if (parseErr instanceof SyntaxError) continue;
              throw parseErr;
            }
          }
        }

        if (sentenceBuffer.trim() && audioCtxRef.current) {
          await speakText(sentenceBuffer.trim(), audioCtxRef.current);
        }

        const withAssistant: Message[] = [
          ...updatedMessages,
          { role: "assistant", content: fullResponse },
        ];
        setMessages(withAssistant);
        messagesRef.current = withAssistant;

        const emailMatch = fullResponse.match(
          /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
        );
        if (emailMatch) {
          await captureLead(emailMatch[0].toLowerCase());
        }

        isProcessingRef.current = false;
        setStatus("listening");
        resumeMic();
      } catch (err) {
        console.error("Voice response error:", err);
        isProcessingRef.current = false;
        setStatus("error");
      }
    },
    [conversationId, pauseMic, resumeMic, captureLead]
  );

  const start = useCallback(async () => {
    clearKeepAlive();
    wsRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    mediaRecorderRef.current = null;
    isProcessingRef.current = false;

    try {
      const audioCtx = new AudioContext();
      await audioCtx.resume();
      audioCtxRef.current = audioCtx;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const tokenRes = await fetch("/api/voice/deepgram-token");
      if (!tokenRes.ok) {
        const err = await tokenRes.json().catch(() => ({}));
        throw new Error(err.message || err.error || "Failed to get voice token");
      }

      const { key, url } = await tokenRes.json();
      const ws = new WebSocket(url, ["token", key]);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("listening");

        keepAliveRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "KeepAlive" }));
          }
        }, KEEPALIVE_MS);

        const mimeType = getRecorderMimeType();
        const recorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);

        recorder.ondataavailable = (e) => {
          if (
            e.data.size > 0 &&
            ws.readyState === WebSocket.OPEN &&
            !isProcessingRef.current
          ) {
            ws.send(e.data);
          }
        };
        recorder.start(100);
        mediaRecorderRef.current = recorder;
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data as string);

          if (data.type === "Results") {
            const alt = data.channel?.alternatives?.[0];
            const transcript: string = alt?.transcript ?? "";
            const isFinal: boolean = Boolean(data.is_final);

            if (!transcript) return;

            if (!isFinal) {
              setInterimTranscript(transcript);
              return;
            }

            setInterimTranscript(transcript);

            if (data.speech_final && !isProcessingRef.current) {
              setInterimTranscript("");
              await handleFinalTranscript(transcript);
            }
          }
        } catch (err) {
          console.error("[voice] WebSocket message error:", err);
        }
      };

      ws.onerror = () => setStatus("error");
      ws.onclose = () => {
        clearKeepAlive();
        if (statusRef.current !== "idle") {
          setStatus("idle");
        }
      };
    } catch (err) {
      console.error("Voice start error:", err);
      clearKeepAlive();
      wsRef.current?.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setStatus("error");
    }
  }, [handleFinalTranscript, clearKeepAlive]);

  const stop = useCallback(async () => {
    clearKeepAlive();
    isProcessingRef.current = false;

    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    wsRef.current?.close();
    wsRef.current = null;

    if (audioCtxRef.current?.state !== "closed") {
      await audioCtxRef.current?.close();
    }
    audioCtxRef.current = null;

    const toStore = messagesRef.current;
    if (toStore.length > 0) {
      await fetch("/api/voice/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, messages: toStore }),
      }).catch((err) => console.error("[voice] Store failed:", err));
    }

    setInterimTranscript("");
    setStatus("idle");
  }, [conversationId, clearKeepAlive]);

  return {
    status,
    messages,
    interimTranscript,
    start,
    stop,
  };
}
