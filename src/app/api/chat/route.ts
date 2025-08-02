import { openai } from '@ai-sdk/openai';
import { paidStreamText } from '@paid-ai/paid-node';
import { getClient } from '../utils/client';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const client = await getClient();

  return await client.trace(
    "customer-with-external-id", async () => {
      const result = await paidStreamText({
        model: openai('gpt-4o'),
        messages,
      });
      
      return result.toDataStreamResponse();
    }
  );
}
