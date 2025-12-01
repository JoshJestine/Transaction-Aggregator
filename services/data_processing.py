import pandas as pd
import io

def load_data(file_or_path):
    """
    Load CSV data from a file object or path.
    """
    try:
        df = pd.read_csv(file_or_path)
        # Normalize column names to lowercase
        df.columns = df.columns.str.lower().str.strip()
        return df
    except Exception as e:
        raise ValueError(f"Error loading CSV: {e}")

def validate_data(df):
    """
    Validate that the DataFrame has the required columns.
    Required: date, description, amount
    """
    required_cols = {'date', 'description', 'amount'}
    if not required_cols.issubset(df.columns):
        missing = required_cols - set(df.columns)
        return False, f"Missing columns: {', '.join(missing)}"
    
    # Basic type conversion
    try:
        df['date'] = pd.to_datetime(df['date'])
        df['amount'] = pd.to_numeric(df['amount'])
    except Exception as e:
        return False, f"Data type error: {e}"
        
    return True, "Data is valid"

def categorize_transaction(description, existing_category=None):
    """
    Simple rule-based categorization if category is missing.
    """
    if pd.notna(existing_category):
        return existing_category
        
    desc = description.lower()
    if any(x in desc for x in ['uber', 'lyft', 'taxi', 'gas', 'shell', 'parking']):
        return 'Transport'
    elif any(x in desc for x in ['food', 'dining', 'restaurant', 'cafe', 'coffee', 'starbucks', 'chipotle', 'sweetgreen', 'doordash', 'ubereats']):
        return 'Dining'
    elif any(x in desc for x in ['grocery', 'market', 'trader', 'whole foods', 'wegmans']):
        return 'Groceries'
    elif any(x in desc for x in ['netflix', 'spotify', 'hulu', 'movie', 'amc', 'cinema']):
        return 'Entertainment'
    elif any(x in desc for x in ['rent', 'apartment', 'mortgage']):
        return 'Housing'
    elif any(x in desc for x in ['salary', 'deposit', 'paycheck']):
        return 'Income'
    else:
        return 'Other'

def compute_stats(df):
    """
    Compute summary statistics from the DataFrame.
    """
    # Ensure category column exists
    if 'category' not in df.columns:
        df['category'] = df['description'].apply(categorize_transaction)
    else:
        # Fill missing categories
        df['category'] = df.apply(
            lambda row: categorize_transaction(row['description'], row['category']), axis=1
        )

    # Separate income and spending
    # Logic: Positive = Income, Negative = Expense
    
    income_df = df[df['amount'] > 0]
    spending_df = df[df['amount'] < 0].copy()
    
    # Convert spending amounts to positive for calculation/display
    spending_df['abs_amount'] = spending_df['amount'].abs()
    
    total_income = income_df['amount'].sum()
    total_spending = spending_df['abs_amount'].sum()
    net = df['amount'].sum()
    
    # Top categories (based on spending)
    category_spend = spending_df.groupby('category')['abs_amount'].sum().sort_values(ascending=False)
    top_categories = []
    for cat, amount in category_spend.head(3).items():
        top_categories.append({
            "category": cat,
            "amount": float(amount),
            "percentage": float((amount / total_spending) * 100) if total_spending > 0 else 0
        })
        
    # Highest spending day
    daily_spend = spending_df.groupby(spending_df['date'].dt.date)['abs_amount'].sum().sort_values(ascending=False)
    if not daily_spend.empty:
        highest_day_date = daily_spend.index[0]
        highest_day_amount = daily_spend.iloc[0]
        
        # Get top merchants for that day
        day_txns = spending_df[spending_df['date'].dt.date == highest_day_date]
        top_merchants = day_txns.sort_values('abs_amount', ascending=False)['description'].head(3).tolist()
        
        highest_day = {
            "date": highest_day_date.strftime("%Y-%m-%d"),
            "amount": float(highest_day_amount),
            "top_merchants": top_merchants
        }
    else:
        highest_day = None

    # Anomalies (Simple: > 40% of total spend in one category, or single txn > 30% of total)
    anomalies = []
    if not category_spend.empty:
        top_cat_pct = (category_spend.iloc[0] / total_spending) * 100
        if top_cat_pct > 40:
            anomalies.append(f"High spending in {category_spend.index[0]} ({top_cat_pct:.1f}% of total)")
            
    # Single large transactions
    if total_spending > 0:
        large_txns = spending_df[spending_df['abs_amount'] > (total_spending * 0.3)]
        for _, row in large_txns.iterrows():
            anomalies.append(f"Large transaction: {row['description']} (${row['abs_amount']:.2f})")

    return {
        "total_income": float(total_income),
        "total_spending": float(total_spending),
        "net": float(net),
        "top_categories": top_categories,
        "highest_day": highest_day,
        "anomalies": anomalies,
        "transaction_count": len(df)
    }
