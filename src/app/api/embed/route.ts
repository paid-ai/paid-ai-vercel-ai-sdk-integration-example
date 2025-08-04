import { paidEmbed } from '@paid-ai/paid-node/vercel';
import { getClient } from '../utils/client';
import { getEmbeddingModel, type ModelProvider } from '../utils/models';

// Allow requests up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { value, provider, modelName } = await req.json();

  const client = await getClient();

  return await client.trace(
    "customer-with-external-id", async () => {
      const result = await paidEmbed({
        model: getEmbeddingModel(provider as ModelProvider, modelName),
        value,
      });

      return Response.json({
        value: result.value,
        embedding: result.embedding,
        usage: result.usage,
      });
    }
  );
}
