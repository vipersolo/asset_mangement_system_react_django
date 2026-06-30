import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Nav, Button } from "react-bootstrap";
import {
  Speedometer2,
  Archive,
  People,
  BoxSeam,
  Wrench,
  BoxArrowRight,
} from "react-bootstrap-icons";

const SIDEBAR_WIDTH = 240;

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <div className="d-flex">
        {/* ===================== SIDEBAR ===================== */}
        <aside
          className="position-fixed top-0 start-0 vh-100 d-flex flex-column"
          style={{
            width: `${SIDEBAR_WIDTH}px`,
            background: "linear-gradient(180deg, #1e293b, #0f172a)",
            color: "#fff",
            zIndex: 1000,
          }}
        >
          {/* Logo */}
          <div className="p-4 border-bottom border-secondary">
            <h4 className="fw-bold text-info mb-0">ASSET_CORE</h4>
            <small className="text-muted">Management Panel</small>
          </div>

          {/* Navigation */}
          <Nav className="flex-column px-3 py-4 gap-2 flex-grow-1">
            {user?.role === "admin" && (
              <>
                <Nav.Link
                  as={Link}
                  to="/admin"
                  className="sidebar-link"
                >
                  <Speedometer2 />
                  <span>Overview</span>
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  to="/admin/assets"
                  className="sidebar-link"
                >
                  <Archive />
                  <span>Assets</span>
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  to="/admin/assignments"
                  className="sidebar-link"
                >
                  <People />
                  <span>Assignments</span>
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  to="/admin/inventory"
                  className="sidebar-link"
                >
                  <BoxSeam />
                  <span>Inventory</span>
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  to="/admin/repairs"
                  className="sidebar-link"
                >
                  <Wrench />
                  <span>Repairs</span>
                </Nav.Link>
              </>
            )}

            {user?.role === "employee" && (
              <Nav.Link
                as={Link}
                to="/my-assets"
                className="sidebar-link"
              >
                <BoxSeam />
                <span>My Workspace</span>
              </Nav.Link>
            )}

            {user?.role === "technician" && (
              <Nav.Link
                as={Link}
                to="/repairs"
                className="sidebar-link"
              >
                <BoxSeam />
                <span>My Workspace</span>
              </Nav.Link>
            )}
          </Nav>

          {/* Logout */}
          <div className="p-3 border-top border-secondary">
            <Button
              variant="outline-light"
              className="w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={handleLogout}
            >
              <BoxArrowRight />
              Logout
            </Button>
          </div>
        </aside>

        {/* ===================== MAIN ===================== */}
        <main
          style={{
            marginLeft: `${SIDEBAR_WIDTH}px`,
            width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
            minHeight: "100vh",
            background: "#f1f5f9",
          }}
        >
          {/* Top Bar */}
          <header
            className="d-flex justify-content-between align-items-center px-4 py-3 shadow-sm"
            style={{
              background: "#fff",
              position: "sticky",
              top: 0,
              zIndex: 999,
            }}
          >
            <h6 className="mb-0 fw-semibold">
              Welcome, {user?.username}
            </h6>

            <small className="text-muted text-capitalize">
              Role: {user?.role}
            </small>
          </header>

          {/* Page Content */}
          <div className="p-4">{children}</div>
        </main>
      </div>

      <style>{`
        body{
          overflow-x:hidden;
          background:#f1f5f9;
        }

        .sidebar-link{
          display:flex;
          align-items:center;
          gap:12px;
          color:#cbd5e1 !important;
          padding:12px 14px;
          border-radius:10px;
          text-decoration:none;
          transition:.25s;
          font-weight:500;
        }

        .sidebar-link:hover{
          background:rgba(255,255,255,.08);
          color:#fff !important;
          transform:translateX(4px);
        }

        .sidebar-link svg{
          font-size:18px;
          flex-shrink:0;
        }

        .sidebar-link.active{
          background:#2563eb;
          color:#fff !important;
        }
      `}</style>
    </>
  );
};

export default Layout;