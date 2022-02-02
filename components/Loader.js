import { Box, CircularProgress, circularProgressClasses } from "@mui/material";

// Inspired by the former Facebook spinners.
export default function FacebookCircularProgress(props) {
  return (
    <Box sx={{ position: "relative", display: props.display || "block" }}>
      <CircularProgress
        variant="determinate"
        sx={{
          color: (theme) =>
            theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
        }}
        size={30}
        thickness={4}
        {...props}
        value={100}
      />
      <CircularProgress
        variant="indeterminate"
        disableShrink
        sx={{
          color: (theme) =>
            theme.palette.mode === "light" ? "#1a90ff" : "#308fe8",
          animationDuration: "350ms",
          position: "absolute",
          left: 0,
          [`& .${circularProgressClasses.circle}`]: {
            strokeLinecap: "round",
          },
        }}
        size={30}
        thickness={4}
        {...props}
      />
    </Box>
  );
}
