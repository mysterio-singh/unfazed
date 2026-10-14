import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

function PublicTherapistProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        console.log("API BASE URL:", import.meta.env.VITE_API_BASE_URL);
    console.log("SLUG:", slug);

        const response = await axiosInstance.get(
          `/therapist/public/${slug}`
        );
        console.log("THERAPIST RESPONSE:", response.data);

        if (response.data.success) {
          setTherapist(response.data.therapist);
        }
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Therapist profile not found."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTherapist();
  }, [slug]);

  useEffect(() => {
    if (!therapist) return;

    document.title = `${therapist.name} | Unfazed`;

    const setMeta = (property, content) => {
      let meta = document.querySelector(
        `meta[property="${property}"]`
      );

      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }

      meta.setAttribute("content", content);
    };

    setMeta("og:title", `${therapist.name} | Unfazed`);
    setMeta(
      "og:description",
      therapist.bio || "Therapist profile on Unfazed"
    );
    setMeta("og:type", "profile");
    setMeta(
      "og:url",
      window.location.href
    );
  }, [therapist]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-slate-400">
          Loading therapist profile...
        </p>
      </div>
    );
  }

  if (error || !therapist) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold text-white">
            Profile Not Found
          </h1>

          <p className="mt-2 text-slate-400">
            {error || "This therapist profile does not exist."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
          
{/* Premium Therapist Header */}
<div className="relative isolate overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-600 to-purple-600 px-6 py-10 sm:px-10 sm:py-12">

  {/* Decorative background glow */}
  <div className="pointer-events-none absolute -right-16 -top-20 -z-10 h-64 w-64 rounded-full bg-fuchsia-400/30 blur-3xl" />
  <div className="pointer-events-none absolute -bottom-24 left-1/3 -z-10 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />

  {/* Therapist badge */}
  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-white shadow-lg backdrop-blur-md sm:text-sm">
    <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]" />
    UNFAZED THERAPIST
  </div>

  {/* Name and slug */}
  <h1 className="mt-5 break-words text-3xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-5xl">
    {therapist.name}
  </h1>

  <p className="mt-2 text-sm font-medium text-indigo-100 sm:text-base">
    @{therapist.slug}
  </p>

  {/* Quick information cards */}
  <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">

    {therapist.experienceYears != null &&
      therapist.experienceYears !== "" && (
        <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl">
            💼
          </div>
          <div>
            <p className="font-bold text-white">
              {therapist.experienceYears}{" "}
              {Number(therapist.experienceYears) === 1
                ? "Year"
                : "Years"}
            </p>
            <p className="text-xs text-indigo-100">Experience</p>
          </div>
        </div>
      )}

    {therapist.languages?.length > 0 && (
      <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl">
          🌐
        </div>
        <div className="min-w-0">
          <p className="font-bold text-white">Languages</p>
          <p className="text-xs text-indigo-100">
            {therapist.languages.join(" · ")}
          </p>
        </div>
      </div>
    )}

    {therapist.specializations?.length > 0 && (
      <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl">
          ✨
        </div>
        <div className="min-w-0">
          <p className="font-bold text-white">
            {therapist.specializations.length} Areas
          </p>
          <p className="text-xs text-indigo-100">Specializations</p>
        </div>
      </div>
    )}

  </div>
</div>


          <div className="p-8">
            <section>
              <h2 className="text-xl font-semibold">
                About
              </h2>

              <p className="mt-3 leading-7 text-slate-400">
                {therapist.bio || "No bio added yet."}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-semibold">
                Specializations
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
                {therapist.specializations?.length > 0 ? (
                  therapist.specializations.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-500">
                    No specializations added.
                  </p>
                )}
              </div>
            </section>
            
            
            {/* Qualifications */}
            {therapist.qualifications?.length > 0 && (
              <section className="mt-8">
                <h2 className="text-xl font-semibold">
                  Qualifications
                </h2>

                <ul className="mt-3 space-y-2">
                  {therapist.qualifications.map((item) => (
                    <li
                      key={item}
                      className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Certifications */}
            {therapist.certifications?.length > 0 && (
              <section className="mt-8">
                <h2 className="text-xl font-semibold">
                  Certifications
                </h2>

                <div className="mt-3 flex flex-wrap gap-2">
                  {therapist.certifications.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Professional Experience */}
            {therapist.experienceYears != null &&
              therapist.experienceYears !== "" && (
                <section className="mt-8">
                  <h2 className="text-xl font-semibold">
                    Professional Experience
                  </h2>

                  <p className="mt-3 text-slate-400">
                    {therapist.experienceYears}{" "}
                    {Number(therapist.experienceYears) === 1
                      ? "year"
                      : "years"}{" "}
                    of experience
                  </p>
                </section>
              )}

            {/* Professional Approach */}
            {therapist.professionalApproach?.trim() && (
              <section className="mt-8">
                <h2 className="text-xl font-semibold">
                  Professional Approach
                </h2>

                <p className="mt-3 leading-7 text-slate-400">
                  {therapist.professionalApproach}
                </p>
              </section>
            )}

            <section className="mt-8">
              <h2 className="text-xl font-semibold">
                Languages
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
                {therapist.languages?.length > 0 ? (
                  therapist.languages.map((language) => (
                    <span
                      key={language}
                      className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300"
                    >
                      {language}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-500">
                    No languages added.
                  </p>
                )}
              </div>
            </section>

            <button
              type="button"
              onClick={() => navigate(`/booking/${slug}`)}
              className="mt-10 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500"
            >
              Book a Session
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Powered by Unfazed
        </p>
      </div>
    </div>
  );
}

export default PublicTherapistProfile;