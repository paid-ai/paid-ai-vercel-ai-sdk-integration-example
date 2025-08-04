#!/usr/bin/env node

const API_BASE = 'http://localhost:3000/api';

async function testEndpoint(endpoint, data, resultPrint) {
  console.log(`\n🧪 Testing ${endpoint}...`);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (resultPrint) {
      console.log(`✅ ${endpoint} success:`, JSON.stringify(result, null, 2));
    } else {
      console.log(`✅ ${endpoint} success (printing keys only)`, JSON.stringify(Object.keys(result), null, 2));
    }
  } catch (error) {
    console.error(`❌ ${endpoint} failed:`, error.message);
  }
}

async function testStreamEndpoint(endpoint, data, resultPrint) {
  console.log(`\n🔄 Testing ${endpoint} (streaming)...`);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      result += chunk;
      if (resultPrint) {
        process.stdout.write(chunk);
      }
    }

    console.log(`\n✅ ${endpoint} streaming completed`);
  } catch (error) {
    console.error(`❌ ${endpoint} failed:`, error.message);
  }
}

// Test configurations
const testConfigs = {
  generateText: {
    prompt: 'Write a haiku about programming',
    system: 'You are a helpful poetry assistant'
  },
  generateObject: {
    prompt: 'Create a profile for a software engineer named Alice who loves TypeScript'
  },
  embed: {
    value: 'The quick brown fox jumps over the lazy dog'
  },
  embedMany: {
    values: [
      'Machine learning is fascinating',
      'TypeScript provides excellent type safety',
      'Next.js makes React development easier'
    ]
  },
  streamText: {
    messages: [
      { role: 'user', content: 'Tell me a short story about a robot learning to paint. 100 words max.' }
    ]
  },
  streamObject: {
    prompt: 'Create a short engaging fantasy story with brave heroes. 100 words max.'
  }
};

const providers = [
  { name: 'openai', displayName: 'OpenAI' },
  { name: 'google', displayName: 'Google', modelName: 'gemini-2.5-flash' }
];

async function testMultipleProviders(endpoint, config, resultPrint = true, isStream = false) {
  console.log(`\n📊 Testing ${endpoint} across providers:`);

  for (const provider of providers) {
    // Skip Google for embedding tests since it falls back to OpenAI anyway
    if ((endpoint.includes('embed')) && provider.name === 'google') {
      console.log(`⏭️  Skipping ${provider.displayName} for ${endpoint} (no embedding models)`);
      continue;
    }

    const testData = {
      ...config,
      provider: provider.name,
      ...(provider.modelName && { modelName: provider.modelName })
    };

    console.log(`  🧪 ${provider.displayName}:`);

    if (isStream) {
      await testStreamEndpoint(endpoint, testData, resultPrint);
    } else {
      await testEndpoint(endpoint, testData, resultPrint);
    }
  }
}

async function runTests() {
  console.log('🚀 Starting AI SDK wrapper tests with multiple providers...');
  console.log('Make sure your Next.js dev server is running on localhost:3000\n');

  // Test generateText across providers
  await testMultipleProviders('/generate-text', testConfigs.generateText, true);

  // Test generateObject across providers  
  await testMultipleProviders('/generate-object', testConfigs.generateObject, true);

  // Test embed (OpenAI only)
  await testMultipleProviders('/embed', testConfigs.embed, false);

  // Test embedMany (OpenAI only)
  await testMultipleProviders('/embed-many', testConfigs.embedMany, false);

  // Test streamText across providers
  await testMultipleProviders('/chat', testConfigs.streamText, false, true);

  // Test streamObject across providers
  await testMultipleProviders('/stream-object', testConfigs.streamObject, true, true);

  // Test with custom model names
  console.log('\n🔧 Testing custom model names...');
  await testEndpoint('/generate-text', {
    ...testConfigs.generateText,
    provider: 'openai',
    modelName: 'gpt-3.5-turbo'
  }, true);

  console.log('\n🎉 All multi-provider tests completed!');
}

runTests().catch(console.error);
