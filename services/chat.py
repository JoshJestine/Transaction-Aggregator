import google.generativeai as genai
from config.settings import GEMINI_API_KEY, GEMINI_MODEL_NAME

def configure_genai():
    if not GEMINI_API_KEY:
        return False
    genai.configure(api_key=GEMINI_API_KEY)
    return True

def generate_chat_response(history, stats, story_context):
    """
    Generate a response to a user question in the chat interface using Gemini.
    """
    if not configure_genai():
        return "Error: Gemini API Key not found."

    system_prompt = """
    You are “Money Mentor,” the same friendly financial explainer who wrote the Money Storybook.
    You are chatting with the user about their finances.
    
    Context:
    - You have access to the user's financial stats and the story you just generated.
    - Answer questions based on this data.
    - Explain answers based on visible stats (e.g., “Based on the transactions tagged as Dining…”).
    - Keep responses under ~150 words.
    - Always avoid investment advice.
    - Focus on explanation, reflection, and small behavior changes.
    - Use simple plain English text and bullet points for structure.
    """
    
    # Construct the chat history for Gemini
    # Gemini expects a list of Content objects or a specific format.
    # We'll use a simple approach: create a new chat session with context.
    
    try:
        model = genai.GenerativeModel(GEMINI_MODEL_NAME)
        chat = model.start_chat(history=[])
        
        # Build the context message
        context_msg = f"{system_prompt}\n\nFinancial Stats: {stats}\n\nGenerated Story: {story_context}"
        
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
            role = "User" if msg["role"] == "user" else "Money Mentor"
            full_prompt += f"{role}: {msg['content']}\n"
            
        # The last message in 'history' is the user's new question (added in app.py before calling this).
        # Wait, app.py appends to session_state.chat_history BEFORE calling this.
        # So the last item in `history` is the new prompt.
        
        # Let's just send the full prompt to generate_content for simplicity and reliability in this stateless context.
        response = model.generate_content(full_prompt)
        return response.text

    except Exception as e:
        return f"Error generating response: {str(e)}"
