import { convertToModelMessages, UIMessage } from 'ai';
import { getClient } from '../utils/client';
import { paidStreamText } from '@paid-ai/paid-node/vercel';
import { getEmbeddingModel, getModel, type ModelProvider } from '../utils/models';

export async function POST(req: Request) {
  const { messages, provider, modelName }: { messages: UIMessage[], provider: string, modelName: string } = await req.json();

  const client = await getClient();

  return await client.trace(
    "customer-with-external-id", async () => {
      const result = await paidStreamText({
        model: getModel(provider as ModelProvider, modelName),
        messages: convertToModelMessages(messages),
      });

      return result.toUIMessageStreamResponse();
    }
  );
}
