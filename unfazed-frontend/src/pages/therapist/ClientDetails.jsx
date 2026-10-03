import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import TherapistChatBox from "../../components/chat/TherapistChatBox";
function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const therapistId = JSON.parse(
  localStorage.getItem("unfazed_user")
)?.therapistId;

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

const [formData, setFormData] = useState({
  name: "",
  email: "",
  phone: "",
  timezone: "Asia/Kolkata",
  age: "",
  gender: "",
  presentingConcern: "",
  history: "",
});

const [saving, setSaving] = useState(false);
const [saveMessage, setSaveMessage] = useState("");
const [bookingOpen, setBookingOpen] = useState(false);
const [bookingDateTime, setBookingDateTime] = useState("");
const [bookingDuration, setBookingDuration] = useState("60");
const [bookingLoading, setBookingLoading] = useState(false);
const [bookingMessage, setBookingMessage] = useState("");

  useEffect(() => {
    const loadClient = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("unfazed_token");

        const response = await axiosInstance.get(
          `/clients/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
  const loadedClient = response.data.client;

  setClient(loadedClient);

  setFormData({
    name: loadedClient.name || "",
    email: loadedClient.email || "",
    phone: loadedClient.phone || "",
    timezone: loadedClient.timezone || "Asia/Kolkata",
    age: loadedClient.demographics?.age || "",
    gender: loadedClient.demographics?.gender || "",
    presentingConcern:
      loadedClient.presentingConcern || "",
    history: loadedClient.history || "",
  });
}
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load client"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadClient();
    }
  }, [id]);
  
  const handleSaveIntake = async () => {
  try {
    setSaving(true);
    setSaveMessage("");

    const token = localStorage.getItem("unfazed_token");

    const response = await axiosInstance.put(
      `/clients/${id}`,
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        timezone: formData.timezone,
        demographics: {
          age: formData.age
            ? Number(formData.age)
            : undefined,
          gender: formData.gender,
        },
        presentingConcern: formData.presentingConcern,
        history: formData.history,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      setClient(response.data.client);
      setEditing(false);
      setSaveMessage("Intake updated successfully! ✓");
    }
  } catch (err) {
    setSaveMessage(
      err.response?.data?.message ||
        "Unable to update client."
    );
  } finally {
    setSaving(false);
  }
};

const handleBookSession = async () => {
  try {
    if (!bookingDateTime) {
      setBookingMessage("Please select a date and time.");
      return;
    }

    setBookingLoading(true);
    setBookingMessage("");

    const token = localStorage.getItem("unfazed_token");

    const startAt = new Date(bookingDateTime);

    if (Number.isNaN(startAt.getTime())) {
      setBookingMessage("Invalid date or time.");
      return;
    }

    const response = await axiosInstance.post(
      "/scheduling/book",
      {
        clientId: id,
        startAt: startAt.toISOString(),
        durationMinutes: Number(bookingDuration),
        timezone: client?.timezone || "Asia/Kolkata",
        bookingSource: "therapist",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      setBookingMessage("Session booked successfully! ✓");
      setBookingDateTime("");
      setBookingOpen(false);
    }
  } catch (err) {
    setBookingMessage(
      err.response?.data?.message ||
        "Unable to book session."
    );
  } finally {
    setBookingLoading(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-slate-400">
          Loading client...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">

        <button
          type="button"
          onClick={() => navigate("/clients")}
          className="mb-6 text-sm text-blue-400 hover:text-blue-300"
        >
          ← Back to Clients
        </button>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-blue-400">
                Client Profile
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                {client.name}
              </h1>

              <p className="mt-2 text-slate-400">
                {client.email}
              </p>
            </div>

            <div className="flex items-center gap-3">
  <button
    type="button"
    onClick={() => {
      setBookingOpen(true);
      setBookingMessage("");
    }}
    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
  >
    📅 Book Session
  </button>

  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
    {client.status}
  </span>
</div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <h2 className="font-semibold">
                Contact Information
              </h2>

              <p className="mt-4 text-sm text-slate-400">
                Phone
              </p>

              <p className="mt-1">
                {client.phone || "Not provided"}
              </p>

              <p className="mt-4 text-sm text-slate-400">
                Timezone
              </p>

              <p className="mt-1">
                {client.timezone || "Asia/Kolkata"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <h2 className="font-semibold">
                Consent
              </h2>

              <p className="mt-4">
                {client.consentGiven
                  ? "✓ Consent provided"
                  : "Consent pending"}
              </p>

              {client.consentTimestamp && (
                <p className="mt-2 text-sm text-slate-500">
                  {new Date(
                    client.consentTimestamp
                  ).toLocaleString("en-IN")}
                </p>
              )}
            </div>

          </div>

          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-5">
  <div className="flex items-center justify-between">
    <h2 className="font-semibold">
      Intake Information
    </h2>

    <button
      type="button"
      onClick={() => {
        setEditing(!editing);
        setSaveMessage("");
      }}
      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
    >
      {editing ? "Cancel" : "Edit Intake"}
    </button>
  </div>

  {!editing ? (
    <>
      <p className="mt-4 text-sm text-slate-400">
        Age
      </p>

      <p className="mt-1">
        {client.demographics?.age || "Not provided"}
      </p>

      <p className="mt-4 text-sm text-slate-400">
        Gender
      </p>

      <p className="mt-1">
        {client.demographics?.gender || "Not provided"}
      </p>

      <p className="mt-4 text-sm text-slate-400">
        Presenting Concern
      </p>

      <p className="mt-1 whitespace-pre-wrap">
        {client.presentingConcern || "Not provided"}
      </p>

      <p className="mt-4 text-sm text-slate-400">
        History
      </p>

      <p className="mt-1 whitespace-pre-wrap">
        {client.history || "Not provided"}
      </p>
    </>
  ) : (
    <div className="mt-5 space-y-4">

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm text-slate-400">
            Age
          </label>

          <input
            type="number"
            value={formData.age}
            onChange={(e) =>
              setFormData({
                ...formData,
                age: e.target.value,
              })
            }
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400">
            Gender
          </label>

          <input
            type="text"
            value={formData.gender}
            onChange={(e) =>
              setFormData({
                ...formData,
                gender: e.target.value,
              })
            }
            placeholder="e.g. Male, Female, Other"
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-slate-400">
          Presenting Concern
        </label>

        <textarea
          rows="4"
          value={formData.presentingConcern}
          onChange={(e) =>
            setFormData({
              ...formData,
              presentingConcern: e.target.value,
            })
          }
          placeholder="Describe the client's presenting concern..."
          className="mt-2 w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-sm text-slate-400">
          History
        </label>

        <textarea
          rows="5"
          value={formData.history}
          onChange={(e) =>
            setFormData({
              ...formData,
              history: e.target.value,
            })
          }
          placeholder="Add relevant client history..."
          className="mt-2 w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
        />
      </div>

      <button
        type="button"
        onClick={handleSaveIntake}
        disabled={saving}
        className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Intake"}
      </button>

      {saveMessage && (
        <p className="text-center text-sm text-slate-300">
          {saveMessage}
        </p>
      )}
    </div>
  )}
    </div>

{bookingOpen && (
  <div className="mt-5 rounded-xl border border-blue-500/30 bg-slate-950 p-5">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">
          Book Therapy Session
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Schedule a session for {client.name}
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setBookingOpen(false);
          setBookingMessage("");
        }}
        className="text-sm text-slate-400 hover:text-white"
      >
        ✕
      </button>
    </div>

    <div className="mt-5 grid gap-4 md:grid-cols-2">
      <div>
        <label className="text-sm text-slate-400">
          Date & Time
        </label>

        <input
          type="datetime-local"
          value={bookingDateTime}
          onChange={(e) =>
            setBookingDateTime(e.target.value)
          }
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-sm text-slate-400">
          Session Duration
        </label>

        <select
          value={bookingDuration}
          onChange={(e) =>
            setBookingDuration(e.target.value)
          }
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
        >
          <option value="30">30 minutes</option>
          <option value="45">45 minutes</option>
          <option value="60">60 minutes</option>
          <option value="90">90 minutes</option>
        </select>
      </div>
    </div>

    <button
      type="button"
      onClick={handleBookSession}
      disabled={bookingLoading}
      className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {bookingLoading
        ? "Booking..."
        : "Confirm Booking"}
    </button>

    {bookingMessage && (
      <p className="mt-3 text-center text-sm text-slate-300">
        {bookingMessage}
      </p>
    )}
  </div>
)}

{therapistId && id && (
  <TherapistChatBox
    clientId={id}
    therapistId={therapistId}
  />
)}

        </div>
      </div>
    </div>
  );
}

export default ClientDetails;