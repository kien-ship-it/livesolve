#!/usr/bin/env python3
"""
Initialize Local SQLite Database
===============================

This script initializes a local SQLite database for testing AI functionality
without needing Cloud SQL.

Usage:
    python init_local_db.py
"""

import sys
import os

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def main():
    """Initialize the local SQLite database"""
    print("🗄️  Initializing Local SQLite Database")
    print("=" * 40)
    
    try:
        from app.db.database_local import init_local_db
        
        # Initialize the database
        init_local_db()
        
        print("\n✅ Local database setup complete!")
        print("You can now test AI functionality with local storage.")
        print("\nNext steps:")
        print("1. Run the backend with local configuration")
        print("2. Use the /api/v1/submission/submit/solution-local endpoint")
        print("3. Or use the standalone test script")
        
    except Exception as e:
        print(f"❌ Failed to initialize local database: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
