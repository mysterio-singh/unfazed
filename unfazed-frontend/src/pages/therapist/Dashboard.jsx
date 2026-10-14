import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

import {
  Users,
  CalendarCheck,
  Wallet,
  CalendarClock,
  ArrowUpRight,
} from "lucide-react";

function Dashboard() {
  
  const { therapist, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    name: "",
    slug: "",
    bio: "",
    specializations: "",
    languages: "",
     qualifications: "",
  certifications: "",
  experienceYears: "",
  professionalApproach: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [dashboardStats, setDashboardStats] = useState(null);
const [dashboardStatsLoading, setDashboardStatsLoading] = useState(true);
const [dashboardStatsError, setDashboardStatsError] = useState("");
  
useEffect(() => {
  if (therapist) {
    setProfileForm({
      name: therapist.name || "",
      slug: therapist.slug || "",
      bio: therapist.bio || "",
      specializations: therapist.specializations?.join(", ") || "",
      languages: therapist.languages?.join(", ") || "",
      qualifications: therapist.qualifications?.join(", ") || "",
      certifications: therapist.certifications?.join(", ") || "",
      experienceYears: therapist.experienceYears ?? "",
      professionalApproach: therapist.professionalApproach || "",
    });
  }
}, [therapist]);

useEffect(() => {
  let isMounted = true;

  const fetchDashboardStats = async () => {
    try {
      setDashboardStatsLoading(true);
      setDashboardStatsError("");

      const response = await axiosInstance.get("/analytics/dashboard");

      if (isMounted) {
        setDashboardStats(response.data.data);
      }
    } catch (error) {
      if (isMounted) {
        setDashboardStatsError(
          error.response?.data?.message ||
            "Dashboard stats load nahi ho paaye."
        );
      }
    } finally {
      if (isMounted) {
        setDashboardStatsLoading(false);
      }
    }
  };

  fetchDashboardStats();

  return () => {
    isMounted = false;
  };
}, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();

    try {
      setSavingProfile(true);
      setProfileMessage("");

      const specializations = profileForm.specializations
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const languages = profileForm.languages
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      
const qualifications = profileForm.qualifications
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const certifications = profileForm.certifications
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const response = await updateProfile({
  name: profileForm.name.trim(),
  slug: profileForm.slug.trim().toLowerCase(),
  bio: profileForm.bio.trim(),
  specializations,
  languages,
  qualifications,
  certifications,
  experienceYears:
    profileForm.experienceYears === ""
      ? null
      : Number(profileForm.experienceYears),
  professionalApproach: profileForm.professionalApproach.trim(),
});


      if (response.success) {
        setProfileMessage("Profile updated successfully! ✓");
      } else {
        setProfileMessage(
          response.message || "Unable to update profile."
        );
      }
    } catch (error) {
      setProfileMessage(
        error.response?.data?.message ||
          "Unable to update profile. Please try again."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleViewPublicProfile = () => {
    if (therapist?.slug) {
      navigate(`/${therapist.slug}`);
    }
  };

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
        {/* Welcome */}
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
          
<div className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-950/30">
  <div className="flex items-start justify-between  "  role="button"
tabIndex={0}
onClick={() => navigate("/clients")}>
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
      <Users size={23} />
    </div>

    <ArrowUpRight
      size={19}
      className="text-slate-600 transition-colors group-hover:text-blue-400"
    />
  </div>

  <p className="mt-4 text-sm text-slate-400 font-bold">Active Clients</p>

  <p className="mt-1 text-3xl font-bold text-white">
    {dashboardStatsLoading
      ? "..."
      : dashboardStatsError
        ? "—"
        : dashboardStats?.activeClients ?? 0}
  </p>
  
</div>


          
<div className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-950/30"  role="button"
tabIndex={0}
onClick={() => navigate("/schedule?filter=today")}>
  <div className="flex items-start justify-between">
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
      <CalendarCheck size={23} />
    </div>

    <ArrowUpRight
      size={19}
      className="text-slate-600 transition-colors group-hover:text-emerald-400"
    />
  </div>

  <p className="mt-4 text-sm text-slate-400">Today's Sessions</p>

  <p className="mt-1 text-3xl font-bold text-white">
    {dashboardStatsLoading
      ? "..."
      : dashboardStatsError
        ? "—"
        : dashboardStats?.todaysSessions ?? 0}
  </p>
</div>


          
<div className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-950/30">
  <div className="flex items-start justify-between">
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
      <Wallet size={23} />
    </div>

    <ArrowUpRight
      size={19}
      className="text-slate-600 transition-colors group-hover:text-amber-400"
    />
  </div>

  <p className="mt-4 text-sm text-slate-400">Pending Payments</p>

  <p className="mt-1 text-3xl font-bold text-white">
    {dashboardStatsLoading
      ? "..."
      : dashboardStatsError
        ? "—"
        : new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(dashboardStats?.pendingPayments ?? 0)}
  </p>
</div>


          
<div className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-950/30"  role="button"
tabIndex={0}
onClick={() => navigate("/schedule?filter=upcoming")}>
  <div className="flex items-start justify-between">
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
      <CalendarClock size={23} />
    </div>

    <ArrowUpRight
      size={19}
      className="text-slate-600 transition-colors group-hover:text-violet-400"
    />
  </div>

  <p className="mt-4 text-sm text-slate-400">Upcoming Sessions</p>

  <p className="mt-1 text-3xl font-bold text-white">
    {dashboardStatsLoading
      ? "..."
      : dashboardStatsError
        ? "—"
        : dashboardStats?.upcomingSessions ?? 0}
  </p>
</div>

        </div>


{dashboardStatsError && (
  <p className="mt-3 text-sm text-red-600">
    {dashboardStatsError}
  </p>
)}


        {/* Professional Profile */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-semibold">
                Professional Profile
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                This information will be visible on your public therapist
                profile.
              </p>

              <p className="text-xs text-slate-500">
  Slug: {therapist?.slug || "NO SLUG"}
</p>
            </div>

            <button
              type="button"
              onClick={handleViewPublicProfile}
              className="rounded-lg border border-indigo-500 px-4 py-2 text-sm font-medium text-indigo-300 transition hover:bg-indigo-500/10"
            >
              View Public Profile →
            </button>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-6">
            {/* Name + Slug */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Professional Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  placeholder="e.g. Dr. Rahul Sharma"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Profile URL
                </label>

                <div className="flex overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
                  <span className="flex items-center bg-slate-900 px-3 text-sm text-slate-500">
                    / 
                  </span>

                  <input
                    type="text"
                    name="slug"
                    value={profileForm.slug}
                    onChange={handleProfileChange}
                    placeholder="your-name"
                    className="w-full bg-transparent px-3 py-3 text-white outline-none"
                  />
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Example: unfazed.in/{profileForm.slug || "your-name"}
                </p>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                About
              </label>

              <textarea
                name="bio"
                value={profileForm.bio}
                onChange={handleProfileChange}
                rows={5}
                placeholder="Tell clients about your professional background, approach and experience..."
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
              />

              <p className="mt-1 text-xs text-slate-500">
                Write a short professional introduction for potential clients.
              </p>
            </div>

            {/* Specializations */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Specializations
              </label>

              <input
                type="text"
                name="specializations"
                value={profileForm.specializations}
                onChange={handleProfileChange}
                placeholder="Anxiety, Depression, Stress Management, Relationship Counselling"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
              />

              <p className="mt-1 text-xs text-slate-500">
                Separate multiple specializations with commas.
              </p>
            </div>

            {/* Languages */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Languages
              </label>

              <input
                type="text"
                name="languages"
                value={profileForm.languages}
                onChange={handleProfileChange}
                placeholder="English, Hindi, Hinglish"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
              />

              <p className="mt-1 text-xs text-slate-500">
                Separate multiple languages with commas.
              </p>
            </div>
            
            
{/* Qualifications */}
<div>
  <label className="mb-2 block text-sm font-medium text-slate-300">
    Qualifications
  </label>
  <input
    type="text"
    name="qualifications"
    value={profileForm.qualifications}
    onChange={handleProfileChange}
    placeholder="e.g. Relevant degree or qualification"
    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
  />
  <p className="mt-1 text-xs text-slate-500">
    Separate multiple qualifications with commas.
  </p>
</div>

{/* Certifications */}
<div>
  <label className="mb-2 block text-sm font-medium text-slate-300">
    Certifications
  </label>
  <input
    type="text"
    name="certifications"
    value={profileForm.certifications}
    onChange={handleProfileChange}
    placeholder="Enter relevant certifications"
    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
  />
  <p className="mt-1 text-xs text-slate-500">
    Separate multiple certifications with commas.
  </p>
</div>

{/* Experience */}
<div>
  <label className="mb-2 block text-sm font-medium text-slate-300">
    Experience (Years)
  </label>
  <input
    type="number"
    name="experienceYears"
    min="0"
    step="1"
    value={profileForm.experienceYears}
    onChange={handleProfileChange}
    placeholder="e.g. 2"
    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
  />
</div>

{/* Professional Approach */}
<div>
  <label className="mb-2 block text-sm font-medium text-slate-300">
    Professional Approach
  </label>
  <textarea
    name="professionalApproach"
    value={profileForm.professionalApproach}
    onChange={handleProfileChange}
    rows={4}
    placeholder="Describe your professional approach..."
    className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
  />
</div>

            {/* Message */}
            {profileMessage && (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  profileMessage.includes("successfully")
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/30 bg-red-500/10 text-red-300"
                }`}
              >
                {profileMessage}
              </div>
            )}

            {/* Save */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </section>

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