import streamlit as st

def apply_custom_styles():
    """
    Apply minimal custom CSS for a cleaner look.
    """
    st.markdown("""
        <style>

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
        /* Global Styles */
        .stButton > button {
            border-radius: 12px;
            font-weight: 600;
        }
        .stTextInput > div > div > input {
            border-radius: 12px;
        }
        
        /* Insight Card Styles */
        .insight-card {
            background-color: #1E212B; /* Slightly lighter than #0E1117 */
            border: 1px solid #00ADB5; /* Vibrant Teal Border */
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .insight-header {
            color: #FAFAFA;
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 20px;
            border-bottom: 1px solid rgba(0, 173, 181, 0.3); /* Subtle Teal Divider */
            padding-bottom: 10px;
        }
        .insight-metrics-container {
            display: flex;
            justify-content: space-between;
            gap: 20px;
        }
        .insight-metric {
            flex: 1;
            text-align: center;
            padding: 15px;
            background-color: rgba(255, 255, 255, 0.03);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .insight-metric-label {
            color: #A0A0A0;
            font-size: 0.85rem;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-weight: 500;
        }
        .insight-metric-value {
            color: #FAFAFA;
            font-size: 1.8rem;
            font-weight: 700;
        }
        </style>
    """, unsafe_allow_html=True)

def render_insights_card(stats):
    """
    Render the insights section as a custom styled card.
    """
    if not stats:
        return

    top_cat = stats['top_categories'][0]['category'] if stats['top_categories'] else "N/A"
    
    html = f"""
    <div class="insight-card">
        <div class="insight-header">Your Money Insights</div>
        <div class="insight-metrics-container">
            <div class="insight-metric">
                <div class="insight-metric-label">Total Spending</div>
                <div class="insight-metric-value">${stats['total_spending']:,.2f}</div>
            </div>
            <div class="insight-metric">
                <div class="insight-metric-label">Top Category</div>
                <div class="insight-metric-value">{top_cat}</div>
            </div>
            <div class="insight-metric">
                <div class="insight-metric-label">Net Flow</div>
                <div class="insight-metric-value" style="color: {'#4ade80' if stats['net'] >= 0 else '#f87171'}">
                    ${stats['net']:,.2f}
                </div>
            </div>
        </div>
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)

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
        "Motivated": "💪",
        "Optimistic": "🌟",
        "Confident": "😎",
        "Cautious": "🛡️",
        "Frustrated": "😤",
        "Content": "😌"
    }
