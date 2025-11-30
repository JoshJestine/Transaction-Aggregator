// ============================================================================
// ACCESSIBLE FINANCIAL ADVISOR - BACKEND SERVER
// CS 5170 AI for HCI
// ============================================================================
//
// Uses FREE Google Gemini API
// Get your free API key at: https://aistudio.google.com/
//
// Features:
// - AI-powered financial advice
// - CSV upload for financial data analysis
// - User profile personalization
//
// ============================================================================

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================================
// API KEY CONFIGURATION
// ============================================================================
// Option 1: Set in .env file (recommended)
// Option 2: Paste your key directly below (for testing only)
// ============================================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'PASTE_YOUR_API_KEY_HERE';

// Check if API key is configured
if (!GEMINI_API_KEY || GEMINI_API_KEY === 'PASTE_YOUR_API_KEY_HERE') {
  console.log('\n⚠️  WARNING: GEMINI_API_KEY not configured!');
  console.log('   Option 1: Create a .env file with: GEMINI_API_KEY=your_key_here');
  console.log('   Option 2: Edit server.js and paste your key on line 31');
  console.log('   Get free key at: https://aistudio.google.com/\n');
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// IN-MEMORY DATA STORES
// ============================================================================

const userProfiles = new Map();
const conversations = new Map();
const conversationHistory = new Map();
const userFinancialData = new Map(); // Store uploaded CSV data

// ============================================================================
// CSV PARSING HELPER FUNCTIONS
// ============================================================================

/**
 * Parse CSV buffer into structured financial data
 */
function parseCSVBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());
    
    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

/**
 * Analyze financial data and create a summary
 */
function analyzeFinancialData(data) {
  const analysis = {
    totalRecords: data.length,
    summary: {},
    insights: [],
    rawData: data
  };

  // Try to detect the type of financial data
  if (data.length > 0) {
    const firstRow = data[0];
    const headers = Object.keys(firstRow).map(h => h.toLowerCase());

    // Monthly budget/expense data
    if (headers.some(h => h.includes('category') || h.includes('type'))) {
      analysis.type = 'expenses';
      analysis.summary = analyzeExpenses(data);
    }
    // Transaction data
    else if (headers.some(h => h.includes('date') && (h.includes('amount') || h.includes('transaction')))) {
      analysis.type = 'transactions';
      analysis.summary = analyzeTransactions(data);
    }
    // Monthly overview data
    else if (headers.some(h => h.includes('month') || h.includes('income'))) {
      analysis.type = 'monthly_overview';
      analysis.summary = analyzeMonthlyOverview(data);
    }
    // Generic financial data
    else {
      analysis.type = 'generic';
      analysis.summary = { headers, sampleData: data.slice(0, 5) };
    }
  }

  return analysis;
}

/**
 * Analyze expense/budget data
 */
function analyzeExpenses(data) {
  const summary = {
    totalExpenses: 0,
    byCategory: {},
    largestExpense: { category: '', amount: 0 },
    smallestExpense: { category: '', amount: Infinity }
  };

  data.forEach(row => {
    const category = row.Category || row.category || row.Type || row.type || 'Unknown';
    const amount = parseFloat(row.Amount || row.amount || row.Budget || row.budget || row.Spent || row.spent || 0);
    const budgeted = parseFloat(row.Budgeted || row.budgeted || row.Budget || row.budget || 0);
    const actual = parseFloat(row.Actual || row.actual || row.Spent || row.spent || row.Amount || row.amount || 0);

    if (!isNaN(amount)) {
      summary.totalExpenses += amount;
      
      if (!summary.byCategory[category]) {
        summary.byCategory[category] = { total: 0, budgeted: 0, actual: 0, count: 0 };
      }
      summary.byCategory[category].total += amount;
      summary.byCategory[category].budgeted += budgeted || 0;
      summary.byCategory[category].actual += actual || amount;
      summary.byCategory[category].count += 1;

      if (amount > summary.largestExpense.amount) {
        summary.largestExpense = { category, amount };
      }
      if (amount < summary.smallestExpense.amount && amount > 0) {
        summary.smallestExpense = { category, amount };
      }
    }
  });

  // Calculate percentages
  Object.keys(summary.byCategory).forEach(cat => {
    summary.byCategory[cat].percentage = ((summary.byCategory[cat].total / summary.totalExpenses) * 100).toFixed(1);
  });

  return summary;
}

/**
 * Analyze transaction data
 */
function analyzeTransactions(data) {
  const summary = {
    totalTransactions: data.length,
    totalIncome: 0,
    totalExpenses: 0,
    netCashFlow: 0,
    byCategory: {},
    byMonth: {}
  };

  data.forEach(row => {
    const amount = parseFloat(row.Amount || row.amount || row.Value || row.value || 0);
    const category = row.Category || row.category || row.Type || row.type || 'Uncategorized';
    const date = row.Date || row.date || '';
    
    if (!isNaN(amount)) {
      if (amount >= 0) {
        summary.totalIncome += amount;
      } else {
        summary.totalExpenses += Math.abs(amount);
      }

      if (!summary.byCategory[category]) {
        summary.byCategory[category] = { income: 0, expenses: 0, count: 0 };
      }
      if (amount >= 0) {
        summary.byCategory[category].income += amount;
      } else {
        summary.byCategory[category].expenses += Math.abs(amount);
      }
      summary.byCategory[category].count += 1;
    }
  });

  summary.netCashFlow = summary.totalIncome - summary.totalExpenses;
  summary.savingsRate = summary.totalIncome > 0 
    ? ((summary.netCashFlow / summary.totalIncome) * 100).toFixed(1) 
    : 0;

  return summary;
}

/**
 * Analyze monthly overview data
 */
function analyzeMonthlyOverview(data) {
  const summary = {
    months: [],
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0,
    averageIncome: 0,
    averageExpenses: 0,
    averageSavings: 0,
    trends: {}
  };

  data.forEach(row => {
    const month = row.Month || row.month || row.Period || row.period || 'Unknown';
    const income = parseFloat(row.Income || row.income || row.Earnings || row.earnings || 0);
    const expenses = parseFloat(row.Expenses || row.expenses || row.Spending || row.spending || 0);
    const savings = parseFloat(row.Savings || row.savings || row.Saved || row.saved || (income - expenses) || 0);
    const debt = parseFloat(row.Debt || row.debt || row['Debt Payment'] || row['debt_payment'] || 0);
    const investments = parseFloat(row.Investments || row.investments || row.Invested || row.invested || 0);

    summary.months.push({
      month,
      income,
      expenses,
      savings,
      debt,
      investments,
      savingsRate: income > 0 ? ((savings / income) * 100).toFixed(1) : 0
    });

    summary.totalIncome += income;
    summary.totalExpenses += expenses;
    summary.totalSavings += savings;
  });

  const count = summary.months.length || 1;
  summary.averageIncome = (summary.totalIncome / count).toFixed(2);
  summary.averageExpenses = (summary.totalExpenses / count).toFixed(2);
  summary.averageSavings = (summary.totalSavings / count).toFixed(2);
  summary.overallSavingsRate = summary.totalIncome > 0 
    ? ((summary.totalSavings / summary.totalIncome) * 100).toFixed(1) 
    : 0;

  return summary;
}

// ============================================================================
// GEMINI AI HELPER FUNCTIONS
// ============================================================================

function buildSystemPrompt(userProfile = null, financialData = null) {
  let prompt = `You are a helpful, accessible financial advisor AI assistant. Your role is to provide clear, educational financial guidance while being mindful that users may have varying levels of financial literacy.

GUIDELINES:
- Explain financial concepts in simple, clear language
- Avoid jargon, or explain it when necessary
- Be encouraging and non-judgmental
- Provide actionable, practical advice
- Remind users to consult certified financial advisors for major decisions
- Use concrete examples and analogies
- Break down complex topics into digestible steps

TOPICS YOU CAN HELP WITH:
- Budgeting and expense tracking
- Saving strategies and emergency funds
- Investment basics
- Debt management
- Retirement planning
- Tax basics
- Financial goal setting

DISCLAIMERS TO INCLUDE:
- You are an AI assistant, not a licensed financial advisor
- Users should consult professionals for major decisions
- Individual circumstances vary`;

  if (userProfile && userProfile.name) {
    prompt += `

USER PROFILE:
- Name: ${userProfile.name}
- Risk Tolerance: ${userProfile.riskTolerance || 'moderate'}
- Financial Goals: ${userProfile.financialGoals?.join(', ') || 'Not specified'}
- Has Emergency Fund: ${userProfile.hasEmergencyFund === null ? 'Unknown' : userProfile.hasEmergencyFund ? 'Yes' : 'No'}

Personalize your advice based on this profile. Address the user by name.`;
  }

  if (financialData && financialData.analysis) {
    const analysis = financialData.analysis;
    prompt += `

USER'S FINANCIAL DATA (uploaded CSV):
Data Type: ${analysis.type || 'general'}
Total Records: ${analysis.totalRecords}

`;

    if (analysis.type === 'expenses' && analysis.summary) {
      const s = analysis.summary;
      prompt += `EXPENSE ANALYSIS:
- Total Expenses: $${s.totalExpenses?.toFixed(2) || 0}
- Largest Expense Category: ${s.largestExpense?.category || 'N/A'} ($${s.largestExpense?.amount?.toFixed(2) || 0})
- Expense Breakdown by Category:
${Object.entries(s.byCategory || {}).map(([cat, data]) => 
  `  • ${cat}: $${data.total?.toFixed(2)} (${data.percentage}%)`
).join('\n')}

Use this data to provide specific, personalized budget advice.`;
    }

    if (analysis.type === 'transactions' && analysis.summary) {
      const s = analysis.summary;
      prompt += `TRANSACTION ANALYSIS:
- Total Transactions: ${s.totalTransactions}
- Total Income: $${s.totalIncome?.toFixed(2) || 0}
- Total Expenses: $${s.totalExpenses?.toFixed(2) || 0}
- Net Cash Flow: $${s.netCashFlow?.toFixed(2) || 0}
- Savings Rate: ${s.savingsRate}%
- Spending by Category:
${Object.entries(s.byCategory || {}).map(([cat, data]) => 
  `  • ${cat}: Income $${data.income?.toFixed(2)}, Expenses $${data.expenses?.toFixed(2)}`
).join('\n')}

Use this transaction data to provide specific spending and saving advice.`;
    }

    if (analysis.type === 'monthly_overview' && analysis.summary) {
      const s = analysis.summary;
      prompt += `MONTHLY FINANCIAL OVERVIEW:
- Months Analyzed: ${s.months?.length || 0}
- Total Income: $${s.totalIncome?.toFixed(2) || 0}
- Total Expenses: $${s.totalExpenses?.toFixed(2) || 0}
- Total Savings: $${s.totalSavings?.toFixed(2) || 0}
- Average Monthly Income: $${s.averageIncome || 0}
- Average Monthly Expenses: $${s.averageExpenses || 0}
- Average Monthly Savings: $${s.averageSavings || 0}
- Overall Savings Rate: ${s.overallSavingsRate}%

Monthly Breakdown:
${(s.months || []).map(m => 
  `  • ${m.month}: Income $${m.income}, Expenses $${m.expenses}, Saved $${m.savings} (${m.savingsRate}%)`
).join('\n')}

Use this monthly data to identify trends and provide actionable recommendations.`;
    }

    prompt += `

IMPORTANT: Reference the user's actual financial data in your responses. Provide specific, data-driven advice based on their numbers. Point out areas of concern and opportunities for improvement.`;
  }

  return prompt;
}

/**
 * Clean markdown formatting from AI response
 */
function cleanMarkdownFormatting(text) {
  return text
    // Remove bold/italic markers
    .replace(/\*\*\*/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/___/g, '')
    .replace(/__/g, '')
    .replace(/_/g, ' ')
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove bullet points and convert to plain text
    .replace(/^[\s]*[-•*+]\s+/gm, '• ')
    // Remove numbered list formatting
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Call Google Gemini API (FREE!)
 * Get your free API key at: https://aistudio.google.com/
 */
async function getAIResponse(messages, userProfile = null, financialData = null) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'PASTE_YOUR_API_KEY_HERE' || GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
    throw new Error('GEMINI_API_KEY not set. Get your free key at https://aistudio.google.com/');
  }

  const systemPrompt = buildSystemPrompt(userProfile, financialData);
  
  // Combine system prompt with first message for Gemini
  const messagesWithSystem = [...messages];
  if (messagesWithSystem.length > 0) {
    messagesWithSystem[0] = {
      ...messagesWithSystem[0],
      content: `${systemPrompt}\n\nIMPORTANT: Respond in plain text only. Do not use any markdown formatting like **, *, #, -, or bullet points. Write in natural paragraphs.\n\n---\n\nUser: ${messagesWithSystem[0].content}`
    };
  }
  
  // Convert messages to Gemini format
  const geminiContents = messagesWithSystem.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  // Try multiple model options in case one doesn't work
  const models = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];
  
  let lastError = null;
  
  for (const model of models) {
    try {
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      console.log(`[Gemini] Trying model: ${model}`);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiContents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[Gemini] Model ${model} failed:`, response.status, errorData);
        lastError = new Error(`Gemini API failed: ${response.status}`);
        continue; // Try next model
      }

      const data = await response.json();
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.log(`[Gemini] Success with model: ${model}`);
        // Clean markdown formatting from response
        const rawResponse = data.candidates[0].content.parts[0].text;
        return cleanMarkdownFormatting(rawResponse);
      }
      
    } catch (err) {
      console.error(`[Gemini] Error with model ${model}:`, err.message);
      lastError = err;
    }
  }
  
  throw lastError || new Error('All Gemini models failed');
}

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    aiProvider: 'Google Gemini (FREE)',
    timestamp: new Date().toISOString()
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId, userId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create conversation
    const convId = conversationId || uuidv4();
    let conversation = conversations.get(convId) || {
      id: convId,
      userId: userId || 'anonymous',
      messages: [],
      createdAt: new Date().toISOString()
    };

    // Get user profile and financial data
    const userProfile = userId ? userProfiles.get(userId) : null;
    const financialData = userId ? userFinancialData.get(userId) : null;

    // Add user message
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    conversation.messages.push(userMessage);

    // Get AI response with financial data context
    const contextMessages = conversation.messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    }));

    const aiResponseText = await getAIResponse(contextMessages, userProfile, financialData);

    // Add AI response
    const aiMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: aiResponseText,
      timestamp: new Date().toISOString()
    };
    conversation.messages.push(aiMessage);
    conversations.set(convId, conversation);

    res.json({
      success: true,
      conversationId: convId,
      message: aiMessage,
      hasFinancialData: !!financialData
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to get response',
      message: error.message,
      retryable: true
    });
  }
});

// Get conversation
app.get('/api/conversation/:id', (req, res) => {
  const conversation = conversations.get(req.params.id);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  res.json({ success: true, conversation });
});

// Delete conversation
app.delete('/api/conversation/:id', (req, res) => {
  const conversation = conversations.get(req.params.id);
  if (conversation) {
    // Store for undo
    const userId = conversation.userId;
    let history = conversationHistory.get(userId) || [];
    history.push(conversation);
    conversationHistory.set(userId, history.slice(-5));
    conversations.delete(req.params.id);
  }
  res.json({ success: true, message: 'Conversation cleared' });
});

// Undo delete
app.post('/api/conversation/:id/undo', (req, res) => {
  const { userId } = req.body;
  const history = conversationHistory.get(userId) || [];
  
  if (history.length === 0) {
    return res.status(404).json({ error: 'Nothing to undo' });
  }

  const restored = history.pop();
  conversationHistory.set(userId, history);
  conversations.set(restored.id, restored);

  res.json({ success: true, conversation: restored });
});

// User profile
app.post('/api/profile', (req, res) => {
  const { userId, profile } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }
  
  const updated = { ...userProfiles.get(userId), ...profile, userId };
  userProfiles.set(userId, updated);
  res.json({ success: true, profile: updated });
});

app.get('/api/profile/:userId', (req, res) => {
  const profile = userProfiles.get(req.params.userId);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  res.json({ success: true, profile });
});

// Quick actions
app.get('/api/quick-actions', (req, res) => {
  res.json({
    success: true,
    quickActions: [
      { id: 'budget', label: 'Budget Help', query: 'Help me create a monthly budget', icon: '📊' },
      { id: 'savings', label: 'Savings Tips', query: 'What are effective savings strategies?', icon: '💰' },
      { id: 'investing', label: 'Investment 101', query: 'Explain investment basics for beginners', icon: '📈' },
      { id: 'debt', label: 'Debt Strategy', query: 'How should I prioritize paying off debt?', icon: '💳' },
      { id: 'emergency', label: 'Emergency Fund', query: 'How much should I save for emergencies?', icon: '🛡️' },
      { id: 'retirement', label: 'Retirement', query: 'When should I start saving for retirement?', icon: '🏖️' }
    ]
  });
});

// ============================================================================
// CSV UPLOAD ENDPOINTS
// ============================================================================

/**
 * POST /api/upload-csv
 * Upload and analyze financial data from CSV
 */
app.post('/api/upload-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.body.userId || 'anonymous';
    
    // Parse CSV
    const data = await parseCSVBuffer(req.file.buffer);
    
    if (data.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty' });
    }

    // Analyze the data
    const analysis = analyzeFinancialData(data);
    
    // Store for user
    const financialData = {
      filename: req.file.originalname,
      uploadedAt: new Date().toISOString(),
      analysis,
      recordCount: data.length
    };
    
    userFinancialData.set(userId, financialData);

    console.log(`[CSV Upload] User ${userId} uploaded ${data.length} records`);

    res.json({
      success: true,
      message: 'Financial data uploaded successfully',
      filename: req.file.originalname,
      recordCount: data.length,
      dataType: analysis.type,
      summary: analysis.summary
    });

  } catch (error) {
    console.error('CSV upload error:', error);
    res.status(500).json({
      error: 'Failed to process CSV',
      message: error.message
    });
  }
});

/**
 * GET /api/financial-data/:userId
 * Get uploaded financial data for a user
 */
app.get('/api/financial-data/:userId', (req, res) => {
  const data = userFinancialData.get(req.params.userId);
  
  if (!data) {
    return res.status(404).json({ 
      error: 'No financial data found',
      message: 'Please upload a CSV file with your financial data'
    });
  }

  res.json({
    success: true,
    data: {
      filename: data.filename,
      uploadedAt: data.uploadedAt,
      recordCount: data.recordCount,
      dataType: data.analysis?.type,
      summary: data.analysis?.summary
    }
  });
});

/**
 * DELETE /api/financial-data/:userId
 * Remove uploaded financial data
 */
app.delete('/api/financial-data/:userId', (req, res) => {
  const deleted = userFinancialData.delete(req.params.userId);
  
  res.json({
    success: true,
    message: deleted ? 'Financial data removed' : 'No data to remove'
  });
});

/**
 * POST /api/analyze-csv
 * Analyze CSV with specific question (doesn't save)
 */
app.post('/api/analyze-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const question = req.body.question || 'Analyze this financial data and provide key insights and recommendations.';
    const userId = req.body.userId;
    
    // Parse and analyze CSV
    const data = await parseCSVBuffer(req.file.buffer);
    const analysis = analyzeFinancialData(data);
    
    // Get user profile if available
    const userProfile = userId ? userProfiles.get(userId) : null;
    
    // Create financial data object for AI
    const financialData = { analysis };
    
    // Get AI analysis
    const aiResponse = await getAIResponse(
      [{ role: 'user', content: question }],
      userProfile,
      financialData
    );

    res.json({
      success: true,
      analysis: {
        type: analysis.type,
        summary: analysis.summary,
        recordCount: data.length
      },
      aiInsights: aiResponse
    });

  } catch (error) {
    console.error('Analyze CSV error:', error);
    res.status(500).json({
      error: 'Failed to analyze CSV',
      message: error.message
    });
  }
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  const keyConfigured = GEMINI_API_KEY && GEMINI_API_KEY !== 'PASTE_YOUR_API_KEY_HERE' && GEMINI_API_KEY !== 'YOUR_API_KEY_HERE';
  const keyStatus = keyConfigured ? '✅ Configured' : '❌ NOT SET';
  
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   💵 ACCESSIBLE FINANCIAL ADVISOR - BACKEND                  ║
║                                                               ║
║   Server: http://localhost:${PORT}                              ║
║   AI: Google Gemini (FREE)                                    ║
║   API Key: ${keyStatus}                                       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
  
  if (!keyConfigured) {
    console.log(`
⚠️  API KEY NOT CONFIGURED!

   To fix this, edit the file: backend/.env
   
   Replace YOUR_API_KEY_HERE with your actual API key
   
   Get your FREE key at: https://aistudio.google.com/
   
   Then restart the server: npm start
    `);
  }
});

module.exports = app;
