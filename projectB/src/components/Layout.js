import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Container, Nav, Button, Row, Col } from 'react-bootstrap';
import {
  Speedometer2,
  Archive,
  People,
  BoxSeam,
  Wrench,
  BoxArrowRight
} from 'react-bootstrap-icons';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container fluid className="p-0">
      <Row className="g-0">

        {/* SIDEBAR */}
        <Col
          md={2}
          className="position-fixed top-0 start-0 vh-100 d-flex flex-column"
          style={{
            background: "linear-gradient(180deg, #1e293b, #0f172a)",
            color: "#fff",
            width: "240px"
          }}
        >
          {/* LOGO */}
          <div className="p-4 border-bottom border-secondary">
            <h4 className="fw-bold text-info mb-0">ASSET_CORE</h4>
            <small className="text-muted">Management Panel</small>
          </div>

          {/* NAV */}
          <Nav className="flex-column px-3 py-4 gap-2 flex-grow-1">

            {user?.role === 'admin' && (
              <>
                <Nav.Link
                  as={Link}
                  to="/admin"
                  className="sidebar-link"
                >
                  <Speedometer2 /> <span>Overview</span>
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  to="/admin/assets"
                  className="sidebar-link"
                >
                  <Archive /> <span>Assets</span>
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  to="/admin/assignments"
                  className="sidebar-link"
                >
                  <People /> <span>Assignments</span>
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  to="/admin/inventory"
                  className="sidebar-link"
                >
                  <BoxSeam /> <span>Inventory</span>
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  to="/admin/repairs"
                  className="sidebar-link"
                >
                  <Wrench /> <span>Repairs</span>
                </Nav.Link>
              </>
            )}

            {user?.role === 'employee' && (
              <Nav.Link
                as={Link}
                to="/my-assets"
                className="sidebar-link"
              >
                <BoxSeam /> <span>My Workspace</span>
              </Nav.Link>
            )}

            {user?.role === 'technician' && (
              <Nav.Link
                as={Link}
                to="/repairs"
                className="sidebar-link"
              >
                <BoxSeam /> <span>My Workspace</span>
              </Nav.Link>
            )}
          </Nav>

          {/* LOGOUT */}
          <div className="p-3 border-top border-secondary">
            <Button
              variant="outline-light"
              size="sm"
              className="w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={handleLogout}
            >
              <BoxArrowRight /> Logout
            </Button>
          </div>
        </Col>

        {/* MAIN CONTENT */}
        <Col
          md={{ span: 10 }}
          style={{
            marginLeft: "240px",
            background: "#f1f5f9",
            minHeight: "100vh"
          }}
        >
          {/* TOP BAR */}
          <div
            className="d-flex justify-content-between align-items-center px-4 py-3 shadow-sm"
            style={{ background: "#ffffff" }}
          >
            <h6 className="mb-0 fw-semibold">
              Welcome, {user?.username}
            </h6>

            <small className="text-muted text-capitalize">
              Role: {user?.role}
            </small>
          </div>

          {/* PAGE CONTENT */}
          <div className="p-4">
            {children}
          </div>
        </Col>

      </Row>

      {/* STYLES */}
      <style>
        {`
          .sidebar-link {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #cbd5f5;
            padding: 10px 12px;
            border-radius: 8px;
            transition: all 0.2s ease;
            font-weight: 500;
          }

          .sidebar-link:hover {
            background: rgba(255,255,255,0.08);
            color: #fff;
            transform: translateX(4px);
          }

          .sidebar-link svg {
            font-size: 18px;
          }
        `}
      </style>
    </Container>
  );
};

export default Layout;