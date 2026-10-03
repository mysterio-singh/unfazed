import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Link } from "react-router-dom";
import ChatBox from "../../components/chat/ChatBox";
function ClientPortal() {
  const [profile, setProfile] = useState(null);
  const [chatInfo, setChatInfo] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPortalData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("unfazed_client_token");

        if (!token) {
          setError(
            "Client portal session not found. Please complete a booking first."
          );
          return;
        }

        const authConfig = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [
          profileResponse,
          sessionsResponse,
          notesResponse,
        ] = await Promise.all([
          axiosInstance.get("/clients/portal/profile", authConfig),
          axiosInstance.get("/clients/portal/sessions", authConfig),
          axiosInstance.get("/notes/client/shared", authConfig),
        ]);

        if (profileResponse.data.success) {
  setProfile(profileResponse.data.data);
  setChatInfo(profileResponse.data.chat);
}
        if (sessionsResponse.data.success) {
          setSessions(sessionsResponse.data.data || []);
        }

        if (notesResponse.data.success) {
          setNotes(notesResponse.data.data || []);
        }
      } catch (err) {
        console.error("Client portal error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load client portal"
        );
      } finally {
        setLoading(false);
      }
    };

    loadPortalData();
  }, []);




  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-slate-400">
          Loading your client portal...
        </p>
      </div>
    );
  }

  if (error) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 text-2xl">
          🔐
        </div>

        <h1 className="mt-5 text-2xl font-semibold">
          Client Portal
        </h1>

        <p className="mt-3 leading-6 text-slate-400">
          {error}
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            to="/"
            className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500"
          >
            Find a Therapist
          </Link>

          <Link
            to="/"
            className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <p className="text-sm font-medium text-blue-400">
            Unfazed
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Client Portal
          </h1>

          <p className="mt-2 text-slate-400">
            Manage your therapy sessions, profile and notes
            shared with you by your therapist.
          </p>
        </div>

        {/* Client Profile / Intake */}
        {profile && (
          <section className="mt-6">
            <h2 className="text-xl font-semibold">
              My Profile
            </h2>

            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <div className="grid gap-5 md:grid-cols-2">

                {/* Name */}
                <div>
                  <p className="text-sm text-slate-500">
                    Name
                  </p>

                  <p className="mt-1 font-medium">
                    {profile.name || "Not provided"}
                  </p>
                </div>

                {/* Email */}
                <div>
                  <p className="text-sm text-slate-500">
                    Email
                  </p>

                  <p className="mt-1 font-medium break-all">
                    {profile.email || "Not provided"}
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <p className="text-sm text-slate-500">
                    Phone
                  </p>

                  <p className="mt-1 font-medium">
                    {profile.phone || "Not provided"}
                  </p>
                </div>

                {/* Timezone */}
                <div>
                  <p className="text-sm text-slate-500">
                    Timezone
                  </p>

                  <p className="mt-1 font-medium">
                    {profile.timezone || "Asia/Kolkata"}
                  </p>
                </div>

                {/* Age */}
                <div>
                  <p className="text-sm text-slate-500">
                    Age
                  </p>

                  <p className="mt-1 font-medium">
                    {profile.demographics?.age || "Not provided"}
                  </p>
                </div>

                {/* Gender */}
                <div>
                  <p className="text-sm text-slate-500">
                    Gender
                  </p>

                  <p className="mt-1 font-medium">
                    {profile.demographics?.gender || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Presenting Concern */}
              <div className="mt-6">
                <p className="text-sm text-slate-500">
                  Presenting Concern
                </p>

                <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {profile.presentingConcern ||
                      "No presenting concern provided."}
                  </p>
                </div>
              </div>

              {/* History */}
              <div className="mt-5">
                <p className="text-sm text-slate-500">
                  History
                </p>

                <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {profile.history ||
                      "No history provided."}
                  </p>
                </div>
              </div>

              {/* Consent */}
              <div className="mt-5 flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    Digital Consent
                  </p>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      profile.consentGiven
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-yellow-500/10 text-yellow-300"
                    }`}
                  >
                    {profile.consentGiven
                      ? "Provided"
                      : "Pending"}
                  </span>
                </div>

                {profile.consentTimestamp && (
                  <p className="text-xs text-slate-500">
                    Provided on{" "}
                    {new Date(
                      profile.consentTimestamp
                    ).toLocaleString("en-IN")}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Sessions */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold">
            My Sessions
          </h2>

          {sessions.length === 0 ? (
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-slate-400">
                No sessions found.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4">
              {sessions.map((session) => (
                <div
                  key={session._id}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold">
                        Therapy Session
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        {new Date(
                          session.startAt
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-300">
                      {session.status}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-400">
                    Duration: {session.durationMinutes} minutes
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Timezone: {session.timezone}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Shared Notes */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold">
            Shared Notes
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            These are notes your therapist has chosen to
            share with you.
          </p>

          {notes.length === 0 ? (
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-slate-400">
                No shared notes available yet.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4">
              {notes.map((note) => (
                <div
                  key={note._id}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      Session Note
                    </h3>

                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                      Shared
                    </span>
                  </div>

                  <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {note.content}
                  </div>

                  <p className="mt-4 text-xs text-slate-500">
                    Shared on{" "}
                    {new Date(
                      note.createdAt
                    ).toLocaleDateString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

    {chatInfo?.clientId && chatInfo?.therapistId && (
  <ChatBox
    clientId={chatInfo.clientId}
    therapistId={chatInfo.therapistId}
  />
)}

      </div>
    </div>
  );
}

export default ClientPortal;