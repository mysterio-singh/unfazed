import { useEffect, useState } from "react";

import axiosInstance from "../../api/axiosInstance";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingFormData, setLoadingFormData] = useState(true);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    client: "",
    session: "",
    type: "private",
    templateType: "basic",
    content: "",
  });

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const token = localStorage.getItem("unfazed_token");

  // Load existing clinical notes
  const loadNotes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/notes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setNotes(response.data.data || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load clinical notes."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load therapist clients and sessions
  const loadFormData = async () => {
    try {
      setLoadingFormData(true);
      setFormError("");

      const [clientsResponse, sessionsResponse] =
        await Promise.all([
          axiosInstance.get("/clients", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          axiosInstance.get("/scheduling/sessions", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      if (clientsResponse.data.success) {
  setClients(clientsResponse.data.clients || []);
}

      if (sessionsResponse.data.success) {
        setSessions(sessionsResponse.data.data || []);
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Unable to load clients and sessions."
      );
    } finally {
      setLoadingFormData(false);
    }
  };

  useEffect(() => {
    loadNotes();
    loadFormData();
  }, []);

  // Client selection
  const handleClientChange = (e) => {
    const selectedClientId = e.target.value;

    setFormData((previous) => ({
      ...previous,
      client: selectedClientId,
      session: "",
    }));

    setSaveMessage("");
  };

  // Create note
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setSaveMessage("");
      setFormError("");

      if (!formData.client || !formData.session) {
        setFormError(
          "Please select both a client and a session."
        );
        return;
      }

      const response = await axiosInstance.post(
        "/notes",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSaveMessage(
          "Session note created successfully! ✓"
        );

        setFormData({
          client: "",
          session: "",
          type: "private",
          templateType: "basic",
          content: "",
        });

        await loadNotes();
      }
    } catch (err) {
      setSaveMessage(
        err.response?.data?.message ||
          "Unable to create session note."
      );
    } finally {
      setSaving(false);
    }
  };

  // Only show sessions belonging to selected client
  const filteredSessions = sessions.filter((session) => {
    const sessionClientId =
      session.client?._id || session.client;

    return (
      sessionClientId?.toString() ===
      formData.client?.toString()
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Clinical Notes
          </h1>

          <p className="mt-2 text-slate-400">
            Create and manage session notes for your clients.
          </p>
        </div>

        {/* General error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {/* Create Note */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Create Session Note
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Add a clinical note for a client session.
          </p>

          {formError && (
            <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {formError}
            </div>
          )}

          {loadingFormData ? (
            <div className="mt-6 rounded-xl bg-slate-950 p-5 text-sm text-slate-400">
              Loading clients and sessions...
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              {/* Client + Session */}
              <div className="grid gap-5 md:grid-cols-2">

                {/* Client */}
                <div>
                  <label className="text-sm text-slate-400">
                    Client
                  </label>

                  <select
                    value={formData.client}
                    onChange={handleClientChange}
                    required
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Select a client
                    </option>

                    {clients.map((client) => (
                      <option
                        key={client._id}
                        value={client._id}
                      >
                        {client.name}{" "}
                        {client.email
                          ? `(${client.email})`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Session */}
                <div>
                  <label className="text-sm text-slate-400">
                    Session
                  </label>

                  <select
                    value={formData.session}
                    onChange={(e) =>
                      setFormData((previous) => ({
                        ...previous,
                        session: e.target.value,
                      }))
                    }
                    required
                    disabled={!formData.client}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">
                      {!formData.client
                        ? "Select a client first"
                        : filteredSessions.length === 0
                        ? "No sessions found"
                        : "Select a session"}
                    </option>

                    {filteredSessions.map((session) => (
                      <option
                        key={session._id}
                        value={session._id}
                      >
                        {new Date(
                          session.startAt
                        ).toLocaleString("en-IN")}{" "}
                        — {session.status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Note Type + Template */}
              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="text-sm text-slate-400">
                    Note Type
                  </label>

                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData((previous) => ({
                        ...previous,
                        type: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  >
                    <option value="private">
                      Private
                    </option>

                    <option value="shared">
                      Shared with Client
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-400">
                    Template Type
                  </label>

                  <select
                    value={formData.templateType}
                    onChange={(e) =>
                      setFormData((previous) => ({
                        ...previous,
                        templateType: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  >
                    <option value="basic">
                      Basic
                    </option>

                    <option value="advanced">
                      Advanced
                    </option>
                  </select>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="text-sm text-slate-400">
                  Note Content
                </label>

                <textarea
                  rows="7"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((previous) => ({
                      ...previous,
                      content: e.target.value,
                    }))
                  }
                  placeholder="Write your clinical note..."
                  required
                  className="mt-2 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  saving ||
                  !formData.client ||
                  !formData.session ||
                  !formData.content.trim()
                }
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Create Note"}
              </button>

              {saveMessage && (
                <p className="text-center text-sm text-slate-300">
                  {saveMessage}
                </p>
              )}
            </form>
          )}
        </div>

        {/* Existing Notes */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">
            Existing Notes
          </h2>

          {loading ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
              Loading notes...
            </div>
          ) : notes.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
              No clinical notes found.
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note._id}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {note.client?.name ||
                          "Unknown Client"}
                      </p>

                      <p className="text-sm text-slate-500">
                        {note.client?.email || ""}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                        {note.type}
                      </span>

                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                        {note.templateType}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg bg-slate-950 p-4">
                    <p className="whitespace-pre-wrap text-sm text-slate-300">
                      {note.content}
                    </p>
                  </div>

                  {note.session && (
                    <p className="mt-3 text-xs text-slate-500">
                      Session:{" "}
                      {note.session.startAt
                        ? new Date(
                            note.session.startAt
                          ).toLocaleString("en-IN")
                        : "N/A"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notes;