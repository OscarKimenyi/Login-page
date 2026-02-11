import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        await axios.get("/dashboard");
        // setDashboardData(response.data); // Removed unused variable
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        if (error.response?.status === 401) {
          logout();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [logout, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="h4 mb-0">
                  <FaUserCircle className="me-2" />
                  Dashboard
                </h2>
                <button
                  onClick={handleLogout}
                  className="btn btn-light btn-sm"
                  aria-label="Logout"
                >
                  <FaSignOutAlt className="me-1" />
                  Logout
                </button>
              </div>
            </div>
            <div className="card-body p-5 text-center">
              <div className="display-4 fw-bold text-primary mb-4">
                Welcome Back
              </div>

              {user && (
                <div className="alert alert-info">
                  <h5 className="alert-heading">User Information</h5>
                  <hr />
                  <p className="mb-1">
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p className="mb-1">
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p className="mb-0">
                    <strong>Session:</strong> Active
                  </p>
                </div>
              )}

              <div className="mt-5">
                <p className="text-muted">
                  You have successfully accessed the protected dashboard. All
                  authentication features are working correctly!
                </p>
              </div>
            </div>
            <div className="card-footer text-muted text-center small">
              Secure Authentication System | Built with React & Node.js
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
