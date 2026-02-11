import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";

const schema = yup.object({
  email: yup.string().email().required("Email is required"),
});

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success(`Reset link sent to ${data.email}`);
      setIsSubmitted(true);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="login-container">
      <ToastContainer />
      <div
        className="login-card p-4 p-md-5"
        style={{ maxWidth: "450px", width: "100%" }}
      >
        <Link
          to="/login"
          className="text-decoration-none mb-4 d-inline-flex align-items-center"
        >
          <FaArrowLeft className="me-2" />
          Back to Login
        </Link>

        <div className="text-center mb-4">
          <h2 className="fw-bold">Reset Password</h2>
          <p className="text-muted">
            {isSubmitted
              ? "Check your email for reset instructions"
              : "Enter your email to receive a reset link"}
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                id="email"
                placeholder="Enter your registered email"
                {...register("email")}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Sending Reset Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="alert alert-success">
              <i className="bi bi-check-circle-fill me-2"></i>
              Password reset link has been sent to your email!
            </div>
            <p className="text-muted small">
              Please check your inbox and follow the instructions to reset your
              password. The link will expire in 1 hour.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="btn btn-outline-primary mt-3"
            >
              Resend Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
