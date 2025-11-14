import React, { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { CreditCard, TrendingDown, TrendingUp, Building, Calendar } from 'lucide-react';
import './App.css';

function App() {
  const [linkToken, setLinkToken] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = 'http://localhost:5000';

  // Generate link token on component mount
  useEffect(() => {
    async function createLinkToken() {
      const response = await fetch(`${API_URL}/api/create_link_token`, {
        method: 'POST',
      });
      const data = await response.json();
      setLinkToken(data.link_token);
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

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balances.current, 0);
  const monthlyExpenses = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyIncome = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <div className="header-content">
            <div className="icon-badge">
              <CreditCard size={28} />
            </div>
            <div>
              <h1>Transaction Aggregator</h1>
              <p>Powered by Plaid API</p>
            </div>
          </div>
          {!isConnected && (
            <button
              onClick={() => open()}
              disabled={!ready || isLoading}
              className="connect-button"
            >
              {isLoading ? 'Connecting...' : 'Connect Bank Account'}
            </button>
          )}
        </div>

        {!isConnected ? (
          <div className="empty-state">
            <Building size={64} />
            <h2>Connect Your Bank</h2>
            <p>Securely link your bank accounts to view all transactions</p>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card balance">
                <div className="stat-header">
                  <span>Total Balance</span>
                  <TrendingUp size={20} />
                </div>
                <p className="stat-value">${totalBalance.toFixed(2)}</p>
              </div>
              <div className="stat-card income">
                <div className="stat-header">
                  <span>Income</span>
                  <TrendingUp size={20} />
                </div>
                <p className="stat-value">${monthlyIncome.toFixed(2)}</p>
              </div>
              <div className="stat-card expenses">
                <div className="stat-header">
                  <span>Expenses</span>
                  <TrendingDown size={20} />
                </div>
                <p className="stat-value">${monthlyExpenses.toFixed(2)}</p>
              </div>
            </div>

            <div className="section">
              <h2>Connected Accounts ({accounts.length})</h2>
              <div className="accounts-grid">
                {accounts.map((account) => (
                  <div key={account.account_id} className="account-card">
                    <div className="account-header">
                      <span className="account-name">{account.name}</span>
                      <span className="account-type">{account.type}</span>
                    </div>
                    <p className="account-mask">****{account.mask}</p>
                    <p className="account-balance">
                      ${account.balances.current.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="section">
              <h2>Recent Transactions ({transactions.length})</h2>
              <div className="transactions-list">
                {transactions.slice(0, 20).map((transaction) => (
                  <div key={transaction.transaction_id} className="transaction-item">
                    <div className="transaction-icon">
                      {transaction.amount < 0 ? (
                        <TrendingUp className="income-icon" />
                      ) : (
                        <TrendingDown className="expense-icon" />
                      )}
                    </div>
                    <div className="transaction-details">
                      <p className="transaction-name">{transaction.name}</p>
                      <div className="transaction-meta">
                        <Calendar size={14} />
                        <span>{transaction.date}</span>
                        <span>•</span>
                        <span className="category-badge">
                          {transaction.category?.[0] || 'Other'}
                        </span>
                      </div>
                    </div>
                    <p className={`transaction-amount ${transaction.amount < 0 ? 'income' : 'expense'}`}>
                      {transaction.amount < 0 ? '+' : '-'}$
                      {Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;