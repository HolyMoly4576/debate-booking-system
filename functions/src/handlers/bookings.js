/**
 * Booking Handler (Phase 4)
 *
 * Implements:
 * - createBooking: User requests a coaching session
 * - getMyBookings: Get user's bookings
 * - getCoachBookings: Get coach's bookings
 * - cancelBooking: Cancel pending/approved booking
 */

const {onCall} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const {validateRequired, AppError, handleError} = require("../utils/errors");

const db = admin.firestore();

/**
 * Create a new booking request
 * @param {string} coachId - Coach ID to book
 * @param {number} startDateTime - Session start time (timestamp)
 * @param {number} endDateTime - Session end time (timestamp)
 * @param {string} sessionTopic - Topic to discuss (optional)
 * @param {string} userNotes - User's notes (optional)
 */
exports.createBooking = onCall(async (request) => {
  try {
    // Verify user is authenticated
    if (!request.auth) {
      throw new AppError("Unauthenticated: User must be logged in", 401);
    }

    const {coachId, startDateTime, endDateTime, sessionTopic, userNotes} =
      request.data;

    // Validate required fields
    validateRequired(request.data, ["coachId", "startDateTime", "endDateTime"]);

    // Validate time range
    if (startDateTime >= endDateTime) {
      throw new AppError("Start time must be before end time");
    }

    // Verify coach exists
    const coachDoc = await db.collection("coaches").doc(coachId).get();
    if (!coachDoc.exists) {
      throw new AppError("Coach not found", 404);
    }

    // Verify user profile exists
    const userDoc = await db.collection("users").doc(request.auth.uid).get();
    if (!userDoc.exists) {
      throw new AppError("User profile not found", 404);
    }

    // Validate time is in the future
    const now = Date.now();
    if (startDateTime < now) {
      throw new AppError("Cannot book sessions in the past");
    }

    // Create booking document with pending_approval status
    const bookingRef = db.collection("bookings").doc();

    await bookingRef.set({
      userId: request.auth.uid,
      coachId,
      startDateTime,
      endDateTime,
      status: "pending_approval",
      sessionTopic: sessionTopic || "",
      userNotes: userNotes || "",
      approverMessage: "",
      approverId: "",
      createdAt: now,
      updatedAt: now,
    });

    // Create corresponding booking approval document
    const approvalRef = db.collection("bookingApprovals").doc();

    await approvalRef.set({
      bookingId: bookingRef.id,
      assignedTo: "", // Will be assigned by admin
      status: "pending",
      notes: "",
      createdAt: now,
      respondedAt: null,
      approvalType: "standard",
    });

    return {
      success: true,
      message: "Booking request created successfully",
      bookingId: bookingRef.id,
      status: "pending_approval",
    };
  } catch (error) {
    return handleError(error, "createBooking");
  }
});

/**
 * Get bookings for authenticated user
 * Can get user's own bookings or coach's bookings
 * @param {string} role - Filter by status (optional)
 */
exports.getMyBookings = onCall(async (request) => {
  try {
    // Verify user is authenticated
    if (!request.auth) {
      throw new AppError("Unauthenticated: User must be logged in", 401);
    }

    const {status} = request.data;

    // Get user profile to determine their role
    const userDoc = await db.collection("users").doc(request.auth.uid).get();

    if (!userDoc.exists) {
      throw new AppError("User profile not found", 404);
    }

    const userRole = userDoc.data().role;
    let query = db.collection("bookings");

    // If user is a coach, get their coaching bookings;
    // otherwise get their booking requests
    if (userRole === "coach") {
      query = query.where("coachId", "==", request.auth.uid);
    } else {
      query = query.where("userId", "==", request.auth.uid);
    }

    // Optionally filter by status
    if (status) {
      const validStatuses = [
        "pending_approval",
        "approved",
        "rejected",
        "completed",
        "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        throw new AppError("Invalid status");
      }
      query = query.where("status", "==", status);
    }

    // Order by creation date descending
    query = query.orderBy("createdAt", "desc");

    const snapshot = await query.get();

    const bookings = [];
    snapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      bookings,
      count: bookings.length,
    };
  } catch (error) {
    return handleError(error, "getMyBookings");
  }
});

/**
 * Get all bookings for a specific coach
 * @param {string} coachId - Coach ID to get bookings for
 * @param {string} status - Filter by status (optional)
 */
exports.getCoachBookings = onCall(async (request) => {
  try {
    const {coachId, status} = request.data;

    validateRequired(request.data, ["coachId"]);

    let query = db.collection("bookings").where("coachId", "==", coachId);

    // Optionally filter by status
    if (status) {
      const validStatuses = [
        "pending_approval",
        "approved",
        "rejected",
        "completed",
        "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        throw new AppError("Invalid status");
      }
      query = query.where("status", "==", status);
    }

    // Order by creation date descending
    query = query.orderBy("createdAt", "desc");

    const snapshot = await query.get();

    const bookings = [];
    snapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      bookings,
      count: bookings.length,
    };
  } catch (error) {
    return handleError(error, "getCoachBookings");
  }
});

/**
 * Cancel a booking request
 * @param {string} bookingId - ID of booking to cancel
 * @param {string} reason - Optional reason for cancellation
 */
exports.cancelBooking = onCall(async (request) => {
  try {
    // Verify user is authenticated
    if (!request.auth) {
      throw new AppError("Unauthenticated: User must be logged in", 401);
    }

    const {bookingId, reason} = request.data;

    validateRequired(request.data, ["bookingId"]);

    // Get the booking document
    const bookingDoc = await db.collection("bookings").doc(bookingId).get();

    if (!bookingDoc.exists) {
      throw new AppError("Booking not found", 404);
    }

    const bookingData = bookingDoc.data();

    // Verify ownership (only user who made booking can cancel)
    if (bookingData.userId !== request.auth.uid) {
      throw new AppError(
          "Unauthorized: You can only cancel your own bookings",
          403,
      );
    }

    // Check booking status
    const currentStatus = bookingData.status;
    if (currentStatus === "completed") {
      throw new AppError("Cannot cancel completed bookings");
    }
    if (currentStatus === "cancelled") {
      throw new AppError("Booking is already cancelled");
    }
    if (currentStatus === "rejected") {
      throw new AppError("Cannot cancel rejected bookings");
    }

    // Update booking status
    await db.collection("bookings").doc(bookingId).update({
      status: "cancelled",
      updatedAt: Date.now(),
    });

    // Update approval status if still pending
    if (currentStatus === "pending_approval") {
      const approvalSnapshot = await db
          .collection("bookingApprovals")
          .where("bookingId", "==", bookingId)
          .get();

      approvalSnapshot.forEach(async (doc) => {
        if (doc.data().status === "pending") {
          await doc.ref.update({
            status: "cancelled",
            respondedAt: Date.now(),
            notes: reason || "Cancelled by user",
          });
        }
      });
    }

    return {
      success: true,
      message: "Booking cancelled successfully",
      bookingId,
    };
  } catch (error) {
    return handleError(error, "cancelBooking");
  }
});

