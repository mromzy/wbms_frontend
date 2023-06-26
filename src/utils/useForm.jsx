import { useState } from "react";

export const useForm = (initialValues) => {
  const [values, setValues] = useState(initialValues);

  const handleInputChange = (e, type = 1) => {
    const { value, name } = e.target;

    if (type === 1) {
      setValues((prev) => {
        return { ...prev, [name]: value };
      });
    } else if (type === 2) {
      setValues((prev) => {
        prev.jsonData = { ...prev.jsonData, [name]: value };
        return { ...prev };
      });
    }
  };
  return { values, setValues, handleInputChange };
};

export const Form = (props) => {
  return <form autoComplete="off">{props.children}</form>;
};
