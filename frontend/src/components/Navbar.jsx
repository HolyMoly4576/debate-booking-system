import { AppBar, Toolbar, Box, Button, Avatar, Menu, MenuItem, IconButton } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { getAuth, signOut } from 'firebase/auth'
import LogoutIcon from '@mui/icons-material/Logout'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import SettingsIcon from '@mui/icons-material/Settings'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, userProfile } = useAuth()
  const [anchorEl, setAnchorEl] = useState(null)

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileClose = () => {
    setAnchorEl(null)
  }

  const handleGoProfile = () => {
    handleProfileClose()
    navigate('/profile')
  }

  const handleLogout = async () => {
    try {
      const auth = getAuth()
      await signOut(auth)
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  // Don't show navbar on login/signup pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
  }

  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Toolbar>
        {/* Back Button */}
        <IconButton
          color="inherit"
          onClick={handleBack}
          sx={{ mr: 2 }}
          title="Go back"
        >
          <ArrowBackIcon />
        </IconButton>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Profile Avatar and Menu */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <IconButton
            onClick={handleProfileClick}
            sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'secondary.main',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 'bold',
              }}
              title={userProfile?.name}
            >
              {getInitials(userProfile?.name)}
            </Avatar>
          </IconButton>

          {/* Logout Button */}
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            Logout
          </Button>

          <IconButton
            color="inherit"
            onClick={handleLogout}
            sx={{ display: { xs: 'flex', sm: 'none' } }}
            title="Logout"
          >
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem disabled>
          <strong>{userProfile?.name}</strong>
        </MenuItem>
        <MenuItem disabled sx={{ fontSize: '0.875rem', color: 'textSecondary' }}>
          {userProfile?.role}
        </MenuItem>
        <MenuItem onClick={handleGoProfile} sx={{ mt: 1 }}>
          <SettingsIcon sx={{ mr: 1 }} />
          View Profile
        </MenuItem>
      </Menu>
    </AppBar>
  )
}

export default Navbar
