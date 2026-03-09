import { httpsCallable } from 'firebase/functions'
import { functions } from '../config/firebase'

export const adminService = {
  async getPendingBookings(assignedTo = null, limit = 20) {
    try {
      const getPendingBookings = httpsCallable(functions, 'getPendingBookings')
      const result = await getPendingBookings({
        assignedTo,
        limit,
      })
      return result.data
    } catch (error) {
      throw new Error(error.message)
    }
  },

  async approveBooking(bookingId, message = '') {
    try {
      const approveBooking = httpsCallable(functions, 'approveBooking')
      const result = await approveBooking({
        bookingId,
        message,
      })
      return result.data
    } catch (error) {
      throw new Error(error.message)
    }
  },

  async rejectBooking(bookingId, reason) {
    try {
      const rejectBooking = httpsCallable(functions, 'rejectBooking')
      const result = await rejectBooking({
        bookingId,
        reason,
      })
      return result.data
    } catch (error) {
      throw new Error(error.message)
    }
  },

  async getBookingStats() {
    try {
      const getBookingStats = httpsCallable(functions, 'getBookingStats')
      const result = await getBookingStats({})
      return result.data
    } catch (error) {
      throw new Error(error.message)
    }
  },
}
