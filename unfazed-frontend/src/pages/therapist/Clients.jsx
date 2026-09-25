import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("unfazed_token");

        const response = await axiosInstance.get("/clients", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setClients(response.data.clients || []);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load clients"
        );
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-slate-400">
          Loading clients...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <p className="text-sm font-medium text-blue-400">
            Unfazed CRM
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Clients
          </h1>

          <p className="mt-2 text-slate-400">
            Manage your clients and their practice information.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {clients.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-xl font-semibold">
              No clients yet
            </h2>

            <p className="mt-2 text-slate-400">
              Clients will appear here after they book a session.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <div
  key={client._id}
  onClick={() => {
    window.location.href = `/clients/${client._id}`;
  }}
  className="cursor-pointer rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500/50 hover:bg-slate-800"
>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {client.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      {client.email}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      client.status === "active"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {client.status}
                  </span>
                </div>

                {client.phone && (
                  <p className="mt-4 text-sm text-slate-300">
                    📞 {client.phone}
                  </p>
                )}

                <p className="mt-2 text-sm text-slate-500">
                  Timezone: {client.timezone || "Asia/Kolkata"}
                </p>

                <div className="mt-5 border-t border-slate-800 pt-4">
                  <p className="text-xs text-slate-500">
                    Consent
                  </p>

                  <p className="mt-1 text-sm">
                    {client.consentGiven
                      ? "✓ Consent provided"
                      : "Consent pending"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Clients;