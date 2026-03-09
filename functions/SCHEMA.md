# Debate Booking System - Firestore Schema Documentation

This document describes the complete data model for the debate booking system.

## Database Collections

### 1. `users` Collection

Stores user profile information. Each user must have exactly one document in this collection.

**Document Path**: `users/{userId}` (where userId = Firebase Auth UID)

**Fields**:
- `uid` (string, required): Firebase Authentication UID
- `email` (string, required): User's email address
- `name` (string, required): User's full name
- `phone` (string, optional): User's phone number
- `role` (string, required): User role - one of: 'user', 'coach', 'admin'
- `profilePicture` (string, optional): URL to profile picture
- `isActive` (boolean, required): Whether account is active
- `createdAt` (timestamp, required): Account creation timestamp
- `updatedAt` (timestamp, required): Last profile update timestamp

**Example**:
```json
{
  "uid": "user_123xyz",
  "email": "john@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "coach",
  "profilePicture": "https://...",
  "isActive": true,
  "createdAt": 1709859600000,
  "updatedAt": 1709859600000
}
```

---

### 2. `coaches` Collection

Extends user information with coaching-specific details.

**Document Path**: `coaches/{coachId}` (where coachId = userId of the coach)

**Fields**:
- `userId` (string, required): Reference to users collection
- `bio` (string, optional): Coach biography/description
- `experience` (number, required): Years of coaching experience
- `specializations` (array, optional): Topics of expertise (e.g., ["Lincoln-Douglas", "Public Forum"])
- `baseRatePerHour` (number, required): Base hourly rate in dollars
- `rating` (number, optional): Average rating (0-5)
- `totalSessions` (number, required): Total completed sessions (default: 0)
- `availability` (array, optional): Array of availability slot IDs
- `createdAt` (timestamp, required): When coach profile was created
- `updatedAt` (timestamp, required): Last update timestamp

**Example**:
```json
{
  "userId": "user_123xyz",
  "bio": "Master debate coach with 10 years experience",
  "experience": 10,
  "specializations": ["Lincoln-Douglas", "Parliamentary"],
  "baseRatePerHour": 50,
  "rating": 4.8,
  "totalSessions": 125,
  "createdAt": 1709859600000,
  "updatedAt": 1709859600000
}
```

---

### 3. `availability` Collection

Stores coaching availability slots that users can book.

**Document Path**: `availability/{availabilityId}` (auto-generated)

**Fields**:
- `coachId` (string, required): Reference to coach
- `dayOfWeek` (number, required): Day of week (0=Monday, 6=Sunday)
- `startTime` (string, required): Start time in 24-hour format (e.g., "14:00")
- `endTime` (string, required): End time in 24-hour format (e.g., "16:00")
- `slotDuration` (number, required): Duration of each booking slot in minutes (e.g., 60, 90)
- `isRecurring` (boolean, required): Whether this repeats every week
- `bookedSlots` (array, optional): Array of booked timestamp objects
- `createdAt` (timestamp, required): When this availability was created
- `updatedAt` (timestamp, required): Last update timestamp

**Booked Slot Object**:
```json
{
  "bookingId": "booking_456",
  "startDateTime": 1709859600000,
  "endDateTime": 1709863200000
}
```

**Example**:
```json
{
  "coachId": "user_123xyz",
  "dayOfWeek": 2,
  "startTime": "14:00",
  "endTime": "17:00",
  "slotDuration": 60,
  "isRecurring": true,
  "bookedSlots": [],
  "createdAt": 1709859600000,
  "updatedAt": 1709859600000
}
```

---

### 4. `bookings` Collection

Stores booking requests from users requesting coaching sessions.

**Document Path**: `bookings/{bookingId}` (auto-generated)

**Fields**:
- `userId` (string, required): Reference to user requesting booking
- `coachId` (string, required): Reference to coach
- `startDateTime` (timestamp, required): Session start time
- `endDateTime` (timestamp, required): Session end time
- `status` (string, required): Booking status - one of:
  - `pending_approval` - Awaiting admin approval
  - `approved` - Approved by admin
  - `rejected` - Rejected by admin
  - `completed` - Session completed
  - `cancelled` - Cancelled by user
- `userNotes` (string, optional): User's notes/comments about the session
- `sessionTopic` (string, optional): Topic to be discussed in session
- `approverMessage` (string, optional): Admin's approval/rejection message
- `approverId` (string, optional): ID of admin who approved/rejected
- `createdAt` (timestamp, required): When booking was requested
- `updatedAt` (timestamp, required): Last update timestamp

**Status Transitions**:
- `pending_approval` → `approved` (by admin)
- `pending_approval` → `rejected` (by admin)
- `approved` → `completed` (automatic or manual after session)
- Any status → `cancelled` (by user or admin)

**Example**:
```json
{
  "userId": "user_456abc",
  "coachId": "user_123xyz",
  "startDateTime": 1709945400000,
  "endDateTime": 1709949000000,
  "status": "approved",
  "userNotes": "Need help with cross-examination strategy",
  "sessionTopic": "Cross-examination Techniques",
  "approverMessage": "Approved - experienced coach assigned",
  "approverId": "admin_789def",
  "createdAt": 1709859600000,
  "updatedAt": 1709862200000
}
```

---

### 5. `bookingApprovals` Collection

Tracks the approval workflow for pending bookings.

**Document Path**: `bookingApprovals/{approvalId}` (auto-generated)

**Fields**:
- `bookingId` (string, required): Reference to booking
- `assignedTo` (string, required): Admin user ID this is assigned to
- `status` (string, required): Approval status - one of:
  - `pending` - Awaiting admin response
  - `approved` - Approved
  - `rejected` - Rejected
- `notes` (string, optional): Admin's internal notes
- `createdAt` (timestamp, required): When approval was created
- `respondedAt` (timestamp, optional): When admin responded
- `approvalType` (string, optional): Type of approval needed

**Example**:
```json
{
  "bookingId": "booking_999xyz",
  "assignedTo": "admin_789def",
  "status": "approved",
  "notes": "Great fit for the requested topic",
  "createdAt": 1709859600000,
  "respondedAt": 1709862200000,
  "approvalType": "standard"
}
```

---

## Data Relationships

```
users (all roles)
├── coaches (extended profile)
│   ├── availability (weekly slots)
│   │   └── bookings (booked slots reference this)
│   └── bookings (coach receives these)
└── bookings (user requests these)
    └── bookingApprovals (tracked by admins)
```

---

## Security Rules Summary

- **Users**: Can only read/write own profile. Admins can read all profiles.
- **Coaches**: Public read, write only by the coach.
- **Availability**: Public read, write/update/delete only by the coach.
- **Bookings**: Users read own bookings, coaches read their bookings, admins read all and can approve/reject.
- **BookingApprovals**: Admins only.

---

## Firestore Indexes

The following composite indexes are configured for efficient querying:

1. **availability**: coachId + dayOfWeek
2. **bookings**: userId + status
3. **bookings**: coachId + status
4. **bookings**: status + startDateTime
5. **bookingApprovals**: status + createdAt (descending)

---

## Next Steps (Phase 2-5)

- Phase 2: Authentication functions
- Phase 3: Availability management
- Phase 4: Booking requests
- Phase 5: Admin approvals
