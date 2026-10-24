/**
 * CyberTutor AI - Smoke Test Script
 * Sends a realistic cybersecurity prompt through the active provider (Gemini API or Ollama)
 * and prints PASS or FAIL.
 *
 * Usage:
 *   npx tsx smoke_test.ts
 *   or:
 *   PROVIDER=api npx tsx smoke_test.ts
 *   PROVIDER=local npx tsx smoke_test.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { runSmokeTest, getActiveProvider, CONFIG } from './server/aiService';

async function main() {
  console.log('====================================================');
  console.log('       🛡️  CYBERTUTOR AI - SMOKE TEST SUITE          ');
  console.log('====================================================\n');

  const provider = getActiveProvider();
  console.log(`[Config] Active Provider : ${provider.toUpperCase()}`);
  if (provider === 'api') {
    console.log(`[Config] API Model       : ${CONFIG.apiModel}`);
    console.log(`[Config] API Key Status  : ${process.env.GEMINI_API_KEY ? 'Present (configured)' : 'MISSING (check .env / secrets)'}`);
  } else {
    console.log(`[Config] Ollama Endpoint : ${CONFIG.ollamaEndpoint}`);
    console.log(`[Config] Ollama Model    : ${CONFIG.ollamaModel}`);
  }

  console.log('\n[Test 1/1] Dispatching realistic cybersecurity inquiry...');
  console.log('----------------------------------------------------');

  const result = await runSmokeTest();

  console.log(`Sample Prompt: "${result.sampleInput}"`);
  console.log('----------------------------------------------------');
  console.log(`Latency       : ${result.latencyMs}ms`);
  console.log(`Used Model    : ${result.model}`);

  if (result.pass) {
    console.log('\n[Response Received]:');
    console.log(result.sampleOutput);
    console.log('----------------------------------------------------');
    console.log('\n>> RESULT: PASS\n');
    console.log('All safety checks and teaching pipeline tests passed successfully.');
    process.exit(0);
  } else {
    console.error('\n[Error Encountered]:');
    console.error(result.error || 'Output failed validation criteria.');
    if (result.sampleOutput) {
      console.error(`Received: ${result.sampleOutput}`);
    }
    console.log('----------------------------------------------------');
    console.log('\n>> RESULT: FAIL\n');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\nFatal test execution error:', err);
  console.log('\n>> RESULT: FAIL\n');
  process.exit(1);
});
