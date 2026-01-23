const judge0Service = require('./judge0Service');

class CodeExecutionService {
  // Execute JavaScript code (Judge0)
  async executeJavaScript(code, testCases = []) {
    try {
      const wrappedCode = this.wrapJavaScriptCode(code, testCases);
      const testResults = [];
      
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const input = Array.isArray(testCase.input) ? testCase.input.join('\n') : testCase.input;
        const expected = testCase.expectedOutput;
        
        const result = await judge0Service.run({
          language: 'javascript',
          code: wrappedCode,
          input: input
        });
        
        const actual = result.stdout ? result.stdout.trim() : '';
        const passed = JSON.stringify(actual) === JSON.stringify(expected);
        
        testResults.push({
          testCase: i + 1,
          input: testCase.input,
          expected: expected,
          actual: actual,
          passed: passed,
          error: result.stderr || null
        });
      }

      return {
        success: true,
        output: testResults.map(t => t.actual).join('\n'),
        testResults
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        output: '',
        testResults: []
      };
    }
  }

  // Execute Java code (Judge0)
  async executeJava(code, testCases = []) {
    try {
      const wrappedCode = this.wrapJavaCode(code, testCases);
      const testResults = [];
      
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const input = Array.isArray(testCase.input) ? testCase.input.join('\n') : testCase.input;
        const expected = testCase.expectedOutput;
        
        const result = await judge0Service.run({
          language: 'java',
          code: wrappedCode,
          input: input
        });
        
        const actual = result.stdout ? result.stdout.trim() : '';
        const passed = JSON.stringify(actual) === JSON.stringify(expected);
        
        testResults.push({
          testCase: i + 1,
          input: testCase.input,
          expected: expected,
          actual: actual,
          passed: passed,
          error: result.stderr || null
        });
      }

      return {
        success: true,
        output: testResults.map(t => t.actual).join('\n'),
        testResults
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        output: '',
        testResults: []
      };
    }
  }

  // Execute Python code (Judge0)
  async executePython(code, testCases = []) {
    try {
      const wrappedCode = this.wrapPythonCode(code, testCases);
      const testResults = [];
      
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const input = Array.isArray(testCase.input) ? testCase.input.join('\n') : testCase.input;
        const expected = testCase.expectedOutput;
        
        const result = await judge0Service.run({
          language: 'python',
          code: wrappedCode,
          input: input
        });
        
        const actual = result.stdout ? result.stdout.trim() : '';
        const passed = JSON.stringify(actual) === JSON.stringify(expected);
        
        testResults.push({
          testCase: i + 1,
          input: testCase.input,
          expected: expected,
          actual: actual,
          passed: passed,
          error: result.stderr || null
        });
      }

      return {
        success: true,
        output: testResults.map(t => t.actual).join('\n'),
        testResults
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        output: '',
        testResults: []
      };
    }
  }

  // Wrap JavaScript code with test cases
  wrapJavaScriptCode(userCode, testCases) {
    // For scratch format, we just return the user code as-is
    // Test cases will be handled by feeding input via stdin
    return userCode;
  }

  // Wrap Python code with test cases
  wrapPythonCode(userCode, testCases) {
    // For scratch format, we just return the user code as-is
    // Test cases will be handled by feeding input via stdin
    return userCode;
  }

  // Wrap Java code with test cases
  wrapJavaCode(userCode, testCases) {
    // For scratch format, we just return the user code as-is
    // Test cases will be handled by feeding input via stdin
    return userCode;
  }

  // Execute C++ code (Judge0)
  async executeCpp(code, testCases = []) {
    try {
      const wrappedCode = this.wrapCppCode(code, testCases);
      const testResults = [];
      
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const input = Array.isArray(testCase.input) ? testCase.input.join('\n') : testCase.input;
        const expected = testCase.expectedOutput;
        
        const result = await judge0Service.run({
          language: 'cpp',
          code: wrappedCode,
          input: input
        });
        
        const actual = result.stdout ? result.stdout.trim() : '';
        const passed = JSON.stringify(actual) === JSON.stringify(expected);
        
        testResults.push({
          testCase: i + 1,
          input: testCase.input,
          expected: expected,
          actual: actual,
          passed: passed,
          error: result.stderr || null
        });
      }

      return {
        success: true,
        output: testResults.map(t => t.actual).join('\n'),
        testResults
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        output: '',
        testResults: []
      };
    }
  }

  // Wrap C++ code with test cases
  wrapCppCode(userCode, testCases) {
    // For scratch format, we just return the user code as-is
    // Test cases will be handled by feeding input via stdin
    return userCode;
  }

  // Parse Judge0 results for our test wrapper output (JSON lines)
  parseJudge0TestRun(result, testCases) {
    const stdout = result?.stdout || '';
    const stderr = result?.stderr || '';
    const compileOutput = result?.compile_output || '';
    const statusDesc = result?.status_description || 'Unknown';

    // Compilation errors, runtime errors, or any non-empty stderr should surface as failure
    if (compileOutput) {
      return {
        success: false,
        error: 'Compilation error',
        output: stdout,
        stderr,
        compileOutput,
        status: statusDesc,
        testResults: []
      };
    }

    // If the wrapper ran, stdout should contain JSON lines; otherwise, include stderr
    if (statusDesc && statusDesc !== 'Accepted' && statusDesc !== 'Finished') {
      // Judge0 uses many terminal statuses; keep consistent error reporting.
      // We'll still try to parse stdout if present.
    }

    const lines = String(stdout).trim() ? String(stdout).trim().split('\n') : [];
    const testResults = [];

    for (const line of lines) {
      try {
        testResults.push(JSON.parse(line));
      } catch {
        // ignore non-json lines
      }
    }

    if (!testCases || testCases.length === 0) {
      // Non-test execution (used by realtime runner)
      return {
        success: statusDesc === 'Accepted',
        output: stdout,
        stderr,
        status: statusDesc,
        testResults: []
      };
    }

    const passedTests = testResults.filter((t) => t && t.passed).length;
    const totalTests = testCases.length;

    // If the wrapper printed structured results, consider it success even if some tests failed.
    // (The caller uses summary to display pass/fail counts.)
    return {
      success: true,
      output: stdout,
      stderr,
      status: statusDesc,
      testResults,
      summary: {
        passed: passedTests,
        total: totalTests,
        percentage: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
      }
    };
  }

  // Main execution method
  async executeCode(language, code, testCases = []) {
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
        return await this.executeJavaScript(code, testCases);
      case 'python':
      case 'py':
        return await this.executePython(code, testCases);
      case 'java':
        return await this.executeJava(code, testCases);
      case 'cpp':
      case 'c':
        return await this.executeCpp(code, testCases);
      default:
        return {
          success: false,
          error: `Language ${language} is not supported yet`,
          output: '',
          testResults: []
        };
    }
  }

  // Analyze code complexity (basic implementation)
  analyzeComplexity(code, language) {
    const analysis = {
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      suggestions: []
    };

    // Basic pattern matching for complexity analysis
    if (code.includes('for') && code.includes('for')) {
      analysis.timeComplexity = 'O(n²)';
      analysis.suggestions.push('Consider optimizing nested loops');
    } else if (code.includes('for') || code.includes('while')) {
      analysis.timeComplexity = 'O(n)';
    }

    if (code.includes('[]') || code.includes('{}') || code.includes('new ')) {
      analysis.spaceComplexity = 'O(n)';
    }

    // Provide a simple numeric indicator for UI scoring.
    // 1 = best (O(1)), 2 = O(n), 3 = O(n log n), 4 = O(n^2) or worse
    const time = analysis.timeComplexity;
    let complexity = 2;
    if (time === 'O(1)') complexity = 1;
    else if (time === 'O(n log n)') complexity = 3;
    else if (time === 'O(n²)' || time === 'O(n^2)') complexity = 4;
    analysis.complexity = complexity;

    return analysis;
  }
}

module.exports = new CodeExecutionService();
