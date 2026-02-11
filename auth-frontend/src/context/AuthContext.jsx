import { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create the context
const AuthContext = createContext();

// Export the provider component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.baseURL = "http://localhost:5000/api";
    axios.defaults.withCredentials = true;
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get("/auth/status");
      if (response.data.isAuthenticated) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password, rememberMe) => {
    try {
      const response = await axios.post("/auth/login", {
        email,
        password,
        rememberMe,
      });
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post("/auth/register", {
        name,
        email,
        password,
      });

      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.data.message || "Registration failed",
        };
      }
    } catch (error) {
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const firstError = error.response.data.errors[0];
        return {
          success: false,
          error: firstError.message || "Validation error",
        };
      }

      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout");
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export both as named exports
export { AuthContext, AuthProvider };
