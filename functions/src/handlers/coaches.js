/**
 * Coaches Handler (Phase 3)
 *
 * Implements:
 * - setAvailability: Create new availability slots
 * - getAvailability: Get coach's available time slots
 * - updateAvailability: Modify existing slots
 * - deleteAvailability: Remove availability slot
 */

const {onCall} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const {validateRequired, AppError, handleError} = require("../utils/errors");

const db = admin.firestore();

/**
 * Validate time format (HH:MM)
 * @param {string} time - Time string to validate
 * @return {boolean} True if valid
 */
const isValidTimeFormat = (time) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Convert time string to minutes for comparison
 * @param {string} time - Time in HH:MM format
 * @return {number} Total minutes from midnight
 */
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Set availability slot for a coach
 * @param {number} dayOfWeek - Day of week (0=Monday, 6=Sunday)
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @param {number} slotDuration - Duration in minutes
 * @param {boolean} isRecurring - Whether this repeats weekly
 */
exports.setAvailability = onCall(async (request) => {
  try {
    // Verify user is authenticated
    if (!request.auth) {
      throw new AppError("Unauthenticated: User must be logged in", 401);
    }

    const {dayOfWeek, startTime, endTime, slotDuration, isRecurring} =
      request.data;

    // Validate required fields
    validateRequired(request.data, [
      "dayOfWeek",
      "startTime",
      "endTime",
      "slotDuration",
    ]);

    // Validate day of week
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new AppError("Invalid dayOfWeek. Must be 0-6 (Mon-Sun)");
    }

    // Validate time format
    if (!isValidTimeFormat(startTime)) {
      throw new AppError("Invalid startTime format. Use HH:MM");
    }
    if (!isValidTimeFormat(endTime)) {
      throw new AppError("Invalid endTime format. Use HH:MM");
    }

    // Validate slot duration
    if (slotDuration < 15 || slotDuration > 480) {
      throw new AppError("Slot duration must be between 15 and 480 minutes");
    }

    // Validate time range
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      throw new AppError("Start time must be before end time");
    }

    // Create availability document
    const now = Date.now();
    const availabilityRef = db.collection("availability").doc();

    await availabilityRef.set({
      coachId: request.auth.uid,
      dayOfWeek,
      startTime,
      endTime,
      slotDuration,
      isRecurring: isRecurring || true,
      bookedSlots: [],
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      message: "Availability slot created successfully",
      availabilityId: availabilityRef.id,
    };
  } catch (error) {
    return handleError(error, "setAvailability");
  }
});

/**
 * Get all available time slots for a coach or specific day
 * @param {string} coachId - Coach ID to get availability for (optional)
 * @param {number} dayOfWeek - Specific day to filter (optional)
 */
exports.getAvailability = onCall(async (request) => {
  try {
    const {coachId, dayOfWeek} = request.data;

    let query = db.collection("availability");

    // If coachId provided, filter by that coach
    if (coachId) {
      query = query.where("coachId", "==", coachId);
    } else if (request.auth) {
      // If no coachId, get current user's availability
      query = query.where("coachId", "==", request.auth.uid);
    } else {
      throw new AppError(
          "Must provide coachId or be authenticated",
          400,
      );
    }

    // Optionally filter by day of week
    if (dayOfWeek !== undefined) {
      if (dayOfWeek < 0 || dayOfWeek > 6) {
        throw new AppError("Invalid dayOfWeek. Must be 0-6");
      }
      query = query.where("dayOfWeek", "==", dayOfWeek);
    }

    const snapshot = await query.get();

    const slots = [];
    snapshot.forEach((doc) => {
      slots.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      slots,
      count: slots.length,
    };
  } catch (error) {
    return handleError(error, "getAvailability");
  }
});

/**
 * Update an existing availability slot
 * @param {string} availabilityId - ID of availability to update
 * @param {object} updates - Fields to update
 */
exports.updateAvailability = onCall(async (request) => {
  try {
    // Verify user is authenticated
    if (!request.auth) {
      throw new AppError("Unauthenticated: User must be logged in", 401);
    }

    const {availabilityId, updates} = request.data;

    validateRequired(request.data, ["availabilityId", "updates"]);

    // Get the availability document
    const availDoc = await db.collection("availability").doc(availabilityId)
        .get();

    if (!availDoc.exists) {
      throw new AppError("Availability not found", 404);
    }

    // Verify ownership
    if (availDoc.data().coachId !== request.auth.uid) {
      throw new AppError(
          "Unauthorized: You can only update your own availability",
          403,
      );
    }

    // Validate update fields if provided
    if (updates.startTime !== undefined) {
      if (!isValidTimeFormat(updates.startTime)) {
        throw new AppError("Invalid startTime format. Use HH:MM");
      }
    }

    if (updates.endTime !== undefined) {
      if (!isValidTimeFormat(updates.endTime)) {
        throw new AppError("Invalid endTime format. Use HH:MM");
      }
    }

    if (updates.dayOfWeek !== undefined) {
      if (updates.dayOfWeek < 0 || updates.dayOfWeek > 6) {
        throw new AppError("Invalid dayOfWeek. Must be 0-6");
      }
    }

    if (updates.slotDuration !== undefined) {
      if (updates.slotDuration < 15 || updates.slotDuration > 480) {
        throw new AppError(
            "Slot duration must be between 15 and 480 minutes",
        );
      }
    }

    // Validate time range if both times provided
    if (updates.startTime && updates.endTime) {
      const startMin = timeToMinutes(updates.startTime);
      const endMin = timeToMinutes(updates.endTime);
      if (startMin >= endMin) {
        throw new AppError("Start time must be before end time");
      }
    }

    // Update the document
    await db.collection("availability").doc(availabilityId).update({
      ...updates,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Availability updated successfully",
      availabilityId,
    };
  } catch (error) {
    return handleError(error, "updateAvailability");
  }
});

/**
 * Delete an availability slot
 * @param {string} availabilityId - ID of availability to delete
 */
exports.deleteAvailability = onCall(async (request) => {
  try {
    // Verify user is authenticated
    if (!request.auth) {
      throw new AppError("Unauthenticated: User must be logged in", 401);
    }

    const {availabilityId} = request.data;

    validateRequired(request.data, ["availabilityId"]);

    // Get the availability document
    const availDoc = await db.collection("availability").doc(availabilityId)
        .get();

    if (!availDoc.exists) {
      throw new AppError("Availability not found", 404);
    }

    // Verify ownership
    if (availDoc.data().coachId !== request.auth.uid) {
      throw new AppError(
          "Unauthorized: You can only delete your own availability",
          403,
      );
    }

    // Check if there are booked slots
    const bookedSlots = availDoc.data().bookedSlots || [];
    if (bookedSlots.length > 0) {
      throw new AppError(
          "Cannot delete availability with booked slots",
          400,
      );
    }

    // Delete the document
    await db.collection("availability").doc(availabilityId).delete();

    return {
      success: true,
      message: "Availability deleted successfully",
      availabilityId,
    };
  } catch (error) {
    return handleError(error, "deleteAvailability");
  }
});

