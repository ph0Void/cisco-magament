import { createAgent } from "langchain";
import { getModelProvider } from "./Model";
import { SYSTEM_PROMPT } from "./Promt";
import { CISCO_TOOLS } from "./CiscoTool";
import { MemorySaver } from "@langchain/langgraph";

export const ciscoAgent = createAgent({
  model: getModelProvider(),
  tools: CISCO_TOOLS,
  systemPrompt: SYSTEM_PROMPT,
  checkpointer: new MemorySaver(),
});

 