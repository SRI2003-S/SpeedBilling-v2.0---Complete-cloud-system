#!/usr/bin/env python3
"""
SpeedBilling - Setup Render PostgreSQL Schema Only
(No Supabase available, tables will be auto-created by JPA)
"""

import psycopg2

RENDER_URL = "dpg-d8gj8pt7vvec7390u52g-a.oregon-postgres.render.com"
RENDER_DB = "speedbilling"
RENDER_USER = "speedbilling_user"
RENDER_PASSWORD = "QC91RjjnOFzr2HqvK3paRFjyxZcyLJgv"

print("Connecting to Render PostgreSQL...")
conn = psycopg2.connect(
    host=RENDER_URL,
    port=5432,
    dbname=RENDER_DB,
    user=RENDER_USER,
    password=RENDER_PASSWORD,
    connect_timeout=15
)
conn.autocommit = True
cur = conn.cursor()

# Enable UUID extension if needed
cur.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
print("Enabled UUID extension")

# Enable pgcrypto if needed
cur.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
print("Enabled pgcrypto extension")

cur.close()
conn.close()
print()
print("Render PostgreSQL is ready!")
print("Tables will be auto-created by Spring Boot JPA on first startup.")
print("Connection string: postgresql://speedbilling_user:****@dpg-d8gj8pt7vvec7390u52g-a:5432/speedbilling")
