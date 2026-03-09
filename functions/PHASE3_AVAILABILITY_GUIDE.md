# Phase 3 - Coach Availability Management - Testing Guide

## What's been implemented:

✅ **Four availability management functions:**

1. **setAvailability** - Create a new availability slot
```javascript
// Example request:
{
  dayOfWeek: 2,           // 0=Monday, 6=Sunday
  startTime: "14:00",     // 24-hour format
  endTime: "17:00",
  slotDuration: 60,       // minutes (15-480)
  isRecurring: true       // optional, defaults to true
}

// Returns:
{
  success: true,
  message: "Availability slot created successfully",
  availabilityId: "abc123..."
}
```

2. **getAvailability** - Retrieve availability slots
```javascript
// Get your own availability:
{
  dayOfWeek: 2  // optional - filter by specific day
}

// Get specific coach's availability:
{
  coachId: "coach_uid_123",
  dayOfWeek: 2  // optional
}

// Returns:
{
  success: true,
  slots: [
    {
      id: "avail_123",
      coachId: "coach_uid",
      dayOfWeek: 2,
      startTime: "14:00",
      endTime: "17:00",
      slotDuration: 60,
      isRecurring: true,
      bookedSlots: [],
      createdAt: 1709859600000,
      updatedAt: 1709859600000
    }
  ],
  count: 1
}
```

3. **updateAvailability** - Modify an existing slot
```javascript
// Example request:
{
  availabilityId: "abc123...",
  updates: {
    startTime: "15:00",
    endTime: "18:00",
    slotDuration: 90
  }
}

// Returns:
{
  success: true,
  message: "Availability updated successfully",
  availabilityId: "abc123..."
}
```

4. **deleteAvailability** - Remove an availability slot
```javascript
// Example request:
{
  availabilityId: "abc123..."
}

// Returns:
{
  success: true,
  message: "Availability deleted successfully",
  availabilityId: "abc123..."
}
```

## Key Features:

- ✅ **Time validation** - Ensures 24-hour format (HH:MM)
- ✅ **Day of week validation** - 0-6 (Monday to Sunday)
- ✅ **Slot duration validation** - 15 to 480 minutes
- ✅ **Time range validation** - Start time must be before end time
- ✅ **Ownership verification** - Can only update/delete your own slots
- ✅ **Booked slot protection** - Can't delete slots with bookings
- ✅ **Recurring availability** - Weekly repeating slots
- ✅ **Flexible filtering** - Filter by coach or day of week

## How to test:

### Step 1: Keep emulator running
Make sure your emulator is still running:
```
firebase emulators:start
```

### Step 2: Test in Functions Shell
```bash
cd "c:/Users/Micheal Goh/Desktop/Projects/debate-booking-system/functions"
npm run shell
```

### Step 3: Test creating availability

First, sign up as a coach (from Phase 2):
```javascript
const signupResult = await signup({
  email: "coach@example.com",
  password: "password123",
  name: "Test Coach",
  role: "coach"
})

// Get the token
const token = signupResult.token
```

Then test setAvailability:
```javascript
await setAvailability({
  dayOfWeek: 2,          // Wednesday
  startTime: "14:00",
  endTime: "17:00",
  slotDuration: 60,
  isRecurring: true
})
```

### Step 4: Test retrieving availability
```javascript
// Get your own slots
await getAvailability({})

// Get slots for a specific day
await getAvailability({
  dayOfWeek: 2
})

// Get another coach's slots (public query)
await getAvailability({
  coachId: "some_coach_uid"
})
```

### Step 5: Test updating availability
```javascript
// Get availability ID from previous getAvailability call
const availId = "abc123..."

await updateAvailability({
  availabilityId: availId,
  updates: {
    startTime: "15:00",
    endTime: "18:00"
  }
})
```

### Step 6: Test deleting availability
```javascript
await deleteAvailability({
  availabilityId: availId
})
```

## Error Handling:

All functions return proper errors:
- `Invalid dayOfWeek. Must be 0-6 (Mon-Sun)`
- `Invalid startTime format. Use HH:MM`
- `Slot duration must be between 15 and 480 minutes`
- `Start time must be before end time`
- `Unauthorized: You can only update your own availability`
- `Cannot delete availability with booked slots`

## Security:

- ✅ Only authenticated users can create/modify slots
- ✅ Coaches can only manage their own slots
- ✅ Public read access for viewing other coaches' availability
- ✅ Booked slots are protected from deletion

## Next Steps:

Phase 4 will implement booking requests:
- `createBooking` - User requests a coaching session
- `getMyBookings` - Get user's bookings
- `getCoachBookings` - Get coach's bookings
- `cancelBooking` - Cancel pending bookings

Ready for Phase 4?
