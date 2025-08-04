import { openai } from '@ai-sdk/openai';
import { paidStreamObject } from '@paid-ai/paid-node';
import { getClient } from '../utils/client';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const client = await getClient();

  return await client.trace(
    "customer-with-external-id", async () => {
      // Example schema for streaming object generation
      const schema = z.object({
        story: z.string().describe('A creative story'),
        characters: z.array(z.object({
          name: z.string().describe('Character name'),
          role: z.string().describe('Character role in the story'),
        })).describe('List of characters in the story'),
        theme: z.string().describe('The main theme of the story'),
      });

      const result = await paidStreamObject({
        model: openai('gpt-4o'),
        prompt,
        schema,
        onFinish: (result) => {
          console.log('Stream object finished:', result.usage);
        },
      });

      return result.toTextStreamResponse();
    }
  );
}