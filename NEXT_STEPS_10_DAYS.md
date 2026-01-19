# Next Steps: 10 Days to Launch

## ✅ Completed Today

1. **Security Hardening**
   - ✅ Tightened CORS for production (strict origin checking)
   - ✅ Added JWT_SECRET validation (min 32 chars)
   - ✅ Added production environment variable warnings
   - ✅ Password requirements already enforced (min 8 chars)

2. **Legal Pages**
   - ✅ Privacy Policy page created (`/privacy`)
   - ✅ Terms of Service page created (`/terms`)
   - ✅ Routes added to frontend

3. **Documentation**
   - ✅ Quick Start Guide created
   - ✅ Pre-Launch Checklist created
   - ✅ Marketing Guide created

## 🎯 Priority Actions (Next 3 Days)

### Day 1-2: Critical Testing

1. **End-to-End User Journey Test**
   - [ ] Create test company account
   - [ ] Create test jobsite
   - [ ] Register test worker via mobile app
   - [ ] Create assignment
   - [ ] Test clock in/out on mobile
   - [ ] Verify GPS geofencing works
   - [ ] Approve time entry on web dashboard
   - [ ] Export weekly summary

2. **Security Testing**
   - [ ] Test CORS with production domain
   - [ ] Verify JWT token expiration
   - [ ] Test rate limiting
   - [ ] Verify password hashing
   - [ ] Test input sanitization

3. **Billing Testing**
   - [ ] Test Stripe checkout flow
   - [ ] Verify subscription creation
   - [ ] Test webhook handling
   - [ ] Test subscription cancellation
   - [ ] Verify pricing (£1/employee/month)

### Day 3: Environment Setup

1. **Production Environment Variables**
   - [ ] Generate strong JWT_SECRET (32+ chars)
   - [ ] Set FRONTEND_URL to your domain
   - [ ] Switch Stripe to live keys
   - [ ] Update Stripe webhook URL
   - [ ] Verify DATABASE_URL is set

2. **Domain & SSL**
   - [ ] Purchase domain
   - [ ] Configure DNS
   - [ ] Set up SSL certificate (Vercel/Render auto-handles)
   - [ ] Update FRONTEND_URL in backend

## 📋 Remaining Tasks (Days 4-10)

### Documentation & Content

- [ ] Update Privacy Policy with your contact email
- [ ] Update Terms of Service with your contact email
- [ ] Add FAQ page
- [ ] Create help center or documentation site
- [ ] Write 3-5 blog posts for SEO

### Mobile App

- [ ] Test production build (not just Expo Go)
- [ ] Prepare app store assets:
  - [ ] App icon (1024x1024)
  - [ ] Screenshots (various device sizes)
  - [ ] App description
  - [ ] Privacy policy URL
  - [ ] Terms of service URL
- [ ] Test on real devices (iOS & Android)
- [ ] Test background location tracking
- [ ] Test app behavior when GPS is disabled

### Web App

- [ ] Add footer links (Privacy, Terms, Contact)
- [ ] Create contact/support page
- [ ] Add Google Analytics (optional)
- [ ] Test all pages load correctly
- [ ] Verify responsive design on mobile browsers

### Backend

- [ ] Set up database backups (Render may auto-handle)
- [ ] Configure monitoring/alerting
- [ ] Test API performance under load
- [ ] Verify all error messages are user-friendly

### Marketing Prep

- [ ] Create landing page (if not done)
- [ ] Set up Google Analytics
- [ ] Create demo video (2-3 minutes)
- [ ] Prepare social media accounts
- [ ] Create email templates for:
  - Welcome email
  - Onboarding sequence
  - Support emails

## 🚨 Critical Before Launch

1. **Environment Variables Checklist**
   ```
   ✅ JWT_SECRET (strong, 32+ chars)
   ✅ DATABASE_URL (PostgreSQL)
   ✅ FRONTEND_URL (your domain)
   ✅ STRIPE_SECRET_KEY (live key)
   ✅ STRIPE_WEBHOOK_SECRET (live secret)
   ✅ STRIPE_PRICE_ID (production price)
   ```

2. **Test Complete Flow**
   - [ ] Company signup → receives code
   - [ ] Worker registration → can login
   - [ ] Jobsite creation → appears in app
   - [ ] Assignment creation → worker sees jobsite
   - [ ] Clock in → GPS verified
   - [ ] Clock out → time entry created
   - [ ] Approval → entry approved
   - [ ] Export → CSV generated
   - [ ] Billing → subscription created

3. **Legal Compliance**
   - [ ] Privacy Policy accessible
   - [ ] Terms of Service accessible
   - [ ] Contact information updated
   - [ ] GDPR compliance (if applicable)

## 📝 Daily Checklist Template

Use this each day:

- [ ] Test one complete user flow
- [ ] Fix any bugs found
- [ ] Update documentation if needed
- [ ] Check environment variables
- [ ] Review error logs
- [ ] Test on mobile device
- [ ] Verify web dashboard works

## 🎯 Success Criteria

Before launch, you should be able to:

1. ✅ Complete user can sign up and use the service end-to-end
2. ✅ No critical bugs or errors
3. ✅ All security measures in place
4. ✅ Legal pages accessible
5. ✅ Billing works correctly
6. ✅ Mobile app works on real devices
7. ✅ Documentation is clear

## 🚀 Launch Day Checklist

- [ ] Domain connected
- [ ] SSL active
- [ ] All services running
- [ ] Test complete flow one more time
- [ ] Monitor error logs
- [ ] Have support email ready
- [ ] Marketing materials live

---

**Remember:** It's better to launch with fewer features that work perfectly than many features with bugs. Focus on the core flow first!
