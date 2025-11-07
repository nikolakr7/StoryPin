# Firebase Setup Instructions

## Phase 1 Implementation Complete!

This document contains instructions for deploying Firestore security rules and enabling authentication in your Firebase project.

## 1. Enable Google Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `first-hackathon-163ce`
3. Navigate to **Authentication** in the left sidebar
4. Click on **Sign-in method** tab
5. Click on **Google** provider
6. Toggle **Enable** to ON
7. Add your email as a test user if needed
8. Click **Save**

## 2. Deploy Firestore Security Rules

### Option A: Using Firebase CLI (Recommended)

1. Install Firebase CLI if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init firestore
   ```
   - Select your project
   - Accept the default `firestore.rules` file
   - Accept the default `firestore.indexes.json` file

4. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Option B: Manual Deployment via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `first-hackathon-163ce`
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Copy the contents of `firestore.rules` from this project
6. Paste into the Firebase Console rules editor
7. Click **Publish**

## 3. Current Firestore Security Rules

The rules in `firestore.rules` implement the following security:

- **Users Collection**: Users can only read/write their own data
- **Pins Collection**:
  - Anyone can read (public discovery)
  - Only authenticated users can create or update pins
  - Deletion is disabled (can be changed for admins)

## 4. Testing the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test the following features:
   - Sign in with Google
   - View your profile page
   - Try to add a story (should work when signed in)
   - Try to add a story when signed out (should show warning)
   - Verify that page doesn't refresh after adding a story
   - Check that author info appears in stories

## 5. Data Migration (If you have existing pins)

If you have existing pins without the new fields (authorId, timestamp, likes), you'll need to migrate them. Here's a simple script you can run in the Firebase Console:

1. Go to Firestore Database
2. Click on a pin document
3. Manually add missing fields to existing stories, or delete old test data and create new stories with the updated schema

## 6. Next Steps for Phase 2

Once you've tested Phase 1 and everything is working:

1. Get a Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Set up Firebase Cloud Functions for AI features
3. Continue with Phase 2 implementation

## Troubleshooting

### Authentication Not Working
- Verify that Google Auth is enabled in Firebase Console
- Check that the authorized domains include `localhost` and your GitHub Pages domain
- Clear browser cache and try again

### Firestore Permission Denied
- Verify that security rules are deployed
- Check that user is authenticated before trying to write
- Look at Firebase Console > Firestore > Usage tab for specific error messages

### Stories Not Appearing Immediately
- Check browser console for errors
- Verify that `onStoryAdded` callback is being called
- Check network tab to see if Firestore queries are succeeding

## Support

If you encounter issues, check:
1. Browser console for JavaScript errors
2. Firebase Console > Firestore > Usage for security rule errors
3. Firebase Console > Authentication > Users to verify sign-ins are working
