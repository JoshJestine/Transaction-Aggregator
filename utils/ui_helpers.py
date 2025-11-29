import streamlit as st

def apply_custom_styles():
    """
    Apply minimal custom CSS for a cleaner look.
    """
    st.markdown("""
        <style>
        .stApp {
            max-width: 1200px;
            margin: 0 auto;
        }
        .metric-card {
            background-color: #f0f2f6;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .metric-label {
            font-size: 0.9rem;
            color: #555;
            margin-bottom: 5px;
        }
        .metric-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #000;
        }
        </style>
    """, unsafe_allow_html=True)

def render_metric_card(label, value, help_text=None):
    """
    Render a simple metric card using Streamlit native metrics or custom HTML.
    Using native st.metric for simplicity and consistency.
    """
    st.metric(label=label, value=value, help=help_text)

def get_mood_emojis():
    """
    Return a dictionary of moods and their corresponding emojis.
    """
    return {
        "Stressed": "😰",
        "Anxious": "😟",
        "Curious": "🤔",
        "Neutral": "😐",
        "Motivated": "💪"
    }
