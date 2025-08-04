import { openai } from '@ai-sdk/openai';
import { paidGenerateText } from '@paid-ai/paid-node';
import { getClient } from '../utils/client';

// Allow requests up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt, system } = await req.json();

  const client = await getClient();

  return await client.trace(
    "customer-with-external-id", async () => {
      const result = await paidGenerateText({
        model: openai('gpt-4o'),
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