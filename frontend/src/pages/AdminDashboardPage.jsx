import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Paper,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import { adminService } from '../services/adminService'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

function AdminDashboardPage() {
  const { userProfile } = useAuth()
  const [pendingBookings, setPendingBookings] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [actionType, setActionType] = useState(null) // 'approve' or 'reject'
  const [reason, setReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // User data cache
  const [users, setUsers] = useState({})
  const [coaches, setCoaches] = useState({})

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Load pending bookings
        const bookings = await adminService.getPendingBookings(null, 100)
        setPendingBookings(bookings)

        // Load stats
        const statsData = await adminService.getBookingStats()
        setStats(statsData)

        // Load users and coaches info
        const usersSnapshot = await getDocs(collection(db, 'users'))
        const usersMap = {}
        usersSnapshot.docs.forEach((doc) => {
          usersMap[doc.id] = doc.data()
        })
        setUsers(usersMap)

        const coachesSnapshot = await getDocs(collection(db, 'coaches'))
        const coachesMap = {}
        coachesSnapshot.docs.forEach((doc) => {
          coachesMap[doc.id] = doc.data()
        })
        setCoaches(coachesMap)
      } catch (err) {
        setError('Failed to load admin data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (userProfile?.role === 'admin') {
      loadData()
    }
  }, [userProfile])

  const handleOpenDialog = (booking, type) => {
    setSelectedBooking(booking)
    setActionType(type)
    setReason('')
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedBooking(null)
    setActionType(null)
    setReason('')
  }

  const handleAction = async () => {
    if (!selectedBooking) return

    setError('')
    setSuccess('')
    setActionLoading(true)

    try {
      if (actionType === 'approve') {
        await adminService.approveBooking(selectedBooking.bookingId, '')
        setSuccess('Booking approved successfully')
      } else if (actionType === 'reject') {
        if (!reason.trim()) {
          throw new Error('Please provide a reason for rejection')
        }
        await adminService.rejectBooking(selectedBooking.bookingId, reason)
        setSuccess('Booking rejected successfully')
      }

      // Remove from pending list
      setPendingBookings(
        pendingBookings.filter((b) => b.bookingId !== selectedBooking.bookingId),
      )
      handleCloseDialog()
    } catch (err) {
      setError(err.message || 'Failed to process booking')
    } finally {
      setActionLoading(false)
    }
  }

  if (userProfile?.role !== 'admin') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Only admins can access this page</Alert>
      </Container>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
          Admin Dashboard
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* Stats Grid */}
        {stats && (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Bookings
                  </Typography>
                  <Typography variant="h5">{stats.total}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Approvals
                  </Typography>
                  <Typography variant="h5" sx={{ color: 'warning.main' }}>
                    {stats.countByStatus?.pending_approval || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Approved
                  </Typography>
                  <Typography variant="h5" sx={{ color: 'success.main' }}>
                    {stats.countByStatus?.approved || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Rejected
                  </Typography>
                  <Typography variant="h5" sx={{ color: 'error.main' }}>
                    {stats.countByStatus?.rejected || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Pending Bookings Table */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Pending Approvals
        </Typography>

        {pendingBookings.length === 0 ? (
          <Alert severity="success">No pending bookings to approve</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell>Student</TableCell>
                  <TableCell>Coach</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Requested</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingBookings.map((booking) => {
                  const student = users[booking.userId]
                  const coach = coaches[booking.coachId]
                  return (
                    <TableRow key={booking.bookingId}>
                      <TableCell>{student?.name || 'Unknown'}</TableCell>
                      <TableCell>{coach?.bio || 'Unknown Coach'}</TableCell>
                      <TableCell>{booking.booking?.startDateTime}</TableCell>
                      <TableCell>{booking.booking?.createdAt}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          startIcon={<CheckIcon />}
                          color="success"
                          onClick={() => handleOpenDialog(booking, 'approve')}
                          sx={{ mr: 1 }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          startIcon={<CloseIcon />}
                          color="error"
                          onClick={() => handleOpenDialog(booking, 'reject')}
                        >
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Booking' : 'Reject Booking'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Student:</strong> {users[selectedBooking?.userId]?.name || 'Unknown'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Coach:</strong> {coaches[selectedBooking?.coachId]?.bio || 'Unknown'}
            </Typography>

            {actionType === 'reject' && (
              <TextField
                fullWidth
                label="Reason for Rejection"
                multiline
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why are you rejecting this booking?"
              />
            )}

            {actionType === 'approve' && (
              <Alert severity="info">
                This booking will be approved and confirmed to both the student and coach.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleAction}
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminDashboardPage
