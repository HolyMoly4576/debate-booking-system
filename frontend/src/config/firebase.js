import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForEmulatorTesting",
  authDomain: "localhost:9099",
  projectId: "debate-booking-system-20-a6b8a",
  storageBucket: "debate-booking-system-20-a6b8a.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef1234567890"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app, 'us-central1')

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099')
  } catch (e) {
    // Emulator already connected or error
  }

  try {
    connectFirestoreEmulator(db, '127.0.0.1', 8085)
  } catch (e) {
    // Emulator already connected or error
  }

  try {
    connectFunctionsEmulator(functions, '127.0.0.1', 5001)
  } catch (e) {
    // Emulator already connected
  }
}

export default app
