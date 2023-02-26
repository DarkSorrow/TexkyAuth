import { Box } from "@mui/material"

export const NoData = () => {
    return <Box
    justifyContent={'center'}
    sx={{
      padding: 5,
      border: 'solid',
      borderColor: 'primary.light',
      borderWidth: 1,
      borderRadius: 2
    }}
  >
    No data
</Box>
}