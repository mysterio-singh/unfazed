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
        const response = await axiosInstance.get(
          `/therapist/public/${slug}`
        );

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
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-12">
            <p className="text-sm font-medium text-indigo-100">
              Unfazed Therapist
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              {therapist.name}
            </h1>

            <p className="mt-2 text-indigo-100">
              {therapist.slug}
            </p>
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