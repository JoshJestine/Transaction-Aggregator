import streamlit as st
import pandas as pd
import os
import json
import urllib.parse
from config.settings import APP_NAME, SAMPLE_DATA_PATH
from services.data_processing import load_data, validate_data, compute_stats
from services.story_generator import generate_money_story
from services.chat import generate_chat_response
from utils.ui_helpers import apply_custom_styles, render_metric_card, get_mood_emojis, render_insights_card



# Page Config
st.set_page_config(
    page_title=APP_NAME,
    page_icon="📖",
    layout="wide"
)



# Apply custom styles
apply_custom_styles()

# Session State Initialization
if "stats" not in st.session_state:
    st.session_state.stats = None
if "story" not in st.session_state:
    st.session_state.story = None
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []
if "mood" not in st.session_state:
    st.session_state.mood = None
if "df" not in st.session_state:
    st.session_state.df = None
if "username" not in st.session_state:
    st.session_state.username = None

def logout():
    """Clear all session state data including username."""
    st.session_state.stats = None
    st.session_state.story = None
    st.session_state.chat_history = []
    st.session_state.mood = None
    st.session_state.df = None
    st.session_state.username = None
    st.rerun()

def clear_data():
    """Clear data but keep username."""
    st.session_state.stats = None
    st.session_state.story = None
    st.session_state.chat_history = []
    st.session_state.mood = None
    st.session_state.df = None
    st.rerun()

# --- Welcome Screen ---
if not st.session_state.username:
    st.image("assets/SpendLensLogo.png", width=400)
    
    st.title("👋 Welcome to " + APP_NAME)
    st.markdown("### Let's get to know you.")
    
    with st.form("welcome_form"):
        name_input = st.text_input("What should we call you?")
        submitted = st.form_submit_button("Get Started 🚀", type="primary")
        
        if submitted and name_input:
            st.session_state.username = name_input.strip().title()
            st.rerun()

    st.markdown("---")
    st.markdown("""
        ##### What is this?
        - **SpendLens** turns your transaction history into simple, human-readable insights. 
        - Instead of overwhelming dashboards, you get a calm, insightful narrative tailored to your current mood.  
        - Plus a friendly AI mentor to answer your questions.
    """)
            
# --- Main App ---
else:
    # --- Header ---
    # Use columns to create a header row with Logo (Left) and Logout (Right)
    col_logo, _, col_logout = st.columns([1, 3, 1])
    
    with col_logo:
        st.image("assets/SpendLensLogo.png", width=200)
        
    with col_logout:
        # Using a container to push button to the right if needed, 
        # but standard column behavior with use_container_width should be fine or just default.
        if st.button("Log Out 👤", use_container_width=True, type="primary"):
            logout()

    st.title(f"Welcome, {st.session_state.username}! 👋")         
    
    # st.caption(APP_NAME)
    st.markdown("""
        **Your monthly spending, explained simply.**  
        Upload your transactions to get a personalized, stress-free narrative about your money.
    """)

    st.info("🔒 **Privacy Note:** Your data is processed locally in memory and is never saved to disk or sent to any server (except for the anonymized stats sent to the AI to write your story).")

    # --- Data Input Section ---
    if st.session_state.stats is None:
        st.header("Add Your Data")
        
        col1, col2 = st.columns(2)
        
        with col1:
            uploaded_file = st.file_uploader("Upload CSV", type=["csv"], help="Required columns: date, description, amount | Optional columns: category")
            
        with col2:
            st.write("Or try with sample data:")
            if st.button("Use Sample Data", type="primary"):
                try:
                    if os.path.exists(SAMPLE_DATA_PATH):
                        uploaded_file = SAMPLE_DATA_PATH
                    else:
                        st.error("Sample data file not found.")
                except Exception as e:
                    st.error(f"Error loading sample data: {e}")

        if uploaded_file:
            try:
                df = load_data(uploaded_file)
                is_valid, message = validate_data(df)
                
                if is_valid:
                    st.success("Data loaded successfully!")
                    stats = compute_stats(df)
                    st.session_state.stats = stats
                    st.session_state.df = df
                    st.rerun()
                else:
                    st.error(f"Invalid CSV: {message}")
                    st.markdown("[Download sample CSV format](https://raw.githubusercontent.com/your-repo/sample_data/sample_transactions.csv)") # Placeholder link
            except Exception as e:
                st.error(f"Error processing file: {e}")

    # --- Main App Flow (After Data Load) ---
    else:
        # Create Main Layout: Left (Content) vs Right (Chatbot)
        col_main, col_chat = st.columns([2, 1], gap="large")
        
        # --- LEFT COLUMN: Main Content ---
        with col_main:
            # Show Data Preview
            if st.session_state.df is not None:
                with st.expander("📊 View Uploaded Data (First 5 rows)"):
                    # Create a copy for display to avoid messing with the actual data used for stats
                    display_df = st.session_state.df.head().copy()
                    # Format date if it's a datetime column
                    if pd.api.types.is_datetime64_any_dtype(display_df['date']):
                         display_df['date'] = display_df['date'].dt.strftime('%Y-%m-%d')
                    st.dataframe(display_df)
            
            if st.button("🔄 Reset / Clear Data", use_container_width=True, type="primary"):
                clear_data()

            st.divider()
            # Render Custom Insights Card
            render_insights_card(st.session_state.stats)
            
            st.divider()
                    
            # --- Mood Selection ---
            st.header("How are you feeling about money this month?")
            moods = get_mood_emojis()
            
            # Create columns for mood buttons in a grid (5 columns per row)
            mood_items = list(moods.items())
            for i in range(0, len(mood_items), 5):
                cols = st.columns(5)
                for j in range(5):
                    if i + j < len(mood_items):
                        mood_name, emoji = mood_items[i + j]
                        with cols[j]:
                            if st.button(f"{emoji}\n{mood_name}", key=f"mood_{mood_name}", use_container_width=True):
                                st.session_state.mood = mood_name
            
            if st.session_state.mood:
                st.success(f"Selected Mood: {moods[st.session_state.mood]} {st.session_state.mood}")
                
                # --- Generate Story ---
                # Always show generate button to allow regeneration
                if st.button("✨ Generate My Money Narrative", type="primary"):
                    with st.spinner("Writing your narrative..."):
                        story = generate_money_story(st.session_state.stats, st.session_state.mood)
                        st.session_state.story = story
                        st.rerun()
                
                # --- Display Story ---
                if st.session_state.story:
                    st.divider()
                    
                    # The Story
                    try:
                        # Try to parse JSON. If it fails (legacy string), fallback to markdown
                        story_data = json.loads(st.session_state.story)
                        
                        if "acts" in story_data:
                            for act in story_data["acts"]:
                                with st.container():
                                    st.markdown(f"### {act['title']}")
                                    
                                    # Layout: Image on left, Text on right (or stacked on mobile)
                                    # Using columns for a "card" feel
                                    col_img, col_text = st.columns([1, 2])
                                    
                                    with col_img:
                                        # Generate image URL using Pollinations.ai
                                        # Encode prompt to be URL safe
                                        safe_prompt = urllib.parse.quote(act['visual_prompt'])
                                        image_url = f"https://image.pollinations.ai/prompt/{safe_prompt}?width=400&height=300&nologo=true"
                                        st.image(image_url, width='stretch')
                                        
                                    with col_text:
                                        st.markdown(act['content'])
                                        
                                    st.markdown("---") # Divider between acts
                        else:
                            st.markdown(st.session_state.story)

                    except json.JSONDecodeError:
                        # Fallback for legacy string format
                        st.markdown(st.session_state.story)
                    except Exception as e:
                        st.error(f"Error rendering story: {e}")
                        st.markdown(st.session_state.story)
                    
                    st.divider()

        # --- RIGHT COLUMN: Chatbot ---
        with col_chat:
            st.markdown("### 💬 Money Mentor Chat")
            
            # Container for chat history to make it scrollable/contained
            with st.container(height=400, border=True):
                # Display chat history
                if not st.session_state.chat_history:
                    st.info("Ask me anything about your spending!")
                
                for message in st.session_state.chat_history:
                    with st.chat_message(message["role"]):
                        st.markdown(message["content"])

                # Chat Input
                # Note: st.chat_input is fixed to bottom of the container/page usually.
                # When inside a column, it might behave differently or stick to bottom of column.
                # Let's try placing it inside the container or just below it.
                # st.chat_input always sticks to bottom of viewport in standard mode.
                # To make it stick to the column, we might need to use st.text_input + button or accept the bottom placement.
                # However, Streamlit's st.chat_input is designed to be at the bottom of the *script* execution flow or main area.
                # If we want it in the sidebar/column, it might still float at bottom.
                
                # Let's try using st.chat_input normally. It will likely stay at the bottom of the screen, spanning the width.
                # If we want it restricted to the column, we might need a workaround or accept it.
                # Actually, st.chat_input takes the full width of its parent container if placed inside one?
                # No, st.chat_input is always fixed to bottom.
                
                # Alternative: Use a form with text_input for a "contained" chat experience in the right column.
                pass 

            # Input for chat (using form to keep it in the column flow)
            with st.form(key="chat_form", clear_on_submit=True):
                user_input = st.text_area("Ask a question...", height=100)
                submit_chat = st.form_submit_button("Send", use_container_width=True, type="primary")
                
                if submit_chat and user_input:
                    # Add user message to history
                    st.session_state.chat_history.append({"role": "user", "content": user_input})
                    
                    # Generate response
                    # We need to rerun to show the user message immediately? 
                    # Streamlit forms rerun on submit.
                    
                    # Generate response logic
                    with st.spinner("Thinking..."):
                        response = generate_chat_response(
                            st.session_state.chat_history,
                            st.session_state.stats,
                            st.session_state.story if st.session_state.story else ""
                        )
                        
                    # Add assistant response to history
                    st.session_state.chat_history.append({"role": "assistant", "content": response})
                    st.rerun()

# Footer
# st.markdown("---")
st.markdown(
    """
    <div style="font-size:14px; color:#b00020; font-weight:600;">
        ⚠️ <strong>Disclaimer:</strong> This is not professional financial advice. Outputs are for reflection and education only.
    </div>
    """,
    unsafe_allow_html=True
)
