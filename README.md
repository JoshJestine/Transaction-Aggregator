# 🧾 Transaction Aggregator  
**Project built for CS 5170**

## 🧩 Overview  
Managing personal finances often requires accessing multiple banking apps, payment platforms, or expense trackers. This fragmented approach makes it difficult for users to get a holistic view of their transactions, track spending habits, or manage budgets efficiently. Without a unified perspective, users risk overspending, missing payments, or experiencing financial stress.

## Setup Instructions & Running Application
1. Clone the repository
2. Copy `backend/.env.example` to `backend/.env`
3. Add your Plaid credentials to `backend/.env`
4. Install dependencies:
```bash
   cd backend && npm install
   cd ../frontend && npm install
```
5. Run the application (two terminals):
```bash
   # Terminal 1
   cd backend && npm start
   
   # Terminal 2
   cd frontend && npm start
```

## 👥 Target Users  
- Individuals who use multiple bank accounts, credit/debit cards, or payment apps.  
- Young professionals, students, and busy adults who want a streamlined overview of their finances.  
- Users seeking better control over their spending without the cognitive load of managing multiple applications.

## 🤖 Proposed AI Solution  
The **Transaction Aggregator** is an AI-driven tool that consolidates all transactions and expenses from multiple sources into a single, intuitive dashboard.  

### Key Features:
- **Machine Learning Categorization** – Automatically categorizes transactions and detects spending patterns.  
- **Insight Generation** – Provides personalized summaries and recommendations based on user behavior.  
- **Unified Dashboard** – Offers a clean and interactive view of financial data across platforms.  

### Tech Stack:
- **Frontend:** React for dynamic and modular components.  
- **Data Visualization:** Chart.js or D3.js for interactive charts and insights.  
- **Styling:** Tailwind CSS for a responsive, modern UI.  

This human-centered approach ensures users can understand their financial data quickly and make informed decisions without deep financial expertise.

## 🎨 Human-Centered Design Elements  
- **Ease of Use:** Clean, simple interface with a unified dashboard that reduces cognitive load.  
- **Personalized Insights:** AI-driven categorization and spending summaries tailored to user behavior.  
- **Transparency & Control:** Users can view data sources, edit categories, and customize alerts for budget management.  
- **Security & Privacy:** Strong encryption and ethical handling of sensitive financial data to build user trust.  

## 💬 Potential Stakeholders for Feedback  
- Personal finance bloggers and communities (e.g., [r/personalfinance](https://www.reddit.com/r/personalfinance/), financial literacy groups).  
- Banking or fintech product managers and developers.  
- Users who actively track budgets using apps like Mint, YNAB, or Plaid-integrated platforms.  
- Consumer advocacy organizations focusing on digital finance tools.  

## 🚀 Future Enhancements  
- Integration with Plaid or similar APIs for live financial data import.  
- Advanced predictive analytics for expense forecasting.  
- Customizable budgeting goals and visual progress tracking.  
- AI chat assistant for on-demand financial queries.  

## 📄 License  
This project is for educational purposes as part of **CS 5170**.  
