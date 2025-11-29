import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Gemini Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", "gemini-2.0-flash")

# App Configuration
APP_NAME = "SpendLens" #"Emotion-Aware Money Storybook"
SAMPLE_DATA_PATH = os.path.join("sample_data", "sample_transactions.csv")
