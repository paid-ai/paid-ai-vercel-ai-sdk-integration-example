import { openai } from '@ai-sdk/openai';
import { paidGenerateObject } from '@paid-ai/paid-node';
import { getClient } from '../utils/client';
import { z } from 'zod';

// Allow requests up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt, schema: schemaData } = await req.json();

  const client = await getClient();

  return await client.trace(
    "customer-with-external-id", async () => {
      // Example schema - in a real app, you'd pass this from the client or define it based on the use case
      const schema = z.object({
        name: z.string().describe('The name of the person'),
        age: z.number().describe('The age of the person'),
        occupation: z.string().describe('The occupation of the person'),
      });

      const result = await paidGenerateObject({
        model: openai('gpt-4o'),
        prompt,
        schema,
      });

      return Response.json({
        object: result.object,
        usage: result.usage,
        finishReason: result.finishReason,
      });
    }
  );
}
