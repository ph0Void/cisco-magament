import ChatPrincipalWraper from "@/component/chat/ChatPrincipalWraper";
import React from "react";

export const metadata = {
  title: "Chat Cisco | Network Assistant",
  description:
    "Asistente inteligente para gestionar dispositivos Cisco y topologías de red con IA.",
};

export default function ChatPage() {
  return (
    <div className="flex h-full w-full min-h-0">
      <ChatPrincipalWraper />
    </div>
  );
}
