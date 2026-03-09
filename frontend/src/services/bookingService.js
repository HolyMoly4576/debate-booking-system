import { httpsCallable } from 'firebase/functions'
import { functions } from '../config/firebase'

export const bookingService = {
  async createBooking(coachId, startDateTime, endDateTime, sessionTopic = '', userNotes = '') {
    try {
      const createBooking = httpsCallable(functions, 'createBooking')
      const result = await createBooking({
        coachId,
        startDateTime,
        endDateTime,
        sessionTopic,
        userNotes,
      })
      return result.data
    } catch (error) {
      throw new Error(error.message)
    }
  },

  async getMyBookings(status = null) {
    try {
      const getMyBookings = httpsCallable(functions, 'getMyBookings')
      const result = await getMyBookings({
        status,
      })
      return result.data
    } catch (error) {
      throw new Error(error.message)
    }
  },

  async getCoachBookings(coachId, status = null) {
    try {
      const getCoachBookings = httpsCallable(functions, 'getCoachBookings')
      const result = await getCoachBookings({
        coachId,
        status,
      })
      return result.data
    } catch (error) {
      throw new Error(error.message)
    }
  },

  async cancelBooking(bookingId, reason = '') {
    try {
      const cancelBooking = httpsCallable(functions, 'cancelBooking')
      const result = await cancelBooking({
        bookingId,
        reason,
      })
      return result.data
    } catch (error) {
      throw new Error(error.message)
    }
  },
}
