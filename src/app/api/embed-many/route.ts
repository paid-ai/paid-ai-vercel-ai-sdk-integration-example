import { paidEmbedMany } from '@paid-ai/paid-node/vercel';
import { getClient } from '../utils/client';
import { getEmbeddingModel, type ModelProvider } from '../utils/models';

export async function POST(req: Request) {
  const { values, provider, modelName } = await req.json();

  const client = await getClient();

  return await client.trace(
    "customer-with-external-id", async () => {
      const result = await paidEmbedMany({
        model: getEmbeddingModel(provider as ModelProvider, modelName),
        values,
      });

      return Response.json({
        values: result.values,
        embeddings: result.embeddings,
        usage: result.usage,
      });
    }
  );
}
