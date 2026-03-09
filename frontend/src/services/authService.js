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
      if (!result.data.success) {
        throw new Error(result.data.error || result.data.message || 'Signup failed')
      }
      return result.data
    } catch (error) {
      const message = error.message || 'Signup failed'
      throw new Error(message)
    }
  },

  async login(email, password) {
    try {
      const login = httpsCallable(functions, 'login')
      const result = await login({ email, password })
      if (!result.data.success) {
        throw new Error(result.data.error || result.data.message || 'Login failed')
      }
      return result.data
    } catch (error) {
      const message = error.message || 'Login failed'
      throw new Error(message)
    }
  },

  async getUserProfile() {
    try {
      const getUserProfile = httpsCallable(functions, 'getUserProfile')
      const result = await getUserProfile({})
      if (!result.data.success) {
        throw new Error(result.data.error || result.data.message || 'Failed to load profile')
      }
      return result.data.user
    } catch (error) {
      const message = error.message || 'Failed to load profile'
      throw new Error(message)
    }
  },
}
