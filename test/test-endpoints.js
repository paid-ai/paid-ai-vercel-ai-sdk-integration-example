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

async function runTests() {
  console.log('🚀 Starting AI SDK wrapper tests...');
  console.log('Make sure your Next.js dev server is running on localhost:3000\n');

  // Test generateText
  await testEndpoint('/generate-text', {
    prompt: 'Write a haiku about programming',
    system: 'You are a helpful poetry assistant'
  }, true);

  // Test generateObject
  await testEndpoint('/generate-object', {
    prompt: 'Create a profile for a software engineer named Alice who loves TypeScript'
  }, true);

  // Test embed
  await testEndpoint('/embed', {
    value: 'The quick brown fox jumps over the lazy dog'
  }, false);

  // Test embedMany
  await testEndpoint('/embed-many', {
    values: [
      'Machine learning is fascinating',
      'TypeScript provides excellent type safety',
      'Next.js makes React development easier'
    ]
  }, false);

  // Test streamText
  await testStreamEndpoint('/chat', {
    messages: [
      { role: 'user', content: 'Tell me a short story about a robot learning to paint. 100 words max.' }
    ]
  }, false);

  // Test streamObject
  await testStreamEndpoint('/stream-object', {
    prompt: 'Create a short engaging fantasy story. 100 words max.'
  }, true);

  console.log('\n🎉 All tests completed!');
}

runTests().catch(console.error);
