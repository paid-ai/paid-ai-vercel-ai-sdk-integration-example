import { convertToModelMessages, UIMessage } from 'ai';
import { getClient } from '../utils/client';
import { openai } from '@ai-sdk/openai';
import { paidStreamText } from '@paid-ai/paid-node/vercel';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const client = await getClient();

  return await client.trace(
    "customer-with-external-id", async () => {
      const result = await paidStreamText({
        model: openai("gpt-4o"),
        messages: convertToModelMessages(messages),
      });

      return result.toUIMessageStreamResponse();
    }
  );
}
