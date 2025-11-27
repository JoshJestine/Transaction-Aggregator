import React, { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Building, Wallet, TrendingUp, Lightbulb } from 'lucide-react';
import './App.css';

// Components
import Header from './components/Header';
import MetricCard from './components/MetricCard';
import IncomeChart from './components/IncomeChart';
import QuickActions from './components/QuickActions';

function App() {
  const [linkToken, setLinkToken] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = 'http://localhost:5050';

  // Generate link token on component mount
  useEffect(() => {
    async function createLinkToken() {
      try {
        const response = await fetch(`${API_URL}/api/create_link_token`, {
          method: 'POST',
        });
        const data = await response.json();
        setLinkToken(data.link_token);
      } catch (error) {
        console.error("Error creating link token:", error);
      }
    }
    createLinkToken();
  }, []);

  // Handle successful link
  const onSuccess = async (public_token) => {
    setIsLoading(true);

    // Exchange public token
    await fetch(`${API_URL}/api/set_access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_token }),
    });

    // Get accounts
    const accountsResponse = await fetch(`${API_URL}/api/accounts`);
    const accountsData = await accountsResponse.json();
    setAccounts(accountsData.accounts);

    // Get transactions
    const transactionsResponse = await fetch(`${API_URL}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: '2024-01-01',
        endDate: new Date().toISOString().split('T')[0],
      }),
    });
    const transactionsData = await transactionsResponse.json();
    setTransactions(transactionsData.transactions);

    setIsConnected(true);
    setIsLoading(false);
  };

  const config = {
    token: linkToken,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  // Calculate metrics
  const monthlyExpenses = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyIncome = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Mock data for the chart (combining historical and forecast)
  const chartData = [
    { month: 'Jun', amount: 4200, isForecast: false },
    { month: 'Jul', amount: 4500, isForecast: false },
    { month: 'Aug', amount: 4100, isForecast: false },
    { month: 'Sep', amount: 4800, isForecast: false },
    { month: 'Oct', amount: 5100, isForecast: false },
    { month: 'Nov', amount: 4900, isForecast: false },
    { month: 'Dec', amount: 5300, isForecast: true },
    { month: 'Jan', amount: 5500, isForecast: true },
    { month: 'Feb', amount: 5800, isForecast: true },
  ];

  // Handle logout
  const handleLogout = () => {
    setIsConnected(false);
    setAccounts([]);
    setTransactions([]);
  };

  return (
    <div className="app">
      <Header isConnected={isConnected} onLogout={handleLogout} />

      <main className="dashboard-content">
        {!isConnected ? (
          <div className="connect-state">
            <div className="connect-card">
              <Building size={64} className="connect-icon" />
              <h2>Connect Your Bank</h2>
              <p>Securely link your bank accounts to enable the Financial Advisory Dashboard.</p>
              <button
                onClick={() => open()}
                disabled={!ready || isLoading}
                className="connect-button"
              >
                {isLoading ? 'Connecting...' : 'Connect Bank Account'}
              </button>
            </div>
          </div>
        ) : (
          <div className="dashboard-grid">
            {/* Key Metrics Row */}
            <div className="metrics-row">
              <MetricCard
                title="Total Income"
                value={`$${monthlyIncome.toFixed(2)}`}
                type="income"
                trend={12}
                icon={Wallet}
              />
              <MetricCard
                title="Total Expenses"
                value={`$${monthlyExpenses.toFixed(2)}`}
                type="expense"
                trend={-5}
                icon={TrendingUp}
              />
              <MetricCard
                title="AI Savings Tip"
                description="You could save $150 by switching your internet provider."
                type="savings"
                icon={Lightbulb}
              />
            </div>

            {/* Main Content Row: Chart + Quick Actions */}
            <div className="main-row">
              <div className="chart-section">
                <IncomeChart data={chartData} />
              </div>
              <div className="actions-section">
                <QuickActions />
              </div>
            </div>

            {/* Recent Transactions (Optional/Below fold) */}
            <div className="transactions-section">
              <h3>Recent Transactions</h3>
              <div className="transactions-list">
                {transactions.slice(0, 5).map((t) => (
                  <div key={t.transaction_id} className="transaction-row">
                    <span className="t-name">{t.name}</span>
                    <span className="t-date">{t.date}</span>
                    <span className={`t-amount ${t.amount < 0 ? 'income' : 'expense'}`}>
                      {t.amount < 0 ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;