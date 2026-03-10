import { useAuth } from '../context/AuthContext'
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CardActions,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import BookingIcon from '@mui/icons-material/LocalActivity'
import AdminPanelIcon from '@mui/icons-material/AdminPanelSettings'

function DashboardPage() {
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1">
            Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            Welcome back, {userProfile?.name}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* User Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Account
                </Typography>
                <Typography variant="h6">{userProfile?.name || 'Loading...'}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Email: {user?.email}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Role: {userProfile?.role?.charAt(0).toUpperCase() + userProfile?.role?.slice(1)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Coach Card */}
          {userProfile?.role === 'coach' && (
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Coach Profile
                  </Typography>
                  <Typography variant="body2">
                    Expertise: {userProfile?.expertise || 'Not set'}
                  </Typography>
                  <Typography variant="body2">
                    Experience: {userProfile?.experience || 'Not set'} years
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {userProfile?.role === 'coach'
                    ? 'Manage your availability and view booking requests'
                    : userProfile?.role === 'admin'
                      ? 'Manage booking approvals and view statistics'
                      : 'Browse coaches and book coaching sessions'}
                </Typography>
              </CardContent>
              <CardActions sx={{ gap: 1, flexWrap: 'wrap' }}>
                {userProfile?.role === 'coach' && (
                  <Button
                    variant="contained"
                    startIcon={<EventAvailableIcon />}
                    onClick={() => navigate('/coach/availability')}
                  >
                    Manage Availability
                  </Button>
                )}

                {userProfile?.role === 'user' && (
                  <Button
                    variant="contained"
                    startIcon={<BookingIcon />}
                    onClick={() => navigate('/bookings')}
                  >
                    Browse & Book Coaches
                  </Button>
                )}

                {userProfile?.role === 'admin' && (
                  <Button
                    variant="contained"
                    startIcon={<AdminPanelIcon />}
                    onClick={() => navigate('/admin')}
                  >
                    Admin Dashboard
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default DashboardPage
