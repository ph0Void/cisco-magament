import { envConfig } from "@/config/EnvConfig";
import { ChatGoogle } from "@langchain/google";
import { ChatOpenAI } from "@langchain/openai";

export function getModelProvider() {
  switch (envConfig.MODEL_PROVIDER) {
    case "google":
      return new ChatGoogle({
        apiKey: envConfig.MODEL_API_KEY,
        model: envConfig.MODEL_NAME,
        temperature: Number(envConfig.MODEL_TEMPERATURE) ?? 0.7,
      });

    case "openai":
      return new ChatOpenAI({
        apiKey: envConfig.MODEL_API_KEY,
        modelName: envConfig.MODEL_NAME,
        temperature: Number(envConfig.MODEL_TEMPERATURE) ?? 0.7,
      });

    default:
      return new ChatOpenAI({
        apiKey: envConfig.MODEL_API_KEY,
        modelName: envConfig.MODEL_NAME,
        temperature: Number(envConfig.MODEL_TEMPERATURE) ?? 0.7,
        configuration: {
          baseURL: envConfig.MODEL_BASE_URL,
        },
      });
  }
}
