# Ngrok Tunnel Setup Guide

This guide explains how to expose your HRIS application to the internet using ngrok.

## Prerequisites

1. **Install ngrok**: Download from [ngrok.com/download](https://ngrok.com/download)
2. **Sign up for ngrok**: Create a free account at [ngrok.com](https://ngrok.com)
3. **Get your auth token**: Found in your ngrok dashboard

## Quick Setup

### Step 1: Authenticate ngrok
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Step 2: Start Your Application
```bash
cd c:\Users\dadidelux\Documents\Programs\HRIS_F
docker-compose up -d
```

### Step 3: Start ngrok Tunnels

**Terminal 1 - Backend API:**
```bash
ngrok http 8000
```

**Terminal 2 - Frontend:**
```bash
ngrok http 8082
```

You'll see output like:
```
Forwarding   https://abc123.ngrok.io -> http://localhost:8082
```

### Step 4: Update Configuration

#### A. Update Backend CORS

Edit `backend/.env`:
```env
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173","http://localhost:8082","http://localhost","https://YOUR_FRONTEND_NGROK_URL.ngrok.io"]
```

Replace `YOUR_FRONTEND_NGROK_URL` with the actual ngrok URL from Terminal 2.

#### B. Update Frontend API URL

Edit `frontend/.env`:
```env
VITE_API_URL=https://YOUR_BACKEND_NGROK_URL.ngrok.io/api/v1
```

Replace `YOUR_BACKEND_NGROK_URL` with the actual ngrok URL from Terminal 1.

### Step 5: Rebuild Frontend
```bash
docker-compose up -d --build frontend
```

### Step 6: Access Your Application
Open the **frontend ngrok URL** in your browser:
```
https://YOUR_FRONTEND_NGROK_URL.ngrok.io
```

## Advanced: Use ngrok Configuration File

Create `ngrok.yml` for easier management:

```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN
tunnels:
  backend:
    addr: 8000
    proto: http
    hostname: my-hris-api.ngrok.io  # Custom subdomain (requires paid plan)
  frontend:
    addr: 8082
    proto: http
    hostname: my-hris-app.ngrok.io  # Custom subdomain (requires paid plan)
```

Then start both tunnels at once:
```bash
ngrok start --all
```

## Free Plan Limitations

- 1 online ngrok agent
- Random URLs that change each restart
- 40 connections/minute

**Solution**: Run one tunnel (frontend), and keep backend local if testing on same network.

## Option 2: Frontend Only (For Same Network Testing)

If you're testing on devices on the same local network:

1. Only tunnel the frontend:
```bash
ngrok http 8082
```

2. Update `frontend/.env` to use your local IP:
```env
VITE_API_URL=http://YOUR_LOCAL_IP:8000/api/v1
```

Find your local IP:
```bash
# Windows
ipconfig | findstr IPv4

# Result example: 192.168.1.100
```

3. Update `backend/.env` CORS:
```env
CORS_ORIGINS=["http://192.168.1.100:8000","http://localhost:8082","https://YOUR_NGROK_URL.ngrok.io"]
```

4. Rebuild:
```bash
docker-compose up -d --build
```

## Troubleshooting

### CORS Errors
- Ensure ngrok URLs are added to `CORS_ORIGINS` in `backend/.env`
- Restart backend: `docker-compose restart backend`

### 502 Bad Gateway
- Check that your local application is running: `docker-compose ps`
- Verify ports are correct (8000 for backend, 8082 for frontend)

### "Invalid Host Header"
- This is normal for Vite in dev mode with ngrok
- The production build (current setup) doesn't have this issue

### Environment Variables Not Working
- Ensure `frontend/.env` exists with `VITE_API_URL`
- Rebuild frontend: `docker-compose up -d --build frontend`
- Environment variables starting with `VITE_` are required for Vite

## Security Notes

⚠️ **Important**:
- ngrok tunnels expose your app to the internet
- Use strong passwords (already set in seed data)
- Don't expose production databases
- Free ngrok URLs are public - anyone with the URL can access
- Consider using ngrok authentication features for added security

## ngrok Authentication (Optional)

Add basic auth to your tunnel:
```bash
ngrok http 8082 --basic-auth "username:password"
```

Or add to `ngrok.yml`:
```yaml
tunnels:
  frontend:
    addr: 8082
    proto: http
    auth: "username:password"
```

## Test Accounts

When sharing with others, provide these test credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hris.com | admin123 |
| HR | hr@hris.com | hr123 |
| Candidate | candidate@hris.com | candidate123 |
| Candidate | jane.smith@example.com | password123 |
| Candidate | mike.johnson@example.com | password123 |

## Persistent URLs (Paid Plan)

With ngrok paid plans, you can get static URLs:
```bash
ngrok http 8082 --domain=my-static-domain.ngrok.io
```

This means you won't need to update `CORS_ORIGINS` every time you restart ngrok.

## Quick Reference

```bash
# Check ngrok status
ngrok version

# Start with specific region
ngrok http 8082 --region us    # United States
ngrok http 8082 --region eu    # Europe
ngrok http 8082 --region ap    # Asia Pacific

# View web interface
http://127.0.0.1:4040  # ngrok inspector (very useful for debugging)
```

## Complete Example

```bash
# 1. Start application
docker-compose up -d

# 2. Start ngrok for backend
# Terminal 1:
ngrok http 8000
# Copy the HTTPS URL: https://abc123.ngrok.io

# 3. Start ngrok for frontend
# Terminal 2:
ngrok http 8082
# Copy the HTTPS URL: https://xyz789.ngrok.io

# 4. Update backend/.env
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173","http://localhost:8082","http://localhost","https://xyz789.ngrok.io"]

# 5. Update frontend/.env
VITE_API_URL=https://abc123.ngrok.io/api/v1

# 6. Rebuild
docker-compose restart backend
docker-compose up -d --build frontend

# 7. Share the frontend URL
# Send https://xyz789.ngrok.io to others
```

Happy sharing! 🚀
