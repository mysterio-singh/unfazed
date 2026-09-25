import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function Profile() {
  const { therapist, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: therapist?.name || "",
    bio: therapist?.bio || "",
    slug: therapist?.slug || "",
    specializations: therapist?.specializations?.join(", ") || "",
    languages: therapist?.languages?.join(", ") || "",
  });

  const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
  event.preventDefault();

  setLoading(true);
  setMessage("");
  setError("");

  try {
    await updateProfile({
      name: formData.name,
      bio: formData.bio,
      slug: formData.slug,
      specializations: formData.specializations
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      languages: formData.languages
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });

    setMessage("Profile updated successfully!");
  } catch (error) {
    setError(
      error.response?.data?.message ||
        "Failed to update profile."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Therapist Profile</h1>

        <p className="mt-2 text-slate-400">
          Manage your professional profile and public information.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {message && (
  <div className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-400">
    {message}
  </div>
)}

{error && (
  <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
    {error}
  </div>
)}
            
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Email
              </label>

              <input
                type="email"
                value={therapist?.email || ""}
                disabled
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Bio
              </label>

              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                placeholder="Tell clients about yourself..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Specializations
              </label>

              <input
                type="text"
                name="specializations"
                value={formData.specializations}
                onChange={handleChange}
                placeholder="Anxiety, Stress, Depression"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />

              <p className="mt-1 text-xs text-slate-500">
                Separate multiple specializations with commas.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Languages
              </label>

              <input
                type="text"
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                placeholder="Hindi, English"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Branded Profile Slug
              </label>

              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="dr-sharma"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />

              <p className="mt-2 text-sm text-indigo-400">
                unfazed.in/{formData.slug || "your-slug"}
              </p>
            </div>

            <button
  type="submit"
  disabled={loading}
  className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
>
  {loading ? "Saving..." : "Save Profile"}
</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;