/**
 * Admin Handler (Phase 5)
 *
 * Implements:
 * - getPendingBookings: Get all pending approvals
 * - approveBooking: Admin approves a booking
 * - rejectBooking: Admin rejects a booking with message
 * - getBookingStats: Dashboard stats
 */

const {onCall} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const {validateRequired, AppError, handleError} = require("../utils/errors");

const db = admin.firestore();

/**
 * Verify user is admin
 * @param {object} request - Firebase Cloud Functions request
 * @throws {AppError} If user is not admin
 */
const verifyAdmin = async (request) => {
  if (!request.auth) {
    throw new AppError("Unauthenticated: User must be logged in", 401);
  }

  const userDoc = await db.collection("users").doc(request.auth.uid).get();

  if (!userDoc.exists) {
    throw new AppError("User profile not found", 404);
  }

  if (userDoc.data().role !== "admin") {
    throw new AppError("Unauthorized: Admin access required", 403);
  }
};

/**
 * Get all pending booking approvals
 * @param {string} assignedTo - Filter by admin (optional)
 * @param {number} limit - Max results (default: 20, max: 100)
 */
exports.getPendingBookings = onCall(async (request) => {
  try {
    // Verify admin
    await verifyAdmin(request);

    const {assignedTo, limit} = request.data;

    // Validate limit
    let queryLimit = 20;
    if (limit) {
      queryLimit = Math.min(Math.max(limit, 1), 100);
    }

    let query = db.collection("bookingApprovals")
        .where("status", "==", "pending")
        .orderBy("createdAt", "asc")
        .limit(queryLimit);

    // Optionally filter by assigned admin
    if (assignedTo) {
      query = db.collection("bookingApprovals")
          .where("status", "==", "pending")
          .where("assignedTo", "==", assignedTo)
          .orderBy("createdAt", "asc")
          .limit(queryLimit);
    }

    const snapshot = await query.get();

    const approvals = [];
    snapshot.forEach((doc) => {
      approvals.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Fetch associated booking details
    const approvalsWithDetails = await Promise.all(
        approvals.map(async (approval) => {
          const bookingDoc = await db.collection("bookings")
              .doc(approval.bookingId)
              .get();

          if (!bookingDoc.exists) {
            return null;
          }

          const booking = bookingDoc.data();

          // Get user and coach details
          const userDoc = await db.collection("users")
              .doc(booking.userId)
              .get();
          const coachDoc = await db.collection("users")
              .doc(booking.coachId)
              .get();

          return {
            approval,
            booking: {
              id: bookingDoc.id,
              ...booking,
            },
            user: userDoc.exists ? userDoc.data() : null,
            coach: coachDoc.exists ? coachDoc.data() : null,
          };
        }),
    );

    // Filter out nulls
    const validApprovals = approvalsWithDetails.filter((a) => a !== null);

    return {
      success: true,
      approvals: validApprovals,
      count: validApprovals.length,
    };
  } catch (error) {
    return handleError(error, "getPendingBookings");
  }
});

/**
 * Approve a booking request
 * @param {string} bookingId - ID of booking to approve
 * @param {string} message - Optional approval message
 */
exports.approveBooking = onCall(async (request) => {
  try {
    // Verify admin
    await verifyAdmin(request);

    const {bookingId, message} = request.data;

    validateRequired(request.data, ["bookingId"]);

    // Get booking
    const bookingDoc = await db.collection("bookings").doc(bookingId).get();

    if (!bookingDoc.exists) {
      throw new AppError("Booking not found", 404);
    }

    const bookingData = bookingDoc.data();

    // Check if already processed
    if (bookingData.status !== "pending_approval") {
      throw new AppError(
          `Cannot approve booking with status: ${bookingData.status}`,
      );
    }

    // Update booking
    await db.collection("bookings").doc(bookingId).update({
      status: "approved",
      approverId: request.auth.uid,
      approverMessage: message || "",
      updatedAt: Date.now(),
    });

    // Update approval
    const approvalSnapshot = await db
        .collection("bookingApprovals")
        .where("bookingId", "==", bookingId)
        .limit(1)
        .get();

    if (!approvalSnapshot.empty) {
      const approvalDoc = approvalSnapshot.docs[0];
      await approvalDoc.ref.update({
        status: "approved",
        assignedTo: request.auth.uid,
        respondedAt: Date.now(),
        notes: message || "Approved",
      });
    }

    return {
      success: true,
      message: "Booking approved successfully",
      bookingId,
    };
  } catch (error) {
    return handleError(error, "approveBooking");
  }
});

/**
 * Reject a booking request
 * @param {string} bookingId - ID of booking to reject
 * @param {string} reason - Reason for rejection (required)
 */
exports.rejectBooking = onCall(async (request) => {
  try {
    // Verify admin
    await verifyAdmin(request);

    const {bookingId, reason} = request.data;

    validateRequired(request.data, ["bookingId", "reason"]);

    if (!reason || reason.trim().length === 0) {
      throw new AppError("Rejection reason is required");
    }

    // Get booking
    const bookingDoc = await db.collection("bookings").doc(bookingId).get();

    if (!bookingDoc.exists) {
      throw new AppError("Booking not found", 404);
    }

    const bookingData = bookingDoc.data();

    // Check if already processed
    if (bookingData.status !== "pending_approval") {
      throw new AppError(
          `Cannot reject booking with status: ${bookingData.status}`,
      );
    }

    // Update booking
    await db.collection("bookings").doc(bookingId).update({
      status: "rejected",
      approverId: request.auth.uid,
      approverMessage: reason,
      updatedAt: Date.now(),
    });

    // Update approval
    const approvalSnapshot = await db
        .collection("bookingApprovals")
        .where("bookingId", "==", bookingId)
        .limit(1)
        .get();

    if (!approvalSnapshot.empty) {
      const approvalDoc = approvalSnapshot.docs[0];
      await approvalDoc.ref.update({
        status: "rejected",
        assignedTo: request.auth.uid,
        respondedAt: Date.now(),
        notes: reason,
      });
    }

    return {
      success: true,
      message: "Booking rejected successfully",
      bookingId,
      reason,
    };
  } catch (error) {
    return handleError(error, "rejectBooking");
  }
});

/**
 * Get booking statistics for dashboard
 */
exports.getBookingStats = onCall(async (request) => {
  try {
    // Verify admin
    await verifyAdmin(request);

    // Get all bookings
    const bookingsSnapshot = await db.collection("bookings").get();

    const stats = {
      total: 0,
      pending_approval: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      cancelled: 0,
      thisMonth: 0,
      thisWeek: 0,
    };

    const now = Date.now();
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    bookingsSnapshot.forEach((doc) => {
      const booking = doc.data();
      stats.total += 1;

      // Count by status
      if (stats[booking.status] !== undefined) {
        stats[booking.status] += 1;
      }

      // Count this month
      if (booking.createdAt > oneMonthAgo) {
        stats.thisMonth += 1;
      }

      // Count this week
      if (booking.createdAt > oneWeekAgo) {
        stats.thisWeek += 1;
      }
    });

    // Get approval stats
    const approvalsSnapshot = await db.collection("bookingApprovals").get();

    const approvalStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
    };

    approvalsSnapshot.forEach((doc) => {
      const approval = doc.data();
      approvalStats.total += 1;

      if (approvalStats[approval.status] !== undefined) {
        approvalStats[approval.status] += 1;
      }
    });

    // Average approval time
    let totalApprovalTime = 0;
    let respondedCount = 0;

    approvalsSnapshot.forEach((doc) => {
      const approval = doc.data();
      if (approval.respondedAt) {
        const approvalTime = approval.respondedAt - approval.createdAt;
        totalApprovalTime += approvalTime;
        respondedCount += 1;
      }
    });

    const avgApprovalTime = respondedCount > 0 ?
      Math.round(totalApprovalTime / respondedCount / 1000 / 60) :
      0;

    return {
      success: true,
      bookings: stats,
      approvals: approvalStats,
      avgApprovalTimeMinutes: avgApprovalTime,
      performance: {
        approvalRate: respondedCount > 0 ?
          Math.round((approvalStats.approved / respondedCount) * 100) :
          0,
        rejectionRate: respondedCount > 0 ?
          Math.round((approvalStats.rejected / respondedCount) * 100) :
          0,
      },
    };
  } catch (error) {
    return handleError(error, "getBookingStats");
  }
});

