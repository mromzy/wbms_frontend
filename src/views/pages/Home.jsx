import { Container, Card, Button, Image } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

const Home = () => {
  return (
    <div className="min-vh-100 d-flex flex-row align-items-center">
      <Container className="d-flex justify-content-center">
        <Card className="p-5 d-flex flex-column align-items-center hero-card w-80">
          <p className="text-center mb-4">
            <Image src="assets/dsn.png" />
          </p>
          <h1 className="text-center mb-4">
            Welcome to DSN WBMS
            <br />
            [Weighbridge Management System]
          </h1>

          <div className="d-flex">
            <LinkContainer to="/signin">
              <Button variant="primary" className="me-3">
                Sign In
              </Button>
            </LinkContainer>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default Home;
