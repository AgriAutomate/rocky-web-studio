import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { getClientIP } from "@/lib/rate-limit";
import type { AIMessage } from "@/types/ai-assistant";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { conversationId, messages } = (await req.json()) as {
      conversationId: string;
      messages: AIMessage[];
    };

    if (!conversationId || !messages?.length) {
      return NextResponse.json({ ok: true });
    }

    const clientIp = getClientIP(req);
    const supabase = createServerSupabaseClient(true);
    const lastMessage = messages[messages.length - 1];

    const { error: convError } = await supabase.from("ai_assistant_conversations").upsert(
      {
        id: conversationId,
        channel: "voice",
        message_count: messages.length,
        last_message: lastMessage?.content?.slice(0, 200) ?? "",
        client_ip: clientIp,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (convError) {
      console.error("[voice/store] Conversation upsert failed:", convError);
      return NextResponse.json({ error: "Failed to store conversation" }, { status: 500 });
    }

    const rows = messages.map((m) => ({
      conversation_id: conversationId,
      role: m.role,
      content: m.content,
      channel: "voice",
      created_at: new Date().toISOString(),
    }));

    const { error: messagesError } = await supabase.from("ai_assistant_messages").insert(rows);

    if (messagesError) {
      console.error("[voice/store] Messages insert failed:", messagesError);
      return NextResponse.json({ error: "Failed to store messages" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[voice/store] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
