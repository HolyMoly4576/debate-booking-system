import { Box, CircularProgress } from '@mui/material'

function LoadingSpinner() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
    >
      <CircularProgress size={60} />
    </Box>
  )
}

export default LoadingSpinner
