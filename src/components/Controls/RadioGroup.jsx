import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup as MuiRadioGroup,
} from "@mui/material";

const RadioGroup = (props) => {
  const { name, label, value, onChange, items } = props;

  return (
    <FormControl>
      <FormLabel id={name}>{label}</FormLabel>
      <MuiRadioGroup
        row
        aria-labelledby={name}
        name={name}
        value={value}
        onChange={onChange}
      >
        {items.map((item, index) => (
          <FormControlLabel
            key={index}
            value={item.value}
            control={<Radio size="small" />}
            label={item.label}
          />
        ))}
      </MuiRadioGroup>
    </FormControl>
  );
};

export default RadioGroup;
