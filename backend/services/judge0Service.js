const axios = require('axios');

/**
 * Judge0 Community Edition integration (official free endpoint).
 *
 * Endpoint:
 *   https://ce.judge0.com
 *
 * Flow:
 * 1) Submit code: POST /submissions?base64_encoded=false&wait=false => { token }
 * 2) Poll result: GET /submissions/{token}?base64_encoded=false until status is not In Queue/Processing
 *
 * Notes:
 * - We never execute arbitrary user code locally.
 * - Judge0 CE does not require API keys or credit cards.
 * - Optional env var:
 *   - JUDGE0_BASE_URL (defaults to https://ce.judge0.com)
 */

const DEFAULT_BASE_URL = 'https://ce.judge0.com';

const LANGUAGE_NAME_TO_ID = {
  python: 71,
  java: 62,
  c: 50,
  cpp: 54,
  javascript: 63,
  js: 63,
  py: 71
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class Judge0Service {
  constructor() {
    this.client = axios.create({
      baseURL: process.env.JUDGE0_BASE_URL || DEFAULT_BASE_URL,
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.isConfigured = true;
  }

  /**
   * Map language name to Judge0 language_id.
   */
  getLanguageId(language) {
    const key = String(language || '').trim().toLowerCase();
    return LANGUAGE_NAME_TO_ID[key] || null;
  }

  /**
   * Submit a Judge0 execution.
   */
  async createSubmission({ languageId, sourceCode, stdin }) {
    const response = await this.client.post(
      '/submissions',
      {
        language_id: languageId,
        source_code: sourceCode,
        stdin: stdin || ''
      },
      {
        params: {
          base64_encoded: 'false',
          wait: 'false'
        }
      }
    );

    return response.data;
  }

  /**
   * Fetch a submission result.
   */
  async getSubmission(token) {
    const response = await this.client.get(`/submissions/${encodeURIComponent(token)}`, {
      params: {
        base64_encoded: 'false'
      }
    });

    return response.data;
  }

  /**
   * Execute code on Judge0 and poll until finished.
   */
  async run({ language, code, input, pollIntervalMs = 800, maxPolls = 30 }) {
    const languageId = this.getLanguageId(language);
    if (!languageId) {
      const err = new Error(`Unsupported language: ${language}`);
      err.code = 'UNSUPPORTED_LANGUAGE';
      throw err;
    }

    const submission = await this.createSubmission({
      languageId,
      sourceCode: code,
      stdin: input
    });

    const token = submission?.token;
    if (!token) {
      const err = new Error('Failed to create Judge0 submission (missing token)');
      err.code = 'JUDGE0_NO_TOKEN';
      throw err;
    }

    // Judge0 status ids:
    // 1 = In Queue, 2 = Processing
    // Others indicate a terminal state.
    let last = null;
    for (let i = 0; i < maxPolls; i += 1) {
      last = await this.getSubmission(token);
      const statusId = last?.status?.id;

      if (statusId && statusId !== 1 && statusId !== 2) {
        break;
      }

      await sleep(pollIntervalMs);
    }

    if (!last) {
      const err = new Error('Failed to retrieve Judge0 submission result');
      err.code = 'JUDGE0_NO_RESULT';
      throw err;
    }

    const statusId = last?.status?.id;
    if (!statusId || statusId === 1 || statusId === 2) {
      const err = new Error('Judge0 timed out while processing submission');
      err.code = 'JUDGE0_TIMEOUT';
      throw err;
    }

    return {
      token,
      stdout: last.stdout || '',
      stderr: last.stderr || '',
      compile_output: last.compile_output || '',
      time: last.time || null,
      memory: last.memory || null,
      status: last.status || null,
      status_description: last.status?.description || 'Unknown'
    };
  }
}

module.exports = new Judge0Service();
module.exports.LANGUAGE_NAME_TO_ID = LANGUAGE_NAME_TO_ID;
