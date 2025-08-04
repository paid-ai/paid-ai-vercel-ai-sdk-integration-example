import { paidStreamText } from '@paid-ai/paid-node/vercel';
import { getClient } from '../utils/client';
import { getModel, type ModelProvider } from '../utils/models';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, provider, modelName } = await req.json();

  const client = await getClient();

  return await client.trace(
    "customer-with-external-id", async () => {
      const result = await paidStreamText({
        model: getModel(provider as ModelProvider, modelName),
        messages,
      });

      return result.toUIMessageStreamResponse();
    }
  );
}
