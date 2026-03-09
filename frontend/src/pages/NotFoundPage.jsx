import { Box, Container, Typography, Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

function NotFoundPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Box textAlign="center">
          <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h3" component="h1" sx={{ mb: 1 }}>
            404
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ mb: 3 }}>
            Page not found
          </Typography>
          <Button variant="contained" color="primary" component={RouterLink} to="/">
            Go to Home
          </Button>
        </Box>
      </Container>
    </Box>
  )
}

export default NotFoundPage
