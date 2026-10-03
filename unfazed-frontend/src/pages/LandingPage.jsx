import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
const featuredTherapists = [
  {
    name: "Sahil Singh",
    specialty: "Therapist",
    experience: "Private Practice",
    slug: "sahil-singh",
  },
  {
    name: "Dr. Neha Kapoor",
    specialty: "Counselling Psychologist",
    experience: "6+ years experience",
    slug: "dr-neha-kapoor",
  },
  {
    name: "Dr. Rahul Mehta",
    specialty: "Mental Wellness Specialist",
    experience: "10+ years experience",
    slug: "dr-rahul-mehta",
  },
];

function LandingPage() {
  const [hasClientToken, setHasClientToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("unfazed_client_token");
    setHasClientToken(Boolean(token));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            unfazed<span className="text-blue-500">.</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#therapists"
              className="text-sm text-slate-300 hover:text-white"
            >
              Find a Therapist
            </a>

            <a
              href="#how-it-works"
              className="text-sm text-slate-300 hover:text-white"
            >
              How It Works
            </a>

            {hasClientToken ? (
  <Link
    to="/client-portal"
    className="rounded-xl border border-slate-700 px-6 py-3.5 font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
  >
    Open Client Portal
  </Link>
) : (
  <a
    href="#therapists"
    className="rounded-xl border border-slate-700 px-6 py-3.5 font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
  >
    I'm a Client
  </a>
)}

            <Link
              to="/login"
              className="text-sm text-slate-300 hover:text-white"
            >
              Therapist Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium transition hover:bg-blue-500"
            >
              Join as Therapist
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
              Better therapy. Simpler practice.
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              Mental healthcare,
              <span className="text-blue-500"> made simpler.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
              Find the right therapist, book sessions, manage appointments,
              communicate securely, and keep everything organized in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#therapists"
                className="rounded-xl bg-blue-600 px-6 py-3.5 font-medium transition hover:bg-blue-500"
              >
                Find a Therapist
              </a>

              {hasClientToken ? (
                <Link
                  to="/client-portal"
                  className="rounded-xl border border-slate-700 px-6 py-3.5 font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
                >
                  Open Client Portal
                </Link>
              ) : (
                <a
                  href="#therapists"
                  className="rounded-xl border border-slate-700 px-6 py-3.5 font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
                >
                  I'm a Client
                </a>
              )}

              <Link
                to="/register"
                className="rounded-xl border border-slate-700 px-6 py-3.5 font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
              >
                I'm a Therapist
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-8 text-sm text-slate-400">
              <div>
                <p className="text-2xl font-bold text-white">1</p>
                <p>Simple platform</p>
              </div>

              <div>
                <p className="text-2xl font-bold text-white">24/7</p>
                <p>Access to your portal</p>
              </div>

              <div>
                <p className="text-2xl font-bold text-white">Secure</p>
                <p>Client communication</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
              <p className="text-sm text-slate-400">Your therapy journey</p>

              <h2 className="mt-3 text-2xl font-semibold">
                Everything in one place.
              </h2>

              <div className="mt-6 space-y-4">
                {[
                  ["01", "Find your therapist"],
                  ["02", "Choose a convenient session"],
                  ["03", "Book and pay securely"],
                  ["04", "Connect through your portal"],
                ].map(([number, text]) => (
                  <div
                    key={number}
                    className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 text-sm font-semibold text-blue-400">
                      {number}
                    </span>

                    <span className="text-sm text-slate-200">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-wider text-blue-400">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              A simpler way to manage therapy
            </h2>

            <p className="mt-4 text-slate-400">
              From discovering a therapist to attending your session, Unfazed
              brings the important parts of the journey together.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Discover",
                text: "Explore therapist profiles and find someone who matches your needs.",
              },
              {
                number: "02",
                title: "Book",
                text: "Choose a suitable session and complete your booking securely.",
              },
              {
                number: "03",
                title: "Connect",
                text: "Use your client portal to manage sessions and communicate with your therapist.",
              },
            ].map((item) => (
              <div
                key={item.number}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-7"
              >
                <span className="text-sm font-semibold text-blue-400">
                  {item.number}
                </span>

                <h3 className="mt-4 text-xl font-semibold">
                  {item.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Therapists */}
      <section id="therapists" className="border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-blue-400">
                Featured therapists
              </p>

              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                Find the right professional for you
              </h2>

              <p className="mt-4 max-w-2xl text-slate-400">
                Explore therapist profiles, learn about their expertise, and
                choose a professional you feel comfortable with.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {featuredTherapists.map((therapist) => (
              <div
                key={therapist.slug}
                className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-blue-500/40"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10 text-xl font-bold text-blue-400">
                  {therapist.name
                    .split(" ")
                    .slice(0, 2)
                    .map((word) => word[0])
                    .join("")}
                </div>

                <h3 className="mt-5 text-xl font-semibold">
                  {therapist.name}
                </h3>

                <p className="mt-2 text-blue-400">
                  {therapist.specialty}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {therapist.experience}
                </p>

                <Link
                  to={`/${therapist.slug}`}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-slate-700 px-4 py-3 text-sm font-medium transition hover:border-blue-500 hover:bg-blue-500/10"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Therapist CTA */}
      <section className="border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="rounded-3xl border border-blue-500/20 bg-blue-600/10 p-8 md:p-12">
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-wider text-blue-400">
                For therapists
              </p>

              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                Run your private practice from one place.
              </h2>

              <p className="mt-5 leading-7 text-slate-300">
                Manage clients, sessions, notes, payments, communication and
                practice analytics through your therapist dashboard.
              </p>

              <Link
                to="/register"
                className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3.5 font-medium transition hover:bg-blue-500"
              >
                Create Therapist Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} Unfazed. All rights reserved.
          </p>

          <p>Better therapy. Simpler practice.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;