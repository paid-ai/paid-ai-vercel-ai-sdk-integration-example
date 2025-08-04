import { paidStreamObject } from '@paid-ai/paid-node';
import { getClient } from '../utils/client';
import { getModel, type ModelProvider } from '../utils/models';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt, provider, modelName } = await req.json();

  const client = await getClient();

  return await client.trace(
    "customer-with-external-id", async () => {
      const schema = z.object({
        story: z.string().describe('A creative story'),
        characters: z.array(z.object({
          name: z.string().describe('Character name'),
          role: z.string().describe('Character role in the story'),
        })).describe('List of characters in the story'),
        theme: z.string().describe('The main theme of the story'),
      });

      const result = await paidStreamObject({
        model: getModel(provider as ModelProvider, modelName),
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