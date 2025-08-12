# Paid.ai Vercel AI SDK Integration Example

A Next.js chat application demonstrating how to instrument AI SDK applications with [paid.ai](https://paid.ai) for cost tracking and usage monitoring.

Get started at [app.paid.ai](https://app.paid.ai/) for free.

## What's Included

This example shows how to integrate Paid.ai's cost tracking and signal instrumentation into a Vercel AI SDK chat application:

- **Cost Tracking**: Automatic LLM token cost calculation and tracking. See [/api/chat/route.ts](src/app/api/chat/route.ts)
- **Usage Signals**: Custom event tracking for user interactions. See [/api/track-agent-usage/route.ts](src/app/api/track-agent-usage/route.ts)
- **Multiple Providers**: Support for OpenAI and Google AI models. See [/api/utils/client.ts](src/app/api/utils/client.ts)

## Get started

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Set your environment variables:
   ```bash
   PAID_API_TOKEN=your_paid_api_token # visit https://app.paid.ai/ to get started for free
   OPENAI_API_KEY=your_openai_key  # optional depending on the provider you wish to use
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_key  # optional depending on the provider you wish to use
   ```

3. Run the development server:
   ```bash
   yarn dev
   ```

4. Open [http://localhost:3847](http://localhost:3847) to chat with the agent

5. Go to https://app.paid.ai/ to see the collected results

## Implementation

The demo implements two main Paid.ai features:

1. **Automatic Cost Tracking** via `paidStreamText()` wrapper in `/api/chat`
  - Also see the other wrappers for AI SDK methods under /api
2. **Custom Usage Signals** via the Paid.ai client in `/api/track-agent-usage`

## Learn More

- [paid.ai](https://paid.ai) - Learn about how we help you monetize your agents
- [app.paid.ai](https://app.paid.ai/) - Try our platform out for free
