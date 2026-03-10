import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { coachService } from '../services/coachService'
import { useAuth } from '../context/AuthContext'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function CoachAvailabilityPage() {
  const { user, userProfile } = useAuth()
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    durationMinutes: 60,
  })
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Debug logging
  useEffect(() => {
    console.log('CoachAvailabilityPage - userProfile:', userProfile)
    console.log('CoachAvailabilityPage - user?.uid:', user?.uid)
  }, [userProfile, user?.uid])

  // Load existing availability
  useEffect(() => {
    const loadAvailability = async () => {
      try {
        if (user?.uid) {
          console.log('Loading availability for coach:', user.uid)
          const availability = await coachService.getAvailability(user.uid)
          console.log('Availability loaded:', availability)
          setSlots(availability)
        }
      } catch (err) {
        console.error('Failed to load availability:', err)
        setError(err.message || 'Failed to load availability')
      }
    }

    if (userProfile?.role === 'coach' && user?.uid) {
      loadAvailability()
    }
  }, [userProfile, user?.uid])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'dayOfWeek' || name === 'durationMinutes' ? parseInt(value) : value,
    }))
  }

  const handleAddSlot = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Validation
      if (!formData.startTime || !formData.endTime) {
        throw new Error('Start and end times are required')
      }

      const startMinutes = timeToMinutes(formData.startTime)
      const endMinutes = timeToMinutes(formData.endTime)

      if (startMinutes >= endMinutes) {
        throw new Error('End time must be after start time')
      }

      if (formData.durationMinutes < 15 || formData.durationMinutes > 480) {
        throw new Error('Duration must be between 15 and 480 minutes')
      }

      const result = await coachService.setAvailability(
        formData.dayOfWeek,
        formData.startTime,
        formData.endTime,
        formData.durationMinutes,
      )

      setSlots([...slots, result])
      setSuccess(`Availability slot added for ${DAYS[formData.dayOfWeek]}`)
      setFormData({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        durationMinutes: 60,
      })
    } catch (err) {
      setError(err.message || 'Failed to add availability')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSlot = async (slotId) => {
    if (window.confirm('Are you sure you want to delete this slot?')) {
      try {
        await coachService.deleteAvailability(slotId)
        setSlots(slots.filter((slot) => slot.id !== slotId))
        setSuccess('Slot deleted successfully')
      } catch (err) {
        setError(err.message || 'Failed to delete slot')
      }
    }
  }

  if (userProfile?.role !== 'coach') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Only coaches can access this page</Alert>
      </Container>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
          Manage Your Availability
        </Typography>

        <Grid container spacing={3}>
          {/* Form */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Add Availability Slot
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              <form onSubmit={handleAddSlot}>
                <TextField
                  select
                  fullWidth
                  label="Day of Week"
                  name="dayOfWeek"
                  value={formData.dayOfWeek}
                  onChange={handleChange}
                  margin="normal"
                  SelectProps={{
                    native: true,
                  }}
                >
                  {DAYS.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  label="Start Time"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  fullWidth
                  label="End Time"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  fullWidth
                  label="Session Duration (minutes)"
                  name="durationMinutes"
                  type="number"
                  value={formData.durationMinutes}
                  onChange={handleChange}
                  margin="normal"
                  inputProps={{ min: 15, max: 480, step: 15 }}
                  helperText="15-480 minutes"
                />

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                  sx={{ mt: 3 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Add Slot'}
                </Button>
              </form>
            </Paper>
          </Grid>

          {/* Slots List */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Your Availability Slots
              </Typography>

              {slots.length === 0 ? (
                <Typography color="textSecondary">No availability slots added yet</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'background.default' }}>
                        <TableCell>Day</TableCell>
                        <TableCell>Start Time</TableCell>
                        <TableCell>End Time</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {slots.filter(slot => slot && slot.id).map((slot) => (
                        <TableRow key={slot.id}>
                          <TableCell>{DAYS[slot.dayOfWeek]}</TableCell>
                          <TableCell>{slot.startTime}</TableCell>
                          <TableCell>{slot.endTime}</TableCell>
                          <TableCell>{slot.durationMinutes || slot.slotDuration} min</TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteSlot(slot.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

// Helper function to convert HH:MM to minutes
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export default CoachAvailabilityPage
