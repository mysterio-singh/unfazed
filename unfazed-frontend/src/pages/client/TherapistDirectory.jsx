
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

function TherapistDirectory() {
  const [therapists, setTherapists] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const response = await axiosInstance.get("/therapist/public");

        if (response.data.success) {
          setTherapists(response.data.therapists || []);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load therapists. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  const filteredTherapists = therapists.filter((therapist) => {
    const searchText = search.toLowerCase().trim();

    return (
      therapist.name?.toLowerCase().includes(searchText) ||
      therapist.specializations?.some((item) =>
        item.toLowerCase().includes(searchText)
      ) ||
      therapist.languages?.some((item) =>
        item.toLowerCase().includes(searchText)
      )
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/"
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          ← Back to Home
        </Link>

        <div className="mt-8">
          <p className="text-sm font-medium uppercase tracking-wider text-blue-400">
            Unfazed Directory
          </p>

          <h1 className="mt-3 text-3xl font-bold md:text-5xl">
            Explore All Therapists
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Discover professionals by name, specialization, or language.
            Find someone who matches your needs.
          </p>
        </div>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, specialization, or language..."
          className="mt-8 w-full rounded-xl border border-slate-700 bg-slate-900 px-5 py-4 text-white outline-none focus:border-blue-500 md:max-w-xl"
        />

        {loading && (
          <p className="mt-10 text-slate-400">
            Loading therapists...
          </p>
        )}

        {error && (
          <p className="mt-10 text-red-400">{error}</p>
        )}

        {!loading && !error && (
          <>
            <p className="mt-6 text-sm text-slate-400">
              {filteredTherapists.length} therapist
              {filteredTherapists.length !== 1 ? "s" : ""} found
            </p>

            {filteredTherapists.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                <h2 className="text-xl font-semibold">
                  No therapists found
                </h2>
                <p className="mt-2 text-slate-400">
                  Try another name or search term.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTherapists.map((therapist) => (
                  <article
                    key={therapist._id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-blue-500/50"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10 text-xl font-bold text-blue-400">
                      {therapist.name
                        ?.split(" ")
                        .slice(0, 2)
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase()}
                    </div>

                    <h2 className="mt-5 text-xl font-semibold">
                      {therapist.name}
                    </h2>

                    
<p className="mt-2 text-sm text-slate-400">
  {therapist.specializations?.filter((item) => item?.trim()).length
    ? therapist.specializations
        .filter((item) => item?.trim())
        .join(" · ")
    : "Specialization not added yet"}
</p>


                    {therapist.experienceYears != null && (
  <p className="mt-2 text-sm text-slate-400">
    {therapist.experienceYears} years of experience
  </p>
)}

                    
{therapist.languages?.some((item) => item?.trim()) && (
  <p className="mt-2 text-sm text-slate-400">
    Languages:{" "}
    {therapist.languages
      .filter((item) => item?.trim())
      .join(", ")}
  </p>
)}

{therapist.bio?.trim() && (
  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">
    {therapist.bio}
  </p>
)}

                    <div className="mt-6 flex flex-col gap-3">
                      <Link
                        to={`/${therapist.slug}`}
                        className="rounded-lg border border-slate-700 px-4 py-3 text-center text-sm font-medium hover:border-blue-500 hover:bg-blue-500/10"
                      >
                        View Profile
                      </Link>

                      <Link
                        to={`/booking/${therapist.slug}`}
                        className="rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-medium hover:bg-blue-500"
                      >
                        Book Session
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TherapistDirectory;
