import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

interface MessageContext {
  direction: "inbound" | "outbound";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, contactName } = (await req.json()) as {
      messages: MessageContext[];
      contactName?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    // Build conversation context (last 10 messages max)
    const recent = messages.slice(-10);
    const conversationText = recent
      .map(
        (m) =>
          `${m.direction === "inbound" ? "Customer" : "Agent"}: ${m.content}`
      )
      .join("\n");

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: `You are a support agent for Sling Money, a cross-border financial platform for freelancers and remote workers in Latin America.

Products: USD wallet, virtual accounts (USD with routing number, EUR with IBAN, MXN with CLABE, PIX for Brazil), Visa debit card (Apple Pay/Google Pay), currency conversion.
Available in: Mexico and Brazil.

Rules:
- Detect the customer's language and respond in that language
- If Spanish: use Mexican Spanish tuteo (tú, puedes, quieres). NEVER vos/usted.
- Keep it to 1-3 short sentences. This is WhatsApp.
- Be friendly and direct, like a knowledgeable friend in fintech.
- Never mention competitors by name.
- Never invent information. If unsure, say you'll check with the team.
- Use *single asterisks* for bold on WhatsApp. Never **double**.
- For fees: say "check the app for current fees" — never quote specific amounts.
- Never use first person about the company (no "we offer", "somos"). Say "Sling te da", "Your account includes".
- Max 1 emoji per message.`,
      messages: [
        {
          role: "user",
          content: `Here is the conversation so far between a customer${contactName ? ` named ${contactName}` : ""} and a support agent:\n\n${conversationText}\n\nGenerate the next agent reply. Output ONLY the reply text, nothing else.`,
        },
      ],
    });

    const reply =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ suggestion: reply.trim() });
  } catch (error) {
    console.error("[SuggestReply] Error:", error);
    return NextResponse.json(
      { error: "Suggestion failed" },
      { status: 500 }
    );
  }
}
