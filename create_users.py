#!/usr/bin/env python3
"""
SpeedBilling - Create initial admin and cashier users with proper BCrypt hashes
"""

import psycopg2
from datetime import datetime, timedelta

RENDER_URL = "dpg-d8gj8pt7vvec7390u52g-a.oregon-postgres.render.com"
RENDER_DB = "speedbilling"
RENDER_USER = "speedbilling_user"
RENDER_PASSWORD = "QC91RjjnOFzr2HqvK3paRFjyxZcyLJgv"

conn = psycopg2.connect(
    host=RENDER_URL, port=5432, dbname=RENDER_DB,
    user=RENDER_USER, password=RENDER_PASSWORD, connect_timeout=15
)
conn.autocommit = True
cur = conn.cursor()

# Check if table exists
cur.execute("""
    SELECT EXISTS (SELECT FROM information_schema.tables
                   WHERE table_schema='public' AND table_name='users')
""")
if not cur.fetchone()[0]:
    print("Users table not found - backend hasn't created it yet.")
    print("Please access the login page once to trigger JPA, then re-run.")
    cur.close()
    conn.close()
    exit(1)

# Delete old placeholder users if any
cur.execute("DELETE FROM public.users WHERE username IN ('admin', 'cashier')")

# Real BCrypt hashes
ADMIN_HASH = "$2b$10$eChkMX1EEcAG1f.im/58vuzsyHAwMqi0xg2u2yMgMNjrEXRTCzGV6"
CASHIER_HASH = "$2b$10$p6m4kfkKNWI6MpklMEUhbOjjkgm0YDb7qHQV3AHb3qgkKD9L7mjni"

now = datetime.utcnow()
expiry = now + timedelta(days=365)

cur.execute("""
    INSERT INTO public.users (username, password_hash, role, created_at, expiration_date, is_active, updated_at)
    VALUES (%s,%s,%s,%s,%s,%s,%s)
""", ("admin", ADMIN_HASH, "admin", now, expiry, True, now))
print("Created: admin / admin123")

cur.execute("""
    INSERT INTO public.users (username, password_hash, role, created_at, expiration_date, is_active, updated_at)
    VALUES (%s,%s,%s,%s,%s,%s,%s)
""", ("cashier", CASHIER_HASH, "cashier", now, expiry, True, now))
print("Created: cashier / cashier123")

cur.close()
conn.close()
print("Done! You can now login.")
