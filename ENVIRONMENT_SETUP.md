# Environment Variables Setup Guide

This guide walks you through setting up all environment variables for production.

## 🔐 Critical Security Keys

### 1. Generate a Secure JWT_SECRET

**IMPORTANT:** This must be a random string at least 32 characters long. Never use the default value in production!

**Option A: Use Node.js (Recommended)**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option B: Use OpenSSL**
```bash
openssl rand -hex 32
```

**Option C: Use Online Generator**
Visit: https://randomkeygen.com/ and use a "CodeIgniter Encryption Keys" (256-bit)

**Save this value** - you'll need it for the backend!

---

## 📦 Backend Environment Variables (Render)

Go to your Render dashboard → Your Backend Service → Environment

### Required Variables:

1. **JWT_SECRET** ⚠️ **CRITICAL**
   - Value: The random string you generated above (min 32 characters)
   - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`
   - **DO NOT** use the default value!

2. **DATABASE_URL** ✅ (Already set)
   - Your PostgreSQL connection string
   - Format: `postgresql://user:password@host:port/database`
   - Should already be configured from your PostgreSQL setup

3. **FRONTEND_URL** 🌐
   - Your frontend URL (Vercel deployment)
   - Example: `https://your-app.vercel.app`
   - Or your custom domain: `https://yourdomain.com`

4. **NODE_ENV**
   - Value: `production`

### Optional (Stripe Billing):

5. **STRIPE_SECRET_KEY**
   - Get from: https://dashboard.stripe.com/apikeys
   - Format: `sk_live_...` (for production) or `sk_test_...` (for testing)

6. **STRIPE_WEBHOOK_SECRET**
   - Get from: https://dashboard.stripe.com/webhooks
   - Create a webhook endpoint pointing to: `https://your-backend-url.onrender.com/api/billing/webhook`
   - Copy the "Signing secret"

7. **STRIPE_PRICE_ID**
   - Get from: https://dashboard.stripe.com/products
   - Create a product/price for your subscription tier
   - Copy the Price ID (format: `price_...`)

### How to Add in Render:

1. Go to https://dashboard.render.com
2. Click on your backend service
3. Click "Environment" in the left sidebar
4. Click "Add Environment Variable"
5. Enter the key and value
6. Click "Save Changes"
7. Render will automatically redeploy

---

## 🌐 Frontend Environment Variables (Vercel)

Go to your Vercel dashboard → Your Project → Settings → Environment Variables

### Required Variables:

1. **VITE_API_URL**
   - Value: Your backend URL
   - Example: `https://timesheet-6uuv.onrender.com`
   - Or your custom backend domain

### How to Add in Vercel:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Click "Add New"
5. Enter:
   - Key: `VITE_API_URL`
   - Value: Your backend URL
   - Environment: Production (and Preview if you want)
6. Click "Save"
7. Redeploy your site (or it will auto-deploy on next push)

---

## 📱 Mobile App Environment Variables (Local)

Create a `.env` file in the `mobile/` directory:

```bash
cd mobile
```

Create `.env` file:
```env
EXPO_PUBLIC_API_URL=https://timesheet-6uuv.onrender.com
```

Or if you have a custom backend domain:
```env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
```

**Note:** The `.env` file is already in `.gitignore`, so it won't be committed.

---

## ✅ Verification Checklist

After setting up all variables:

### Backend (Render):
- [ ] JWT_SECRET is set and NOT the default value
- [ ] DATABASE_URL is set and working
- [ ] FRONTEND_URL matches your frontend domain
- [ ] NODE_ENV is set to `production`
- [ ] Backend redeployed successfully
- [ ] Check logs - no warnings about missing keys

### Frontend (Vercel):
- [ ] VITE_API_URL is set to your backend URL
- [ ] Frontend redeployed successfully
- [ ] Can log in from frontend

### Mobile:
- [ ] `.env` file created in `mobile/` directory
- [ ] EXPO_PUBLIC_API_URL points to backend
- [ ] Mobile app can connect to backend

---

## 🧪 Testing Your Setup

1. **Test Backend:**
   ```bash
   curl https://your-backend-url.onrender.com/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Test Frontend:**
   - Visit your frontend URL
   - Try to register/login
   - Check browser console for errors

3. **Test Mobile:**
   - Start the mobile app
   - Try to log in
   - Check that API calls succeed

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use different JWT_SECRET for production** - Never reuse development keys
3. **Rotate keys periodically** - Change JWT_SECRET every 6-12 months
4. **Use strong passwords** - For database and service accounts
5. **Enable HTTPS** - Both Render and Vercel provide this automatically
6. **Monitor logs** - Check for unauthorized access attempts

---

## 🆘 Troubleshooting

### "JWT_SECRET is using default value" warning
- Make sure you set JWT_SECRET in Render environment variables
- Redeploy the backend service
- Check that the value is at least 32 characters

### CORS errors
- Verify FRONTEND_URL in backend matches your actual frontend domain
- Include protocol (https://) in the URL
- No trailing slash

### Database connection errors
- Verify DATABASE_URL is correct
- Check that PostgreSQL service is running in Render
- Ensure database credentials are correct

### Mobile app can't connect
- Verify EXPO_PUBLIC_API_URL in mobile/.env
- Check that backend URL is accessible (try in browser)
- Ensure backend CORS allows your requests

---

## 📝 Quick Reference

**Backend URL:** `https://timesheet-6uuv.onrender.com` (or your custom domain)  
**Frontend URL:** `https://your-app.vercel.app` (or your custom domain)  
**Database:** PostgreSQL on Render (auto-configured)

Need help? Check the logs in Render/Vercel dashboards for specific error messages.
