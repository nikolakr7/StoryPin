# Phase 1 Testing Guide

This guide will help you systematically test all Phase 1 features.

## Prerequisites

1. **Enable Google Authentication:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Navigate to Authentication > Sign-in method
   - Enable Google provider

2. **Deploy Security Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```
   Or manually copy `firestore.rules` content to Firebase Console > Firestore > Rules

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

---

## Test Suite

### 1. Authentication Flow

#### Test 1.1: Sign In
1. Open app (should show Home page)
2. Click "Sign In with Google" in navbar
3. Complete Google sign-in flow
4. **Expected:**
   - Profile picture appears in navbar
   - Name appears next to picture
   - User document created in Firestore `users` collection

#### Test 1.2: Authentication Persistence
1. Sign in
2. Refresh the page
3. **Expected:**
   - Still signed in
   - No need to sign in again

#### Test 1.3: Sign Out
1. Sign in
2. Click profile picture in navbar
3. Click "Sign Out"
4. **Expected:**
   - Redirected/UI updates
   - "Sign In" button appears
   - No user info in navbar

---

### 2. Navigation

#### Test 2.1: Navbar Links
1. Sign in
2. Click profile picture dropdown
3. Test each link:
   - "My Profile" → goes to `/profile`
   - "My Bookmarks" → goes to `/bookmarks`
4. Click Home icon → goes to `/`
5. **Expected:** All navigation works without errors

#### Test 2.2: Map Page Navigation
1. From Home, click "Find Experiences"
2. Click "Back to Home" button
3. **Expected:** Returns to home page
4. From Home, click "Add Your Story"
5. Click "Back to Home" button
6. **Expected:** Returns to home page

---

### 3. Profile Page

#### Test 3.1: Empty Profile (New User)
1. Sign in with a brand new account
2. Navigate to Profile page
3. **Expected:**
   - Profile info displays correctly
   - All stats show 0
   - Empty state message: "You haven't shared any stories yet"

#### Test 3.2: Profile with Stories
1. Add at least 2 stories in different locations
2. Navigate to Profile page
3. **Expected:**
   - Stats update correctly:
     - Stories count = number of stories
     - Unique locations count
     - Cities and countries count
   - Story cards display:
     - Photo
     - Title
     - Desire tag chip
     - Location name
     - Story preview

---

### 4. Story Creation (No Auth)

#### Test 4.1: Unsigned User Attempt
1. Sign out (or use incognito window)
2. Go to "Add Your Story" mode
3. Search for a location
4. Click location to open modal
5. **Expected:**
   - Warning alert: "You must be signed in to add a story"
   - Form fields are disabled
   - "Sign In" button visible in alert

#### Test 4.2: Sign In from Modal
1. While in modal (unsigned), click "Sign In" button
2. Complete sign-in
3. **Expected:**
   - Form fields become enabled
   - Can now fill out story

---

### 5. Story Creation (Authenticated)

#### Test 5.1: Complete Story Submission
1. Sign in
2. Go to "Add Your Story" mode
3. Search for a location (e.g., "CN Tower, Toronto")
4. Click on map or select from search
5. Fill out form:
   - Title: "Amazing views!"
   - Story: "The view from the top is breathtaking..."
   - Desire Tag: "great_view"
   - Upload a photo
6. Click "Submit Story"
7. **Expected:**
   - Loading indicator appears
   - Success message: "Story added successfully!"
   - Modal closes after 1.5 seconds
   - **NO PAGE REFRESH**
   - New pin/story appears on map immediately

#### Test 5.2: Verify Story Data
1. After adding story, open Firebase Console
2. Go to Firestore > pins collection
3. Find your pin
4. Verify story object contains:
   - `id` (unique)
   - `title`, `story`, `desireTag`, `photoUrl`
   - `authorId`, `authorName`, `authorPhoto`
   - `timestamp`
   - `likes: 0`
   - `likedBy: []`

#### Test 5.3: Add Multiple Stories
1. Add 3 stories at different locations
2. Add 2 stories at the same location
3. **Expected:**
   - Each submission succeeds
   - No page refreshes
   - All stories appear correctly
   - Location with 2 stories shows both in sidebar (Find mode)

---

### 6. Story Discovery (Find Mode)

#### Test 6.1: View Stories
1. Go to "Find Experiences" mode
2. Click on a pin with stories
3. **Expected:**
   - Sidebar opens showing all stories
   - Each story shows:
     - Author name (if created after Phase 1)
     - Photo
     - Title
     - Desire tag
     - Story text

#### Test 6.2: Filter Stories
1. In Find mode, select different desire tags from dropdown
2. **Expected:**
   - Only pins with that tag remain visible
   - Sidebar updates if currently selected pin doesn't match filter

---

### 7. Error Handling

#### Test 7.1: No Photo Upload
1. Sign in
2. Try to submit story without uploading photo
3. **Expected:**
   - Error alert: "Please add a photo"
   - Form doesn't submit

#### Test 7.2: Network Error Simulation
1. Open DevTools > Network tab
2. Set throttling to "Offline"
3. Try to submit story
4. **Expected:**
   - Error alert with message
   - Loading state stops
   - Can retry after reconnecting

---

### 8. Loading States

#### Test 8.1: Photo Upload Loading
1. Upload a large photo (>2MB if possible)
2. Observe button during upload
3. **Expected:**
   - Button shows "Uploading..." or loading spinner
   - Button is disabled during upload

#### Test 8.2: Page Loading States
1. Navigate to Profile page
2. **Expected:**
   - Loading spinner while fetching stories
   - Content appears after loading

---

### 9. Security (Firestore Rules)

#### Test 9.1: Read Access (Public)
1. Sign out
2. Go to "Find Experiences"
3. **Expected:**
   - Can see all pins and stories
   - No permission errors

#### Test 9.2: Write Access (Auth Required)
1. Sign out
2. Try to add story (should show warning)
3. Try to manipulate Firestore directly via console (should fail)
4. **Expected:**
   - Cannot write without authentication

#### Test 9.3: User Data Privacy
1. Sign in as User A
2. Open Firebase Console
3. Try to edit User B's document in `users` collection (if you have another account)
4. **Expected:**
   - Security rules should prevent this (test via rules simulator)

---

### 10. Responsive Design (Basic Check)

#### Test 10.1: Mobile View
1. Open DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on iPhone and Android screen sizes
4. **Expected:**
   - Navbar should work (name may hide on small screens)
   - Pages should be usable
   - Note: Full mobile optimization is in Phase 5

---

## Common Issues & Solutions

### Issue: "Permission Denied" when adding story
**Solution:**
- Verify Firestore rules are deployed
- Check that user is signed in
- Look at Firebase Console > Firestore > Usage for specific error

### Issue: Stories don't appear immediately
**Solution:**
- Check browser console for errors
- Verify `onStoryAdded` callback is working
- Check network tab for failed Firestore requests

### Issue: Can't sign in
**Solution:**
- Verify Google Auth is enabled in Firebase Console
- Add authorized domain (localhost for dev)
- Clear browser cookies and cache

### Issue: Profile page doesn't load
**Solution:**
- Check that user document was created in Firestore
- Verify `users` collection exists
- Check browser console for errors

### Issue: Photos don't upload
**Solution:**
- Check Firebase Storage rules
- Verify storage bucket is configured
- Check file size (Firebase free tier has limits)

---

## Performance Checks

- [ ] Page loads in under 3 seconds
- [ ] Story submission completes in under 5 seconds
- [ ] Images load progressively
- [ ] No console errors or warnings
- [ ] Network requests are optimized (not fetching same data repeatedly)

---

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)

---

## Firebase Console Checks

1. **Authentication Tab:**
   - [ ] Users appear after sign-in
   - [ ] User info is correct

2. **Firestore Database:**
   - [ ] `users` collection has documents
   - [ ] `pins` collection has correct structure
   - [ ] Stories have all new fields

3. **Storage:**
   - [ ] `images/` folder has uploaded photos
   - [ ] Photos are accessible via URL

4. **Rules:**
   - [ ] Security rules are deployed
   - [ ] Last updated timestamp is recent

---

## Sign-Off Checklist

Before proceeding to Phase 2:
- [ ] All authentication tests pass
- [ ] Profile page works correctly
- [ ] Stories can be added without page refresh
- [ ] Security rules are deployed
- [ ] No console errors
- [ ] Firebase Console shows correct data
- [ ] Documentation is clear

---

## Ready for Phase 2?

If all tests pass, you're ready to move on to implementing AI features! 🚀

Refer to the plan for Phase 2 tasks:
1. Get Google Gemini API key
2. Set up Firebase Cloud Functions
3. Implement AI auto-tagging
4. Add story quality scoring
5. Create semantic search

**Good luck testing!**
