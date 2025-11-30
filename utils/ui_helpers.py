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
        
        /* File Uploader Button Style */
        [data-testid='stFileUploader'] button {
            border-color: #00ADB5;
            color: #00ADB5;
        }
        [data-testid='stFileUploader'] button:hover {
            border-color: #00ADB5;
            color: #00ADB5;
            background-color: rgba(0, 173, 181, 0.1);
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

def render_story_grid(story_data):
    """
    Render the story acts in a 2x2 grid layout.
    """
    if not story_data or "acts" not in story_data:
        st.error("No story data available.")
        return

    acts = story_data["acts"]
    
    # Custom CSS for story card
    st.markdown("""
        <style>
        .story-card {
            background-color: #1E212B;
            border: 1px solid #00ADB5;
            border-radius: 12px;
            padding: 20px;
            height: 400px; /* Fixed height for symmetry */
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .story-header {
            color: #FAFAFA;
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 15px;
            border-bottom: 1px solid rgba(0, 173, 181, 0.3);
            padding-bottom: 8px;
        }
        .story-content {
            color: #E0E0E0;
            font-size: 0.95rem;
            line-height: 1.5;
            flex-grow: 1;
            overflow-y: auto; /* Scroll if text is too long */
            padding-right: 5px; /* Space for scrollbar */
        }
        /* Custom Scrollbar for Webkit */
        .story-content::-webkit-scrollbar {
            width: 6px;
        }
        .story-content::-webkit-scrollbar-thumb {
            background-color: rgba(0, 173, 181, 0.5);
            border-radius: 3px;
        }
        .story-image {
            border-radius: 8px;
            margin-bottom: 15px;
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
        
        /* Rule Card Styles for Accessibility Modal */
        .rule-card {
            background-color: #1E212B;
            border: 1px solid #00ADB5;
            border-radius: 12px;
            padding: 15px;
            min-height: 200px; /* Fixed min-height for alignment */
            height: 100%;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
        }
        .rule-header {
            color: #00ADB5;
            font-size: 1.0rem;
            font-weight: 700;
            margin-bottom: 10px;
            border-bottom: 1px solid rgba(0, 173, 181, 0.2);
            padding-bottom: 5px;
        }
        .rule-text {
            color: #E0E0E0;
            font-size: 0.9rem;
            line-height: 1.4;
        }
        </style>
    """, unsafe_allow_html=True)

    # Create 2x2 Grid
    # Row 1
    col1, col2 = st.columns(2, gap="medium")
    
    with col1:
        if len(acts) > 0:
            render_story_card(acts[0])
            
    with col2:
        if len(acts) > 1:
            render_story_card(acts[1])
            
    # Row 2
    st.markdown('<div style="height: 25px;"></div>', unsafe_allow_html=True) # Vertical spacer to match horizontal gap
    col3, col4 = st.columns(2, gap="medium")
    
    with col3:
        if len(acts) > 2:
            render_story_card(acts[2])
            
    with col4:
        if len(acts) > 3:
            render_story_card(acts[3])

def render_story_card(act):
    """
    Helper to render a single story card.
    """
    import urllib.parse
    
    safe_prompt = urllib.parse.quote(act['visual_prompt'])
    image_url = f"https://image.pollinations.ai/prompt/{safe_prompt}?width=400&height=300&nologo=true"
    
    # We use a container to apply the styling, but Streamlit containers don't support custom classes directly on the div easily without hacky JS.
    # So we will render the HTML structure for the card content.
    # Note: Streamlit markdown with HTML allows us to build the card.
    
    # However, rendering the image inside the HTML might be tricky if we want Streamlit's image optimization, 
    # but standard <img> tag works fine for external URLs.
    
    html = f"""
    <div class="story-card">
        <div class="story-header">{act['title']}</div>
        <img src="{image_url}" class="story-image" alt="{act['title']}">
        <div class="story-content">
            {act['content']} # We might need to convert markdown to HTML here if content has markdown.
            # For now, assuming simple text or basic markdown. 
            # If content has markdown, we should use a library or just let it be text.
            # The prompt asks for "Markdown allowed", so we should ideally parse it.
            # But putting markdown inside HTML div in st.markdown(..., unsafe_allow_html=True) doesn't parse the markdown.
            # We can use a simple replace for bolding if needed, or just display as text.
            # Let's try to keep it simple: The system prompt says "Markdown allowed".
            # If we want to render markdown inside this HTML card, it's complex.
            # Alternative: Use st.container() and styling.
        </div>
    </div>
    """
    
    # BETTER APPROACH: Use st.container and apply style to the container? No, can't target specific container.
    # Let's use the HTML approach but maybe strip markdown or use a simple parser if needed.
    # Or, we can just render the image and text using Streamlit widgets inside a column, 
    # and wrap that column in a styled container using a custom component or just CSS targeting?
    # The user asked for "Wrap the content... inside a styled container".
    
    # Let's stick to the HTML card for best visual control, matching the insight card.
    # We will assume the content is mostly text. If bolding is needed, we can do a quick replace.
    
    content_html = act['content'].replace("**", "<b>").replace("**", "</b>") # Simple bold support
    # Note: The replace above is flawed (replaces both with <b>).
    # Let's just render the text as is, or use a library if available. 
    # Actually, let's just use st.markdown inside a container if possible.
    
    # Re-evaluating: The user wants a "Card Style".
    # We can create the card visual using HTML.
    
    html = f"""
    <div class="story-card">
        <div class="story-header">{act['title']}</div>
        <img src="{image_url}" class="story-image" alt="{act['title']}">
        <div class="story-content">
            {content_html} 
        </div>
    </div>
    """
    # Wait, the replace logic was bad. Let's fix it or just pass text.
    # Let's use a regex or just leave it. The browser might display **text**.
    # Let's try to use `markdown` library if installed, or just `st.markdown`?
    # We can't nest `st.markdown` inside HTML string.
    
    # Revised approach for `render_story_card`:
    # Use HTML for the container and header/image, but maybe just text for content?
    # Or better: Just use the HTML and simple formatting.
    
    # Let's use a simple bold parser.
    import re
    formatted_content = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', act['content'])
    
    html = f"""
    <div class="story-card">
        <div class="story-header">{act['title']}</div>
        <img src="{image_url}" class="story-image" alt="{act['title']}">
        <div class="story-content">
            {formatted_content}
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

@st.dialog("Accessibility Features", width="large")
def show_accessibility_modal():
    """
    Display a modal with accessibility information and Shneiderman's rules.
    """
    st.write("The application was designed with accessibility in mind, following established HCAI and HCI guidelines to ensure all users can effectively use our financial narrative tool.")
    
    st.markdown("""
                ## Shneiderman's Eight Golden Rules of Interface Design
                Our application follows Ben Shneiderman's foundational principles for creating effective, accessible, and user-friendly interfaces:
                """)
    
    rules = [
        {"title": "1. Strive for Consistency", "text": "We utilize a cohesive 'Dark & Teal' design system across the entire application. From the 'Log Out' button to the 'Money Mentor' chat, every interactive element shares identical typography, border-radius, and hover states, ensuring users always recognize actionable items."},
        
        {"title": "2. Cater to Universal Usability", "text": "Beyond standard navigation, we include a dedicated Accessibility Mode (Colorblind/High-Contrast) and a sample data option. This ensures that everyone—from power users to first-time visitors—can interact with the financial narrative without barriers."},
        
        {"title": "3. Offer Informative Feedback", "text": "The application keeps users informed at every step. File uploads display immediate success messages, the 'Money Mentor' indicates when it is processing a response, and the 'Generate Story' button visually updates to confirm the narrative is being created."},
        
        {"title": "4. Design Dialogs to Yield Closure", "text": "The user journey is designed with a beginning, middle, and end. It starts with data onboarding (Upload), moves to exploration (Dashboard & Mood Selection), and concludes with a finalized output (The Money Storybook), giving users a sense of accomplishment."},
        
        {"title": "5. Prevent Errors", "text": "We minimize user errors by restricting file uploads to CSV formats and providing 'Sample Data' for safe testing. Privacy disclaimers and local-processing notifications reassure users that their financial data is handled correctly without accidental server leaks."},
        
        {"title": "6. Permit Easy Reversal of Actions", "text": "Mistakes happen. Users can instantly reset their analysis via the 'Reset / Clear Data' button or remove specific chat histories using the trash-can icon, allowing for a stress-free exploration of their financial data."},
        
        {"title": "7. Keep Users in Control", "text": "The AI does not force a narrative; the user acts as the conductor. By selecting specific 'Moods' (e.g., Optimistic vs. Cautious), the user explicitly directs the tone of the analysis, ensuring the output aligns with their emotional state."},
        
        {"title": "8. Reduce Short-Term Memory Load", "text": "The 'Money Insights' dashboard (Total Spending, Net Flow) remains fixed at the top, and the 'Money Mentor' chat retains conversation history. This allows users to explore detailed stories without having to memorize or recall their aggregate numbers."}
    ]
    
    # Grid Layout: 3 columns
    # We will iterate and create rows of 3
    
    for i in range(0, len(rules), 3):
        cols = st.columns(3)
        for j in range(3):
            if i + j < len(rules):
                rule = rules[i + j]
                with cols[j]:
                    # Using inline styles to ensure rendering inside the modal
                    html = f"""
                    <div style="background-color: #1E212B; border: 1px solid #333; border-radius: 8px; padding: 15px; min-height: 175px; height: 100%; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); display: flex; flex-direction: column; margin-bottom: 20px;">
                        <div style="color: #00ADB5; font-size: 1.0rem; font-weight: 700; margin-bottom: 10px; border-bottom: 1px solid rgba(0, 173, 181, 0.2); padding-bottom: 5px;">{rule['title']}</div>
                        <div style="color: #E0E0E0; font-size: 0.9rem; line-height: 1.4;">{rule['text']}</div>
                    </div>
                    """
                    st.markdown(html, unsafe_allow_html=True)

    
    


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
