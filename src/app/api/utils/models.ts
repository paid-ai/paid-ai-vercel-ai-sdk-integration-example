import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

export type ModelProvider = 'openai' | 'google';

export function getModel(provider: ModelProvider = 'openai', modelName?: string) {
  switch (provider) {
    case 'openai':
      return openai(modelName || 'gpt-4o');
    case 'google':
      return google(modelName || 'gemini-2.5-flash');
    default:
      return openai('gpt-4o');
  }
}

export function getEmbeddingModel(provider: ModelProvider = 'openai', modelName?: string) {
  switch (provider) {
    case 'openai':
      return openai.embedding(modelName || 'text-embedding-3-small');
    case 'google':
      // Google doesn't have embedding models in AI SDK, fallback to OpenAI
      return openai.embedding('text-embedding-3-small');
    default:
      return openai.embedding('text-embedding-3-small');
  }
}