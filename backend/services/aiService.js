const { GoogleGenerativeAI } = require('@google/generative-ai');
const { jsonrepair } = require('jsonrepair');

function stripCodeFences(text) {
  if (!text) return '';
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

function extractBalancedJsonSubstring(text) {
  if (!text) return null;

  const cleaned = stripCodeFences(text);
  const firstObj = cleaned.indexOf('{');
  const firstArr = cleaned.indexOf('[');

  let start = -1;
  let openChar = '';
  let closeChar = '';

  if (firstObj === -1 && firstArr === -1) return null;
  if (firstArr !== -1 && (firstObj === -1 || firstArr < firstObj)) {
    start = firstArr;
    openChar = '[';
    closeChar = ']';
  } else {
    start = firstObj;
    openChar = '{';
    closeChar = '}';
  }

  let depth = 0;
  let inString = false;
  let stringQuote = '';
  let escaped = false;

  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === stringQuote) {
        inString = false;
        stringQuote = '';
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      stringQuote = ch;
      continue;
    }

    if (ch === openChar) depth += 1;
    else if (ch === closeChar) depth -= 1;

    if (depth === 0) {
      return cleaned.slice(start, i + 1);
    }
  }

  return null;
}

function parseAiJson(text) {
  const cleaned = stripCodeFences(text);
  if (!cleaned) throw new Error('AI response was empty');

  const attempts = [];
  const balanced = extractBalancedJsonSubstring(cleaned);

  // Try whole cleaned response first (best case: strict JSON)
  attempts.push(cleaned);
  if (balanced && balanced !== cleaned) attempts.push(balanced);

  for (const candidate of attempts) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Try to repair common issues (trailing commas, unescaped characters, etc.)
      try {
        return JSON.parse(jsonrepair(candidate));
      } catch {
        // keep trying
      }
    }
  }

  throw new Error('AI response was not valid JSON');
}

function extractFirstJsonObject(text) {
  return parseAiJson(text);
}

class AIService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('⚠️  Gemini API key not configured. AI features are disabled.');
      this.model = null;
      this.modelName = null;
      return;
    }

    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: this.modelName });
  }

  // Check if Gemini is available
  isAvailable() {
    return this.model !== null;
  }

  // Generate interview questions based on company and role
  async generateInterviewQuestions(params) {
    const { company, role, difficulty, questionTypes, count = 5 } = params;

    if (!this.isAvailable()) {
      throw new Error('AI is not configured (missing GEMINI_API_KEY)');
    }

    const prompt = `Generate ${count} interview questions for a ${role} position at ${company}.
    Difficulty level: ${difficulty}
    Question types: ${questionTypes.join(', ')}

    For each question, provide:
    1. Question type (coding/behavioral/technical/system-design)
    2. Difficulty level
    3. Question title
    4. Detailed description
    5. For coding questions: include constraints, examples, and test cases
    6. For behavioral questions: include STAR method guidance
    7. Expected time to solve (in minutes)
    8. Relevant tags/topics

    Return the response in JSON format with an array of questions.`;

    try {
      const content = await this.generateJson({
        system:
          'You are an expert technical interviewer who creates realistic, company-specific interview questions. Always respond with valid JSON.',
        prompt,
        temperature: 0.7,
        maxTokens: 3000
      });

      return content;
    } catch (error) {
      console.error('Error generating questions:', error);
      throw new Error('Failed to generate interview questions');
    }
  }

  // Evaluate coding solution
  async evaluateCode(params) {
    const { code, language, question, testCases } = params;

    const prompt = `Evaluate this ${language} code solution for the given problem:

    Problem: ${question.title}
    Description: ${question.description}
    
    Code Solution:
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Test Cases: ${JSON.stringify(testCases)}
    
    Please provide a comprehensive evaluation including:
    1. Correctness (does it solve the problem?)
    2. Time complexity analysis
    3. Space complexity analysis
    4. Code quality and style
    5. Edge case handling
    6. Optimization suggestions
    7. Overall score (0-100)
    8. Detailed feedback and suggestions
    
    Return the response in JSON format.`;

    try {
      return await this.generateJson({
        system:
          'You are an expert code reviewer and technical interviewer. Provide detailed, constructive feedback on code solutions. Always respond with valid JSON.',
        prompt,
        temperature: 0.3,
        maxTokens: 2000
      });
    } catch (error) {
      console.error('Error evaluating code:', error);
      throw new Error('Failed to evaluate code solution');
    }
  }

  // Evaluate behavioral answer
  async evaluateBehavioralAnswer(params) {
    const { question, answer, timeSpent } = params;

    const prompt = `Evaluate this behavioral interview answer:

    Question: ${question}
    Answer: ${answer}
    Time spent: ${timeSpent} seconds
    
    Please evaluate based on:
    1. STAR method usage (Situation, Task, Action, Result)
    2. Clarity and structure
    3. Relevance to the question
    4. Specific examples and details
    5. Leadership and problem-solving demonstration
    6. Communication effectiveness
    7. Overall score (0-100)
    8. Specific feedback and improvement suggestions
    
    Return the response in JSON format.`;

    try {
      return await this.generateJson({
        system:
          'You are an expert behavioral interviewer and HR professional. Evaluate answers based on industry best practices and the STAR method. Always respond with valid JSON.',
        prompt,
        temperature: 0.3,
        maxTokens: 1500
      });
    } catch (error) {
      console.error('Error evaluating behavioral answer:', error);
      throw new Error('Failed to evaluate behavioral answer');
    }
  }

  // Generate preparation guide
  async generatePreparationGuide(params) {
    const { company, role, userProfile, experience } = params;

    const prompt = `Create a comprehensive interview preparation guide for:
    
    Company: ${company}
    Role: ${role}
    Experience Level: ${experience}
    User Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
    Target Languages: ${userProfile.preferredLanguages?.join(', ') || 'JavaScript'}
    
    Include:
    1. Company overview and culture
    2. Role-specific requirements and expectations
    3. Interview process breakdown (rounds, types, duration)
    4. Technical topics to focus on
    5. Behavioral questions likely to be asked
    6. System design topics (if applicable)
    7. Recommended study timeline (1-4 weeks)
    8. Practice resources and materials
    9. Day-of-interview tips
    10. Common mistakes to avoid
    
    Make it personalized and actionable. Return in JSON format with structured sections.`;

    try {
      return await this.generateJson({
        system:
          'You are an expert career coach and interview preparation specialist. Create detailed, personalized preparation guides. Always respond with valid JSON.',
        prompt,
        temperature: 0.7,
        maxTokens: 4000
      });
    } catch (error) {
      console.error('Error generating preparation guide:', error);
      throw new Error('Failed to generate preparation guide');
    }
  }

  // Generate personalized feedback
  async generatePersonalizedFeedback(params) {
    const { userStats, recentPerformance, skillGaps } = params;

    const prompt = `Generate personalized feedback and recommendations based on user performance:
    
    User Statistics:
    - Total interviews: ${userStats.totalInterviews}
    - Average score: ${userStats.averageScore}
    - Accuracy: ${userStats.accuracy}%
    - Current streak: ${userStats.currentStreak} days
    
    Recent Performance: ${JSON.stringify(recentPerformance)}
    Identified Skill Gaps: ${skillGaps.join(', ')}
    
    Provide:
    1. Performance analysis and trends
    2. Strengths to leverage
    3. Areas for improvement
    4. Specific action items
    5. Recommended practice topics
    6. Study plan suggestions
    7. Motivational insights
    
    Return in JSON format with structured feedback.`;

    try {
      return await this.generateJson({
        system:
          'You are an expert performance analyst and mentor. Provide constructive, actionable feedback to help users improve their interview skills. Always respond with valid JSON.',
        prompt,
        temperature: 0.6,
        maxTokens: 2000
      });
    } catch (error) {
      console.error('Error generating personalized feedback:', error);
      throw new Error('Failed to generate personalized feedback');
    }
  }

  // Generate follow-up questions for interviews
  async generateFollowUpQuestions(params) {
    const { originalQuestion, userAnswer, questionType } = params;

    const prompt = `Based on the user's answer, generate 2-3 relevant follow-up questions:
    
    Original Question: ${originalQuestion}
    User's Answer: ${userAnswer}
    Question Type: ${questionType}
    
    Generate follow-up questions that:
    1. Dive deeper into the user's response
    2. Test understanding and problem-solving
    3. Are appropriate for the question type
    4. Challenge the user appropriately
    
    Return in JSON format with an array of follow-up questions.`;

    try {
      return await this.generateJson({
        system: 'You are an expert interviewer who asks insightful follow-up questions. Always respond with valid JSON.',
        prompt,
        temperature: 0.7,
        maxTokens: 1000
      });
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
      throw new Error('Failed to generate follow-up questions');
    }
  }

  async generateJson({ system, prompt, temperature = 0.7, maxTokens = 1024 }) {
    if (!this.model) {
      throw new Error('Gemini is not configured');
    }

    const fullPrompt = `${system ? `SYSTEM:\n${system}\n\n` : ''}${prompt}`;

    const result = await this.model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: fullPrompt }]
        }
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens
      }
    });

    const text = result?.response?.text?.() || '';
    try {
      return extractFirstJsonObject(text);
    } catch (err) {
      // If parsing fails, return the raw text as fallback
      return text;
    }
  }
}

module.exports = new AIService();
