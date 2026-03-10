import { useState, useEffect } from 'react'
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useAuth } from '../context/AuthContext'
import SaveIcon from '@mui/icons-material/Save'

function ProfilePage() {
  const { user, userProfile } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    expertise: '',
    experience: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Populate form with user data
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        expertise: userProfile.expertise || '',
        experience: userProfile.experience || 0,
      })
    }
  }, [userProfile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'experience' ? parseInt(value) || 0 : value,
    }))
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // TODO: In a real app, you'd call a Cloud Function to update the profile
      // For now, just show a success message
      setSuccess('Profile update features coming soon!')
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
          My Profile
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={3}>
          {/* Profile Info Card */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  mx: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  fontSize: '2.5rem',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                {formData.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </Box>
              <Typography variant="h6">{formData.name}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                {userProfile?.role}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {user?.email}
              </Typography>
            </Paper>
          </Grid>

          {/* Edit Form */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Edit Profile
              </Typography>

              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                disabled
                helperText="Email cannot be changed"
              />

              <TextField
                fullWidth
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                margin="normal"
              />

              {userProfile?.role === 'coach' && (
                <>
                  <TextField
                    fullWidth
                    label="Expertise / Specialization"
                    name="expertise"
                    value={formData.expertise}
                    onChange={handleChange}
                    margin="normal"
                    placeholder="e.g., Public Speaking, Debate Strategy"
                  />

                  <TextField
                    fullWidth
                    label="Years of Experience"
                    name="experience"
                    type="number"
                    value={formData.experience}
                    onChange={handleChange}
                    margin="normal"
                    inputProps={{ min: 0, max: 60 }}
                  />
                </>
              )}

              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Paper>
          </Grid>

          {/* Account Info */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Account Type
                    </Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {userProfile?.role}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      User ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {user?.uid}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default ProfilePage
