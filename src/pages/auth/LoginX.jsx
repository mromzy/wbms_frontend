import { useRef, useState, useEffect } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import {
  Avatar,
  Button,
  FilledInput,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Paper,
  TextField,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockPersonOutlinedIcon from "@mui/icons-material/LockPersonOutlined";
import { deepPurple } from "@mui/material/colors";

const LoginX = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (e) => {
    e.preventDefault();
  };

  return (
    <Grid container>
      <Paper
        elevation={10}
        style={{
          padding: 20,
          height: "40vh",
          width: 280,
          margin: "50px auto",
        }}
      >
        <Grid align="center">
          <Avatar sx={{ bgcolor: deepPurple[500] }}>
            <LockPersonOutlinedIcon />
          </Avatar>
          <h2>Sign In</h2>
        </Grid>

        <TextField
          label="Username"
          variant="filled"
          required
          size="small"
          placeholder="Enter username"
          fullWidth
        />

        <FormControl
          sx={{ mt: 2 }}
          variant="filled"
          size="small"
          fullWidth
          required
        >
          <InputLabel htmlFor="filled-adornment-password">Password</InputLabel>
          <FilledInput
            id="filled-adornment-password"
            type={showPassword ? "text" : "password"}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
          />
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          color="primary"
          fullWidth
        >
          Sign In
        </Button>
      </Paper>
    </Grid>
  );
};

export default LoginX;
