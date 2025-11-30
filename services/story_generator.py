import os
import google.generativeai as genai
from config.settings import GEMINI_API_KEY, GEMINI_MODEL_NAME

def configure_genai():
    if not GEMINI_API_KEY:
        return False
    genai.configure(api_key=GEMINI_API_KEY)
    return True

def generate_money_story(stats, mood):
    """
    Generate the 4-act Money Storybook using Google Gemini.
    """
    if not configure_genai():
        return "Error: Gemini API Key not found. Please set it in the .env file."

    system_prompt = """
    You are “Money Mentor,” a friendly financial explainer.
    Your job is to produce a short “Money Storybook” with exactly four sections:
    1. “Your Month at a Glance”
    2. “Surprises and Spikes”
    3. “Wins and Bright Spots”
    4. “One-Week Action Plan”

    Adapt your tone to the user's mood:
    - Stressed/Anxious: comforting, non-judgmental, focusing on small wins and small steps.
    - Curious/Neutral: explanatory, neutral tone; emphasize understanding.
    - Motivated/Optimistic/Confident: encouraging, challenge-based, but realistic.
    - Cautious: prudent, risk-aware, focusing on safety and stability.
    - Frustrated: empathetic, validating feelings, focusing on solutions.
    - Content: affirming, reinforcing good habits, maintaining stability.

    Rules:
    - Return the response as a valid JSON object with a key "acts".
    - "acts" should be a list of 4 objects, each with:
        - "title": The act title (e.g., "Act 1: ..."). Do NOT use markdown headers like ###. Use plain English text.
        - "content": The story text for that act (Markdown allowed for body, no LaTeX).
        - "visual_prompt": A short, descriptive English prompt for an AI image generator to visualize this section. MUST specify "clip art style" and "no text in image". (e.g., "A bright sun rising over a pile of coins, digital art, clip art style, no text").
    - Do not invent numbers. Only use the provided stats.
    - Keep content concise (2–5 sentences).
    - Ensure there is a space before and after every bolded number.
    """

    user_prompt = f"""
    User Mood: {mood}
    
    Financial Stats:
    {stats}
    
    Please write the Money Storybook in JSON format.
    """

    try:
        model = genai.GenerativeModel(GEMINI_MODEL_NAME, generation_config={"response_mime_type": "application/json"})
        # Combine system prompt and user prompt
        full_prompt = f"{system_prompt}\n\n{user_prompt}"
        
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        return f'{{"error": "{str(e)}"}}'
    except Exception as e:
        return f"Error generating story: {str(e)}"
