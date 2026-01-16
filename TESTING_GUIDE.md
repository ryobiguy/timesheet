# Clockly SaaS Testing Guide

## 🎯 Quick Start Testing Checklist

### 1. Company Signup & Setup Flow
- [ ] **Company Registration**
  - Go to `/signup` on web
  - Create a new company account
  - Verify 6-digit company code is displayed
  - Save the company code for worker testing

- [ ] **Admin Dashboard Access**
  - Log in as the admin user you just created
  - Verify Overview page shows company code
  - Check that all navigation items are accessible

### 2. Worker Registration & Mobile App
- [ ] **Worker Registration**
  - Go to `/register` on web
  - Use the company code from step 1
  - Register a new worker account
  - Verify registration succeeds

- [ ] **Mobile App Login**
  - Open mobile app
  - Enter company code, email, and password
  - Check "Remember my email and company code"
  - Verify login succeeds and navigates to HomeScreen
  - Log out and verify credentials are remembered

### 3. Jobsite Management
- [ ] **Create Jobsite**
  - As admin, go to Jobsites page
  - Create a new jobsite with:
    - Name and address
    - Map location (click to set)
    - Adjust geofence radius with slider
  - Verify jobsite appears in list

- [ ] **Assign Worker to Jobsite**
  - Go to Assignments page
  - Assign the worker to the jobsite
  - Verify assignment is created

### 4. Mobile App - GPS Tracking
- [ ] **View Assignments**
  - Log in to mobile app as worker
  - Verify assigned jobsite appears in "My Jobsites"
  - Pull down to refresh (should update if new assignments added)

- [ ] **Start GPS Tracking**
  - Tap "Start Tracking" button
  - Grant location permissions if prompted
  - Verify status changes to "GPS Tracking Active"
  - Move to the jobsite location (or simulate)

- [ ] **Geofence Detection**
  - When entering jobsite geofence:
    - Verify "Clocked In" alert appears
    - Check active time entry shows in status card
  - When leaving jobsite geofence:
    - Verify "Clocked Out" alert appears
    - Check time entry is completed

### 5. Time Entry Approval Flow
- [ ] **View Pending Approvals (Web)**
  - Log in as admin/supervisor
  - Go to Approvals page
  - Verify pending time entries appear
  - Check summary stats (total hours, workers, estimated cost)
  - Verify trust signals (geofence verified badges)

- [ ] **Approve Time Entries**
  - Select individual entry and approve
  - Use bulk approve (select multiple, approve all)
  - Verify entries move from PENDING to APPROVED
  - Check sidebar badge updates

- [ ] **Mobile App Approvals (Admin/Supervisor)**
  - Log in to mobile app as admin/supervisor
  - Verify "Review Pending Approvals" button appears
  - Navigate to Approvals screen
  - Approve/reject entries from mobile

### 6. Billing & Subscription
- [ ] **Stripe Integration**
  - Go to Billing page
  - Enter employee count (e.g., 5)
  - Click "Subscribe" or "Update Subscription"
  - Complete Stripe checkout
  - Verify subscription shows as "Active"
  - Verify correct amount charged (£5 for 5 employees = £1/employee)
  - Check company code is still visible after subscription

### 7. User Management
- [ ] **View Users**
  - As admin, go to Users page
  - Verify all registered users appear
  - Check roles are displayed correctly

- [ ] **Create Additional Workers**
  - Register more workers using company code
  - Verify they appear in Users list
  - Assign them to jobsites

### 8. Data Persistence
- [ ] **Database Persistence**
  - Create test data (jobsites, assignments, time entries)
  - Restart backend service
  - Verify all data persists (not lost)
  - This confirms PostgreSQL migration worked

### 9. Error Handling
- [ ] **Invalid Company Code**
  - Try registering with wrong company code
  - Verify error message appears

- [ ] **Network Errors**
  - Disable internet on mobile app
  - Try to log in
  - Verify helpful error message

- [ ] **Empty States**
  - View approvals page with no entries
  - Verify helpful empty state message
  - Check "View Live Roster" button works

### 10. Cross-Platform Testing
- [ ] **Web App**
  - Test on Chrome, Firefox, Safari
  - Test responsive design (mobile browser)
  - Verify all features work

- [ ] **Mobile App**
  - Test on Android device
  - Test on iOS device (if available)
  - Verify GPS tracking works
  - Test pull-to-refresh

## 🔍 Key Features to Verify

### Geofence System
- ✅ Automatic clock in/out when entering/exiting jobsite
- ✅ GPS accuracy handling
- ✅ Multiple jobsites support
- ✅ Geofence verification badges in approvals

### Company Code System
- ✅ Unique 6-digit code generation
- ✅ Code displayed on Overview page
- ✅ Copy-to-clipboard functionality
- ✅ Worker registration with code
- ✅ Code remembered in mobile app

### Approval Workflow
- ✅ Pending entries visible to supervisors
- ✅ Bulk approve functionality
- ✅ Trust signals (geofence verified, manual edits)
- ✅ Summary statistics
- ✅ Sidebar badge for pending count
- ✅ Expandable entry details

### Billing
- ✅ Correct pricing per employee
- ✅ Subscription status updates
- ✅ Customer portal access
- ✅ Webhook handling

## 📱 Mobile App Specific Tests

1. **Login Flow**
   - Company code + email + password
   - Remember me checkbox
   - Auto-fill on next login

2. **GPS Tracking**
   - Start/stop tracking
   - Geofence detection
   - Background tracking (if implemented)

3. **Refresh Functionality**
   - Pull-to-refresh
   - Manual refresh button
   - Updates assignments when supervisor adds jobs

4. **Navigation**
   - Login → Home navigation
   - Logout → Login navigation
   - Approvals screen (admin/supervisor only)

## 🚀 Performance Testing

- [ ] **Load Time**
  - Web app loads in < 3 seconds
  - Mobile app loads in < 2 seconds

- [ ] **API Response Times**
  - Time entries load quickly
  - Approvals page responsive
  - GPS updates don't lag

- [ ] **Concurrent Users**
  - Multiple workers tracking simultaneously
  - Multiple supervisors approving

## 🐛 Known Issues to Watch For

1. **CORS Errors** - Should be resolved, but verify API calls work
2. **Database Connection** - Verify PostgreSQL is persistent
3. **Stripe Webhooks** - Check webhook logs for successful processing
4. **GPS Accuracy** - Test in different locations/environments

## 📊 Test Data Scenarios

### Scenario 1: Full Day Workflow
1. Worker clocks in at 8 AM
2. Works at jobsite
3. Takes lunch break (clocks out, back in)
4. Finishes at 5 PM (clocks out)
5. Supervisor approves all entries

### Scenario 2: Multiple Workers
1. Create 3 workers
2. Assign all to same jobsite
3. All clock in/out at different times
4. Supervisor approves all entries
5. Verify payroll calculations

### Scenario 3: Dispute Handling
1. Worker clocks in/out
2. Supervisor disputes entry
3. Entry marked as DISPUTED
4. Verify dispute appears in Disputes page

## ✅ Success Criteria

Your SaaS is ready if:
- ✅ All user roles can complete their workflows
- ✅ GPS tracking accurately detects geofence entries/exits
- ✅ Approvals system works smoothly
- ✅ Billing charges correct amounts
- ✅ Data persists across restarts
- ✅ Mobile and web apps are responsive
- ✅ Error messages are helpful
- ✅ Empty states guide users

## 🎯 Recommended Testing Order

1. **Day 1**: Company signup → Worker registration → Mobile login
2. **Day 2**: Create jobsite → Assign worker → Test GPS tracking
3. **Day 3**: Generate time entries → Test approvals → Test billing
4. **Day 4**: Test edge cases → Performance → Cross-platform

## 📝 Testing Notes Template

```
Date: ___________
Tester: ___________

Issues Found:
1. 
2. 
3. 

Features Working Well:
1. 
2. 
3. 

Suggestions:
1. 
2. 
3. 
```
