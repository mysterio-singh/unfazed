import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const generateTimeSlots = (startTime, endTime, duration, buffer) => {
  const slots = [];

  const [startHour, startMinute] = startTime
    .split(":")
    .map(Number);

  const [endHour, endMinute] = endTime
    .split(":")
    .map(Number);

  let currentMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  const slotDuration = Number(duration);
  const slotBuffer = Number(buffer);

  while (currentMinutes + slotDuration <= endMinutes) {
    const slotEnd = currentMinutes + slotDuration;

    const formatTime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;

      return `${String(hours).padStart(2, "0")}:${String(
        mins
      ).padStart(2, "0")}`;
    };

    slots.push({
      startTime: formatTime(currentMinutes),
      endTime: formatTime(slotEnd),
    });

    currentMinutes += slotDuration + slotBuffer;
  }

  return slots;
};

function BookingPage() {
  const { slug } = useParams();

useEffect(() => {
  const script = document.createElement("script");

  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;

  document.body.appendChild(script);

  return () => {
    document.body.removeChild(script);
  };
}, []);


  const [therapist, setTherapist] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [showBookingForm, setShowBookingForm] = useState(false);
const [bookingForm, setBookingForm] = useState({
  name: "",
  email: "",
  phone: "",
  consentGiven: false,
});
const [bookingLoading, setBookingLoading] = useState(false);
const [bookingMessage, setBookingMessage] = useState("");

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        setLoading(true);
        setError("");

        const therapistResponse = await axiosInstance.get(
          `/therapist/public/${slug}`
        );

        const availabilityResponse = await axiosInstance.get(
          `/scheduling/public/${slug}/availability`
        );

        if (therapistResponse.data.success) {
          setTherapist(therapistResponse.data.therapist);
        }

        if (availabilityResponse.data.success) {
          setAvailability(
            availabilityResponse.data.availability || []
          );
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load booking page"
        );
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadBookingData();
    }
  }, [slug]);

const handleConfirmBooking = async () => {
  try {
    setBookingLoading(true);
    setBookingMessage("");

    if (!selectedSlot || !selectedDate) {
      setBookingMessage("Please select a date and time slot.");
      return;
    }

    if (!bookingForm.name.trim()) {
      setBookingMessage("Please enter your name.");
      return;
    }

    if (!bookingForm.email.trim()) {
      setBookingMessage("Please enter your email.");
      return;
    }

    if (!bookingForm.consentGiven) {
      setBookingMessage(
        "Please provide consent before booking."
      );
      return;
    }

    if (!window.Razorpay) {
      setBookingMessage(
        "Payment system is still loading. Please try again."
      );
      return;
    }

    const startAt = new Date(
      `${selectedDate}T${selectedSlot.startTime}:00`
    ).toISOString();

    /*
      Temporary test price.
      Later this will come from the Package / Entitlement system
      instead of being sent from the frontend.
    */
    const amount = 100;

    const response = await axiosInstance.post(
      `/payments/public/${slug}/create-order`,
      {
        name: bookingForm.name.trim(),
        email: bookingForm.email.trim(),
        phone: bookingForm.phone.trim(),
        startAt,
        durationMinutes: selectedSlot.durationMinutes,
        timezone: "Asia/Kolkata",
        consentGiven: bookingForm.consentGiven,
        amount,
      }
    );

    if (!response.data.success) {
      setBookingMessage(
        response.data.message ||
          "Unable to create payment order."
      );
      return;
    }

    const {
      order,
      payment,
      session,
      keyId,
    } = response.data;

    const options = {
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: "Unfazed",
      description: "Therapy Session Booking",
      order_id: order.id,

      handler: async function (paymentResponse) {
        try {
          setBookingMessage(
            "Verifying your payment..."
          );

          const verifyResponse =
            await axiosInstance.post(
              "/payments/public/verify",
              {
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,

                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,

                razorpay_signature:
                  paymentResponse.razorpay_signature,

                paymentId: payment.id,
                sessionId: session.id,
              }
            );

          if (verifyResponse.data.success) {
            setBookingMessage(
              "Payment successful! Your session is confirmed 🎉"
            );
          } else {
            setBookingMessage(
              verifyResponse.data.message ||
                "Payment verification failed."
            );
          }
        } catch (error) {
          setBookingMessage(
            error.response?.data?.message ||
              "Payment verification failed."
          );
        }
      },

      prefill: {
        name: bookingForm.name.trim(),
        email: bookingForm.email.trim(),
        contact: bookingForm.phone.trim(),
      },

      theme: {
        color: "#2563eb",
      },

      modal: {
        ondismiss: function () {
          setBookingMessage(
            "Payment was cancelled. Your slot is still pending payment."
          );
        },
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on(
      "payment.failed",
      function (response) {
        console.error(
          "Razorpay payment failed:",
          response.error
        );

        setBookingMessage(
          response.error?.description ||
            "Payment failed. Please try again."
        );
      }
    );

    razorpay.open();
  } catch (error) {
    setBookingMessage(
      error.response?.data?.message ||
        "Unable to start payment."
    );
  } finally {
    setBookingLoading(false);
  }
};


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-slate-400">
          Loading booking page...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 text-white">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <h1 className="text-xl font-semibold text-red-300">
            Unable to load booking page
          </h1>

          <p className="mt-2 text-red-200/70">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const weeklyAvailability = availability.filter(
    (slot) => slot.type === "weekly"
  );

  const overrideAvailability = availability.filter(
    (slot) => slot.type === "override"
  );

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <p className="text-sm font-medium text-blue-400">
            Unfazed
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Book a Session
          </h1>

          {therapist && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold">
                {therapist.name}
              </h2>

              {therapist.bio && (
                <p className="mt-2 text-slate-400">
                  {therapist.bio}
                </p>
              )}

              {therapist.specializations?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {therapist.specializations.map(
                    (specialization) => (
                      <span
                        key={specialization}
                        className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-300"
                      >
                        {specialization}
                      </span>
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Weekly Availability */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-semibold">
            Weekly Availability
          </h3>

          <div className="mt-5">
  <label className="block text-sm font-medium text-slate-300">
    Select Date
  </label>

  <input
    type="date"
    value={selectedDate}
    onChange={(e) => {
      setSelectedDate(e.target.value);
      setSelectedSlot(null);
    }}
    min={new Date().toISOString().split("T")[0]}
    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
  />
</div>

          <p className="mt-1 text-sm text-slate-400">
            Choose a suitable day and time for your session.
          </p>

          {weeklyAvailability.length === 0 ? (
            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-5 text-center">
              <p className="text-slate-400">
                No weekly availability is currently available.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {weeklyAvailability.map((slot) => (
                <div
                  key={slot._id}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white">
                      {daysOfWeek[slot.dayOfWeek]}
                    </h4>

                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                      {slot.sessionDuration} min
                    </span>
                {selectedDate && selectedSlot && (
                    <div className="mt-6 rounded-xl border border-blue-500/30 bg-blue-500/10 p-5">
                    <p className="text-sm text-blue-300">
      Selected appointment
    </p>

    <h4 className="mt-2 text-lg font-semibold text-white">
      {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )}
    </h4>

    <p className="mt-1 text-blue-400">
      {selectedSlot.startTime} – {selectedSlot.endTime}
    </p>

    <p className="mt-2 text-sm text-slate-400">
      {selectedSlot.durationMinutes} minute session
    </p>
    {/* <button
  type="button"
  onClick={() => {
    setShowBookingForm(true);
    setBookingMessage("");
  }}
  className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-500"
>
  Book This Session
</button> */}


  <div className="mt-5 rounded-xl border border-slate-700 bg-slate-900 p-5">
    <h4 className="text-lg font-semibold text-white">
      Your Details
    </h4>

    <div className="mt-4 space-y-4">
      <input
        type="text"
        placeholder="Full Name"
        value={bookingForm.name}
        onChange={(e) =>
          setBookingForm({
            ...bookingForm,
            name: e.target.value,
          })
        }
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
      />

      <input
        type="email"
        placeholder="Email Address"
        value={bookingForm.email}
        onChange={(e) =>
          setBookingForm({
            ...bookingForm,
            email: e.target.value,
          })
        }
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
      />

      <input
        type="tel"
        placeholder="Phone Number"
        value={bookingForm.phone}
        onChange={(e) =>
          setBookingForm({
            ...bookingForm,
            phone: e.target.value,
          })
        }
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
      />

      <label className="flex items-start gap-3 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={bookingForm.consentGiven}
          onChange={(e) =>
            setBookingForm({
              ...bookingForm,
              consentGiven: e.target.checked,
            })
          }
          className="mt-1 h-4 w-4"
        />

        <span>
          I agree to provide my information and consent to
          booking this therapy session.
        </span>
      </label>

      <button
  type="button"
  onClick={handleConfirmBooking}
  disabled={bookingLoading}
  className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
>
  {bookingLoading ? "Booking..." : "Confirm Booking"}
</button>

{bookingMessage && (
  <p className="mt-3 text-center text-sm text-slate-300">
    {bookingMessage}
  </p>
)}

    </div>
  </div>
)

  </div>
)}
                  </div>

                  <div className="mt-4 space-y-2">
  {generateTimeSlots(
    slot.startTime,
    slot.endTime,
    slot.sessionDuration,
    slot.bufferMinutes
  ).map((timeSlot) => (
    <button
  key={`${slot._id}-${timeSlot.startTime}`}
  type="button"
  onClick={() => {
    setSelectedSlot({
      ...timeSlot,
      availabilityId: slot._id,
      durationMinutes: slot.sessionDuration,
    });
  }}
  className={`w-full rounded-lg border px-4 py-3 text-left transition ${
    selectedSlot?.availabilityId === slot._id &&
    selectedSlot?.startTime === timeSlot.startTime
      ? "border-blue-500 bg-blue-500/10"
      : "border-slate-700 bg-slate-900 hover:border-blue-500 hover:bg-blue-500/10"
  }`}
>
      <span className="font-medium text-white">
        {timeSlot.startTime} – {timeSlot.endTime}
      </span>

      <span className="ml-2 text-xs text-slate-500">
        {slot.sessionDuration} min
      </span>
    </button>
  ))}
</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Override Availability */}
        {overrideAvailability.length > 0 && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-xl font-semibold">
              Special Availability
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              These are additional date-specific appointment
              timings.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {overrideAvailability.map((slot) => (
                <div
                  key={slot._id}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                >
                  <h4 className="font-semibold">
                    {new Date(slot.date).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </h4>

                  <p className="mt-3 text-lg font-medium text-blue-400">
                    {slot.startTime} – {slot.endTime}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    {slot.sessionDuration} min session
                  </p>

                  <button
                    type="button"
                    className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
                  >
                    Select this time
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default BookingPage;