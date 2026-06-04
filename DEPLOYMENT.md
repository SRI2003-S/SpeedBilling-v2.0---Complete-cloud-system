# SpeedBilling Deployment Guide

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  Spring Boot    │────▶│   Supabase      │
│   (Vercel)      │     │  (Render)       │     │   PostgreSQL    │
│   Port 3000     │     │  Port 8080      │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                    │
                                                    ▼
                                              ┌─────────────────┐
                                              │   Supabase       │
                                              │   Storage        │
                                              │   (Photos)       │
                                              └─────────────────┘
```

---

## Step 1: Supabase Setup

1. **Create a Supabase account**: https://supabase.com
2. **Create a new project**:
   - Name: `speedbilling`
   - Database password: Generate a strong password
   - Region: Choose closest to your location

3. **Get your credentials** (Project Settings → API):
   - Project URL: `https://[PROJECT_REF].supabase.co`
   - Anon Key: `eyJhbGciOiJIUzI1NiIs...`
   - Database URL: `jdbc:postgresql://[PROJECT_REF].supabase.co:5432/postgres`

4. **Run the migration**:
   - Go to SQL Editor in Supabase dashboard
   - Open `database/001_initial_schema.sql`
   - Run the entire script
   - Verify all tables are created:
     ```sql
     SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
     ```

5. **Setup Storage**:
   - Go to Storage → New Bucket
   - Name: `hair-extension-photos`
   - Make it public
   - Add CORS configuration:
     - Allowed origins: `*`
     - Methods: GET, POST, PUT, DELETE

---

## Step 2: Backend Deployment (Render)

1. **Push code to GitHub repository**

2. **Create a new Web Service on Render**:
   - Connect your GitHub repository
   - Name: `speedbilling-backend`
   - Environment: `Docker`
   - Dockerfile path: `./Dockerfile`
   - Port: `8080`

3. **Set environment variables** in Render dashboard:
   ```
   SUPABASE_DB_URL=jdbc:postgresql://[REF].supabase.co:5432/postgres
   SUPABASE_DB_USER=postgres
   SUPABASE_DB_PASSWORD=[password]
   SUPABASE_URL=https://[REF].supabase.co
   SUPABASE_ANON_KEY=[anon-key]
   SUPABASE_STORAGE_URL=https://[REF].supabase.co/storage/v1
   SUPABASE_BUCKET=hair-extension-photos
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```

4. **Deploy**: Render will auto-build and deploy

---

## Step 3: Frontend Deployment (Vercel)

1. **Push frontend code to GitHub** (separate repo or monorepo)

2. **Import project to Vercel**:
   - Connect GitHub repository
   - Framework preset: Next.js
   - Root directory: `frontend/`
   - Build command: `npm run build`
   - Output directory: `.next`

3. **Set environment variables**:
   ```
   NEXT_PUBLIC_API_URL=https://speedbilling-backend.onrender.com
   ```

4. **Deploy**: Vercel auto-deploys on push

---

## Step 4: Local Development

### Prerequisites
- Java 17+
- Node.js 20+
- PostgreSQL (or access to Supabase)
- Maven

### Backend
```bash
cd backend
cp ../.env.example ../.env
# Edit .env with your Supabase credentials
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Frontend
```bash
cd frontend
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_API_URL
npm install
npm run dev
```

### Using Docker (Local)
```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Build and run
docker-compose up --build
```

---

## Step 5: Data Migration from SQLite

Follow the detailed guide in `database/MIGRATION_GUIDE.md`:
1. Export data from existing SQLite database to CSV
2. Import CSV files into Supabase PostgreSQL
3. Verify data integrity
4. Update application configuration

---

## Step 6: Post-Deployment Verification

### Health Check
```bash
# Backend health
curl https://speedbilling-backend.onrender.com/api/health

# Frontend
curl https://speedbilling-frontend.vercel.app
```

### Test All Modules
- [ ] Login with admin credentials
- [ ] Create a customer with hair extension details
- [ ] Create a service session
- [ ] Upload photos
- [ ] Create appointment in calendar
- [ ] Check dashboard widgets
- [ ] View customer timeline
- [ ] Manage products and batches
- [ ] Process a bill
- [ ] Logout and login from different device

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check SUPABASE_DB_URL and credentials |
| CORS errors | Verify CORS_ORIGINS includes frontend URL |
| Photos not uploading | Check Supabase Storage bucket permissions |
| Login fails | Ensure admin user exists in users table |
| 404 on pages | Verify frontend routes match backend API |

---

## Scaling

- **Database**: Supabase auto-scales PostgreSQL
- **Backend**: Render supports horizontal scaling
- **Frontend**: Vercel global CDN
- **Storage**: Supabase Storage with CDN

## Security Notes

- Change default admin password immediately
- Use environment variables for all secrets
- Enable Row Level Security in Supabase for production
- Use HTTPS in production (automatic with Vercel/Render)
- Set up database backups in Supabase dashboard
