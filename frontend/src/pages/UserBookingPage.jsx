import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Paper,
  Button,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material'
import BookingIcon from '@mui/icons-material/EventAvailable'
import { db } from '../config/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { bookingService } from '../services/bookingService'
import { useAuth } from '../context/AuthContext'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function UserBookingPage() {
  const { user, userProfile } = useAuth()
  const [coaches, setCoaches] = useState([])
  const [availability, setAvailability] = useState({})
  const [loadingCoaches, setLoadingCoaches] = useState(true)
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCoach, setSelectedCoach] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [bookingNotes, setBookingNotes] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)

  // Load coaches and their availability
  useEffect(() => {
    const loadCoaches = async () => {
      try {
        const coachesSnapshot = await getDocs(collection(db, 'coaches'))
        const coachList = coachesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setCoaches(coachList)

        // Load availability for each coach
        const availabilityMap = {}
        for (const coach of coachList) {
          try {
            const availQuery = query(
              collection(db, 'availability'),
              where('coachId', '==', coach.id),
            )
            const availSnapshot = await getDocs(availQuery)
            availabilityMap[coach.id] = availSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          } catch (err) {
            console.error(`Failed to load availability for coach ${coach.id}:`, err)
          }
        }
        setAvailability(availabilityMap)
      } catch (err) {
        setError('Failed to load coaches')
      } finally {
        setLoadingCoaches(false)
      }
    }

    loadCoaches()
  }, [])

  // Load user's bookings
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const bookingsSnapshot = await getDocs(
          query(collection(db, 'bookings'), where('userId', '==', user?.uid)),
        )
        setBookings(
          bookingsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        )
      } catch (err) {
        console.error('Failed to load bookings:', err)
      }
    }

    if (user?.uid) {
      loadBookings()
    }
  }, [user?.uid])

  const handleOpenDialog = (coach, slot) => {
    setSelectedCoach(coach)
    setSelectedSlot(slot)
    setBookingNotes('')
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedCoach(null)
    setSelectedSlot(null)
    setBookingNotes('')
  }

  const handleBookSession = async () => {
    if (!selectedCoach || !selectedSlot) return

    setError('')
    setSuccess('')
    setBookingLoading(true)

    try {
      // Create a booking with the selected slot time
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')

      // For demo, book for today (in real app, would let user pick date)
      const [startHour, startMin] = selectedSlot.startTime.split(':')
      const [endHour, endMin] = selectedSlot.endTime.split(':')

      const startDateTime = `${year}-${month}-${day}T${startHour}:${startMin}:00`
      const endDateTime = `${year}-${month}-${day}T${endHour}:${endMin}:00`

      const result = await bookingService.createBooking(
        selectedCoach.id,
        startDateTime,
        endDateTime,
        'Debate Coaching Session',
        bookingNotes,
      )

      setSuccess('Booking request sent! Awaiting admin approval.')
      setBookings([
        ...bookings,
        {
          id: result.bookingId,
          coachId: selectedCoach.id,
          userId: user.uid,
          status: 'pending_approval',
          startDateTime,
          endDateTime,
        },
      ])
      handleCloseDialog()
    } catch (err) {
      setError(err.message || 'Failed to create booking')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loadingCoaches) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
          Book a Coaching Session
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* Available Coaches */}
        <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
          Available Coaches
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {coaches.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info">No coaches available yet</Alert>
            </Grid>
          ) : (
            coaches.map((coach) => (
              <Grid item xs={12} md={6} lg={4} key={coach.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{coach.bio || 'Coach'}</Typography>
                    <Typography color="textSecondary" sx={{ mb: 1 }}>
                      Slots: {(availability[coach.id] || []).length}
                    </Typography>

                    {(availability[coach.id] || []).length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Available Times:
                        </Typography>
                        {(availability[coach.id] || []).slice(0, 3).map((slot) => (
                          <Typography
                            key={slot.id}
                            variant="body2"
                            sx={{ mb: 0.5, color: 'primary.main' }}
                          >
                            {DAYS[slot.dayOfWeek]}: {slot.startTime} - {slot.endTime}
                          </Typography>
                        ))}
                        {(availability[coach.id] || []).length > 3 && (
                          <Typography variant="body2" color="textSecondary">
                            +{(availability[coach.id] || []).length - 3} more slots
                          </Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        const slots = availability[coach.id] || []
                        if (slots.length > 0) {
                          handleOpenDialog(coach, slots[0])
                        }
                      }}
                      disabled={(availability[coach.id] || []).length === 0}
                    >
                      Book Session
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* User's Bookings */}
        <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
          Your Booking Requests
        </Typography>
        {bookings.length === 0 ? (
          <Alert severity="info">You haven't made any bookings yet</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell>Coach</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => {
                  const coach = coaches.find((c) => c.id === booking.coachId)
                  return (
                    <TableRow key={booking.id}>
                      <TableCell>{coach?.bio || 'Unknown Coach'}</TableCell>
                      <TableCell>{booking.startDateTime}</TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status}
                          color={
                            booking.status === 'approved'
                              ? 'success'
                              : booking.status === 'pending_approval'
                                ? 'warning'
                                : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {booking.status === 'pending_approval' && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => {
                              bookingService.cancelBooking(booking.id, 'User cancelled')
                              setBookings(bookings.filter((b) => b.id !== booking.id))
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      {/* Booking Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Booking</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Coach:</strong> {selectedCoach?.bio || 'Coach'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Time:</strong> {selectedSlot && DAYS[selectedSlot.dayOfWeek]}{' '}
              {selectedSlot?.startTime} - {selectedSlot?.endTime}
            </Typography>

            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={3}
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              placeholder="Any special requests or notes?"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleBookSession}
            variant="contained"
            color="primary"
            disabled={bookingLoading}
          >
            {bookingLoading ? <CircularProgress size={24} /> : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UserBookingPage
