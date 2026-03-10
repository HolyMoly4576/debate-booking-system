import { httpsCallable } from 'firebase/functions'
import { functions } from '../config/firebase'

export const coachService = {
  async setAvailability(dayOfWeek, startTime, endTime, durationMinutes) {
    try {
      const setAvailability = httpsCallable(functions, 'setAvailability')
      const result = await setAvailability({
        dayOfWeek,
        startTime,
        endTime,
        slotDuration: durationMinutes,
      })
      if (!result.data.success) {
        throw new Error(result.data.error || result.data.message || 'Failed to set availability')
      }
      // Return the newly created slot object
      return {
        id: result.data.availabilityId,
        dayOfWeek,
        startTime,
        endTime,
        slotDuration: durationMinutes,
      }
    } catch (error) {
      throw new Error(error.message)
    }
  },

  async getAvailability(coachId = null, dayOfWeek = null) {
    try {
      const getAvailability = httpsCallable(functions, 'getAvailability')
      const result = await getAvailability({
        coachId,
        dayOfWeek,
      })
      if (!result.data.success) {
        throw new Error(result.data.error || result.data.message || 'Failed to get availability')
      }
      return result.data.slots || []
    } catch (error) {
      throw new Error(error.message)
    }
  },

  async updateAvailability(slotId, dayOfWeek, startTime, endTime, durationMinutes) {
    try {
      const updateAvailability = httpsCallable(functions, 'updateAvailability')
      const result = await updateAvailability({
        slotId,
        dayOfWeek,
        startTime,
        endTime,
        slotDuration: durationMinutes,
      })
      if (!result.data.success) {
        throw new Error(result.data.error || result.data.message || 'Failed to update availability')
      }
      return result.data
    } catch (error) {
      throw new Error(error.message)
    }
  },

  async deleteAvailability(slotId) {
    try {
      const deleteAvailability = httpsCallable(functions, 'deleteAvailability')
      const result = await deleteAvailability({
        slotId,
      })
      if (!result.data.success) {
        throw new Error(result.data.error || result.data.message || 'Failed to delete availability')
      }
      return result.data
    } catch (error) {
      throw new Error(error.message)
    }
  },
}
