const { GoogleGenerativeAI } = require('@google/generative-ai');

function stripCodeFences(text) {
  if (!text) return '';
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

function extractFirstJsonObject(text) {
  const cleaned = stripCodeFences(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = cleaned.slice(firstBrace, lastBrace + 1);
      return JSON.parse(candidate);
    }
    throw new Error('AI response was not valid JSON');
  }
}

class AIInterviewerService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('⚠️  Gemini API key not configured. AI interviewer will use fallback responses.');
      this.model = null;
      this.modelName = null;
    } else {
      this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({ model: this.modelName });
    }

    this.interviewSessions = new Map(); // Store active interview sessions
  }

  isAvailable() {
    return this.model !== null;
  }

  // Initialize personalized AI interviewer
  async initializePersonalizedInterview(sessionId, profile, interviewType) {
    const systemPrompt = this.getPersonalizedSystemPrompt(profile, interviewType);

    const session = {
      sessionId,
      profile,
      interviewType,
      messages: [{ role: 'system', content: systemPrompt }],
      currentQuestionIndex: 0,
      startTime: new Date(),
      responses: [],
      scores: {
        communication: 0,
        technical: 0,
        behavioral: 0,
        overall: 0
      }
    };

    this.interviewSessions.set(sessionId, session);

    return {
      sessionId,
      estimatedDuration: profile.duration || 30
    };
  }

  // Initialize AI interviewer for a session (legacy)
  async initializeInterview(sessionId, config) {
    const { company, role, interviewType, difficulty } = config;
    
    const systemPrompt = this.getSystemPrompt(company, role, interviewType, difficulty);
    
    const session = {
      sessionId,
      config,
      messages: [{ role: 'system', content: systemPrompt }],
      currentQuestionIndex: 0,
      startTime: new Date(),
      responses: [],
      scores: {
        communication: 0,
        technical: 0,
        behavioral: 0,
        overall: 0
      }
    };
    
    this.interviewSessions.set(sessionId, session);
    
    // Generate opening question
    const openingQuestion = await this.generateOpeningQuestion(session);
    session.messages.push({ role: 'assistant', content: openingQuestion });
    
    return {
      sessionId,
      question: openingQuestion,
      questionNumber: 1,
      totalQuestions: 8, // Typical interview length
      estimatedDuration: 45 // minutes
    };
  }

  // Generate opening question based on interview type
  async generateOpeningQuestion(session) {
    const { company, role, interviewType } = session.config;
    
    const openingPrompts = {
      behavioral: `Hello! I'm your AI interviewer for the ${role} position at ${company}. Let's start with a behavioral question: Tell me about yourself and why you're interested in this role at ${company}.`,
      technical: `Welcome to your technical interview for the ${role} position at ${company}. Let's begin: Can you walk me through your technical background and experience with the technologies relevant to this role?`,
      mixed: `Hi! I'm conducting your interview for the ${role} position at ${company}. We'll cover both technical and behavioral aspects. Let's start: Tell me about yourself and what draws you to ${company}.`,
      system_design: `Welcome to your system design interview for the ${role} position at ${company}. Let's start with: Tell me about a complex system you've designed or worked on recently.`
    };
    
    return openingPrompts[interviewType] || openingPrompts.mixed;
  }

  // Process candidate response and generate follow-up
  async processResponse(sessionId, candidateResponse) {
    const session = this.interviewSessions.get(sessionId);
    if (!session) {
      throw new Error('Interview session not found');
    }

    // Add candidate response to conversation
    session.messages.push({ role: 'user', content: candidateResponse });
    session.responses.push({
      questionIndex: session.currentQuestionIndex,
      response: candidateResponse,
      timestamp: new Date()
    });

    // Analyze response and generate follow-up
    const analysis = await this.analyzeResponse(session, candidateResponse);
    const followUp = await this.generateFollowUpQuestion(session, analysis);
    
    session.messages.push({ role: 'assistant', content: followUp.question });
    session.currentQuestionIndex++;

    // Update scores based on analysis
    this.updateScores(session, analysis);

    return {
      analysis,
      followUp,
      questionNumber: session.currentQuestionIndex + 1,
      totalQuestions: 8,
      isComplete: session.currentQuestionIndex >= 7 // End after 8 questions
    };
  }

  // Analyze candidate response using AI
  async analyzeResponse(session, response) {
    if (!this.model) {
      return this.getFallbackAnalysis();
    }

    const company = session?.config?.company || session?.profile?.targetCompany || 'the company';
    const role = session?.config?.role || session?.profile?.targetRole || 'the role';

    const analysisPrompt = `
    Analyze this interview response for a ${role} position at ${company}:
    
    Response: "${response}"
    
    Evaluate on:
    1. Communication clarity (1-10)
    2. Technical depth (1-10) 
    3. Behavioral indicators (1-10)
    4. Specific strengths
    5. Areas for improvement
    6. Follow-up question suggestions
    
    Return as JSON with scores and feedback.
    `;

    try {
      return await this.generateJson({
        system: 'You are an expert technical interviewer. Analyze responses objectively and provide constructive feedback. Always respond with valid JSON.',
        prompt: analysisPrompt,
        temperature: 0.3,
        maxTokens: 1000
      });
    } catch (error) {
      console.error('AI analysis error:', error);
      return this.getFallbackAnalysis();
    }
  }

  // Generate intelligent follow-up question
  async generateFollowUpQuestion(session, analysis) {
    if (!this.model) {
      return this.getFallbackFollowUp(session);
    }

    const company = session?.config?.company || session?.profile?.targetCompany || 'the company';
    const role = session?.config?.role || session?.profile?.targetRole || 'the role';
    const interviewType = session?.config?.interviewType || session?.interviewType || 'mixed';
    const context = (session.messages || []).slice(-4) // Last 2 exchanges
      .map(m => `${String(m.role || '').toUpperCase()}: ${m.content}`)
      .join('\n\n');
    
    const followUpPrompt = `
    Based on the conversation context and analysis, generate the next interview question for a ${role} at ${company}.
    
    Interview type: ${interviewType}
    Question number: ${session.currentQuestionIndex + 1}/8
    
    Previous analysis: ${JSON.stringify(analysis)}
    
    Generate a relevant follow-up question that:
    1. Builds on their previous response
    2. Explores deeper technical/behavioral aspects
    3. Is appropriate for the role and company
    4. Maintains natural conversation flow
    
    Return JSON with: question, type, difficulty, expectedDuration
    `;

    try {
      return await this.generateJson({
        system: `You are conducting a professional interview. Ask relevant, insightful questions. Always respond with valid JSON.\n\nConversation context:\n${context}`,
        prompt: followUpPrompt,
        temperature: 0.7,
        maxTokens: 500
      });
    } catch (error) {
      console.error('Follow-up generation error:', error);
      return this.getFallbackFollowUp(session);
    }
  }

  // Generate final interview summary and scores
  async generateInterviewSummary(sessionId) {
    const session = this.interviewSessions.get(sessionId);
    if (!session) {
      throw new Error('Interview session not found');
    }

    const duration = Math.round((new Date() - session.startTime) / 1000 / 60); // minutes
    
    if (!this.model) {
      return this.getFallbackSummary(session, duration);
    }

    const company = session?.config?.company || session?.profile?.targetCompany || 'the company';
    const role = session?.config?.role || session?.profile?.targetRole || 'the role';

    const summaryPrompt = `
    Generate a comprehensive interview summary for a ${role} position at ${company}.
    
    Interview duration: ${duration} minutes
    Responses: ${JSON.stringify(session.responses)}
    
    Provide:
    1. Overall performance score (1-100)
    2. Individual scores: communication, technical, behavioral
    3. Key strengths (3-5 points)
    4. Areas for improvement (3-5 points)
    5. Specific recommendations
    6. Hiring recommendation (strong yes/yes/maybe/no)
    
    Return detailed JSON analysis.
    `;

    try {
      const summary = await this.generateJson({
        system: 'You are an expert interviewer providing final candidate assessment. Always respond with valid JSON.',
        prompt: summaryPrompt,
        temperature: 0.2,
        maxTokens: 1500
      });
      
      // Clean up session
      this.interviewSessions.delete(sessionId);
      
      return {
        ...summary,
        duration,
        totalQuestions: session.responses.length,
        sessionId
      };
    } catch (error) {
      console.error('Summary generation error:', error);
      return this.getFallbackSummary(session, duration);
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
    return extractFirstJsonObject(text);
  }

  // Get personalized system prompt
  getPersonalizedSystemPrompt(profile, interviewType) {
    const { name, experience, currentRole, targetRole, targetCompany, skills } = profile;

    return `You are an expert interviewer conducting a ${interviewType} interview for ${name}, who is applying for a ${targetRole} position at ${targetCompany}.

CANDIDATE PROFILE:
- Name: ${name}
- Current Role: ${currentRole}
- Experience: ${experience} years
- Target Role: ${targetRole} at ${targetCompany}
- Skills: ${skills.join(', ')}

YOUR ROLE:
- Conduct a natural, conversational interview
- Ask follow-up questions based on their responses
- Tailor questions to their experience level and target role
- Evaluate their fit for ${targetRole} at ${targetCompany}
- Be encouraging but thorough in your assessment

INTERVIEW GUIDELINES:
- Start with their background and motivation
- Ask about specific experiences relevant to ${targetRole}
- Probe deeper when they mention interesting projects or challenges
- Ask behavioral questions using real scenarios they might face at ${targetCompany}
- Assess both technical competence and cultural fit
- Keep the conversation natural and engaging
- Ask 6-8 questions total, adapting based on their responses

EVALUATION FOCUS:
- Communication skills and clarity
- Relevant experience for ${targetRole}
- Problem-solving approach
- Cultural fit for ${targetCompany}
- Leadership potential (if applicable)
- Technical depth appropriate for their experience level

Be conversational, professional, and adapt your questions based on their responses. Make them feel comfortable while thoroughly evaluating their candidacy.`;
  }

  // Get system prompt for AI interviewer (legacy)
  getSystemPrompt(company, role, interviewType, difficulty) {
    return `You are an expert technical interviewer conducting a ${interviewType} interview for a ${role} position at ${company}.

Your role:
- Ask relevant, insightful questions appropriate for the role and company
- Listen carefully to responses and ask intelligent follow-ups
- Evaluate communication, technical skills, and cultural fit
- Maintain a professional but friendly tone
- Adapt questions based on candidate responses
- Probe deeper when answers are surface-level
- Recognize and explore interesting points

Interview guidelines:
- Ask 6-8 questions total
- Mix of behavioral and technical questions
- Difficulty level: ${difficulty}
- Focus on real-world scenarios
- Evaluate problem-solving approach
- Assess cultural fit for ${company}

Be conversational, professional, and thorough in your evaluation.`;
  }

  // Update session scores based on analysis
  updateScores(session, analysis) {
    if (analysis.scores) {
      session.scores.communication = Math.max(session.scores.communication, analysis.scores.communication || 0);
      session.scores.technical = Math.max(session.scores.technical, analysis.scores.technical || 0);
      session.scores.behavioral = Math.max(session.scores.behavioral, analysis.scores.behavioral || 0);
      session.scores.overall = Math.round(
        (session.scores.communication + session.scores.technical + session.scores.behavioral) / 3
      );
    }
  }

  // Fallback responses when Gemini is not available
  getFallbackAnalysis() {
    return {
      scores: {
        communication: Math.floor(Math.random() * 3) + 7, // 7-9
        technical: Math.floor(Math.random() * 3) + 6, // 6-8
        behavioral: Math.floor(Math.random() * 3) + 7 // 7-9
      },
      strengths: ['Clear communication', 'Good examples provided'],
      improvements: ['Could provide more specific details', 'Consider discussing metrics'],
      feedback: 'Good response overall. Consider elaborating on specific examples.'
    };
  }

  getFallbackFollowUp(session) {
    const questions = [
      'Can you tell me about a challenging project you worked on recently?',
      'How do you handle working under pressure or tight deadlines?',
      'Describe a time when you had to learn a new technology quickly.',
      'What interests you most about working at our company?',
      'How do you approach problem-solving when facing a complex technical issue?',
      'Tell me about a time you had to work with a difficult team member.',
      'What are your thoughts on the latest trends in technology?'
    ];
    
    return {
      question: questions[session.currentQuestionIndex % questions.length],
      type: 'behavioral',
      difficulty: 'medium',
      expectedDuration: 3
    };
  }

  getFallbackSummary(session, duration) {
    return {
      overallScore: Math.floor(Math.random() * 20) + 75, // 75-95
      scores: {
        communication: Math.floor(Math.random() * 20) + 75,
        technical: Math.floor(Math.random() * 20) + 70,
        behavioral: Math.floor(Math.random() * 20) + 80
      },
      strengths: [
        'Strong communication skills',
        'Good technical understanding',
        'Positive attitude and enthusiasm',
        'Relevant experience for the role'
      ],
      improvements: [
        'Could provide more specific examples',
        'Consider discussing quantifiable results',
        'Elaborate on leadership experiences'
      ],
      recommendation: 'yes',
      duration,
      totalQuestions: session.responses.length,
      sessionId: session.sessionId
    };
  }

  // Get active session
  getSession(sessionId) {
    return this.interviewSessions.get(sessionId);
  }

  // End interview session
  endSession(sessionId) {
    this.interviewSessions.delete(sessionId);
  }
}

module.exports = new AIInterviewerService();
