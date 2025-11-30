# 💵 Accessible Financial Advisor

## CS 5170 AI for HCI - Course Project

An AI-powered financial advisor using the **FREE Google Gemini API** with **CSV upload** for personalized financial analysis.

---

## 🚀 QUICK START (3 Steps)

### Step 1: Get FREE Gemini API Key

1. Go to **https://aistudio.google.com/**
2. Sign in with Google
3. Click **"Get API Key"** → **"Create API Key"**
4. Copy the key

---

### Step 2: Start Backend

Open Terminal #1:

```bash
cd financial-advisor/backend
npm install
```

**Mac/Linux:**
```bash
GEMINI_API_KEY=paste_your_key_here npm start
```

**Windows Command Prompt:**
```cmd
set GEMINI_API_KEY=paste_your_key_here
npm start
```

**Windows PowerShell:**
```powershell
$env:GEMINI_API_KEY="paste_your_key_here"
npm start
```

You should see:
```
╔═══════════════════════════════════════════════════════════════╗
║   💵 ACCESSIBLE FINANCIAL ADVISOR - BACKEND                  ║
║   Server: http://localhost:3001                              ║
║   AI: Google Gemini (FREE)                                    ║
╚═══════════════════════════════════════════════════════════════╝
```

---

### Step 3: Start Frontend

Open Terminal #2 (keep backend running):

```bash
cd financial-advisor/frontend
npm install
npm start
```

Browser opens automatically at **http://localhost:3000**

---

## 📊 CSV UPLOAD FEATURE

### How to Use

1. Click the **"📤 Upload CSV"** button in the header
2. Select a CSV file with your financial data
3. The AI will analyze your data and provide personalized advice
4. Use the **Quick Actions** for data-specific queries

### Supported CSV Formats

The app automatically detects three types of financial data:

#### 1. Monthly Budget (expenses)
```csv
Category,Budgeted,Actual,Difference
Housing,1500,1500,0
Groceries,400,425,-25
Entertainment,150,220,-70
```

#### 2. Transactions
```csv
Date,Description,Category,Amount
2024-01-02,Monthly Salary,Income,4500
2024-01-03,Rent Payment,Housing,-1500
2024-01-04,Grocery Store,Groceries,-125
```

#### 3. Monthly Overview
```csv
Month,Income,Expenses,Savings,Debt Payment,Investments
January,5300,3850,650,200,300
February,5100,3720,580,200,300
```

### Sample Data for Testing

Use the sample CSV files in `/sample-data/`:
- `monthly_budget.csv` - Monthly budget with 20 expense categories
- `transactions.csv` - 31 sample transactions for January
- `monthly_overview.csv` - 12 months of financial data

---

## 📁 Project Structure

```
financial-advisor/
├── backend/
│   ├── server.js      ← Express API (Gemini AI + CSV parsing)
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js     ← Main React component
│   │   ├── App.css    ← Styles
│   │   └── index.js
│   └── package.json
├── sample-data/       ← Test CSV files
│   ├── monthly_budget.csv
│   ├── transactions.csv
│   └── monthly_overview.csv
└── README.md
```

---

## 📐 Shneiderman's Eight Golden Rules

| Rule | Implementation |
|------|----------------|
| 1. Consistency | CSS variables, uniform button styles |
| 2. Shortcuts | Ctrl+Enter, Ctrl+U (upload), Quick Actions |
| 3. Feedback | Loading dots, toast notifications, data badges |
| 4. Closure | Welcome messages, upload confirmations |
| 5. Error Handling | Retry buttons, clear error messages |
| 6. Easy Reversal | Undo button, remove data option |
| 7. User Control | Manual settings, optional features |
| 8. Reduce Memory | Visible data summary, context-aware quick actions |

---

## ♿ Accessibility Features

- ✓ Screen reader support (ARIA labels)
- ✓ Full keyboard navigation
- ✓ High contrast mode
- ✓ Adjustable font size (12-24px)
- ✓ Skip navigation link
- ✓ Focus indicators

---

## 🤖 AI Component

- Uses **Google Gemini 1.5 Flash** (FREE tier)
- **CSV Analysis**: Parses and summarizes uploaded financial data
- **Personalized Advice**: Uses user profile + financial data
- **Context Awareness**: Maintains conversation history
- **Data-Driven Insights**: References actual numbers in responses

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Ctrl+Enter` | Send message (alternative) |
| `Ctrl+U` | Upload CSV file |
| `Ctrl+,` | Open settings |
| `Escape` | Clear input |

---

## 🛠️ Troubleshooting

**"Cannot connect to backend"**
→ Make sure backend is running on port 3001

**"GEMINI_API_KEY not set"**
→ Set the environment variable before running npm start

**"Only CSV files are allowed"**
→ Make sure your file has a .csv extension

**"CSV file is empty"**
→ Check that your CSV has data rows (not just headers)

---

## 📚 For CS 5170

This project demonstrates:
1. **AI Integration** - Gemini API for intelligent responses
2. **Data Processing** - CSV parsing and financial analysis
3. **HCI Principles** - Shneiderman's 8 Golden Rules
4. **Accessibility** - WCAG 2.1 AA compliance
5. **User-Centered Design** - Personalization & data-driven UX

---

Created for CS 5170 AI for HCI
