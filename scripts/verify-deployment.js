#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Run this script to verify your deployment is working correctly
 */

const https = require('https');
const http = require('http');

const DEPLOYMENT_URL = process.argv[2] || 'https://your-app.vercel.app';

console.log('🔍 Verifying deployment at:', DEPLOYMENT_URL);
console.log('=' .repeat(60));

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https:') ? https : http;
    
    const req = lib.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.abort();
      reject(new Error('Request timeout'));
    });
  });
}

async function testEndpoint(path, description) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`   URL: ${DEPLOYMENT_URL}${path}`);
    
    const result = await makeRequest(`${DEPLOYMENT_URL}${path}`);
    
    if (result.status === 200) {
      console.log('   ✅ Success');
      if (typeof result.data === 'object') {
        console.log('   📊 Response:', JSON.stringify(result.data, null, 2).substring(0, 200) + '...');
      }
    } else {
      console.log(`   ❌ Failed (Status: ${result.status})`);
    }
    
    return result.status === 200;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function verifyDeployment() {
  console.log('Starting deployment verification...\n');
  
  const tests = [
    ['/', 'Home page loads'],
    ['/api/health', 'Health check endpoint'],
    ['/api/debug-supabase', 'Supabase connection test'],
  ];
  
  let passedTests = 0;
  
  for (const [path, description] of tests) {
    const passed = await testEndpoint(path, description);
    if (passed) passedTests++;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Results: ${passedTests}/${tests.length} tests passed`);
  
  if (passedTests === tests.length) {
    console.log('🎉 All tests passed! Deployment is healthy.');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.');
    process.exit(1);
  }
}

// Usage information
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Usage: node verify-deployment.js [URL]

Examples:
  node scripts/verify-deployment.js https://your-app.vercel.app
  node scripts/verify-deployment.js http://localhost:3000

If no URL is provided, it will use: ${DEPLOYMENT_URL}
`);
  process.exit(0);
}

verifyDeployment().catch(error => {
  console.error('💥 Verification failed:', error);
  process.exit(1);
});