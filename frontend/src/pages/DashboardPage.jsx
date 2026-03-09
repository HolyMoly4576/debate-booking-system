import { useAuth } from '../context/AuthContext'
import { Container, Box, Typography, Button, Card, CardContent, Grid } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { getAuth, signOut } from 'firebase/auth'
import LogoutIcon from '@mui/icons-material/Logout'

function DashboardPage() {
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      const auth = getAuth()
      await signOut(auth)
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Dashboard
          </Typography>
          <Button
            variant="contained"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>

        <Grid container spacing={3}>
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
                  Role: {userProfile?.role}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {userProfile?.role === 'coach' && (
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Coach Info
                  </Typography>
                  <Typography variant="body2">
                    Expertise: {userProfile?.expertise || 'Not set'}
                  </Typography>
                  <Typography variant="body2">
                    Experience: {userProfile?.experience || 'Not set'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Getting Started
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {userProfile?.role === 'coach'
                    ? 'Set your availability and start accepting booking requests from students.'
                    : 'Browse coaches and request coaching sessions.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default DashboardPage
