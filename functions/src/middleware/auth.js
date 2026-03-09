/**
 * Authentication Middleware
 *
 * Verifies user authentication and role authorization
 */

const admin = require("firebase-admin");

/**
 * Middleware to verify user is authenticated
 * @param {object} context - Firebase context object
 * @return {string} User ID if authenticated
 */
const verifyAuth = async (context) => {
  if (!context.auth) {
    throw new Error("Unauthenticated: User must be logged in");
  }
  return context.auth.uid;
};

/**
 * Middleware to verify user has specific role
 * @param {string} uid - User ID
 * @param {string} requiredRole - Role required to proceed (e.g., 'admin')
 * @return {string} User role if authorized
 */
const verifyRole = async (uid, requiredRole) => {
  const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(uid)
      .get();

  if (!userDoc.exists) {
    throw new Error("User profile not found");
  }

  const userRole = userDoc.data().role;
  if (userRole !== requiredRole) {
    throw new Error(
        `Unauthorized: Required role '${requiredRole}', got '${userRole}'`,
    );
  }

  return userRole;
};

/**
 * Middleware to get user data
 * @param {string} uid - User ID
 * @return {object} User data
 */
const getUserData = async (uid) => {
  const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(uid)
      .get();

  if (!userDoc.exists) {
    throw new Error("User not found");
  }

  return userDoc.data();
};

module.exports = {
  verifyAuth,
  verifyRole,
  getUserData,
};
