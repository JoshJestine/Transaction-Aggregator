import sys
import os
import pandas as pd

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.data_processing import load_data, validate_data, compute_stats
from config.settings import SAMPLE_DATA_PATH

def test_data_processing():
    print("Testing Data Processing...")
    
    # Check if sample data exists
    if not os.path.exists(SAMPLE_DATA_PATH):
        print(f"FAIL: Sample data not found at {SAMPLE_DATA_PATH}")
        return

    try:
        # Load Data
        df = load_data(SAMPLE_DATA_PATH)
        print(f"PASS: Loaded {len(df)} rows from sample data.")
        
        # Validate Data
        is_valid, msg = validate_data(df)
        if is_valid:
            print("PASS: Data validation successful.")
        else:
            print(f"FAIL: Data validation failed: {msg}")
            return

        # Compute Stats
        stats = compute_stats(df)
        print("\nComputed Stats:")
        print(f"Total Spending: ${stats['total_spending']:.2f}")
        print(f"Total Income: ${stats['total_income']:.2f}")
        print(f"Net: ${stats['net']:.2f}")
        print(f"Top Category: {stats['top_categories'][0]['category']} ({stats['top_categories'][0]['percentage']:.1f}%)")
        
        if stats['highest_day']:
            print(f"Highest Spending Day: {stats['highest_day']['date']} (${stats['highest_day']['amount']:.2f})")
        
        print(f"Anomalies Found: {len(stats['anomalies'])}")
        for a in stats['anomalies']:
            print(f" - {a}")
            
        print("\nPASS: Data processing logic verified.")
        
    except Exception as e:
        print(f"FAIL: Exception occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_data_processing()
