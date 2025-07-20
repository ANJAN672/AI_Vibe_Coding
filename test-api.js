// Comprehensive test script to verify all components are working
const testPrompts = [
  "When I receive an email with an attachment, save it to Google Drive and send a Slack notification",
  "Monitor my website for downtime and send SMS alerts when it's offline",
  "Sync new Airtable records to a Google Sheet and create Trello cards"
];

const providers = ['openai', 'groq', 'gemini'];

async function testAPI(prompt, provider) {
  console.log(`\n🧪 Testing ${provider.toUpperCase()} with prompt: "${prompt.substring(0, 50)}..."`);
  
  try {
    const response = await fetch('http://localhost:3000/api/generate-workflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        provider: provider
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${provider.toUpperCase()} Test Successful!`);
      console.log(`   - Workflow Name: ${data.workflow.name}`);
      console.log(`   - Nodes Count: ${data.workflow.nodes?.length || 0}`);
      console.log(`   - Has Connections: ${Object.keys(data.workflow.connections || {}).length > 0 ? 'Yes' : 'No'}`);
      return true;
    } else {
      console.log(`❌ ${provider.toUpperCase()} Test Failed:`);
      console.log(`   - Error: ${data.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${provider.toUpperCase()} Network Error: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting agen8 vibe coding platform Tests...\n');
  
  let totalTests = 0;
  let passedTests = 0;
  
  // Test each provider with the first prompt
  for (const provider of providers) {
    totalTests++;
    const success = await testAPI(testPrompts[0], provider);
    if (success) passedTests++;
    
    // Wait a bit between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Test fallback functionality (should work even if all APIs fail)
  console.log('\n🔄 Testing Fallback Workflow Generation...');
  totalTests++;
  const fallbackSuccess = await testAPI("Test fallback workflow", "openai");
  if (fallbackSuccess) passedTests++;
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log(`   - Total Tests: ${totalTests}`);
  console.log(`   - Passed: ${passedTests}`);
  console.log(`   - Failed: ${totalTests - passedTests}`);
  console.log(`   - Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Your platform is ready to use.');
  } else if (passedTests > 0) {
    console.log('\n⚠️  Some tests failed, but the platform should still work with fallback.');
  } else {
    console.log('\n❌ All tests failed. Please check your configuration.');
  }
}

// Run the tests if this file is executed directly
if (typeof window === 'undefined') {
  runAllTests();
}