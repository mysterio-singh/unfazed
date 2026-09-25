import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { therapist, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">
          Loading Unfazed...
        </p>
      </div>
    );
  }

  if (!therapist) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;