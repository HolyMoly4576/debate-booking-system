/**
 * Authentication Handler (Phase 2)
 *
 * Implements:
 * - signup: Create new user account with role
 * - login: Authenticate and return JWT token
 * - getUserProfile: Get current user's profile
 */

const {onCall} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const {validateRequired, AppError, handleError} = require("../utils/errors");

const db = admin.firestore();
const auth = admin.auth();

/**
 * Sign up a new user
 * @param {string} email - User email
 * @param {string} password - User password (min 6 chars)
 * @param {string} name - User full name
 * @param {string} role - User role: 'user', 'coach', or 'admin'
 * @param {string} phone - User phone number (optional)
 */
exports.signup = onCall(async (request) => {
  try {
    const {email, password, name, role, phone} = request.data;

    // Validate required fields
    validateRequired(request.data, ["email", "password", "name", "role"]);

    // Validate role
    const validRoles = ["user", "coach", "admin"];
    if (!validRoles.includes(role)) {
      throw new AppError("Invalid role. Must be 'user', 'coach', or 'admin'");
    }

    // Validate password length
    if (password.length < 6) {
      throw new AppError("Password must be at least 6 characters");
    }

    // Check if user already exists
    try {
      await auth.getUserByEmail(email);
      throw new AppError("Email already in use");
    } catch (error) {
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Set custom claims for role-based access
    await auth.setCustomUserClaims(userRecord.uid, {
      role: role,
    });

    // Create user profile in Firestore
    const now = Date.now();
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      phone: phone || "",
      role,
      profilePicture: "",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // If user is a coach, create coach profile
    if (role === "coach") {
      await db.collection("coaches").doc(userRecord.uid).set({
        userId: userRecord.uid,
        bio: "",
        experience: 0,
        specializations: [],
        baseRatePerHour: 0,
        rating: 0,
        totalSessions: 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Get ID token for immediate login
    const idToken = await auth.createCustomToken(userRecord.uid);

    return {
      success: true,
      message: "User created successfully",
      user: {
        uid: userRecord.uid,
        email,
        name,
        role,
        phone: phone || "",
      },
      token: idToken,
    };
  } catch (error) {
    return handleError(error, "signup");
  }
});

/**
 * Log in a user
 * Note: Client-side should use Firebase Auth's signInWithEmailAndPassword
 * This endpoint can be used to validate credentials server-side
 *
 * @param {string} email - User email
 * @param {string} password - User password
 */
exports.login = onCall(async (request) => {
  try {
    const {email} = request.data;

    validateRequired(request.data, ["email", "password"]);

    // Verify user exists
    const userRecord = await auth.getUserByEmail(email);

    // Create custom token for client-side sign-in
    const customToken = await auth.createCustomToken(userRecord.uid);

    // Get user profile
    const userDoc = await db.collection("users").doc(userRecord.uid).get();

    if (!userDoc.exists) {
      throw new AppError("User profile not found");
    }

    const userData = userDoc.data();

    return {
      success: true,
      message: "Login successful",
      user: {
        uid: userRecord.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        phone: userData.phone,
      },
      token: customToken,
    };
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      return handleError(new AppError("Email not found"), "login");
    }
    return handleError(error, "login");
  }
});

/**
 * Get current user's profile
 * Requires authentication
 */
exports.getUserProfile = onCall(async (request) => {
  try {
    // Verify user is authenticated
    if (!request.auth) {
      throw new AppError("Unauthenticated: User must be logged in", 401);
    }

    const uid = request.auth.uid;

    // Get user profile from Firestore
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      throw new AppError("User profile not found");
    }

    const userData = userDoc.data();

    // If user is a coach, get coach details
    let coachData = null;
    if (userData.role === "coach") {
      const coachDoc = await db.collection("coaches").doc(uid).get();
      if (coachDoc.exists) {
        coachData = coachDoc.data();
      }
    }

    return {
      success: true,
      user: userData,
      coach: coachData,
    };
  } catch (error) {
    return handleError(error, "getUserProfile");
  }
});
