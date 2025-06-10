import psycopg2

# --- IMPORTANT: UPDATE THESE VALUES ---
DB_USER = "user"  # e.g., "postgres"
DB_PASSWORD = "1111"
DB_NAME = "livesolve_app_db"  # e.g., "postgres"
# --- These values point to the proxy ---
DB_HOST = "127.0.0.1"
DB_PORT = "5432"

print("Attempting to connect to the database...")

try:
    # Connect to the database via the proxy
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
    )
    print("✅ Connection successful!")

    # Create a cursor and run a simple query
    cur = conn.cursor()
    cur.execute("SELECT version();")
    db_version = cur.fetchone()
    print(f"PostgreSQL version: {db_version[0]}")

    # Close the connection
    cur.close()
    conn.close()

except Exception as e:
    print("❌ Connection failed.")
    print(e)

