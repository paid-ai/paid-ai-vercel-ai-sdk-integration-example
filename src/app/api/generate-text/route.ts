import { paidGenerateText } from '@paid-ai/paid-node';
import { getClient } from '../utils/client';
import { getModel, type ModelProvider } from '../utils/models';

// Allow requests up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt, system, provider, modelName } = await req.json();

  const client = await getClient();

  return await client.trace(
    "customer-with-external-id", async () => {
      const result = await paidGenerateText({
        model: getModel(provider as ModelProvider, modelName),
        prompt,
        system,
      });

      return Response.json({
        text: result.text,
        usage: result.usage,
        finishReason: result.finishReason,
      });
    }
  );
}
