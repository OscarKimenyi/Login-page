import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const InputField = ({
  type = "text",
  label,
  name,
  register,
  errors,
  placeholder,
  validation,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">
        {label}
      </label>
      <div className="input-group">
        <input
          type={inputType}
          className={`form-control ${errors[name] ? "is-invalid" : ""}`}
          id={name}
          placeholder={placeholder}
          {...register(name, validation)}
          {...props}
        />
        {type === "password" && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>
      {errors[name] && (
        <div className="invalid-feedback d-block">{errors[name].message}</div>
      )}
    </div>
  );
};

export default InputField;
