# Pre-Launch Checklist (10 Days to Launch)

## 🔴 Critical - Must Fix Before Launch

### Security & Authentication
- [ ] **Password Requirements**
  - Minimum 8 characters enforced
  - Password hashing verified (bcrypt)
  - JWT tokens expire properly

- [ ] **API Security**
  - All routes require authentication (except public ones)
  - CORS properly configured for production domain
  - Rate limiting active
  - Input sanitization working

- [ ] **Environment Variables**
  - All secrets in environment variables (not hardcoded)
  - Stripe keys (test → live keys)
  - Database URL secure
  - JWT secret strong and unique

### Database & Data
- [ ] **PostgreSQL Production Ready**
  - Database backups configured
  - Connection pooling optimized
  - Migrations tested
  - Data persistence verified (no data loss on restart)

- [ ] **Data Validation**
  - All user inputs validated
  - SQL injection prevention verified
  - XSS protection active

### Billing & Payments
- [ ] **Stripe Production Setup**
  - Switch from test to live Stripe keys
  - Webhook endpoint configured for production
  - Test successful payment flow
  - Test subscription cancellation
  - Test failed payment handling
  - Verify correct pricing (£1/employee/month)

- [ ] **Billing Features**
  - Customer portal works
  - Subscription updates correctly
  - Invoice generation (if needed)

### Mobile App
- [ ] **Production Build**
  - Test production build (not just Expo Go)
  - GPS permissions work on real devices
  - App doesn't crash on background/foreground
  - Push notifications (if implemented)

- [ ] **App Store Preparation**
  - App icons and splash screens
  - Privacy policy URL
  - Terms of service URL
  - App description ready

## 🟡 Important - Should Fix

### Performance
- [ ] **Backend Performance**
  - API response times < 500ms
  - Database queries optimized
  - No N+1 query problems
  - Caching where appropriate

- [ ] **Frontend Performance**
  - Page load < 3 seconds
  - Images optimized
  - Bundle size reasonable

### User Experience
- [ ] **Error Messages**
  - All error messages are user-friendly
  - No technical jargon exposed
  - Helpful guidance on what to do next

- [ ] **Empty States**
  - All empty states have helpful messages
  - Clear call-to-actions

- [ ] **Loading States**
  - Loading indicators on all async operations
  - Skeleton screens where appropriate

### Documentation
- [ ] **User Documentation**
  - Quick start guide
  - FAQ page
  - Video tutorials (optional but recommended)

- [ ] **Admin Documentation**
  - How to add workers
  - How to create jobsites
  - How to approve time entries
  - How to manage billing

## 🟢 Nice to Have

### Features
- [ ] **Email Notifications**
  - Welcome email
  - Approval notifications
  - Payment receipts

- [ ] **Analytics**
  - Google Analytics or similar
  - Track key user actions
  - Monitor errors

- [ ] **Support System**
  - Contact form
  - Support email
  - Help center

## 📋 Day-by-Day Testing Plan

### Days 1-3: Core Functionality
- Test complete user journey
- Fix critical bugs
- Verify all features work end-to-end

### Days 4-5: Security & Performance
- Security audit
- Performance testing
- Load testing (simulate multiple users)

### Days 6-7: Polish & UX
- Fix UI/UX issues
- Improve error messages
- Add helpful tooltips

### Days 8-9: Documentation & Marketing Prep
- Write documentation
- Prepare marketing materials
- Set up analytics

### Day 10: Final Checks
- Full system test
- Backup verification
- Launch day preparation

## 🚀 Launch Day Checklist

- [ ] Domain connected
- [ ] SSL certificate active
- [ ] All services running
- [ ] Monitoring set up
- [ ] Support channels ready
- [ ] Marketing materials live
