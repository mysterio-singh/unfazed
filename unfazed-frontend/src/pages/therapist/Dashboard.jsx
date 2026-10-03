import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { therapist, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">Unfazed</h1>
            <p className="text-sm text-slate-400">
              Therapist Practice Management
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">
                {therapist?.name || "Therapist"}
              </p>
              <p className="text-xs text-slate-400">
                {therapist?.email || ""}
              </p>
            </div>

            <button
              onClick={logout}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Welcome back, {therapist?.name || "Therapist"} 👋
          </h2>

          <p className="mt-2 text-slate-400">
            Here's an overview of your practice.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Active Clients</p>
            <p className="mt-2 text-3xl font-bold">0</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Today's Sessions</p>
            <p className="mt-2 text-3xl font-bold">0</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Pending Payments</p>
            <p className="mt-2 text-3xl font-bold">₹0</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Upcoming Sessions</p>
            <p className="mt-2 text-3xl font-bold">0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="mb-4 text-xl font-semibold">
            Quick Actions
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <button
    onClick={() => navigate("/clients")}
    className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-left transition hover:border-indigo-500 hover:bg-slate-800"
  >
    <p className="font-semibold">Clients</p>
    <p className="mt-1 text-sm text-slate-400">
      Manage your clients
    </p>
  </button>

  <button
    onClick={() => navigate("/schedule")}
    className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-left transition hover:border-indigo-500 hover:bg-slate-800"
  >
    <p className="font-semibold">Schedule</p>
    <p className="mt-1 text-sm text-slate-400">
      Manage availability
    </p>
  </button>

  <button
    onClick={() => navigate("/notes")}
    className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-left transition hover:border-indigo-500 hover:bg-slate-800"
  >
    <p className="font-semibold">Notes</p>
    <p className="mt-1 text-sm text-slate-400">
      View clinical notes
    </p>
  </button>

  <button
    onClick={() => navigate("/analytics")}
    className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-left transition hover:border-indigo-500 hover:bg-slate-800"
  >
    <p className="font-semibold">Analytics</p>
    <p className="mt-1 text-sm text-slate-400">
      View practice insights
    </p>
  </button>
</div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;