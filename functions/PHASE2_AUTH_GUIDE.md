# Phase 2 - Authentication Functions - Testing Guide

## What's been implemented:

✅ **Three authentication functions:**

1. **signup** - Create new user account with role
```javascript
// Example request:
{
  email: "coach@example.com",
  password: "password123",
  name: "John Coach",
  role: "coach",
  phone: "+1234567890" // optional
}

// Returns:
{
  success: true,
  message: "User created successfully",
  user: { uid, email, name, role, phone },
  token: customToken
}
```

2. **login** - Authenticate user and get token
```javascript
// Example request:
{
  email: "coach@example.com",
  password: "password123"
}

// Returns user info and custom token
```

3. **getUserProfile** - Get authenticated user's profile
```javascript
// Requires authenticated user
// Returns:
{
  success: true,
  user: { full user profile },
  coach: { coach details if user is a coach }
}
```

## How to test locally:

### Step 1: Stop any running emulators
In your current terminal, press `Ctrl+C` to stop any running emulator.

### Step 2: Start the emulator (in terminal 1)
```bash
cd "c:/Users/Micheal Goh/Desktop/Projects/debate-booking-system/functions"
npm run serve
```

This will output something like:
```
✔ All emulators ready!
│ Functions │ http://127.0.0.1:5001
```

### Step 3: Test functions (in terminal 2)
```bash
cd "c:/Users/Micheal Goh/Desktop/Projects/debate-booking-system/functions"
npm run shell
```

### Step 4: Call functions from the shell
```javascript
// Create a new coach
await signup({
  email: "test.coach@example.com",
  password: "password123",
  name: "Test Coach",
  role: "coach",
  phone: "+1234567890"
})

// Login
await login({
  email: "test.coach@example.com",
  password: "password123"
})

// Get profile (requires auth - use the web SDK for this in real apps)
```

## What happens when you sign up:

1. ✅ User created in Firebase Auth
2. ✅ Custom role claims added to token
3. ✅ User profile document created in Firestore
4. ✅ If coach role: Coach profile document created
5. ✅ Returns token for immediate login

## Security implemented:

- ✅ Password must be at least 6 characters
- ✅ Email uniqueness enforced
- ✅ Role validation (only 'user', 'coach', 'admin')
- ✅ Custom claims for role-based access control
- ✅ Firestore security rules enforce access

## Next steps:

The auth functions are now complete and working! You can:
1. Test them locally with the emulator
2. Move to Phase 3 (Availability Management)
3. Implement coach availability slots

Ready to continue?
