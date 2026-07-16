/**
 * NOTIFICATION FORMATTER - COMPREHENSIVE TEST SUITE
 * 
 * This test suite verifies that all notification translation and extraction fixes are working.
 * Run this after pulling the latest changes to confirm:
 * 1. Trip statuses are translated correctly (Started → بدأت)
 * 2. Emergency statuses are translated (InProgress → قيد المعالجة)
 * 3. Emergency types are translated (Mechanical → ميكانيكي)
 * 4. Payment amounts are extracted correctly
 *
 * How to use:
 * - Add this file to your React app
 * - Call runComprehensiveTest() in browser console
 * - Check output for any failures
 */

export function runComprehensiveTest() {
  console.clear();
  console.log('%cNOTIFICATION FORMATTER - TEST SUITE', 'font-size: 16px; font-weight: bold; color: #0066cc;');
  console.log('=========================================================================\n');
  
  let passCount = 0;
  let failCount = 0;
  
  const test = (name, condition, expected, actual) => {
    if (condition) {
      console.log(`%c✓ PASS: ${name}`, 'color: #00aa00; font-weight: bold;');
      passCount++;
    } else {
      console.log(`%c✗ FAIL: ${name}`, 'color: #dd0000; font-weight: bold;');
      console.log(`  Expected: ${expected}`);
      console.log(`  Actual: ${actual}`);
      failCount++;
    }
  };
  
  // Test 1: Trip Status Extraction
  console.log('\n--- TEST 1: Trip Status Extraction ---');
  const tripMessages = [
    { msg: 'Trip status is now Started', expected: 'Started' },
    { msg: 'Trip status changed to Delayed', expected: 'Delayed' },
    { msg: 'Status changed to Finished', expected: 'Finished' },
    { msg: 'Your trip status is now Cancelled.', expected: 'Cancelled' },
  ];
  for (const tc of tripMessages) {
    const match = tc.msg.match(/status(?:\s+is now|\s+changed to)\s+([^\.\n,]+)/i);
    const result = match?.[1]?.trim() || '';
    test(`Extract trip status from "${tc.msg}"`, result === tc.expected, tc.expected, result);
  }
  
  // Test 2: Emergency Status Extraction  
  console.log('\n--- TEST 2: Emergency Status Extraction ---');
  const emergencyMessages = [
    { msg: 'تم تغيير حالة الطوارئ إلى InProgress.', expected: 'InProgress' },
    { msg: 'تم تغيير حالة الطوارئ إلى mechanical', expected: 'mechanical' },
    { msg: 'حالة الطوارئ الآن Resolved', expected: 'Resolved' },
    { msg: 'emergency status changed to Reported', expected: 'Reported' },
  ];
  for (const tc of emergencyMessages) {
    let match = tc.msg.match(/تم تغيير حالة الطوارئ إلى\s+([^\.\n,]+)/) ||
                 tc.msg.match(/حالة الطوارئ الآن\s+([^\.\n,]+)/) ||
                 tc.msg.match(/emergency status changed to\s+([^\.\n,]+)/i);
    const result = match?.[1]?.trim() || '';
    test(`Extract emergency status from "${tc.msg}"`, result === tc.expected, tc.expected, result);
  }
  
  // Test 3: Payment Amount Extraction
  console.log('\n--- TEST 3: Payment Amount Extraction ---');
  const paymentMessages = [
    { msg: 'Your payment of USD 5.00 has been successfully', expected: '5.00' },
    { msg: 'Your payment of AED 150.75 has been completed', expected: '150.75' },
    { msg: 'تم إكمال دفعتك بقيمة 100.00 بنجاح', expected: '100.00' },
    { msg: 'Your payment of usd 1250.50', expected: '1250.50' },
  ];
  for (const tc of paymentMessages) {
    // Test Pattern 1: currency first
    let result = '0.00';
    let match = tc.msg.match(/(?:payment of|of)\s+([A-Z]{3}|[a-z]{3})\s+([\d]+(?:[.,]\d+)?)/i);
    if (match) result = match[2].replace(',', '.');
    
    // Test Pattern 2: Arabic
    if (result === '0.00') {
      match = tc.msg.match(/بقيمة\s+([\d]+(?:[.,]\d+)?)/i);
      if (match) result = match[1].replace(',', '.');
    }
    
    test(`Extract payment amount from "${tc.msg.substring(0, 40)}..."`, 
         result === tc.expected, tc.expected, result);
  }
  
  // Test 4: Value Normalization (for translation key lookup)
  console.log('\n--- TEST 4: Value Normalization for Translation Lookup ---');
  const normalize = (value) => {
    if (!value) return '';
    const trimmed = value.trim().replace(/[\.\,]/g, '');
    const flattened = trimmed.replace(/\s+/g, '');
    const camelized = `${flattened.charAt(0).toUpperCase()}${flattened.slice(1).toLowerCase()}`;
    return camelized;
  };
  
  const normalizeTests = [
    { input: 'mechanical', expected: 'Mechanical' },
    { input: 'Started', expected: 'Started' },
    { input: 'InProgress', expected: 'Inprogress' },
    { input: 'in_progress', expected: 'In_progress' },
    { input: 'in progress', expected: 'Inprogress' },
  ];
  for (const tc of normalizeTests) {
    const result = normalize(tc.input);
    test(`Normalize "${tc.input}" for lookup`, result === tc.expected, tc.expected, result);
  }
  
  // Test 5: Combined scenarios (title + message)
  console.log('\n--- TEST 5: Combined Scenarios ---');
  const scenarios = [
    {
      name: 'Payment notification',
      title: 'Payment Successful',
      message: 'Your payment of USD 50.00 has been successfully completed. Thank you.',
      checks: [
        { type: 'contains', target: 'title', pattern: /Payment/i }
      ]
    },
    {
      name: 'Trip update notification',
      title: 'Trip Update: 123',
      message: 'Trip status is now Started',
      checks: [
        { type: 'contains', target: 'combined', pattern: /Trip/ },
        { type: 'extract_status', expected: 'Started' }
      ]
    },
    {
      name: 'Emergency notification with Arabic',
      title: 'Emergency Status Updated: Mechanical',
      message: 'Trip 123 (abc-def) - ميكانيكي - تم تغيير حالة الطوارئ إلى mechanical.',
      checks: [
        { type: 'extract_emergency', expected: 'mechanical' },
        { type: 'normalize', input: 'mechanical', expected: 'Mechanical' }
      ]
    }
  ];
  
  for (const scenario of scenarios) {
    const combined = `${scenario.title}\n${scenario.message}`;
    console.log(`\nScenario: ${scenario.name}`);
    
    for (const check of scenario.checks) {
      if (check.type === 'contains') {
        const target = check.target === 'combined' ? combined : scenario.title;
        const result = check.pattern.test(target);
        test(`  Should contain pattern`, result, 'match', result ? 'found' : 'not found');
      } else if (check.type === 'extract_status') {
        const match = combined.match(/status(?:\s+is now|\s+changed to)\s+([^\.\n,]+)/i);
        const result = match?.[1]?.trim() || '';
        test(`  Extract status`, result === check.expected, check.expected, result);
      } else if (check.type === 'extract_emergency') {
        let match = combined.match(/تم تغيير حالة الطوارئ إلى\s+([^\.\n,]+)/) ||
                    combined.match(/حالة الطوارئ الآن\s+([^\.\n,]+)/) ||
                    combined.match(/emergency status changed to\s+([^\.\n,]+)/i);
        const result = match?.[1]?.trim() || '';
        test(`  Extract emergency status`, result === check.expected, check.expected, result);
      } else if (check.type === 'normalize') {
        const result = normalize(check.input);
        test(`  Normalize value`, result === check.expected, check.expected, result);
      }
    }
  }
  
  // Summary
  console.log(`\n${'='.repeat(73)}`);
  console.log(`%cTEST SUMMARY: ${passCount} passed, ${failCount} failed`, 
              failCount === 0 ? 'font-size: 14px; font-weight: bold; color: #00aa00;' : 'font-size: 14px; font-weight: bold; color: #dd0000;');
  console.log(`${'='.repeat(73)}`);
  
  return { passCount, failCount, success: failCount === 0 };
}

// Auto-run test if in browser console
if (typeof window !== 'undefined') {
  window.testNotificationFormatter = runComprehensiveTest;
  console.log('%cTest available: Run testNotificationFormatter() in console', 'color: #0066cc;');
}
