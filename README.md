# Emotion-Aware Money Storybook 📖

A friendly, privacy-focused web app that turns your transaction data into a calm, narrative "Money Storybook". Designed for students and young adults who want to understand their spending without being overwhelmed by complex dashboards.

## 🌟 Features

-   **Simple Data Input**: Upload a CSV or use sample data to get started instantly.
-   **Mood-Adaptive Storytelling**: Select your current mood (Stressed, Motivated, etc.) to get a story tailored to your emotional state.
-   **The Money Storybook**: A 4-act narrative summary of your month:
    1.  Month at a Glance
    2.  Surprises and Spikes
    3.  Wins and Bright Spots
    4.  One-Week Action Plan
-   **Money Mentor Chat**: Ask follow-up questions to a friendly AI assistant who knows your data context.
-   **Privacy First**: All data processing happens locally. Your CSV is never saved to disk or sent to a server. Only anonymized statistics are sent to the LLM for story generation.

## 🛠️ Setup Instructions

### Prerequisites
-   Anaconda or Miniconda installed.
-   A Google Gemini API Key.

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Create and activate the environment**
    ```bash
    # Create environment in project root
    conda create --prefix ./venv python=3.11 -y

    # Activate the environment
    conda activate ./venv
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

1.  **Upload Data**: Click "Browse files" to upload your own CSV, or click "Use Sample Data" to try the app with demo transactions.
2.  **Select Mood**: Tell the app how you're feeling about money right now. This adjusts the tone of the story.
3.  **Generate Story**: Click the button to read your 4-act Money Storybook.
4.  **Chat**: Use the chat interface at the bottom to ask questions like "How can I save more on food?" or "What was my biggest expense?".
5.  **Reset**: Use the "Reset / Clear Data" button at the top to wipe your session and start over.

## 📊 CSV Format

If uploading your own data, your CSV must have at least these columns:

| date | description | amount |
| :--- | :--- | :--- |
| 2023-10-01 | Uber Ride | 24.50 |
| 2023-10-02 | Starbucks | 5.75 |

-   **date**: YYYY-MM-DD format preferred.
-   **description**: Text description of the transaction.
-   **amount**: Numeric value. Positive numbers are treated as spending unless categorized as 'Income'.

## 🧠 Human-Centered AI Principles

This project strictly adheres to **Human-Centered AI (HCAI)** and **Shneiderman’s Eight Golden Rules**:

-   **User Control**: You choose when to upload, generate, and reset. No automatic background processing.
-   **Transparency**: The story relies on visible statistics. The app explains *why* it says what it says.
-   **Privacy**: Data is processed in-memory. We respect your financial privacy.
-   **Consistency**: Uniform design language and clear navigation.
-   **Error Prevention**: Friendly validation messages and sample data options prevent frustration.
-   **Internal Locus of Control**: The user drives the experience; the AI assists, it doesn't command.

## ⚠️ Limitations & Disclaimer

-   **Not Financial Advice**: The "Money Mentor" is an AI, not a certified financial planner. Outputs are for educational and reflection purposes only.
-   **LLM Accuracy**: While we ground the AI in calculated stats, large language models can occasionally hallucinate or misinterpret context. Always verify important numbers.
-   **Local Processing**: Since data is not saved, refreshing the page will clear your session. This is a privacy feature, not a bug.
