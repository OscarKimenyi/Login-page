import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FaGoogle, FaFacebook, FaGithub, FaArrowLeft } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import InputField from "../components/InputField";

const registerSchema = yup.object({
  name: yup
    .string()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
  agreeToTerms: yup
    .boolean()
    .oneOf([true], "You must accept the terms and conditions"),
});

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: "onChange",
  });

  const password = watch("password", "");

  const handleRegister = async (data) => {
    setIsLoading(true);
    const result = await registerUser(data.name, data.email, data.password);

    if (result.success) {
      toast.success("Registration successful! Welcome to our platform.");
      setTimeout(() => navigate("/dashboard"), 1500);
    } else {
      toast.error(result.error || "Registration failed. Please try again.");
    }
    setIsLoading(false);
  };

  const handleSocialRegister = (provider) => {
    toast.info(
      `${provider} registration integration - Configure your OAuth credentials`,
    );
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengths = [
      { label: "Very Weak", color: "danger" },
      { label: "Weak", color: "warning" },
      { label: "Fair", color: "info" },
      { label: "Good", color: "primary" },
      { label: "Strong", color: "success" },
    ];

    return strengths[strength - 1] || { label: "", color: "" };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="login-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div
        className="login-card p-4 p-md-5"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <Link
          to="/login"
          className="text-decoration-none mb-4 d-inline-flex align-items-center"
        >
          <FaArrowLeft className="me-2" />
          Back to Login
        </Link>

        <div className="text-center mb-4">
          <h2 className="fw-bold">Create Account</h2>
          <p className="text-muted">Join our platform and get started today</p>
        </div>

        <form onSubmit={handleSubmit(handleRegister)}>
          <InputField
            label="Full Name"
            name="name"
            placeholder="Enter your full name"
            register={formRegister}
            errors={errors}
          />

          <InputField
            type="email"
            label="Email Address"
            name="email"
            placeholder="Enter your email"
            register={formRegister}
            errors={errors}
          />

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-group">
              <input
                type="password"
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                id="password"
                placeholder="Create a password"
                {...formRegister("password")}
              />
              {password && (
                <span
                  className={`input-group-text bg-${passwordStrength.color} text-white`}
                >
                  {passwordStrength.label}
                </span>
              )}
            </div>
            {errors.password && (
              <div className="invalid-feedback d-block">
                {errors.password.message}
              </div>
            )}
            {password && !errors.password && (
              <div className="form-text">
                <small className={`text-${passwordStrength.color}`}>
                  Password strength: {passwordStrength.label}
                </small>
                <div className="progress mt-1" style={{ height: "3px" }}>
                  <div
                    className={`progress-bar bg-${passwordStrength.color}`}
                    style={{
                      width: `${(passwordStrength.strength || 0) * 20}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
            <div className="form-text">
              <small>
                Must be at least 6 characters with uppercase, lowercase, and
                number
              </small>
            </div>
          </div>

          <InputField
            type="password"
            label="Confirm Password"
            name="confirmPassword"
            placeholder="Confirm your password"
            register={formRegister}
            errors={errors}
          />

          <div className="mb-4">
            <div className="form-check">
              <input
                type="checkbox"
                className={`form-check-input ${errors.agreeToTerms ? "is-invalid" : ""}`}
                id="agreeToTerms"
                {...formRegister("agreeToTerms")}
              />
              <label className="form-check-label" htmlFor="agreeToTerms">
                I agree to the{" "}
                <Link to="/terms" className="text-decoration-none">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-decoration-none">
                  Privacy Policy
                </Link>
              </label>
              {errors.agreeToTerms && (
                <div className="invalid-feedback d-block">
                  {errors.agreeToTerms.message}
                </div>
              )}
            </div>
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
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

          <div className="text-center mb-4">
            <p className="mb-0">
              Already have an account?{" "}
              <Link to="/login" className="text-decoration-none fw-semibold">
                Sign In
              </Link>
            </p>
          </div>

          <div className="position-relative text-center mb-3">
            <hr />
            <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted">
              Or sign up with
            </span>
          </div>

          <div className="row g-2 mb-4">
            <div className="col-4">
              <button
                type="button"
                className="btn btn-social w-100 d-flex align-items-center justify-content-center"
                onClick={() => handleSocialRegister("Google")}
                aria-label="Sign up with Google"
              >
                <FaGoogle className="text-danger" />
              </button>
            </div>
            <div className="col-4">
              <button
                type="button"
                className="btn btn-social w-100 d-flex align-items-center justify-content-center"
                onClick={() => handleSocialRegister("Facebook")}
                aria-label="Sign up with Facebook"
              >
                <FaFacebook className="text-primary" />
              </button>
            </div>
            <div className="col-4">
              <button
                type="button"
                className="btn btn-social w-100 d-flex align-items-center justify-content-center"
                onClick={() => handleSocialRegister("GitHub")}
                aria-label="Sign up with GitHub"
              >
                <FaGithub />
              </button>
            </div>
          </div>

          <div className="text-center text-muted small">
            <p className="mb-0">
              By creating an account, you agree to our Terms of Service and
              Privacy Policy
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
