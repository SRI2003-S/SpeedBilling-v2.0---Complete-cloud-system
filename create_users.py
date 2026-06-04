#!/usr/bin/env python3
"""
SpeedBilling - Update user credentials
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

# BCrypt hashes
# Srinesh@2003
ADMIN_HASH = "$2b$10$7GclzXMBNoEFcZk.6DiruupnbJALz18rDKf3eBPQ3/l7TVT2nqsVy"
# BeemBoy@123
CASHIER_HASH = "$2b$10$eIk.v.MZYBqPdAbe.wpsIuVElhRcw8DLaTMnuCLslw0Xxz1rh6VaC"

now = datetime.utcnow()
expiry = now + timedelta(days=365)

# Delete old users
cur.execute("DELETE FROM public.users WHERE username IN ('admin', 'cashier', 'Srinesh', 'Employee1')")

# Create admin: Srinesh / Srinesh@2003
cur.execute("""
    INSERT INTO public.users (username, password_hash, role, created_at, expiration_date, is_active, updated_at)
    VALUES (%s,%s,%s,%s,%s,%s,%s)
""", ("Srinesh", ADMIN_HASH, "admin", now, expiry, True, now))
print("Created: Srinesh / Srinesh@2003 (admin)")

# Create cashier: Employee1 / BeemBoy@123
cur.execute("""
    INSERT INTO public.users (username, password_hash, role, created_at, expiration_date, is_active, updated_at)
    VALUES (%s,%s,%s,%s,%s,%s,%s)
""", ("Employee1", CASHIER_HASH, "cashier", now, expiry, True, now))
print("Created: Employee1 / BeemBoy@123 (cashier)")

cur.close()
conn.close()
print("Done!")
