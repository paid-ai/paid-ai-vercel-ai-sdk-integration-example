import { openai } from '@ai-sdk/openai';
import { paidEmbedMany } from '@paid-ai/paid-node';
import { getClient } from '../utils/client';

// Allow requests up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { values } = await req.json();

  const client = await getClient();

  return await client.trace(
    "customer-with-external-id", async () => {
      const result = await paidEmbedMany({
        model: openai.embedding('text-embedding-3-small'),
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