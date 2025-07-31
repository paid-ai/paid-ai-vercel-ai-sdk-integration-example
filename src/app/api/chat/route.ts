import { openai } from '@ai-sdk/openai';
import { PaidAISDKOpenAI } from '@paid-ai/paid-node';
import { getClient } from '../utils/client';
import { StreamTextResult, ToolSet } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  debugger;
  const client = await getClient();

  const wrapper = new PaidAISDKOpenAI();

  let result: StreamTextResult<ToolSet, never>;
  await client.trace(
    "customer-with-external-id", async () => {
      result = wrapper.streamText({
        model: openai('gpt-4o'),
        messages,
      })
    }
  )

  if (!result) {
    throw Error('Failed to stream text');
  }

  return result.toDataStreamResponse();
}
