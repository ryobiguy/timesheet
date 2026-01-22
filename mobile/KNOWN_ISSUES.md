# Known Issues & Potential Bugs to Watch For

## 🔍 Issues Found in Code Review

### 1. Redundant Boolean() Calls
**Location:** `LoginScreen.tsx`
- Line 137: `secureTextEntry={Boolean(true)}` → Should be `secureTextEntry={true}`
- Line 156: `disabled={Boolean(isLoading === true)}` → Should be `disabled={isLoading === true}`

**Impact:** Low - Works but unnecessary code
**Fix:** Simplify to direct boolean values

---

### 2. ApprovalsScreen Refresh State
**Location:** `ApprovalsScreen.tsx`
- The `RefreshControl` calls `loadApprovals()` but `loadApprovals()` doesn't set `isRefreshing` to `true` at the start
- It only sets it to `false` in the finally block

**Impact:** Medium - Pull-to-refresh might not show loading indicator properly
**Fix:** Set `setIsRefreshing(true)` at the start of `loadApprovals()` when called from refresh

---

## 🧪 Things to Test Specifically

### Text Visibility Issues
- [ ] Check ALL text inputs across the app for visibility
- [ ] Test in different lighting conditions
- [ ] Test with different Android themes (light/dark mode if applicable)

### GPS/Location Tracking
- [ ] Test with location permissions denied
- [ ] Test with location services disabled
- [ ] Test entering/exiting geofences multiple times
- [ ] Test background tracking (minimize app, then maximize)
- [ ] Test what happens if GPS signal is lost during tracking

### Network Edge Cases
- [ ] Test with airplane mode (no network)
- [ ] Test with slow/unstable network
- [ ] Test what happens if backend is down
- [ ] Test timeout scenarios

### Data Persistence
- [ ] Force close app and reopen (should stay logged in)
- [ ] Clear app data and reopen (should require login)
- [ ] Test "Remember Me" with app updates

### Navigation Edge Cases
- [ ] Press back button on login screen (shouldn't exit app)
- [ ] Navigate quickly between screens
- [ ] Test with app in background for extended time

### Error Handling
- [ ] Invalid login credentials
- [ ] Expired JWT token
- [ ] Server returns 500 error
- [ ] Malformed API responses

---

## 🎨 UI/UX Issues to Watch

### Spacing & Layout
- [ ] Check if content is cut off on small screens
- [ ] Verify padding/margins look good
- [ ] Check if buttons are easily tappable (not too small)

### Colors & Contrast
- [ ] Ensure all text has good contrast against backgrounds
- [ ] Check button colors are visible
- [ ] Verify status indicators are clear

### Loading States
- [ ] All async operations show loading indicators
- [ ] Loading states don't block UI unnecessarily
- [ ] Error states are clear and actionable

---

## 📝 Testing Tips

1. **Test on Real Device** - Emulators don't catch all issues
2. **Test Different Scenarios** - Happy path AND error cases
3. **Test Multiple Times** - Some bugs only appear after repeated actions
4. **Document Everything** - Note exact steps to reproduce bugs
5. **Take Screenshots** - Visual bugs are easier to understand with images

---

## 🚨 Critical Bugs (Fix Before Release)

- [ ] App crashes on startup
- [ ] Can't log in with valid credentials
- [ ] Data loss (entries disappear)
- [ ] GPS tracking doesn't work
- [ ] App freezes or becomes unresponsive

---

## ⚠️ Medium Priority Bugs

- [ ] UI elements overlap or are cut off
- [ ] Text is unreadable (color/contrast issues)
- [ ] Buttons don't respond to taps
- [ ] Loading states never complete
- [ ] Error messages are unclear

---

## 💡 Low Priority / Nice to Have

- [ ] Minor UI inconsistencies
- [ ] Performance optimizations
- [ ] Better error messages
- [ ] Additional validation
- [ ] Accessibility improvements
