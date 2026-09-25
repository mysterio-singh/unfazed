import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";

const days = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

function Schedule() {
  const { token } = useAuth();

  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
  type: "weekly",
  dayOfWeek: 1,
  date: "",
  startTime: "09:00",
  endTime: "18:00",
  sessionDuration: 60,
  bufferMinutes: 15,
  timezone: "Asia/Kolkata",
});

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        "/scheduling/availability",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setAvailability(response.data.availability);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load availability"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAvailability();
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "dayOfWeek" ||
        name === "sessionDuration" ||
        name === "bufferMinutes"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await axiosInstance.post(
        "/scheduling/availability",
        {
  type: form.type,
  ...(form.type === "weekly" && {
    dayOfWeek: form.dayOfWeek,
  }),
  ...(form.type !== "weekly" && {
    date: form.date,
  }),
  startTime: form.startTime,
  endTime: form.endTime,
  sessionDuration: form.sessionDuration,
  bufferMinutes: form.bufferMinutes,
  timezone: form.timezone,
},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMessage("Availability added successfully.");

        await fetchAvailability();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to add availability"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setError("");
      setMessage("");

      const response = await axiosInstance.delete(
        `/scheduling/availability/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMessage("Availability removed successfully.");
        await fetchAvailability();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to remove availability"
      );
    }
  };

  const getDayName = (dayNumber) => {
    return (
      days.find((day) => day.value === dayNumber)?.label ||
      "Unknown"
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Schedule
          </h1>

          <p className="mt-2 text-slate-400">
            Manage your weekly availability and session
            settings.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Add Availability */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">
              Add Weekly Availability
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Set when clients can book sessions with you.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >

            <div>
  <label className="mb-2 block text-sm text-slate-300">
    Availability Type
  </label>

  <select
    name="type"
    value={form.type}
    onChange={handleChange}
    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
  >
    <option value="weekly">
      Weekly Availability
    </option>

    <option value="override">
      One-time Override
    </option>

    <option value="blocked">
      Blocked Slot
    </option>
  </select>
</div>
     {form.type !== "weekly" && (
  <div>
    <label className="mb-2 block text-sm text-slate-300">
      Date
    </label>

    <input
      type="date"
      name="date"
      value={form.date}
      onChange={handleChange}
      required
      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
    />
  </div>
)}

              {form.type !== "blocked" && (
  <div>
    <label className="mb-2 block text-sm text-slate-300">
      Session Duration
    </label>

    <select
      name="sessionDuration"
      value={form.sessionDuration}
      onChange={handleChange}
      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
    >
      <option value={30}>30 minutes</option>
      <option value={45}>45 minutes</option>
      <option value={60}>60 minutes</option>
      <option value={90}>90 minutes</option>
    </select>
  </div>
)}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Start Time
                  </label>

                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    End Time
                  </label>

                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Session Duration
                </label>

                <select
                  name="sessionDuration"
                  value={form.sessionDuration}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>

            {form.type !== "blocked" && (
  <div>
    <label className="mb-2 block text-sm text-slate-300">
      Buffer Between Sessions
    </label>

    <select
      name="bufferMinutes"
      value={form.bufferMinutes}
      onChange={handleChange}
      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
    >
      <option value={0}>No buffer</option>
      <option value={5}>5 minutes</option>
      <option value={10}>10 minutes</option>
      <option value={15}>15 minutes</option>
      <option value={30}>30 minutes</option>
    </select>
  </div>
)}

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Timezone
                </label>

                <input
                  type="text"
                  name="timezone"
                  value={form.timezone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Add Availability"}
              </button>
            </form>
          </div>

          {/* Existing Availability */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">
              Your Availability
            </h2>

            {loading ? (
              <p className="mt-6 text-slate-400">
                Loading availability...
              </p>
            ) : availability.length === 0 ? (
              <p className="mt-6 text-slate-400">
                No availability added yet.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {availability.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">
                          {item.type === "weekly"
                            ? getDayName(item.dayOfWeek)
                            : item.type}
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          {item.startTime} – {item.endTime}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          {item.sessionDuration} min session
                          {" • "}
                          {item.bufferMinutes} min buffer
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(item._id)
                        }
                        className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Schedule;