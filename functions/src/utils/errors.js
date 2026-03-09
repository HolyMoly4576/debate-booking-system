/**
 * Error Handling Utilities
 *
 * Standardized error handling for Cloud Functions
 */

const logger = require("firebase-functions/logger");

/**
 * Custom application error class
 */
class AppError extends Error {
  /**
   * Create an AppError
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Handle errors and return standardized response
 * @param {Error} error - The error object
 * @param {string} context - Context where error occurred
 * @return {object} Standardized error response
 */
const handleError = (error, context = "Unknown") => {
  logger.error(`Error in ${context}:`, error);

  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      statusCode: error.statusCode,
    };
  }

  // Firebase Auth errors
  if (error.code) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      statusCode: 400,
    };
  }

  // Generic errors
  return {
    success: false,
    error: "An unexpected error occurred",
    statusCode: 500,
  };
};

/**
 * Validate required fields in request data
 * @param {object} data - Data object to validate
 * @param {string[]} fields - Required field names
 */
const validateRequired = (data, fields) => {
  const missing = fields.filter((field) => !data[field]);
  if (missing.length > 0) {
    throw new AppError(
        `Missing required fields: ${missing.join(", ")}`,
        400,
    );
  }
};

module.exports = {
  AppError,
  handleError,
  validateRequired,
};
