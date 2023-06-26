import {
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Select as MuiSelect,
} from "@mui/material";

const Select = (props) => {
  const { name, label, value, onChange, items } = props;

  return (
    <FormControl fullWidth size="small" sx={{ width: "80%", m: 1 }}>
      <InputLabel id={`${name}Label`}>{label}</InputLabel>
      <MuiSelect
        labelId={`${name}Label`}
        id={`${name}Id`}
        label={label}
        name={name}
        value={value}
        onChange={onChange}
      >
        <MenuItem value="">None</MenuItem>
        {items.map((item, index) => (
          <MenuItem key={index} value={item.value}>
            {item.label}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
};

export default Select;
