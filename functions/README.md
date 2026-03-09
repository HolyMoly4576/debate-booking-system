# Firebase Cloud Functions - Debate Booking System

This directory contains all backend API implementations for the debate booking system using Firebase Cloud Functions.

## Directory Structure

```
functions/
├── src/
│   ├── handlers/          # HTTP/Callable function handlers
│   │   ├── auth.js       # Authentication endpoints (Phase 2)
│   │   ├── coaches.js    # Availability management (Phase 3)
│   │   ├── bookings.js   # Booking operations (Phase 4)
│   │   └── admin.js      # Admin operations (Phase 5)
│   ├── middleware/        # Authentication & validation middleware
│   │   └── auth.js       # Auth verification functions
│   └── utils/            # Utility functions
│       └── errors.js     # Error handling utilities
├── index.js              # Main entry point
├── package.json          # Dependencies
├── SCHEMA.md             # Firestore data schema documentation
└── .eslintrc.js          # ESLint configuration
```

## Available Scripts

- `npm run serve` - Run Firebase emulator locally for testing
- `npm run lint` - Run ESLint to check code quality
- `npm run deploy` - Deploy functions to Firebase
- `npm run logs` - View Firebase function logs

## Function Phases

### Phase 1: Firestore Schema & Security Rules ✅ COMPLETE
- ✅ Firestore collections structure
- ✅ Security rules for role-based access
- ✅ Composite indexes for efficient queries
- ✅ Handler file structure created

**What's been set up:**
- 5 Collections: users, coaches, availability, bookings, bookingApprovals
- Role-based security rules for different user types
- Optimized indexes for common queries
- Placeholder handler files ready for implementation

### Phase 2: Authentication Functions
- [ ] `signup` - Create new user account with role
- [ ] `login` - Authenticate user
- [ ] `getUserProfile` - Get user data

**What you'll need to implement:**
- Create Firebase Auth Custom Claims for roles
- Create user documents in Firestore on signup
- Password validation and security
- Token generation

### Phase 3: Availability Management Functions
- [ ] `setAvailability` - Create availability slots
- [ ] `getAvailability` - Retrieve available times
- [ ] `updateAvailability` - Modify slots
- [ ] `deleteAvailability` - Remove slots

**What you'll need to implement:**
- Time slot validation
- Recurring availability support
- Slot conflict detection
- Coach authorization checks

### Phase 4: Booking Request Functions
- [ ] `createBooking` - User requests session
- [ ] `getMyBookings` - User's booking history
- [ ] `getCoachBookings` - Coach's bookings
- [ ] `cancelBooking` - Cancel booking

**What you'll need to implement:**
- Booking validation against availability
- Status management (pending_approval → approved/rejected)
- User/Coach data retrieval
- Booking conflict prevention

### Phase 5: Admin Approval Functions
- [ ] `getPendingBookings` - Queue of approvals
- [ ] `approveBooking` - Admin accepts booking
- [ ] `rejectBooking` - Admin rejects with message
- [ ] `getBookingStats` - Dashboard statistics

**What you'll need to implement:**
- Admin role verification
- Approval workflow management
- Booking status updates
- Statistics aggregation

## Key Documentation

- **SCHEMA.md** - Complete Firestore data model with examples
- **firestore.rules** - Security rules file
- **firestore.indexes.json** - Index configuration

## Development Guidelines

1. **Always verify authentication** - Use `verifyAuth()` middleware in all functions
2. **Use error handling** - Import `handleError` and `AppError` from utils
3. **Validate input** - Use `validateRequired()` for required fields
4. **Log activity** - Use Firebase logger for debugging
5. **Keep functions small** - Extract business logic to separate files

## Testing Functions Locally

```bash
# Start the emulator
npm run serve

# In another terminal, test with Firebase Shell
npm run shell
```

## Security Rules Reminders

- Users can only access their own profile
- Coaches can manage their own availability
- Only admins can approve bookings
- Bookings require explicit approval before confirmation

## Next Steps

Ready for Phase 2? Start implementing authentication functions in `handlers/auth.js` using the Firebase Admin SDK patterns already set up.
