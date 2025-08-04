import { paidGenerateObject } from '@paid-ai/paid-node';
import { getClient } from '../utils/client';
import { getModel, type ModelProvider } from '../utils/models';
import { z } from 'zod';

// Allow requests up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt, provider, modelName } = await req.json();

  const client = await getClient();

  return await client.trace(
    "customer-with-external-id", async () => {
      const schema = z.object({
        name: z.string().describe('The name of the person'),
        age: z.number().describe('The age of the person'),
        occupation: z.string().describe('The occupation of the person'),
      });

      const result = await paidGenerateObject({
        model: getModel(provider as ModelProvider, modelName),
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
