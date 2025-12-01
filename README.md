<div align="center">
  <img src="assets/SpendLensLogo.png" alt="SpendLens Logo" width="200">
</div>

---
A friendly, privacy-focused web app that turns your transaction data into a calm, "Money narrative". Designed for students, young adults, and even professionals who are busy and want to understand their spending without being overwhelmed by complex dashboards.

## 🌟 Features
-   **Simple Data Input**: Upload a CSV or use sample data to get started instantly.
-   **Mood-Adaptive Narrative**: Select your current mood (Stressed, Motivated, etc.) to get a story tailored to your emotional state.
-   **The Money Narrative**: A narrative summary of your month:
    1.  Month at a Glance
    2.  Surprises and Spikes
    3.  Wins and Bright Spots
    4.  One-Week Action Plan
-   **Chat with Finn**: Ask follow-up questions to a friendly AI assistant who knows your data context.
-   **Privacy First**: All data processing happens locally. Your CSV is never saved to disk or sent to a server. Only anonymized statistics are sent to the LLM for narrative generation.

## 🛠️ Setup Instructions

### Prerequisites
-   Anaconda/Miniconda OR Python 3.11+ installed.
-   A Google Gemini API Key.

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Create and activate the environment**

    Choose one of the following methods:

    **Option 1: Using Conda**
    ```bash
    # Create environment in project root
    conda create --prefix ./venv python=3.11 -y

    # Activate the environment
    conda activate ./venv
    ```

    **Option 2: Using Python venv**
    ```bash
    # Create environment
    python -m venv venv

    # Activate the environment
    # On macOS/Linux:
    source venv/bin/activate
    # On Windows:
    # venv\Scripts\activate
    ```

3.  **Install dependencies**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure API Key**
    -   Copy `.env.example` to `.env`:
        ```bash
        cp .env.example .env
        ```
    -   Open `.env` and paste your Gemini API Key:
        ```
        GEMINI_API_KEY="AIza..."
        ```

5.  **Run the App**
    ```bash
    streamlit run app.py
    ```

## 📖 Usage Guide

1.  **Welcome**: Enter your name to personalize the experience.
2.  **Upload Data**: Click "Browse files" to upload your own CSV, or click "Use Sample Data" to try the app with demo transactions.
3.  **Manage Data**: Review your transactions in the data editor. You can edit values directly and click "Update Analysis" to refresh the insights.
4.  **Select Mood**: Tell the app how you're feeling about money right now (e.g., Stressed, Motivated). This adjusts the tone of the narrative.
5.  **Generate Narrative**: Click "Generate My Money Narrative" to receive a personalized 4-act summary of your financial month.
6.  **Explore Insights**:
    -   **Narrative**: Read your personalized story.
    -   **Charts**: Click "Show/Hide Charts" to visualize expenses by category and daily spending trends.
7.  **Chat with Finn**: Use the chat interface on the right to ask follow-up questions like "How can I save more on food?" or "What was my biggest expense?".
8.  **Reset**: Use the "Reset / Clear Data" button to wipe your session data, or "Log Out" to return to the welcome screen.

## 📊 CSV Format

If uploading your own data, your CSV must have at least these columns:

| date | description | amount | category |
| :--- | :--- | :--- | :--- |
| 2023-10-01 | Uber Ride | -24.50 | Transport |
| 2023-10-02 | Starbucks | -5.75 | Dining |
| 2023-10-30 | Salary Deposit | 3500.00 | Income |

-   **date**: YYYY-MM-DD format preferred.
-   **description**: Text description of the transaction.
-   **amount**: Numeric value. **Negative** numbers indicate expenses (e.g., -24.50), and **Positive** numbers indicate income (e.g., 3500.00).
-   **category** (Optional): Text category for the transaction (e.g., Dining, Transport). If omitted, the app may try to categorize it or group it under 'Uncategorized'.

## 🧠 Human-Centered AI Principles

This project strictly adheres to **Human-Centered AI (HCAI)** and **Shneiderman’s Eight Golden Rules**:

-   **User Control**: You choose when to upload, generate, and reset. No automatic background processing.
-   **Transparency**: The story relies on visible statistics. The app explains *why* it says what it says.
-   **Privacy**: Data is processed in-memory. We respect your financial privacy.
-   **Consistency**: Uniform design language and clear navigation.
-   **Error Prevention**: Friendly validation messages and sample data options prevent frustration.
-   **Internal Locus of Control**: The user drives the experience; the AI assists, it doesn't command.

## ⚠️ Limitations & Disclaimer

-   **Not Financial Advice**: Finn is an AI, not a certified financial planner. Outputs are for educational and reflection purposes only.
-   **LLM Accuracy**: While we ground the AI in calculated stats, large language models can occasionally hallucinate or misinterpret context. Always verify important numbers.
-   **Local Processing**: Since data is not saved, refreshing the page will clear your session. This is a privacy feature, not a bug.
