import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getConversation } from "@/app/actions/chat";
import { ArtworkChatClient } from "./ArtworkChatClient";

export const dynamic = "force-dynamic";

export default async function ArtworkChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  
  if (!session) {
    redirect(`/login?callbackUrl=/chat/${id}`);
  }

  const chat = await getConversation(id);
  console.log("Loading Chat Page:", id, "Found:", !!chat, "Messages In DB:", chat?.messages?.length);

  if (!chat || chat.userId !== session.userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#F6E6CB]">
      <ArtworkChatClient 
        chatId={chat.id}
        initialArtwork={chat.artworkData as any} 
        initialMessages={chat.messages as any[]}
      />
    </div>
  );
}

