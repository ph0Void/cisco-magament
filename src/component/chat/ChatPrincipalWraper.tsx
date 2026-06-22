"use client";

import React from "react";
import { ChatInputComponent } from "@/component/chat/items/ChatInputComponent";

export default function ChatPrincipalWraper() {
  return (
    <>
      <div className="flex h-full w-full flex-col overflow-hidden">
        <ChatInputComponent />
      </div>
    </>
  );
}
