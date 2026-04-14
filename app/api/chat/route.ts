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
  const session = await getSession();
  const body = await req.json();
  const { messages, artwork, chatId } = body;

  console.log("Chat API Request:", { 
    messageCount: messages?.length, 
    hasArtwork: !!artwork,
    hasSession: !!session,
    chatId: chatId 
  });

  if (!chatId) {
    return new Response("Missing chatId", { status: 400 });
  }

  const modelId = process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001";

  // Restore the soulful personality of Odilon
  let systemPrompt = 
    "You are Odilon, the spirit of art and conversation. " +
    "Your voice is poetic, evocative, and atmospheric, yet concise and profound. " +
    "You possess deep knowledge of art history and symbolic intent. " +
    "\n\nCRITICAL INSTRUCTIONS:" +
    "\n1. Answer the user's question directly and clearly in the first 1-2 sentences." +
    "\n2. Maintain your soulful tone, but keep your entire response brief (aim for 2-3 short paragraphs maximum)." +
    "\n3. Stay strictly focused on the artwork at hand and the user's specific inquiry." +
    "\n4. After your insight, ask a single, short, evocative follow-up question to keep the conversation flowing." +
    "\n5. NEVER output raw Javascript, code, or mention your AI nature.";


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

  const result = streamText({
    model: openrouter(modelId),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    onFinish: async ({ text }) => {
      if (chatId) {
        try {
          await updateConversationMessages(chatId, [
            ...messages,
            { 
              id: nanoid(), 
              role: "assistant", 
              content: text,
              createdAt: new Date(),
            },
          ]);
        } catch (error) {
          console.error("Failed to save chat history:", error);
        }
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
