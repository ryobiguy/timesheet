# SaaS Next Steps - Timesheet Control

## ✅ Completed Features

### Core Application
- ✅ Full timesheet management system (jobsites, time entries, geofencing)
- ✅ User management (CRUD, roles)
- ✅ Assignment management
- ✅ Dispute management
- ✅ Weekly summaries & exports (CSV/PDF)
- ✅ Dashboard with stats and activity feed
- ✅ Security (rate limiting, sanitization, error handling)
- ✅ Logging and monitoring

### Marketing Website
- ✅ Landing page with features showcase
- ✅ Company signup page
- ✅ UK pricing (£1 per employee/month)
- ✅ White & sky blue theme
- ✅ Navigation and footer

---

## 🎯 Priority 1: Payment & Subscription Management

### 1. Payment Integration (Stripe)
**Status:** Not implemented  
**Why:** Critical for SaaS - need to accept payments

**Tasks:**
- Install Stripe SDK (`stripe`)
- Create Stripe account and get API keys
- Add Stripe webhook endpoint for payment events
- Store Stripe customer ID in Organization model
- Implement subscription creation/updates
- Handle payment failures and retries
- Add subscription status checks

**Backend Changes:**
- Add `stripeCustomerId` and `stripeSubscriptionId` to Organization model
- Create `/api/billing/subscribe` endpoint
- Create `/api/billing/webhook` endpoint (Stripe webhooks)
- Create `/api/billing/portal` endpoint (customer portal)
- Add subscription status middleware

**Frontend Changes:**
- Add payment form to signup flow
- Create billing/subscription management page
- Show subscription status in dashboard
- Handle payment errors gracefully

**Files to Create/Modify:**
- `backend/src/routes/billing.ts` (new)
- `backend/src/services/stripe.ts` (new)
- `backend/prisma/schema.prisma` (add Stripe fields)
- `frontend/src/pages/BillingPage.tsx` (new)
- `frontend/src/pages/CompanySignupPage.tsx` (add payment step)

---

### 2. Subscription Management
**Status:** Basic tier field exists, no enforcement  
**Why:** Need to enforce subscription limits and handle upgrades/downgrades

**Tasks:**
- Enforce subscription limits (e.g., max employees based on tier)
- Handle subscription upgrades/downgrades
- Add subscription expiration checks
- Implement grace period for failed payments
- Add subscription cancellation flow
- Track subscription history

**Backend Changes:**
- Add subscription limit checks to relevant endpoints
- Create subscription status service
- Add subscription expiration middleware
- Create subscription change logs

**Frontend Changes:**
- Show subscription limits and usage
- Add upgrade prompts when limits reached
- Create subscription change history page

---

## 🎯 Priority 2: Email System

### 3. Email Notifications
**Status:** Not implemented  
**Why:** Essential for user onboarding, password resets, and notifications

**Tasks:**
- Set up email service (SendGrid, Mailgun, or AWS SES)
- Create email templates
- Implement welcome emails
- Implement password reset emails
- Implement approval/dispute notifications
- Implement weekly summary emails
- Add email preferences per user

**Backend Changes:**
- Install email service SDK
- Create `backend/src/services/email.ts`
- Create email templates directory
- Add email sending to relevant flows:
  - User registration
  - Password reset
  - Time entry approval/dispute
  - Weekly summary ready

**Frontend Changes:**
- Add email preferences page
- Add "Resend verification email" option
- Show email notification settings

**Files to Create:**
- `backend/src/services/email.ts` (new)
- `backend/src/templates/` (new directory)
- `backend/src/routes/auth.ts` (add password reset)
- `frontend/src/pages/SettingsPage.tsx` (new)

---

### 4. Password Reset Flow
**Status:** Not implemented  
**Why:** Users need to reset forgotten passwords

**Tasks:**
- Create password reset token system
- Add "Forgot Password" page
- Add "Reset Password" page
- Send password reset emails
- Expire tokens after use/time limit

**Backend Changes:**
- Add password reset token to User model (or separate table)
- Create `/api/auth/forgot-password` endpoint
- Create `/api/auth/reset-password` endpoint
- Add token expiration logic

**Frontend Changes:**
- Create `frontend/src/pages/ForgotPasswordPage.tsx`
- Create `frontend/src/pages/ResetPasswordPage.tsx`
- Add link to login page

---

## 🎯 Priority 3: Onboarding & User Experience

### 5. Onboarding Flow
**Status:** Basic signup exists  
**Why:** Help new companies get started quickly

**Tasks:**
- Create multi-step onboarding wizard
- Guide users through:
  - Adding first jobsite
  - Adding first worker
  - Creating first assignment
  - Testing clock in/out
- Add progress tracking
- Skip option for experienced users

**Frontend Changes:**
- Create `frontend/src/components/OnboardingWizard.tsx`
- Add onboarding state to AuthContext
- Show onboarding on first login
- Add "Skip Tutorial" option

---

### 6. Help & Documentation
**Status:** Not implemented  
**Why:** Users need help understanding features

**Tasks:**
- Create help center/documentation
- Add in-app tooltips
- Create video tutorials (optional)
- Add FAQ page
- Add "Contact Support" form

**Frontend Changes:**
- Create `frontend/src/pages/HelpPage.tsx`
- Create `frontend/src/pages/FAQPage.tsx`
- Add help tooltips to complex features
- Add "?" icons with explanations

---

## 🎯 Priority 4: Testing & Quality

### 7. Automated Testing
**Status:** No tests  
**Why:** Ensure reliability and catch bugs early

**Tasks:**
- Set up Jest/Vitest for backend
- Set up React Testing Library for frontend
- Write unit tests for critical services
- Write integration tests for API endpoints
- Write E2E tests for critical flows (signup, clock in/out, approval)
- Add test coverage reporting
- Set up CI/CD to run tests

**Files to Create:**
- `backend/__tests__/` (test directory)
- `frontend/src/__tests__/` (test directory)
- `jest.config.js` or `vitest.config.ts`
- `.github/workflows/test.yml` (CI/CD)

---

### 8. Error Tracking & Monitoring
**Status:** Basic logging exists  
**Why:** Need to track errors in production

**Tasks:**
- Set up Sentry (or similar)
- Add error tracking to frontend
- Add error tracking to backend
- Set up alerts for critical errors
- Add performance monitoring
- Track user analytics (privacy-compliant)

**Backend Changes:**
- Install Sentry SDK
- Initialize Sentry in server
- Add error context

**Frontend Changes:**
- Install Sentry SDK
- Initialize Sentry in app
- Add user context

---

## 🎯 Priority 5: Advanced Features

### 9. Mobile App / PWA
**Status:** Web-based mobile UI exists  
**Why:** Better mobile experience for workers

**Tasks:**
- Convert to Progressive Web App (PWA)
- Add offline support
- Add push notifications
- Add install prompt
- Optimize for mobile performance

**Files to Modify:**
- `frontend/vite.config.ts` (add PWA plugin)
- `frontend/public/manifest.json` (new)
- `frontend/src/` (add service worker)

---

### 10. API Documentation
**Status:** Not implemented  
**Why:** For integrations and developer access

**Tasks:**
- Set up Swagger/OpenAPI
- Document all API endpoints
- Add example requests/responses
- Create API key system for external access
- Add rate limiting per API key

**Backend Changes:**
- Install Swagger/OpenAPI libraries
- Add API documentation annotations
- Create `/api/docs` endpoint
- Create API key model and routes

---

### 11. Advanced Reporting
**Status:** Basic exports exist  
**Why:** Companies need detailed analytics

**Tasks:**
- Create custom report builder
- Add scheduled reports (email)
- Add cost analysis reports
- Add productivity metrics
- Add overtime analysis
- Add export to Excel

**Backend Changes:**
- Create report generation service
- Add report scheduling
- Create report templates

**Frontend Changes:**
- Create report builder UI
- Create reports page
- Add report scheduling UI

---

## 🎯 Priority 6: Deployment & Operations

### 12. Production Deployment
**Status:** Local development only  
**Why:** Need to launch the product

**Tasks:**
- Set up production database (PostgreSQL recommended)
- Set up hosting (Vercel, Railway, AWS, etc.)
- Configure environment variables
- Set up domain and SSL
- Configure CDN for static assets
- Set up database backups
- Create deployment documentation

**Recommended Stack:**
- Frontend: Vercel or Netlify
- Backend: Railway, Render, or AWS
- Database: PostgreSQL (Supabase, Railway, or AWS RDS)
- Email: SendGrid or AWS SES
- Payments: Stripe

---

### 13. Legal & Compliance
**Status:** Not implemented  
**Why:** Required for UK/EU operations

**Tasks:**
- Add Terms of Service page
- Add Privacy Policy page
- Add Cookie Policy
- Add GDPR compliance features:
  - Data export
  - Data deletion
  - Consent management
- Add accessibility (WCAG compliance)

**Frontend Changes:**
- Create `frontend/src/pages/TermsPage.tsx`
- Create `frontend/src/pages/PrivacyPage.tsx`
- Add cookie consent banner
- Add accessibility improvements

---

## 📋 Recommended Implementation Order

### Week 1: Payment Integration
1. Set up Stripe account
2. Implement payment processing
3. Add subscription management
4. Test payment flows

### Week 2: Email System
1. Set up email service
2. Implement welcome emails
3. Implement password reset
4. Add notification emails

### Week 3: Onboarding & Polish
1. Create onboarding flow
2. Add help documentation
3. Improve error messages
4. Add loading states

### Week 4: Testing & Deployment
1. Write critical tests
2. Set up error tracking
3. Prepare for production deployment
4. Add legal pages

---

## 🚀 Quick Wins (Can Do Now)

1. **Add Password Reset** - Essential feature (2-3 hours)
2. **Add Help/FAQ Page** - Simple but valuable (1-2 hours)
3. **Improve Error Messages** - Better UX (1 hour)
4. **Add Loading States** - Better UX (1 hour)
5. **Add Terms/Privacy Pages** - Legal requirement (1-2 hours)

---

## 📝 Notes

- **Payment is critical** - Can't launch SaaS without payment processing
- **Email is essential** - Users need password resets and notifications
- **Testing is important** - But can be done incrementally
- **Deployment can wait** - Until core features are ready
- **Legal pages are required** - Before accepting real customers

**Current Status:** ✅ Core application complete, marketing site ready. Next: Payment integration and email system.
