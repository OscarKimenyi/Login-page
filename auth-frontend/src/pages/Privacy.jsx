import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h1 className="h3 mb-0">Privacy Policy</h1>
            </div>
            <div className="card-body">
              <p className="text-muted">
                This is a placeholder Privacy Policy page. In a real
                application, you would include your actual privacy policy here.
              </p>
              <p>
                <Link to="/register" className="btn btn-primary">
                  Back to Registration
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
