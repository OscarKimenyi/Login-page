import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FaGoogle, FaFacebook, FaGithub } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import InputField from "../components/InputField";

const loginSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  rememberMe: yup.boolean(),
});

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: "onChange",
  });

  const handleLogin = async (data) => {
    setIsLoading(true);
    const result = await login(data.email, data.password, data.rememberMe);

    if (result.success) {
      toast.success("Login successful!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  const handleSocialLogin = (provider) => {
    toast.info(
      `${provider} login integration - Configure your OAuth credentials`,
    );
  };

  return (
    <div className="login-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div
        className="login-card p-4 p-md-5"
        style={{ maxWidth: "450px", width: "100%" }}
      >
        <div className="text-center mb-4">
          <h2 className="fw-bold">Welcome Back</h2>
          <p className="text-muted">Please sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(handleLogin)}>
          <InputField
            type="email"
            label="Email Address"
            name="email"
            placeholder="Enter your email"
            register={formRegister}
            errors={errors}
            validation={{ required: true }}
          />

          <InputField
            type="password"
            label="Password"
            name="password"
            placeholder="Enter your password"
            register={formRegister}
            errors={errors}
            validation={{ required: true }}
          />

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="rememberMe"
                {...formRegister("rememberMe")}
              />
              <label className="form-check-label" htmlFor="rememberMe">
                Remember me
              </label>
            </div>
            <Link to="/forgot-password" className="text-decoration-none">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="text-center mb-4">
            <p className="mb-0">
              Don't have an account?{" "}
              <Link to="/register" className="text-decoration-none fw-semibold">
                Create Account
              </Link>
            </p>
          </div>

          <div className="position-relative text-center mb-3">
            <hr />
            <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted">
              Or continue with
            </span>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-4">
              <button
                type="button"
                className="btn btn-social w-100 d-flex align-items-center justify-content-center"
                onClick={() => handleSocialLogin("Google")}
                aria-label="Sign in with Google"
              >
                <FaGoogle className="text-danger" />
              </button>
            </div>
            <div className="col-4">
              <button
                type="button"
                className="btn btn-social w-100 d-flex align-items-center justify-content-center"
                onClick={() => handleSocialLogin("Facebook")}
                aria-label="Sign in with Facebook"
              >
                <FaFacebook className="text-primary" />
              </button>
            </div>
            <div className="col-4">
              <button
                type="button"
                className="btn btn-social w-100 d-flex align-items-center justify-content-center"
                onClick={() => handleSocialLogin("GitHub")}
                aria-label="Sign in with GitHub"
              >
                <FaGithub />
              </button>
            </div>
          </div>

          <div className="text-center text-muted small">
            <p className="mb-0">
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
