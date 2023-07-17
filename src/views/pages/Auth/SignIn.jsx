import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Form,
  Button,
  Row,
  Col,
  Container,
  CardGroup,
  Card,
  InputGroup,
  Image,
} from "react-bootstrap";

import FormContainer from "../../../components/FormContainer";

import { useSigninMutation } from "../../../slices/authApiSlice";
import { setCredentials } from "../../../slices/appSlice";

import { FaUser, FaLock } from "react-icons/fa";

const initialValues = { username: "", password: "" };

const SignIn = () => {
  const { userInfo } = useSelector((state) => state.app);
  const [signin, { isLoading }] = useSigninMutation();

  const [values, setValues] = useState(initialValues);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await signin(values).unwrap();

      if (res?.status && !res.status) {
        console.log(res.message);
        console.log(res.logs);

        toast.error(res.message);

        return;
      }

      dispatch(setCredentials({ ...res.data.user }));

      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

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

  useEffect(() => {
    if (userInfo) navigate("/dashboard");

    return () => {};
  }, [navigate, userInfo]);

  return (
    <div className="min-vh-100 d-flex flex-row align-items-center">
      <FormContainer>
        <Form onSubmit={handleSubmit}>
          <h1>Login</h1>
          <p className="text-medium-emphasis">Sign In to your account</p>
          <InputGroup className="mb-3">
            <InputGroup.Text>
              <FaUser />
            </InputGroup.Text>
            <Form.Control
              name="username"
              placeholder="Username"
              autoComplete="username"
              value={values.username}
              onChange={(e) => handleInputChange(e)}
            />
          </InputGroup>
          <InputGroup className="mb-4">
            <InputGroup.Text>
              <FaLock />
            </InputGroup.Text>
            <Form.Control
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="password"
              value={values.password}
              onChange={(e) => handleInputChange(e)}
            />
          </InputGroup>
          <Row>
            <Col xs={6}>
              <Button type="submit" color="primary" className="px-4">
                Sign In
              </Button>
            </Col>
          </Row>
        </Form>
      </FormContainer>
    </div>
  );
};

export default SignIn;
