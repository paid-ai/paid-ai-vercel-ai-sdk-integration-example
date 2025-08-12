import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { getModel, ModelProvider } from '../utils/models';

export async function POST(req: Request) {
  const { messages, provider, modelName }: { messages: UIMessage[], provider: string, modelName: string } = await req.json();

  const result = streamText({
    model: getModel(provider as ModelProvider, modelName),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
