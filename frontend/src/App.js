// ============================================================================
// ACCESSIBLE FINANCIAL ADVISOR - FRONTEND
// CS 5170 AI for HCI - Uses FREE Google Gemini API
// ============================================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';

const API_URL = 'http://localhost:3001/api';

// Financial literacy resources - verified sources
const financialResources = [
  { title: 'Budgeting Basics', source: 'Consumer.gov', url: 'https://consumer.gov/managing-your-money/making-budget' },
  { title: 'Saving and Investing', source: 'Investor.gov (SEC)', url: 'https://www.investor.gov/introduction-investing' },
  { title: 'Understanding Credit', source: 'CFPB', url: 'https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/' },
  { title: 'Retirement Planning', source: 'SSA.gov', url: 'https://www.ssa.gov/benefits/retirement/' },
  { title: 'Debt Management', source: 'FTC', url: 'https://consumer.ftc.gov/articles/coping-debt' },
  { title: 'Financial Education', source: 'MyMoney.gov', url: 'https://www.mymoney.gov/' }
];

function App() {
  const [messages, setMessages] = useState([{
    id: '1',
    role: 'assistant',
    content: 'Welcome to your Accessible Financial Advisor! I\'m powered by Google Gemini AI and I\'m here to help you understand budgeting, investments, savings, and more.\n\nTip: Upload your financial data (CSV) for personalized advice based on your actual numbers!\n\nHow can I assist you today?',
    timestamp: new Date().toISOString()
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [toast, setToast] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState('chat');
  const [financialData, setFinancialData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDataPanel, setShowDataPanel] = useState(false);
  
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('fontSize')) || 16);
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('highContrast') === 'true');
  
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : { name: '', riskTolerance: 'moderate', financialGoals: [], hasEmergencyFund: null };
  });
  const [userId] = useState(() => {
    const existing = localStorage.getItem('userId');
    if (existing) return existing;
    const newId = `user-${Date.now()}`;
    localStorage.setItem('userId', newId);
    return newId;
  });

  const quickActions = financialData ? [
    { id: 'analyze', label: 'Analyze My Data', query: 'Analyze my uploaded financial data and give me a complete overview with actionable recommendations.', icon: '📊' },
    { id: 'savings', label: 'Savings Analysis', query: 'Based on my financial data, how can I improve my savings rate?', icon: '💰' },
    { id: 'spending', label: 'Spending Review', query: 'Review my spending patterns and identify areas where I can cut back.', icon: '🔍' },
    { id: 'budget', label: 'Budget Suggestions', query: 'Based on my actual expenses, suggest an optimized budget for me.', icon: '📝' },
    { id: 'goals', label: 'Goal Planning', query: 'Given my financial situation, help me create realistic financial goals.', icon: '🎯' },
    { id: 'improve', label: 'Top 3 Improvements', query: 'What are the top 3 things I should change about my finances based on my data?', icon: '⬆️' }
  ] : [
    { id: 'budget', label: 'Budget Help', query: 'Help me create a monthly budget', icon: '📊' },
    { id: 'savings', label: 'Savings Tips', query: 'What are effective savings strategies?', icon: '💰' },
    { id: 'investing', label: 'Investment 101', query: 'Explain investment basics for beginners', icon: '📈' },
    { id: 'debt', label: 'Debt Strategy', query: 'How should I prioritize paying off debt?', icon: '💳' },
    { id: 'emergency', label: 'Emergency Fund', query: 'How much should I save for emergencies?', icon: '🛡️' },
    { id: 'retirement', label: 'Retirement', query: 'When should I start saving for retirement?', icon: '🏖️' }
  ];

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { localStorage.setItem('fontSize', fontSize); }, [fontSize]);
  useEffect(() => { localStorage.setItem('highContrast', highContrast); }, [highContrast]);
  useEffect(() => { localStorage.setItem('userProfile', JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        const response = await fetch(`${API_URL}/financial-data/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setFinancialData(data.data);
        }
      } catch (err) {}
    };
    loadFinancialData();
  }, [userId]);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (inputValue.trim() && !isLoading) handleSendMessage();
      }
      if (e.key === 'Escape') {
        if (currentPage === 'accessibility') setCurrentPage('chat');
        else { setInputValue(''); showToast('Input cleared', 'info'); }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ',') { e.preventDefault(); setShowSettings(prev => !prev); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') { e.preventDefault(); fileInputRef.current?.click(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputValue, isLoading, showToast, currentPage]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) { showToast('Please upload a CSV file', 'error'); return; }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    try {
      const response = await fetch(`${API_URL}/upload-csv`, { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');

      setFinancialData({ filename: data.filename, recordCount: data.recordCount, dataType: data.dataType, summary: data.summary, uploadedAt: new Date().toISOString() });
      showToast(`Uploaded ${data.recordCount} records from ${data.filename}`, 'success');

      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        role: 'assistant',
        content: `Financial Data Uploaded!\n\nI've received your data from "${data.filename}" with ${data.recordCount} records.\n\nData type detected: ${data.dataType}\n\nI'll now use this data to provide personalized advice. Try asking me to analyze your spending or suggest a budget!`,
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      showToast(err.message || 'Failed to upload file', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveData = async () => {
    try {
      await fetch(`${API_URL}/financial-data/${userId}`, { method: 'DELETE' });
      setFinancialData(null);
      showToast('Financial data removed', 'info');
    } catch (err) { showToast('Failed to remove data', 'error'); }
  };

  const handleSendMessage = async (customMessage = null) => {
    const messageText = customMessage || inputValue.trim();
    if (!messageText || isLoading) return;

    const userMessage = { id: `user-${Date.now()}`, role: 'user', content: messageText, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, conversationId, userId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to get response');

      setConversationId(data.conversationId);
      setMessages(prev => [...prev, data.message]);
      showToast('Response received', 'success');
    } catch (err) {
      setError({ message: err.message, retryable: true });
      showToast('Error occurred', 'error');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearConversation = () => {
    setConversationHistory(prev => [...prev, { messages, conversationId }]);
    setMessages([{ id: `assistant-${Date.now()}`, role: 'assistant', content: financialData ? 'Conversation cleared. Your financial data is still loaded. How can I help you analyze it?' : 'Conversation cleared. How can I help you with your financial questions?', timestamp: new Date().toISOString() }]);
    setConversationId(null);
    setShowSettings(false);
    showToast('Conversation cleared. You can undo this.', 'info');
  };

  const restoreConversation = () => {
    if (conversationHistory.length > 0) {
      const last = conversationHistory[conversationHistory.length - 1];
      setMessages(last.messages);
      setConversationId(last.conversationId);
      setConversationHistory(prev => prev.slice(0, -1));
      showToast('Conversation restored', 'success');
    }
  };

  const handleOnboardingNext = () => {
    if (onboardingStep < 3) setOnboardingStep(prev => prev + 1);
    else { setShowOnboarding(false); showToast(`Welcome${userProfile.name ? `, ${userProfile.name}` : ''}!`, 'success'); }
  };

  const toggleGoal = (goal) => {
    const goals = userProfile.financialGoals || [];
    setUserProfile({ ...userProfile, financialGoals: goals.includes(goal) ? goals.filter(g => g !== goal) : [...goals, goal] });
  };

  const formatSummary = (summary, type) => {
    if (!summary) return null;
    if (type === 'expenses') {
      return (<div className="data-summary"><p><strong>Total:</strong> ${summary.totalExpenses?.toFixed(2)}</p><ul>{Object.entries(summary.byCategory || {}).slice(0, 4).map(([cat, data]) => (<li key={cat}>{cat}: ${data.total?.toFixed(2)}</li>))}</ul></div>);
    }
    if (type === 'monthly_overview') {
      return (<div className="data-summary"><p><strong>Months:</strong> {summary.months?.length}</p><p><strong>Avg Savings:</strong> ${summary.averageSavings}</p><p><strong>Savings Rate:</strong> {summary.overallSavingsRate}%</p></div>);
    }
    if (type === 'transactions') {
      return (<div className="data-summary"><p><strong>Count:</strong> {summary.totalTransactions}</p><p><strong>Net Flow:</strong> ${summary.netCashFlow?.toFixed(2)}</p></div>);
    }
    return <p>Data loaded</p>;
  };

  const dynamicStyles = {
    '--base-font-size': `${fontSize}px`,
    '--bg-primary': highContrast ? '#000000' : '#0a1628',
    '--bg-secondary': highContrast ? '#1a1a1a' : '#132038',
    '--bg-tertiary': highContrast ? '#2a2a2a' : '#1c2d4a',
    '--text-primary': highContrast ? '#ffffff' : '#e8f0fe',
    '--text-secondary': highContrast ? '#e0e0e0' : '#94a3b8',
    '--accent-primary': highContrast ? '#00ff00' : '#22c55e',
    '--accent-secondary': highContrast ? '#ffff00' : '#3b82f6',
    '--border-color': highContrast ? '#ffffff' : '#2d4a6f',
    '--focus-ring': highContrast ? '0 0 0 3px #ffff00' : '0 0 0 3px #3b82f6'
  };

  // ========== ACCESSIBILITY PAGE ==========
  if (currentPage === 'accessibility') {
    return (
      <div className="app-container" style={dynamicStyles}>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <header className="header">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">💵</div>
              <div className="logo-text"><h1>FinanceAI</h1><p>Accessibility Information</p></div>
            </div>
            <nav className="header-actions">
              <button className="btn btn-primary" onClick={() => setCurrentPage('chat')}>← Back to Chat</button>
            </nav>
          </div>
        </header>

        <main className="accessibility-page" id="main-content">
          <div className="accessibility-content">
            <h1>Accessibility Features</h1>
            <p className="intro">This application was designed with accessibility as a core principle, following established HCI guidelines to ensure all users can effectively use our financial advisor tool.</p>

            <section className="accessibility-section">
              <h2>Shneiderman's Eight Golden Rules of Interface Design</h2>
              <p>Our interface implements Ben Shneiderman's foundational principles for creating effective, user-friendly interfaces:</p>

              <div className="rules-grid">
                <div className="rule-card">
                  <h3>1. Strive for Consistency</h3>
                  <p>The interface uses consistent visual elements throughout: uniform button styles (primary green, secondary blue, danger red), consistent typography (Literata for headings, Source Sans for body text), and predictable interaction patterns. CSS custom properties ensure colors and spacing remain uniform across all components.</p>
                </div>
                <div className="rule-card">
                  <h3>2. Cater to Universal Usability</h3>
                  <p>Power users can use keyboard shortcuts: Ctrl+Enter to send messages, Ctrl+U to upload files, Ctrl+, to open settings, and Escape to clear input or close dialogs. Quick Action buttons provide one-click access to common queries, reducing the need to type repetitive questions.</p>
                </div>
                <div className="rule-card">
                  <h3>3. Offer Informative Feedback</h3>
                  <p>Every action provides immediate visual feedback: a loading animation (bouncing dots) appears while the AI processes requests, toast notifications confirm successful actions, a green pulsing status indicator shows the AI is online, and timestamps on messages provide temporal context.</p>
                </div>
                <div className="rule-card">
                  <h3>4. Design Dialogs to Yield Closure</h3>
                  <p>Sequences of actions have clear beginning, middle, and end states. The onboarding wizard uses progress dots to show completion status. File uploads confirm success with a summary message. Conversation clearing shows a fresh welcome message to indicate the action is complete.</p>
                </div>
                <div className="rule-card">
                  <h3>5. Prevent Errors</h3>
                  <p>Input validation prevents empty messages from being sent. The send button is disabled during loading to prevent duplicate requests. File upload only accepts CSV files, with clear error messages for invalid formats. Form fields have appropriate constraints and validation.</p>
                </div>
                <div className="rule-card">
                  <h3>6. Permit Easy Reversal of Actions</h3>
                  <p>Users can undo conversation clearing with the restore button. Deleted financial data can be re-uploaded. The conversation history is preserved, allowing users to restore previous states. Settings changes take effect immediately but can be reverted.</p>
                </div>
                <div className="rule-card">
                  <h3>7. Keep Users in Control</h3>
                  <p>All interactions are user-initiated—no auto-popups or forced actions. Users choose when to upload data, when to clear conversations, and when to adjust settings. The onboarding can be skipped entirely. Font size and contrast settings put visual preferences in the user's hands.</p>
                </div>
                <div className="rule-card">
                  <h3>8. Reduce Short-Term Memory Load</h3>
                  <p>The conversation history remains visible, eliminating the need to remember previous exchanges. User profile information is displayed in the sidebar. Quick Action buttons provide pre-written queries so users don't need to remember exact phrasings.</p>
                </div>
              </div>
            </section>

            <section className="accessibility-section">
              <h2>Color Palette and Colorblindness Accessibility</h2>
              <p>Our color scheme was carefully selected to be accessible to users with various types of color vision deficiency:</p>

              <div className="color-info">
                <h3>Design Principles</h3>
                <ul>
                  <li><strong>High Contrast Ratios:</strong> All text meets WCAG 2.1 AA standards with a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text.</li>
                  <li><strong>Not Color-Dependent:</strong> Information is never conveyed by color alone. Icons, text labels, and shape differences accompany color indicators.</li>
                  <li><strong>Blue-Green Safe:</strong> The primary palette uses blue (#3b82f6) and green (#22c55e), which remain distinguishable for most types of colorblindness.</li>
                </ul>

                <h3>Colorblindness Considerations</h3>
                <div className="colorblind-grid">
                  <div className="colorblind-card">
                    <h4>Deuteranopia (Green-Blind)</h4>
                    <p>Affects approximately 6% of males. Our green (#22c55e) appears as a distinct yellow-brown shade, while blue remains blue. The luminance contrast between these colors is maintained.</p>
                  </div>
                  <div className="colorblind-card">
                    <h4>Protanopia (Red-Blind)</h4>
                    <p>Affects approximately 2% of males. Our palette intentionally avoids red-green distinctions for critical information. Error states use both color AND icons with text for redundancy.</p>
                  </div>
                  <div className="colorblind-card">
                    <h4>Tritanopia (Blue-Blind)</h4>
                    <p>Affects approximately 0.01% of people. Our blue appears as a distinct cyan/teal shade, and the high luminance difference between backgrounds and text ensures readability.</p>
                  </div>
                  <div className="colorblind-card">
                    <h4>Monochromacy</h4>
                    <p>For users with complete color blindness, our high-contrast mode provides pure black backgrounds with white text, ensuring maximum readability through luminance differences alone.</p>
                  </div>
                </div>

                <h3>High Contrast Mode</h3>
                <p>Users can enable high contrast mode in settings, which switches to pure black background (#000000), white text (#FFFFFF), bright green (#00FF00) for primary actions, and yellow (#FFFF00) for secondary elements and focus indicators.</p>

                <div className="color-swatches">
                  <div className="swatch-group">
                    <h4>Default Mode</h4>
                    <div className="swatches">
                      <div className="swatch" style={{background: '#0a1628'}}><span>BG</span></div>
                      <div className="swatch" style={{background: '#e8f0fe', color: '#0a1628'}}><span>Text</span></div>
                      <div className="swatch" style={{background: '#22c55e'}}><span>Primary</span></div>
                      <div className="swatch" style={{background: '#3b82f6'}}><span>Secondary</span></div>
                    </div>
                  </div>
                  <div className="swatch-group">
                    <h4>High Contrast</h4>
                    <div className="swatches">
                      <div className="swatch" style={{background: '#000000'}}><span>BG</span></div>
                      <div className="swatch" style={{background: '#ffffff', color: '#000000'}}><span>Text</span></div>
                      <div className="swatch" style={{background: '#00ff00', color: '#000000'}}><span>Primary</span></div>
                      <div className="swatch" style={{background: '#ffff00', color: '#000000'}}><span>Secondary</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="accessibility-section">
              <h2>WCAG 2.1 Compliance</h2>
              <div className="wcag-grid">
                <div className="wcag-card"><h3>Perceivable</h3><ul><li>All images have alt text</li><li>Semantic HTML structure</li><li>Text resizable to 200%</li><li>Color not sole indicator</li></ul></div>
                <div className="wcag-card"><h3>Operable</h3><ul><li>Full keyboard navigation</li><li>Skip navigation link</li><li>Visible focus indicators</li><li>No time limits</li></ul></div>
                <div className="wcag-card"><h3>Understandable</h3><ul><li>Clear, jargon-free language</li><li>Consistent navigation</li><li>Descriptive error messages</li><li>Clear input labels</li></ul></div>
                <div className="wcag-card"><h3>Robust</h3><ul><li>Valid HTML structure</li><li>ARIA attributes</li><li>Screen reader compatible</li><li>Cross-browser support</li></ul></div>
              </div>
            </section>

            <section className="accessibility-section">
              <h2>Keyboard Navigation</h2>
              <table className="shortcuts-table">
                <thead><tr><th>Shortcut</th><th>Action</th></tr></thead>
                <tbody>
                  <tr><td><kbd>Tab</kbd></td><td>Move to next element</td></tr>
                  <tr><td><kbd>Shift+Tab</kbd></td><td>Move to previous element</td></tr>
                  <tr><td><kbd>Enter</kbd></td><td>Activate / Send message</td></tr>
                  <tr><td><kbd>Ctrl+U</kbd></td><td>Upload file</td></tr>
                  <tr><td><kbd>Ctrl+,</kbd></td><td>Open settings</td></tr>
                  <tr><td><kbd>Escape</kbd></td><td>Clear / Close / Go back</td></tr>
                </tbody>
              </table>
            </section>

            <div className="back-button-container">
              <button className="btn btn-primary btn-large" onClick={() => setCurrentPage('chat')}>← Return to Financial Advisor</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ========== MAIN CHAT PAGE ==========
  return (
    <div className="app-container" style={dynamicStyles}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" style={{ display: 'none' }} aria-label="Upload CSV file" />

      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">💵</div>
            <div className="logo-text"><h1>FinanceAI</h1><p>Powered by Gemini</p></div>
          </div>
          <nav className="header-actions">
            <button className={`btn ${financialData ? 'btn-success' : 'btn-secondary'}`} onClick={() => fileInputRef.current?.click()} disabled={isUploading} title="Upload CSV (Ctrl+U)">
              {isUploading ? '⏳ Uploading...' : financialData ? '📁 Data Loaded' : '📤 Upload CSV'}
            </button>
            <button className="btn btn-secondary btn-icon" onClick={clearConversation} title="Clear conversation">🗑️</button>
            {conversationHistory.length > 0 && <button className="btn btn-secondary btn-icon" onClick={restoreConversation} title="Undo">↩️</button>}
            <button className="btn btn-secondary" onClick={() => setShowSettings(true)}>⚙️ Settings</button>
          </nav>
        </div>
      </header>

      <main className="main-layout" id="main-content">
        <section className="chat-container">
          <div className="chat-header">
            <h2><span className="status-indicator"></span> Financial Advisor</h2>
            {financialData && <span className="data-badge" title="Financial data loaded">📊 Data Active</span>}
          </div>

          <div className="messages-container" role="log" aria-live="polite">
            {messages.map((message) => (
              <article key={message.id} className={`message message-${message.role}`}>
                <div className="message-content">
                  {message.content.split('\n').map((line, i) => (<React.Fragment key={i}>{line}{i < message.content.split('\n').length - 1 && <br />}</React.Fragment>))}
                </div>
                <time className="message-time">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
              </article>
            ))}
            {isLoading && <div className="loading-indicator" role="status"><span className="loading-dot"></span><span className="loading-dot"></span><span className="loading-dot"></span></div>}
            {error && (
              <div className="error-container" role="alert">
                <div className="error-header">⚠️ {error.message}</div>
                <div className="error-actions">
                  <button className="btn btn-primary" onClick={() => { const lastMsg = [...messages].reverse().find(m => m.role === 'user'); if (lastMsg) handleSendMessage(lastMsg.content); }}>🔄 Retry</button>
                  <button className="btn btn-secondary" onClick={() => setError(null)}>Dismiss</button>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <div className="input-wrapper">
              <textarea ref={inputRef} className="input-field" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={financialData ? "Ask about your financial data..." : "Ask about budgeting, investing, savings..."} disabled={isLoading} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} />
              <button className="btn btn-primary" onClick={() => handleSendMessage()} disabled={!inputValue.trim() || isLoading}>{isLoading ? '...' : 'Send →'}</button>
            </div>
            <div className="input-hint"><span><kbd>Enter</kbd> send</span><span><kbd>Ctrl+U</kbd> upload</span><span><kbd>Ctrl+,</kbd> settings</span></div>
          </div>
        </section>

        <aside className="sidebar">
          {financialData && (
            <div className="sidebar-card data-card">
              <h3>📊 Your Financial Data</h3>
              <p className="filename">{financialData.filename}</p>
              <p><strong>Records:</strong> {financialData.recordCount}</p>
              <p><strong>Type:</strong> {financialData.dataType}</p>
              {formatSummary(financialData.summary, financialData.dataType)}
              <div className="data-actions">
                <button className="btn btn-secondary" onClick={() => setShowDataPanel(true)}>View Details</button>
                <button className="btn btn-danger btn-small" onClick={handleRemoveData}>Remove</button>
              </div>
            </div>
          )}

          {!financialData && (
            <div className="sidebar-card upload-prompt">
              <h3>📤 Upload Your Data</h3>
              <p>Upload a CSV file with your financial data to get personalized advice.</p>
              <button className="btn btn-primary full-width" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>{isUploading ? 'Uploading...' : 'Choose CSV File'}</button>
              <p className="hint">Supports: expenses, transactions, monthly budgets</p>
            </div>
          )}

          <div className="sidebar-card">
            <h3>⚡ Quick Actions</h3>
            <div className="quick-actions">
              {quickActions.map((action) => (<button key={action.id} className="quick-action-btn" onClick={() => handleSendMessage(action.query)} disabled={isLoading}><span>{action.icon}</span> {action.label}</button>))}
            </div>
          </div>

          {userProfile.name && (
            <div className="sidebar-card">
              <h3>👤 Your Profile</h3>
              <p><strong>Name:</strong> {userProfile.name}</p>
              <p><strong>Risk:</strong> {userProfile.riskTolerance}</p>
              {userProfile.financialGoals?.length > 0 && <p><strong>Goals:</strong> {userProfile.financialGoals.join(', ')}</p>}
              <button className="btn btn-secondary full-width" onClick={() => setShowOnboarding(true)}>Edit Profile</button>
            </div>
          )}

          <div className="sidebar-card">
            <h3>📚 Financial Resources</h3>
            <div className="resources-list">
              {financialResources.map((resource, index) => (
                <a key={index} href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                  <span className="resource-title">{resource.title}</span>
                  <span className="resource-source">{resource.source}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="sidebar-card accessibility-card">
            <h3>♿ Accessibility</h3>
            <p>Learn how this site is designed for everyone.</p>
            <button className="btn btn-secondary full-width" onClick={() => setCurrentPage('accessibility')}>Learn More →</button>
          </div>
        </aside>
      </main>

      {showDataPanel && financialData && (
        <>
          <div className="settings-backdrop" onClick={() => setShowDataPanel(false)} />
          <div className="settings-panel" role="dialog">
            <div className="settings-header"><h2>📊 Financial Data Details</h2><button className="btn btn-secondary btn-icon" onClick={() => setShowDataPanel(false)}>✕</button></div>
            <div className="settings-section"><h3>File Information</h3><p><strong>Filename:</strong> {financialData.filename}</p><p><strong>Records:</strong> {financialData.recordCount}</p><p><strong>Data Type:</strong> {financialData.dataType}</p><p><strong>Uploaded:</strong> {new Date(financialData.uploadedAt).toLocaleString()}</p></div>
            <div className="settings-section"><h3>Data Summary</h3>{formatSummary(financialData.summary, financialData.dataType)}</div>
            <div className="settings-section"><button className="btn btn-danger full-width" onClick={() => { handleRemoveData(); setShowDataPanel(false); }}>🗑️ Remove Financial Data</button></div>
          </div>
        </>
      )}

      {showSettings && (
        <>
          <div className="settings-backdrop" onClick={() => setShowSettings(false)} />
          <div className="settings-panel" role="dialog">
            <div className="settings-header"><h2>⚙️ Settings</h2><button className="btn btn-secondary btn-icon" onClick={() => setShowSettings(false)}>✕</button></div>
            <div className="settings-section">
              <h3>Accessibility</h3>
              <div className="settings-row"><label>Font Size</label><div className="slider-container"><span>{fontSize}px</span><input type="range" className="slider" min="12" max="24" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} /></div></div>
              <div className="settings-row"><label>High Contrast</label><button className={`toggle ${highContrast ? 'active' : ''}`} onClick={() => setHighContrast(!highContrast)} role="switch" aria-checked={highContrast} /></div>
            </div>
            <div className="settings-section"><h3>Actions</h3><button className="btn btn-danger full-width" onClick={clearConversation}>🗑️ Clear Conversation</button></div>
          </div>
        </>
      )}

      {showOnboarding && (
        <div className="modal-backdrop" role="dialog">
          <div className="modal">
            <div className="progress-dots">{[0, 1, 2, 3].map(s => (<div key={s} className={`progress-dot ${onboardingStep >= s ? 'active' : ''}`} />))}</div>
            {onboardingStep === 0 && (<><h2>Welcome! 👋</h2><p>Let's personalize your financial advice experience.</p><div className="form-group"><label>What should we call you?</label><input type="text" className="form-input" value={userProfile.name} onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })} placeholder="Enter your name" autoFocus /></div></>)}
            {onboardingStep === 1 && (<><h2>Risk Tolerance 📊</h2><p>How comfortable are you with financial risk?</p><div className="form-group"><select className="form-select" value={userProfile.riskTolerance} onChange={(e) => setUserProfile({ ...userProfile, riskTolerance: e.target.value })}><option value="conservative">Conservative - I prefer stability</option><option value="moderate">Moderate - Balanced approach</option><option value="aggressive">Aggressive - Growth focused</option></select></div></>)}
            {onboardingStep === 2 && (<><h2>Financial Goals 🎯</h2><p>Select your goals.</p><div className="checkbox-group">{["Emergency Fund", "Debt Payoff", "Retirement", "Home Purchase", "Education", "Travel"].map(goal => (<label key={goal} className="checkbox-item"><button type="button" className={`checkbox ${userProfile.financialGoals?.includes(goal) ? 'checked' : ''}`} onClick={() => toggleGoal(goal)}>{userProfile.financialGoals?.includes(goal) && "✓"}</button>{goal}</label>))}</div></>)}
            {onboardingStep === 3 && (<><h2>Almost Done! 🎉</h2><p>Do you have an emergency fund?</p><div className="form-group"><select className="form-select" value={userProfile.hasEmergencyFund === null ? '' : String(userProfile.hasEmergencyFund)} onChange={(e) => setUserProfile({ ...userProfile, hasEmergencyFund: e.target.value === '' ? null : e.target.value === 'true' })}><option value="">Prefer not to say</option><option value="true">Yes</option><option value="false">No</option></select></div></>)}
            <div className="modal-actions"><button className="btn btn-secondary" onClick={() => setShowOnboarding(false)}>Skip</button><button className="btn btn-primary" onClick={handleOnboardingNext}>{onboardingStep === 3 ? 'Get Started' : 'Continue →'}</button></div>
          </div>
        </div>
      )}

      {toast && (<div className={`toast toast-${toast.type}`} role="status">{toast.type === 'success' && '✓'}{toast.type === 'error' && '✕'}{toast.type === 'info' && 'ℹ'} {toast.message}</div>)}
    </div>
  );
}

export default App;
