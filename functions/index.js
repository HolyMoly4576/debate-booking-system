/**
 * Debate Booking System - Firebase Cloud Functions
 * Main entry point for all backend APIs
 */

const {setGlobalOptions} = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Set global options for cost control
setGlobalOptions({maxInstances: 10});

// Import handlers
const authHandlers = require("./src/handlers/auth");
const coachHandlers = require("./src/handlers/coaches");
const bookingHandlers = require("./src/handlers/bookings");
const adminHandlers = require("./src/handlers/admin");

// Auth Endpoints (Phase 2) ✅
exports.signup = authHandlers.signup;
exports.login = authHandlers.login;
exports.getUserProfile = authHandlers.getUserProfile;

// Coach Availability Endpoints (Phase 3) ✅
exports.setAvailability = coachHandlers.setAvailability;
exports.getAvailability = coachHandlers.getAvailability;
exports.updateAvailability = coachHandlers.updateAvailability;
exports.deleteAvailability = coachHandlers.deleteAvailability;

// Booking Endpoints (Phase 4) ✅
exports.createBooking = bookingHandlers.createBooking;
exports.getMyBookings = bookingHandlers.getMyBookings;
exports.getCoachBookings = bookingHandlers.getCoachBookings;
exports.cancelBooking = bookingHandlers.cancelBooking;

// Admin Endpoints (Phase 5) ✅
exports.getPendingBookings = adminHandlers.getPendingBookings;
exports.approveBooking = adminHandlers.approveBooking;
exports.rejectBooking = adminHandlers.rejectBooking;
exports.getBookingStats = adminHandlers.getBookingStats;

