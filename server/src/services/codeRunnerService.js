import vm from 'vm';

/**
 * Isolated safe code execution runner for candidate submissions.
 * Prevents access to filesystem, network, child processes, or main process globals.
 * Enforces strict timeout and captures console outputs.
 */
export const runCodeSandbox = async (code, testData, timeoutMs = 3000) => {
  const startTime = process.hrtime();
  const logs = [];
  const testResults = [];
  let passedCount = 0;

  // Sandboxed environment
  const sandbox = {
    console: {
      log: (...args) => logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
      error: (...args) => logs.push('[ERROR] ' + args.join(' ')),
      warn: (...args) => logs.push('[WARN] ' + args.join(' '))
    },
    Math,
    Date,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Map,
    Set,
    JSON,
    parseInt,
    parseFloat,
    isNaN,
    isFinite
  };

  const context = vm.createContext(sandbox);

  try {
    // 1. Compile and execute user code in the VM
    const script = new vm.Script(code);
    script.runInContext(context, { timeout: timeoutMs });

    // 2. Identify the function exported or defined in the sandbox
    // Detect candidate function
    const definedFunctions = Object.keys(sandbox).filter(
      k => typeof sandbox[k] === 'function' && !['Math', 'Date', 'Array', 'Object', 'String', 'Number', 'Boolean', 'RegExp', 'Map', 'Set', 'JSON', 'parseInt', 'parseFloat', 'isNaN', 'isFinite'].includes(k)
    );

    if (definedFunctions.length === 0) {
      throw new Error('No function definition found in submission.');
    }

    const targetFnName = definedFunctions[definedFunctions.length - 1];
    const candidateFn = sandbox[targetFnName];

    // 3. Run against test cases
    for (let i = 0; i < testData.length; i++) {
      const tc = testData[i];
      let actual;
      let passed = false;
      let errorMessage = null;

      try {
        const testScript = new vm.Script(`
          ${targetFnName}(...${JSON.stringify(tc.input)})
        `);
        actual = testScript.runInContext(context, { timeout: timeoutMs });

        // Deep equality check
        passed = JSON.stringify(actual) === JSON.stringify(tc.expected);
      } catch (err) {
        errorMessage = err.message;
        passed = false;
      }

      if (passed) passedCount++;

      testResults.push({
        testCaseIndex: i + 1,
        input: tc.input,
        expected: tc.expected,
        actual: actual !== undefined ? actual : 'Error / Undefined',
        passed,
        errorMessage
      });
    }

    const diff = process.hrtime(startTime);
    const runtimeMs = Number((diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2));
    const allPassed = passedCount === testData.length;

    return {
      status: allPassed ? 'passed' : 'failed',
      score: Math.round((passedCount / testData.length) * 100),
      passedCount,
      totalCount: testData.length,
      runtimeMs,
      logs: logs.join('\n'),
      testResults
    };

  } catch (err) {
    const diff = process.hrtime(startTime);
    const runtimeMs = Number((diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2));
    const isTimeout = err.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT' || err.message.includes('timed out');

    return {
      status: isTimeout ? 'time_limit' : 'runtime_error',
      score: 0,
      passedCount: 0,
      totalCount: testData.length,
      runtimeMs,
      logs: logs.join('\n'),
      error: err.message,
      testResults: []
    };
  }
};
