import { httpsCallable } from 'firebase/functions'
import { functions } from '../config/firebase'

export const authService = {
  async signup(email, password, name, role, phone = '') {
    try {
      const signup = httpsCallable(functions, 'signup')
      const result = await signup({
        email,
        password,
        name,
        role,
        phone,
      })
      return result.data
    } catch (error) {
      throw new Error(error.message)
    }
  },

  async login(email, password) {
    try {
      const login = httpsCallable(functions, 'login')
      const result = await login({ email, password })
      return result.data
    } catch (error) {
      throw new Error(error.message)
    }
  },

  async getUserProfile() {
    try {
      const getUserProfile = httpsCallable(functions, 'getUserProfile')
      const result = await getUserProfile({})
      return result.data
    } catch (error) {
      throw new Error(error.message)
    }
  },
}
