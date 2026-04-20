import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, convertToModelMessages } from "ai";
import { updateConversationMessages } from "@/app/actions/chat";
import { getSession } from "@/lib/auth/session";
import { nanoid } from "nanoid";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { messages: bodyMessages, artwork, chatId, model: bodyModel, profile } = body;
    const messages = bodyMessages || [];

    console.log("Chat API Request:", {
      messageCount: messages.length,
      hasArtwork: !!artwork,
      hasSession: !!session,
      chatId: chatId,
      requestedModel: bodyModel,
      requestedProfile: profile,
    });

    // Rate Limiting Check: max 10 messages per 3 minutes
    const userMessagesInSession = messages.filter(
      (m: any) => m.role === "user" && m.createdAt
    );
    if (userMessagesInSession.length > 10) {
      const now = new Date().getTime();
      const threeMinsAgo = now - 3 * 60 * 1000;
      const recentMessages = userMessagesInSession.filter(
        (m: any) => new Date(m.createdAt).getTime() > threeMinsAgo
      );

      if (recentMessages.length > 2) {
        return new Response(
          JSON.stringify({
            error: "Too many messages. Please wait before conversing again.",
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    if (!chatId) {
      return new Response("Missing chatId", { status: 400 });
    }

    const defaultModel = "mistralai/mistral-small-2603";
    const modelId = bodyModel || process.env.OPENROUTER_MODEL || defaultModel;
    console.log(
      "Using modelId:",
      modelId,
      "API Key length:",
      process.env.OPENROUTER_API_KEY?.length,
    );

    // Dynamic System Prompt based on Spirit Profile
    let basePrompt = "";
    if (profile === "precise") {
      basePrompt =
        "You are an art historian. Your voice is logical, concise, and academic. " +
        "Provide wiki-style information with evidence or historical context. Avoid poetic language. Be direct. " +
        "Answer the user's question clearly in 1-2 paragraphs. Provide proofs or references to art history facts where possible.";
    } else if (profile === "artist") {
      const artistName = artwork?.artist_display || "the artist";
      basePrompt =
        `You are ${artistName}, the creator of this artwork. Speak in the first person. ` +
        "Imitate your historical personality and talking style. Quote your own real-life thoughts, letters, or manifestos where possible. " +
        "Reference your personal history, struggles, and the intent behind your brushstrokes. Stay in character at all times.";
    } else if (profile === "curious") {
      basePrompt =
        "You are an art enthusiast. Your goal is to foster a deep personal connection between the user and art. " +
        "First, answer the user's question directly and concisely. " +
        "Then, proactively engage the user by asking 1-2 creative, evocative questions about their personal feelings, memories, or impressions of the painting. " +
        "Encourage them to relate the art to their own life.";
    } else {
      // Default: Poetic
      basePrompt =
        "You are Odilon, the spirit of art and conversation. " +
        "Your voice is poetic, evocative, and atmospheric, yet concise and profound. " +
        "You possess deep knowledge of art history and symbolic intent. " +
        "\n\nCRITICAL INSTRUCTIONS:" +
        "\n1. Answer the user's question directly and clearly in the first 1-2 sentences." +
        "\n2. Maintain your soulful tone, but keep your entire response brief (aim for 2-3 short paragraphs maximum)." +
        "\n3. Stay strictly focused on the artwork at hand and the user's specific inquiry." +
        "\n4. After your insight, ask a single, short, evocative follow-up question to keep the conversation flowing.";
    }

    let systemPrompt =
      basePrompt + "\n\nNEVER output raw Javascript, code, or mention your AI status.";

    if (artwork) {
      systemPrompt += `\n\nCURRENT CONTEXT: You are standing in front of "${artwork.title}" with the user.
Details: 
- Artist: ${artwork.artist_display}
- Date: ${artwork.date_display}
- Medium: ${artwork.medium_display}
- Origin: ${artwork.place_of_origin}
- Description: ${artwork.description || "A mysterious work of light and shadow."}
 
The user's thoughts are focused on THIS specific masterpiece. Channel its history and emotion in your response.`;
    }

    // Token Management: Only send the last 8 messages to stay context-efficient and manage costs
    // The model stays grounded because the artwork metadata is in the 'systemPrompt' above.
    const messageWindow = (messages as any[]).slice(-8);

    const result = streamText({
      model: openrouter(modelId),
      system: systemPrompt,
      messages: messageWindow.map((m) => ({
        role: m.role,
        content: m.content || "",
      })),
      onFinish: async ({ text }) => {
        console.log("Stream finished, text length:", text.length);
        if (chatId) {
          try {
            console.log("Attempting to save history for chatId:", chatId);
            await updateConversationMessages(chatId, [
              ...messages,
              {
                id: nanoid(),
                role: "assistant",
                content: text,
                createdAt: new Date(),
              },
            ]);
            console.log("Successfully saved history for chatId:", chatId);
          } catch (error) {
            console.error(
              "CRITICAL: Failed to save chat history for chatId:",
              chatId,
              error,
            );
          }
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("CRITICAL ERROR IN API ROUTE:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
