import streamlit as st
import pandas as pd
import os
import json
import time
import urllib.parse
import altair as alt
from config.settings import APP_NAME, SAMPLE_DATA_PATH
from services.data_processing import load_data, validate_data, compute_stats
from services.story_generator import generate_money_story
from services.chat import generate_chat_response
from utils.ui_helpers import apply_custom_styles, render_metric_card, get_mood_emojis, render_insights_card, render_story_grid, show_accessibility_modal

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
if "active_view" not in st.session_state:
    st.session_state.active_view = "story"
if "narrative_cache" not in st.session_state:
    st.session_state.narrative_cache = {}
if "narrative_visible" not in st.session_state:
    st.session_state.narrative_visible = True

def logout():
    """Clear all session state data including username."""
    st.session_state.stats = None
    st.session_state.story = None
    st.session_state.chat_history = []
    st.session_state.mood = None
    st.session_state.df = None
    st.session_state.username = None
    st.session_state.narrative_cache = {}
    st.rerun()

def clear_data():
    """Clear data but keep username."""
    st.session_state.stats = None
    st.session_state.story = None
    st.session_state.chat_history = []
    st.session_state.mood = None
    st.session_state.df = None
    st.session_state.narrative_cache = {}
    st.rerun()

# --- Welcome Screen ---
if not st.session_state.username:
    # Header: Spacer | Logo (Centered) | Accessibility (Right)
    col_l, col_c, col_r, col_ = st.columns([1, 0.65, 1, 0.4], vertical_alignment="center")
    
    with col_c:
        st.image("assets/SpendLensLogo.png", use_container_width=True)
        
    with col_:
        if st.button("♿ Accessibility", help="Accessibility Info", use_container_width=True, type="primary"):
            show_accessibility_modal()
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # st.title("👋 Welcome to " + APP_NAME)
    # st.markdown("### Let's get to know you.")
    
    # Center the form (occupy 50% width)
    col_left, col_center, col_right = st.columns([0.5, 1, 0.5])
    
    with col_center:
        # st.image("assets/SpendLensLogo.png", width=400)
    
        st.title("👋 Welcome to " + APP_NAME)
        st.subheader("Let's get to know you.")
        
        
        with st.form("welcome_form"):
            name_input = st.text_input("What should we call you?")
            submitted = st.form_submit_button("Get Started 🚀", type="primary", use_container_width=True)
            
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
    
    st.error("⚠️ **Disclaimer:** This is not professional financial advice. Outputs are for reflection and education only.", width=720)
            
# --- Main App ---
else:
    # --- Header ---
    # Header Layout: Logo | Accessibility | Logout
    col_logo, col_access, col_logout = st.columns([8, 1.1, 1.1], vertical_alignment="center")
    
    with col_logo:
        st.image("assets/SpendLensLogo.png", width=200)
        
    with col_access:
        if st.button("♿ Accessibility", key="access_btn_dash", help="Accessibility Info", width="stretch", type="primary"):
            show_accessibility_modal()

    with col_logout:
        if st.button("➜] Log Out", width="stretch", type="primary", help="Go Back to Login Page"):
            logout()

    st.title(f"Welcome, {st.session_state.username}! 👋")         
    
    # st.caption(APP_NAME)
    st.markdown("""
        **Your monthly spending, explained simply.**  
        Upload your transactions to get a personalized, stress-free narrative about your money.
    """)

    # st.info("🔒 **Privacy Note:** Your data is processed locally in memory and is never saved to disk or sent to any server.", width=875)

    # --- Data Input Section ---
    if st.session_state.stats is None:
        # st.header("Add Your Data")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.header("Add Your Data")
            st.info("🔒 **Privacy Note:** Your data is processed locally in memory and is never saved to disk or sent to any server.", width="stretch")
            uploaded_file = st.file_uploader("Upload CSV", type=["csv"], help="Required columns: date, description, amount | Optional columns: category")
            
        with col2:
            st.space("stretch")
            st.write("Or try with sample data:")
            if st.button("🗂️ Use Sample Data", type="primary"):
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
            # Show Data Editor
            if st.session_state.df is not None:
                # Create containers for visual reordering
                actions_container = st.container()
                data_container = st.container()
                privacy_container = st.container()

                # 1. Render Data Editor (Logic first to capture edited_df)
                with data_container:
                    with st.expander("📊 Manage Data", expanded=False):
                        edited_df = st.data_editor(
                            st.session_state.df,
                            num_rows="dynamic",
                            key='data_editor',
                            column_config={
                                'date': st.column_config.DateColumn('Date', format='YYYY-MM-DD')
                            }
                        )
                
                # 2. Render Actions (Visually at top)
                with actions_container:
                    st.markdown("<br>", unsafe_allow_html=True)
                    col_update, col_reset = st.columns(2)
                    
                    with col_update:
                        if st.button("🔄 Update Analysis", type="primary", use_container_width=True, help="Commit changes and refresh insights"):
                            st.session_state.df = edited_df
                            st.session_state.stats = compute_stats(st.session_state.df)
                            # Clear narrative cache when data changes to force fresh generation
                            st.session_state.narrative_cache = {}
                            st.session_state.story = None
                            st.rerun()
                            
                    with col_reset:
                        if st.button("🗑️ Reset / Clear Data", use_container_width=True, type="secondary", help="Clear All Data"):
                            clear_data()

                # 3. Render Privacy Note (Visually at bottom)
                with privacy_container:
                    st.info("🔒 **Privacy Note:** Your data is processed locally in memory and is never saved to disk or sent to any server.", width="stretch")
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
                            # Determine button type based on selection
                            btn_type = "primary" if st.session_state.mood == mood_name else "secondary"
                            
                            if st.button(f"{emoji}\n{mood_name}", key=f"mood_{mood_name}", use_container_width=True, type=btn_type):
                                # Toggle logic: If already selected, deselect. Otherwise, select.
                                if st.session_state.mood == mood_name:
                                    st.session_state.mood = None
                                else:
                                    st.session_state.mood = mood_name
                                st.rerun()
            
            # --- Dashboard Controls ---
            st.markdown("<br>", unsafe_allow_html=True)
            col_gen, col_toggle, col_chart = st.columns(3)
            
            with col_gen:
                generate_clicked = st.button("✨ Generate My Money Narrative", type="primary", use_container_width=True, help="Get personalized money narrative")
                
                if generate_clicked:
                    st.session_state.active_view = "story"
                    st.session_state.narrative_visible = True # Force visibility on generate
                    if st.session_state.mood:
                        selected_mood = st.session_state.mood
                        
                        # Check if narrative for this mood is already cached
                        if selected_mood in st.session_state.narrative_cache:
                            # Retrieve cached narrative
                            st.session_state.story = st.session_state.narrative_cache[selected_mood]
                            st.toast(f"📖 Loaded cached narrative for '{selected_mood}' mood!", icon="⚡")
                        else:
                            # Generate new narrative and cache it
                            with st.spinner("Writing your narrative...", show_time=False):
                                # Convert dataframe to CSV string for the story generator context
                                transaction_csv = st.session_state.df.to_csv(index=False) if st.session_state.df is not None else None
                                
                                story = generate_money_story(st.session_state.stats, selected_mood, transaction_data=transaction_csv)
                                st.session_state.story = story
                                # Cache the generated narrative
                                st.session_state.narrative_cache[selected_mood] = story
                        st.rerun()
                
                if generate_clicked and not st.session_state.mood:
                    st.error("⚠️ Please select a mood first and try again.")
                else:
                    st.info("Select a mood above and click to generate your personalized narrative.")
            
            with col_toggle:
                if st.button("👁️ Show/Hide Narrative", use_container_width=True, help="Toggle to hide or reveal your narrative"):
                    st.session_state.narrative_visible = not st.session_state.narrative_visible
                    st.rerun()
                st.info("Toggle to see or hide your narrative without regenerating it.")

            with col_chart:
                # Toggle logic for Charts button
                charts_btn_type = "primary" if st.session_state.active_view == "charts" else "secondary"
                if st.button("📈 Show/Hide Charts", type=charts_btn_type, use_container_width=True, help="Toggle to hide or reveal your charts"):
                    if st.session_state.active_view == "charts":
                        st.session_state.active_view = "story" # Toggle off
                    else:
                        st.session_state.active_view = "charts" # Toggle on
                    st.rerun()
                st.info("Toggle to visualize your income, expenses, and spending trends.")
            
            st.divider()

            # --- View Rendering ---
            if st.session_state.active_view == "story":
                if st.session_state.story and st.session_state.narrative_visible:
                    # The Story
                    try:
                        # Try to parse JSON. If it fails (legacy string), fallback to markdown
                        story_data = json.loads(st.session_state.story)
                        
                        if "acts" in story_data:
                             render_story_grid(story_data)
                        else:
                            st.markdown(st.session_state.story)

                    except json.JSONDecodeError:
                        # Fallback for legacy string format
                        st.markdown(st.session_state.story)
                    except Exception as e:
                        st.error(f"Error rendering story: {e}")
                        st.markdown(st.session_state.story)
                elif st.session_state.active_view == "story" and not st.session_state.story:
                     # Instructions are now under the button
                     pass

            elif st.session_state.active_view == "charts":
                st.subheader("Spending Trends & Breakdown")
                
                # Prepare data for charts
                chart_df = st.session_state.df.copy()
                chart_df['date'] = pd.to_datetime(chart_df['date'])
                
                # Create 2-column layout for charts
                chart_c1, chart_c2 = st.columns(2)
                
                # 1. Bar Chart: Expenses by Category
                # Filter for expenses (negative amounts)
                expenses_df = chart_df[chart_df['amount'] < 0].copy()
                expenses_df['abs_amount'] = expenses_df['amount'].abs()
                
                with chart_c1:
                    st.markdown("#### 💸 Expenses by Category")
                    if not expenses_df.empty:
                        cat_data = expenses_df.groupby('category')['abs_amount'].sum().reset_index()
                        
                        bar_chart = alt.Chart(cat_data).mark_bar(color="#00ADB5").encode(
                            x=alt.X('category', sort='-y', title='Category'),
                            y=alt.Y('abs_amount', title='Amount ($)'),
                            tooltip=['category', alt.Tooltip('abs_amount', format='$.2f', title='Amount')]
                        ).interactive()
                        
                        st.altair_chart(bar_chart, use_container_width=True)
                    else:
                        st.info("No expenses found to display.")
                
                # 2. Line Chart: Daily Net Spending
                with chart_c2:
                    st.markdown("#### 📅 Daily Net Spending")
                    daily_net = chart_df.groupby(chart_df['date'].dt.date)['amount'].sum().reset_index()
                    # Rename columns for Altair
                    daily_net.columns = ['date', 'amount']
                    daily_net['date'] = pd.to_datetime(daily_net['date'])
                    
                    line_chart = alt.Chart(daily_net).mark_line(color="#00ADB5", point=True).encode(
                        x=alt.X('date', title='Date'),
                        y=alt.Y('amount', title='Net Amount ($)'),
                        tooltip=[alt.Tooltip('date', format='%Y-%m-%d'), alt.Tooltip('amount', format='$.2f', title='Net Amount')]
                    ).interactive()
                    
                    st.altair_chart(line_chart, use_container_width=True)
                    


            # st.markdown("<br>", unsafe_allow_html=True)
            st.divider()
            st.error("⚠️ **Disclaimer:** This is not professional financial advice. Outputs are for reflection and education only.")

        # --- RIGHT COLUMN: Chatbot ---
        with col_chat:
            # Header with Clear History Button
            c1, c2 = st.columns([5, 1], vertical_alignment="center")
            with c1:
                st.markdown("### 💬 Chat with Finn")
            with c2:
                if st.button("🔄", help="Clear Chat History", type="primary", use_container_width=True):
                    st.session_state.chat_history = []
                    st.rerun()
            
            # Container for chat history to make it scrollable/contained
            with st.container(height=400, border=True):
                # Display chat history
                if not st.session_state.chat_history:
                    st.info("👋 Hi! I'm Finn, your Money Mentor. Ask me anything about your spending!")
                
                for message in st.session_state.chat_history:
                    with st.chat_message(message["role"]):
                        st.markdown(message["content"])

                pass 

            # Input for chat (using form to keep it in the column flow)
            with st.form(key="chat_form", clear_on_submit=True):
                user_input = st.text_area("Ask Finn anything about your spending...", height=100)
                submit_chat = st.form_submit_button("Send", use_container_width=True, type="primary")
                
                if submit_chat and user_input:
                    # Add user message to history
                    st.session_state.chat_history.append({"role": "user", "content": user_input})
                    
                    
                    # Generate response logic
                    with st.spinner("Thinking..."):
                        # Convert dataframe to CSV string for the chatbot context
                        transaction_csv = st.session_state.df.to_csv(index=False) if st.session_state.df is not None else None
                        
                        response = generate_chat_response(
                            st.session_state.chat_history,
                            st.session_state.stats,
                            st.session_state.story if st.session_state.story else "",
                            transaction_data=transaction_csv
                        )
                        
                    # Add assistant response to history
                    st.session_state.chat_history.append({"role": "assistant", "content": response})
                    st.rerun()
            
            st.divider()
            st.markdown("### 📚 Financial Resources")
            
            resources = [
                { "title": "Budgeting Basics", "source": "Consumer.gov", "url": "https://consumer.gov/managing-your-money/making-budget" },
                { "title": "Saving and Investing", "source": "Investor.gov (SEC)", "url": "https://www.investor.gov/introduction-investing" },
                { "title": "Understanding Credit", "source": "CFPB", "url": "https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/" },
                { "title": "Retirement Planning", "source": "SSA.gov", "url": "https://www.ssa.gov/benefits/retirement/" },
                { "title": "Debt Management", "source": "FTC", "url": "https://consumer.ftc.gov/articles/coping-debt" },
                { "title": "Financial Education", "source": "MyMoney.gov", "url": "https://www.mymoney.gov/" }
            ]
            
            # Grid Layout for Resources
            for i in range(0, len(resources), 2):
                res_col1, res_col2 = st.columns(2, gap="small")
                
                # Item 1
                if i < len(resources):
                    res = resources[i]
                    with res_col1:
                        st.link_button(f"{res['title']}", res['url'], help=f"Source: {res['source']}", use_container_width=True)
                
                # Item 2
                if i + 1 < len(resources):
                    res = resources[i+1]
                    with res_col2:
                        st.link_button(f"{res['title']}", res['url'], help=f"Source: {res['source']}", use_container_width=True)
                    

# Footer
# st.markdown("---")
# st.markdown(
#     """
#     <div style="font-size:16px; color:#c91f16; font-weight:400;">
#         ⚠️ <strong>Disclaimer:</strong> This is not professional financial advice. Outputs are for reflection and education only.
#     </div>
#     """,
#     unsafe_allow_html=True
# )

# st.error("⚠️ **Disclaimer:** This is not professional financial advice. Outputs are for reflection and education only.", width=720)
