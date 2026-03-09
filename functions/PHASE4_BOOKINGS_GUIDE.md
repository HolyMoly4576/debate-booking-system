# Phase 4 - Booking Requests - Testing Guide

## What's been implemented:

✅ **Four booking management functions:**

1. **createBooking** - User requests a coaching session
```javascript
// Example request:
{
  coachId: "coach_uid_123",
  startDateTime: 1710000000000,      // Unix timestamp (ms)
  endDateTime: 1710003600000,        // Must be after startDateTime
  sessionTopic: "Cross-examination",  // optional
  userNotes: "Need help with strategy" // optional
}

// Returns:
{
  success: true,
  message: "Booking request created successfully",
  bookingId: "booking_abc123...",
  status: "pending_approval"
}
```

2. **getMyBookings** - Get your bookings (smart based on role)
```javascript
// For users: gets all bookings they requested
// For coaches: gets all bookings from users

{
  status: "approved"  // optional filter
}

// Returns:
{
  success: true,
  bookings: [
    {
      id: "booking_123",
      userId: "user_uid",
      coachId: "coach_uid",
      startDateTime: 1710000000000,
      endDateTime: 1710003600000,
      status: "approved",
      sessionTopic: "Cross-examination",
      userNotes: "Need help with strategy",
      approverMessage: "",
      approverId: "",
      createdAt: 1709859600000,
      updatedAt: 1709859600000
    }
  ],
  count: 1
}
```

3. **getCoachBookings** - Get bookings for a specific coach
```javascript
// Example request:
{
  coachId: "coach_uid_123",
  status: "pending_approval"  // optional filter
}

// Returns all bookings for that coach
```

4. **cancelBooking** - Cancel a booking
```javascript
// Example request:
{
  bookingId: "booking_abc123...",
  reason: "Found another coach"  // optional
}

// Returns:
{
  success: true,
  message: "Booking cancelled successfully",
  bookingId: "booking_abc123..."
}
```

## Key Features:

- ✅ **Future booking validation** - Cannot book in the past
- ✅ **Coach verification** - Ensures coach exists
- ✅ **User verification** - Ensures user profile exists
- ✅ **Time validation** - Start must be before end
- ✅ **Status management** - Tracks pending/approved/rejected/completed/cancelled
- ✅ **Automatic approval creation** - Creates approval document when booking made
- ✅ **Role-based retrieval** - getMyBookings returns different data based on user role
- ✅ **Cancellation restrictions** - Can't cancel completed/rejected bookings
- ✅ **Ownership verification** - Only user who made booking can cancel
- ✅ **Approval status sync** - Updates approval when booking cancelled

## Booking Status Flow:

```
pending_approval
    ↓
    ├→ approved (by admin) → completed (after session)
    │
    └→ rejected (by admin)

OR

cancelled (by user before approval)
```

## How to test:

### Step 1: Keep emulator running
Make sure your emulator is still running:
```
firebase emulators:start
```

### Step 2: Open Functions Shell
```bash
cd "c:/Users/Micheal Goh/Desktop/Projects/debate-booking-system/functions"
npm run shell
```

### Step 3: Create test data

Sign up a user:
```javascript
const userSignup = await signup({
  email: "user@example.com",
  password: "password123",
  name: "John User",
  role: "user"
})
const userId = userSignup.user.uid
```

Sign up a coach:
```javascript
const coachSignup = await signup({
  email: "coach@example.com",
  password: "password123",
  name: "Jane Coach",
  role: "coach"
})
const coachId = coachSignup.user.uid
```

### Step 4: Create a booking

```javascript
// Get current time + 24 hours from now
const now = Date.now()
const tomorrow = now + (24 * 60 * 60 * 1000)

const booking = await createBooking({
  coachId: coachId,
  startDateTime: tomorrow,
  endDateTime: tomorrow + (60 * 60 * 1000),  // 1 hour session
  sessionTopic: "Cross-examination techniques",
  userNotes: "First-time student, need basics"
})

console.log(booking.bookingId)
```

### Step 5: Get bookings

As user:
```javascript
await getMyBookings({})
```

As coach:
```javascript
await getMyBookings({})
```

Get specific coach's bookings:
```javascript
await getCoachBookings({
  coachId: coachId
})
```

Filter by status:
```javascript
await getMyBookings({
  status: "pending_approval"
})
```

### Step 6: Cancel booking

```javascript
await cancelBooking({
  bookingId: booking.bookingId,
  reason: "Found another coach"
})
```

## Error Handling:

- `Unauthenticated: User must be logged in`
- `Coach not found`
- `User profile not found`
- `Cannot book sessions in the past`
- `Start time must be before end time`
- `Cannot cancel completed bookings`
- `Cannot cancel rejected bookings`
- `Booking is already cancelled`
- `Unauthorized: You can only cancel your own bookings`

## Security:

- ✅ Only authenticated users can create bookings
- ✅ Only booking creator can cancel
- ✅ Cannot modify completed/rejected bookings
- ✅ Coach existence verified
- ✅ User profile verified
- ✅ Time validation prevents past bookings
- ✅ Approval documents track administrative actions

## What's Next:

Phase 5 will implement admin approval functions:
- `getPendingBookings` - Queue of bookings awaiting approval
- `approveBooking` - Admin approves booking
- `rejectBooking` - Admin rejects booking
- `getBookingStats` - Dashboard statistics

Ready for Phase 5?
