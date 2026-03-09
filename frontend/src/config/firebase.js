import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: "AIzaSyCH1234567890_your_api_key",
  authDomain: "debate-booking-system-20-a6b8a.firebaseapp.com",
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
export const functions = getFunctions(app)

// Connect to emulator in development
if (process.env.NODE_ENV === 'development') {
  try {
    connectFunctionsEmulator(functions, '127.0.0.1', 5001)
  } catch (e) {
    // Emulator already connected
  }
}

export default app
