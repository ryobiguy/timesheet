# Mobile App Testing Checklist

Test the app thoroughly before rebuilding. Check off items as you go and note any bugs.

## 🔐 Login Screen

- [ ] **Text Visibility**
  - [ ] Company code input shows text when typing
  - [ ] Email input shows text when typing
  - [ ] Password input shows text when typing (as dots)
  - [ ] Placeholder text is visible in all fields

- [ ] **Input Functionality**
  - [ ] Company code accepts only numbers (6 digits max)
  - [ ] Email keyboard appears (with @ symbol)
  - [ ] Password is hidden (shows dots)
  - [ ] Can clear all fields

- [ ] **Remember Me Feature**
  - [ ] Checkbox can be toggled
  - [ ] Email and company code saved when checked
  - [ ] Credentials load on next app open
  - [ ] Credentials clear when unchecked

- [ ] **Login Flow**
  - [ ] Error message shows for invalid credentials
  - [ ] Error message shows for missing fields
  - [ ] Error message shows for invalid company code format
  - [ ] Loading indicator shows during login
  - [ ] Successfully logs in with valid credentials
  - [ ] Navigates to home screen after login

---

## 🏠 Home Screen

- [ ] **Header**
  - [ ] Header has proper padding from status bar
  - [ ] User name displays correctly
  - [ ] Logout button works
  - [ ] Refresh button (↻) works
  - [ ] "Review Pending Approvals" button visible (if admin/supervisor)

- [ ] **Status Card**
  - [ ] Shows "GPS Tracking Inactive" when not tracking
  - [ ] Shows "GPS Tracking Active" when tracking
  - [ ] Status indicator dot changes color
  - [ ] Shows clocked-in time if currently clocked in
  - [ ] Shows jobsite name if clocked in
  - [ ] "Start Tracking" / "Stop Tracking" button works

- [ ] **Assigned Jobsites**
  - [ ] Lists all assigned jobsites
  - [ ] Shows jobsite name
  - [ ] Shows jobsite address
  - [ ] Pull-to-refresh works
  - [ ] Empty state shows if no jobsites assigned

- [ ] **GPS Tracking**
  - [ ] Requests location permission
  - [ ] Starts tracking when button pressed
  - [ ] Stops tracking when button pressed
  - [ ] Shows alert when entering geofence
  - [ ] Shows alert when exiting geofence
  - [ ] Automatically clocks in when entering jobsite
  - [ ] Automatically clocks out when exiting jobsite

- [ ] **Pull to Refresh**
  - [ ] Pull down refreshes assignments
  - [ ] Pull down refreshes active time entry
  - [ ] Loading indicator shows during refresh

---

## ✅ Approvals Screen (Admin/Supervisor Only)

- [ ] **Navigation**
  - [ ] Can navigate from home screen
  - [ ] Can go back to home screen

- [ ] **Pending Approvals List**
  - [ ] Shows all pending time entries
  - [ ] Shows worker name
  - [ ] Shows jobsite name
  - [ ] Shows date and time
  - [ ] Shows duration
  - [ ] Empty state shows if no pending approvals

- [ ] **Actions**
  - [ ] "Approve" button works
  - [ ] "Dispute" button works
  - [ ] Pull-to-refresh works
  - [ ] List updates after approval/dispute

---

## 🔄 General App Behavior

- [ ] **Navigation**
  - [ ] App starts on login screen if not logged in
  - [ ] App starts on home screen if logged in
  - [ ] Logout returns to login screen
  - [ ] Can navigate between screens smoothly

- [ ] **Network**
  - [ ] Shows error if backend is unreachable
  - [ ] Handles network timeouts gracefully
  - [ ] Retries work after network failure

- [ ] **Data Persistence**
  - [ ] Login persists after app restart
  - [ ] Remember me credentials persist
  - [ ] Logout clears all stored data

- [ ] **Performance**
  - [ ] App loads quickly
  - [ ] No lag when typing in inputs
  - [ ] Smooth scrolling
  - [ ] No memory leaks (test by opening/closing app multiple times)

- [ ] **Error Handling**
  - [ ] Shows user-friendly error messages
  - [ ] Doesn't crash on errors
  - [ ] Handles edge cases gracefully

---

## 📱 Device-Specific Testing

### Android
- [ ] **Permissions**
  - [ ] Location permission requested
  - [ ] Background location permission requested
  - [ ] App works if permissions denied

- [ ] **Status Bar**
  - [ ] Header doesn't overlap status bar
  - [ ] Content is visible below status bar

- [ ] **Keyboard**
  - [ ] Keyboard doesn't cover input fields
  - [ ] Can dismiss keyboard
  - [ ] Correct keyboard type for each input

### Different Screen Sizes
- [ ] Test on small phone (if available)
- [ ] Test on large phone (if available)
- [ ] Test on tablet (if available)
- [ ] All content is visible and accessible

---

## 🐛 Bugs Found

Document any bugs you find here:

### Bug 1: [Title]
- **Screen:** [Which screen]
- **Steps to reproduce:**
  1. 
  2. 
  3. 
- **Expected:** 
- **Actual:** 
- **Screenshot:** (if possible)

### Bug 2: [Title]
- **Screen:** 
- **Steps to reproduce:**
  1. 
  2. 
  3. 
- **Expected:** 
- **Actual:** 

---

## ✅ Ready for Rebuild?

- [ ] All critical bugs found and documented
- [ ] All major features tested
- [ ] App is stable and usable
- [ ] Ready to fix bugs and rebuild

---

## Notes

Add any additional observations or suggestions here:
