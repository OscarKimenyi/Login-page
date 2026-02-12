import { useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const Captcha = ({ onVerify }) => {
  const recaptchaRef = useRef(null);

  const handleChange = (token) => {
    onVerify(token);
  };

  return (
    <div className="d-flex justify-content-center mb-3">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
        onChange={handleChange}
      />
    </div>
  );
};

export default Captcha;
