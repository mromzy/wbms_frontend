import { TextField } from "@mui/material";

const Input = (props) => {
  const { name, label, value, onChange } = props;

  return (
    <TextField
      variant="outlined"
      size="small"
      sx={{ width: "80%", m: 1 }}
      label={label}
      name={name}
      value={value}
      onChange={onChange}
    />
  );
};

export default Input;
