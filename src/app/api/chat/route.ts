import { convertToModelMessages, UIMessage } from 'ai';
import { getModel, ModelProvider } from '../utils/models';
import { paidStreamText } from '@paid-ai/paid-node';
import { getClient } from '../../../lib/client';

export async function POST(req: Request) {
  const { messages, provider, modelName }: { messages: UIMessage[], provider: string, modelName: string } = await req.json();
  const client = await getClient();

  const result = await client.trace('external-customer-id', async () => {
    return paidStreamText({
      model: getModel(provider as ModelProvider, modelName),
      messages: convertToModelMessages(messages),
    });
  });

  return result.toUIMessageStreamResponse();
}