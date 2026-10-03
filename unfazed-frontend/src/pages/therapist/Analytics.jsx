import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import RevenueChart from "../../components/analytics/RevenueChart";
function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axiosInstance.get("/analytics");
        setAnalytics(response.data.data);
      } catch (error) {
        console.error("❌ Analytics fetch error:", error);

        const message =
          error.response?.data?.message ||
          "Failed to load analytics";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-lg font-semibold text-red-700">
            Unable to load analytics
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const totalRevenue =
    analytics?.revenueTrend?.reduce(
      (total, item) => total + (item.revenue || 0),
      0
    ) || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics
          </h1>

          <p className="mt-1 text-gray-500">
            Track your practice performance and business insights.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* Revenue */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">
              Total Revenue
            </p>

            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Paid transactions
            </p>
          </div>

          {/* Clients */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">
              Active Clients
            </p>

            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {analytics?.activeClients || 0}
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Currently active
            </p>
          </div>

          {/* Sessions */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">
              Total Sessions
            </p>

            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {analytics?.sessions?.total || 0}
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              All recorded sessions
            </p>
          </div>

          {/* No Show */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">
              No-show Rate
            </p>

            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {analytics?.noShowRate || 0}%
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Missed sessions
            </p>
          </div>
        </div>

        {/* Session Overview */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Session Overview
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Total
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {analytics?.sessions?.total || 0}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Completed
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {analytics?.sessions?.completed || 0}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                No-show
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {analytics?.sessions?.noShow || 0}
              </p>
            </div>

          </div>
        </div>

        {/* Revenue Trend */}
        {/* Revenue Trend */}
<div className="mt-8 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
  <div className="mb-6">
    <h2 className="text-xl font-semibold text-gray-900">
      Revenue Trend
    </h2>

    <p className="mt-1 text-sm text-gray-500">
      Monthly paid revenue
    </p>
  </div>

  <RevenueChart data={analytics?.revenueTrend || []} />
</div>

      </div>
    </div>
  );
}

export default Analytics;