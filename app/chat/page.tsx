"use client";

import { ChatWindow } from "@/components/account/ChatWindow";
import { useAuth, useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

function Chat() {
  const { isLoaded, userId, sessionId, getToken } = useAuth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <ChatWindow />;
}

export default Chat;
