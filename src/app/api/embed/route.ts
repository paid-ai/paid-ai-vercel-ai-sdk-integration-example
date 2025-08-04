import { openai } from '@ai-sdk/openai';
import { paidEmbed } from '@paid-ai/paid-node';
import { getClient } from '../utils/client';

// Allow requests up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { value } = await req.json();

  const client = await getClient();

  return await client.trace(
    "customer-with-external-id", async () => {
      const result = await paidEmbed({
        model: openai.embedding('text-embedding-3-small'),
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