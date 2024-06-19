import { ChatRoom } from "./page.client";
import { cookies } from "next/headers";

function ChatPage({ params }: { params: { chatId: string } }) {
  const cookieStore = cookies();
  const userCookie = cookieStore.get("userName");
  console.log("userName", userCookie?.value);
  return <ChatRoom chatId={params.chatId} userName={userCookie?.value} />;
}

export default ChatPage;
