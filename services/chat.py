import google.generativeai as genai
from config.settings import GEMINI_API_KEY, GEMINI_MODEL_NAME

def configure_genai():
    if not GEMINI_API_KEY:
        return False
    genai.configure(api_key=GEMINI_API_KEY)
    return True

def generate_chat_response(history, stats, story_context, transaction_data=None):
    """
    Generate a response to a user question in the chat interface using Gemini.
    
    Args:
        history: List of chat messages
        stats: Computed financial statistics
        story_context: Generated narrative story
        transaction_data: DataFrame converted to string (CSV format) for detailed queries
    """
    if not configure_genai():
        return "Error: Gemini API Key not found."

    system_prompt = """
    You are Finn, a friendly and empathetic financial assistant for the SpendLens application.
    Your sole purpose is to help users understand their spending habits, analyze their transaction data, 
    and provide financial literacy tips based on the provided dataset.
    
    STRICT BOUNDARY ENFORCEMENT:
    - You must REFUSE to answer any questions that are unrelated to the user's financial data, 
      money management, budgeting, savings, or the specific features of this application.
    - If a user asks about general topics (e.g., "What is the capital of France?", "How do I cook pasta?", "Write a poem about cats", "Tell me a joke", "What's the weather?", coding questions, or any non-financial topics), you MUST politely decline using this standard response:
      
    "I'm Finn, your dedicated Money Mentor! I can only help you with questions about your spending, budget, or financial data. I'm not able to assist with topics outside this scope. Is there anything about your finances I can help you with?"
    
    ALLOWED INTERACTIONS:
    - Small talk related to your persona (e.g., "Hi", "Who are you?", "What can you do?") - respond warmly.
    - Questions about the user's financial data, spending patterns, and transaction history.
    - Requests for budgeting tips, savings advice, and financial literacy explanations.
    - Questions about the SpendLens app features and how to use them.
    - Reflective questions about money habits and behavior changes.
    
    RESPONSE GUIDELINES:
    - You have access to the user's full transaction data (CSV), computed financial stats, and the generated story.
    - Use the transaction data to answer specific questions about individual transactions, merchants, dates, etc.
    - Answer questions based on this data accurately - you can reference specific transactions if asked.
    - Explain answers based on visible stats (e.g., "Based on the transactions tagged as Dining...").
    - Keep responses under ~150 words unless the user asks for detailed breakdowns.
    - Always avoid investment advice or specific stock/crypto recommendations.
    - Focus on explanation, reflection, and small behavior changes.
    - Be warm, encouraging, and non-judgmental.
    
    FORMATTING RULES (CRITICAL - MUST FOLLOW):
    - Do NOT use LaTeX formatting. Never wrap text in dollar signs like $...$ or $$...$$ for any reason.
      Streamlit interprets dollar signs as MathJax, which removes spaces and causes text to mash together
      (e.g., "1200.Thisis..." instead of "1200. This is...").
    - Do NOT use HTML tags of any kind.
    - Do NOT use markdown bold (**text**) or italics (*text*) formatting.
    - For currency amounts, write them as plain text: "20.00 dollars" or "USD 20.00" instead of "$20.00".
      If you must use a dollar sign, ensure there is a space after numbers and before text.
    - Use plain English text only to ensure maximum readability.
    - Use simple dashes (-) for bullet points, not special characters.
    - Your response should look like a standard text message, NOT a math equation or formatted document.
    """
    
    # Construct the chat history for Gemini
    # Gemini expects a list of Content objects or a specific format.
    # We'll use a simple approach: create a new chat session with context.
    
    try:
        model = genai.GenerativeModel(GEMINI_MODEL_NAME)
        chat = model.start_chat(history=[])
        
        # Build the context message with all available data
        context_msg = f"{system_prompt}\n\nFinancial Stats: {stats}\n\nGenerated Story: {story_context}"
        
        # Include full transaction data if available
        if transaction_data:
            context_msg += f"\n\nFull Transaction Data (CSV format):\n{transaction_data}"
        
        # Send context first (invisible to user in UI, but primes the model)
        chat.send_message(context_msg)
        
        # Replay history to get state up to date
        # Note: 'history' arg passed to this function is list of dicts: {"role": "user"/"assistant", "content": "..."}
        # We need to be careful not to double-send. 
        # Ideally, we just send the *last* message if we are maintaining state, but Streamlit re-runs.
        # For a stateless approach with Gemini's `start_chat`, we can feed the history.
        
        # However, `chat.history` in Gemini is a property. We can't easily inject it.
        # A robust way for this stateless function is to construct a prompt chain or use `generate_content` with full history.
        
        full_prompt = context_msg + "\n\nChat History:\n"
        for msg in history:
            role = "User" if msg["role"] == "user" else "Finn"
            full_prompt += f"{role}: {msg['content']}\n"
            
        # The last message in 'history' is the user's new question (added in app.py before calling this).
        # Wait, app.py appends to session_state.chat_history BEFORE calling this.
        # So the last item in `history` is the new prompt.
        
        # Let's just send the full prompt to generate_content for simplicity and reliability in this stateless context.
        response = model.generate_content(full_prompt)
        return response.text

    except Exception as e:
        return f"Error generating response: {str(e)}"
