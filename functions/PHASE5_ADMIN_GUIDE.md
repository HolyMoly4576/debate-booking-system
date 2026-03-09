# Phase 5 - Admin Approvals - Testing Guide

## What's been implemented:

✅ **Four admin functions for booking approval workflow:**

1. **getPendingBookings** - Get queue of pending approvals
```javascript
// Example request (admin only):
{
  assignedTo: "admin_uid",  // optional - filter by admin
  limit: 20                 // optional (1-100, default: 20)
}

// Returns:
{
  success: true,
  approvals: [
    {
      approval: {
        id: "approval_123",
        bookingId: "booking_456",
        assignedTo: "admin_789",
        status: "pending",
        notes: "",
        createdAt: 1709859600000,
        respondedAt: null,
        approvalType: "standard"
      },
      booking: {
        id: "booking_456",
        userId: "user_123",
        coachId: "coach_abc",
        startDateTime: 1710000000000,
        endDateTime: 1710003600000,
        status: "pending_approval",
        sessionTopic: "Cross-examination",
        userNotes: "Need help",
        approverMessage: "",
        approverId: ""
      },
      user: { /* user profile */ },
      coach: { /* coach profile */ }
    }
  ],
  count: 1
}
```

2. **approveBooking** - Admin approves a booking
```javascript
// Example request (admin only):
{
  bookingId: "booking_456",
  message: "Approved - great fit"  // optional
}

// Returns:
{
  success: true,
  message: "Booking approved successfully",
  bookingId: "booking_456"
}

// What happens:
// - Booking status changes from pending_approval to approved
// - Approval document status changes to approved
// - Admin ID recorded in approverId field
// - Message recorded in approverMessage field
```

3. **rejectBooking** - Admin rejects a booking
```javascript
// Example request (admin only):
{
  bookingId: "booking_456",
  reason: "Coach unavailable at this time"  // required
}

// Returns:
{
  success: true,
  message: "Booking rejected successfully",
  bookingId: "booking_456",
  reason: "Coach unavailable at this time"
}

// What happens:
// - Booking status changes from pending_approval to rejected
// - Approval document status changes to rejected
// - Rejection reason stored in approverMessage
// - Admin ID recorded
```

4. **getBookingStats** - Dashboard statistics
```javascript
// Example request (admin only):
{}

// Returns:
{
  success: true,
  bookings: {
    total: 50,
    pending_approval: 5,
    approved: 30,
    rejected: 10,
    completed: 5,
    cancelled: 0,
    thisMonth: 15,
    thisWeek: 3
  },
  approvals: {
    total: 50,
    pending: 5,
    approved: 30,
    rejected: 10,
    cancelled: 0
  },
  avgApprovalTimeMinutes: 45,
  performance: {
    approvalRate: 75,      // % approved out of responded
    rejectionRate: 25      // % rejected out of responded
  }
}
```

## Key Features:

- ✅ **Admin verification** - All functions check for admin role
- ✅ **Rich approval details** - Returns user + coach + booking info
- ✅ **Status management** - Pending → approved/rejected
- ✅ **Audit trail** - Records admin ID and timestamps
- ✅ **Pagination** - Limit results (1-100)
- ✅ **Filtering** - Filter by assigned admin
- ✅ **Statistics** - Time periods (week, month, all-time)
- ✅ **Performance metrics** - Approval/rejection rates
- ✅ **State validation** - Can't approve/reject non-pending bookings
- ✅ **Proper error handling** - Admin-only access enforced

## How to test:

### Step 1: Keep emulator running
```
firebase emulators:start
```

### Step 2: Open Functions Shell
```bash
cd "c:/Users/Micheal Goh/Desktop/Projects/debate-booking-system/functions"
npm run shell
```

### Step 3: Create test data

Sign up as admin (need to manually set role):
```javascript
const adminSignup = await signup({
  email: "admin@example.com",
  password: "password123",
  name: "Admin User",
  role: "admin"
})
const adminId = adminSignup.user.uid
```

### Step 4: Get pending bookings (as admin)

```javascript
// Get all pending bookings
await getPendingBookings({})

// Get with limit
await getPendingBookings({
  limit: 10
})

// Filter by assigned admin
await getPendingBookings({
  assignedTo: adminId
})
```

### Step 5: Approve a booking

```javascript
// Get booking ID from getPendingBookings
const bookingId = "booking_456"

await approveBooking({
  bookingId: bookingId,
  message: "Approved - great fit!"
})
```

### Step 6: Reject a booking

```javascript
await rejectBooking({
  bookingId: bookingId,
  reason: "Coach unavailable at requested time"
})
```

### Step 7: Get dashboard statistics

```javascript
await getBookingStats({})
```

## Error Handling:

Admin-only errors:
- `Unauthorized: Admin access required` - User is not admin
- `Unauthenticated: User must be logged in` - No login

Booking errors:
- `Booking not found` - Invalid booking ID
- `Cannot approve booking with status: pending_approval` - Already processed
- `Cannot reject booking with status: pending_approval` - Already processed
- `Rejection reason is required` - Empty reason provided

## Security:

- ✅ All functions check for admin role
- ✅ Only admins can approve/reject
- ✅ Only admins can view statistics
- ✅ Audit trail of who approved/rejected
- ✅ State validation prevents double-approval
- ✅ Rich data returned for informed decision-making

## Admin Workflow:

```
1. Admin logs in
   ↓
2. Calls getPendingBookings() to see queue
   ↓
3. Reviews each pending booking with full details
   ↓
4. Approves (approveBooking) or Rejects (rejectBooking)
   ↓
5. Checks getBookingStats() for performance metrics
```

## What Happens After Approval:

When approved:
- Booking status → "approved"
- Approval status → "approved"
- Coach can now see confirmed booking
- User receives notification (frontend will implement)

When rejected:
- Booking status → "rejected"
- Approval status → "rejected"
- User can try booking different coach/time
- Rejection reason visible to user

## All Backend Functions Now Complete! 🎉

You have implemented all 15 backend functions:

**Phase 2 (Auth):**
- signup ✅
- login ✅
- getUserProfile ✅

**Phase 3 (Availability):**
- setAvailability ✅
- getAvailability ✅
- updateAvailability ✅
- deleteAvailability ✅

**Phase 4 (Bookings):**
- createBooking ✅
- getMyBookings ✅
- getCoachBookings ✅
- cancelBooking ✅

**Phase 5 (Admin):**
- getPendingBookings ✅
- approveBooking ✅
- rejectBooking ✅
- getBookingStats ✅

## Next: Phase 6 - React Frontend

Ready to build the UI with Material UI?
