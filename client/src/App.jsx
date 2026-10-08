import { useEffect, useState } from "react";
import { getServices, getSlots, bookAppointment } from "./api.js";
import { todayISO, openDates, formatDateShort, formatTime } from "./lib.js";
import Steps from "./components/Steps.jsx";
import ServiceStep from "./steps/ServiceStep.jsx";
import TimeStep from "./steps/TimeStep.jsx";
import DetailsStep from "./steps/DetailsStep.jsx";
import ConfirmationStep from "./steps/ConfirmationStep.jsx";

function App() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(() => openDates(1)[0]);
  const [time, setTime] = useState("");
  const [patient, setPatient] = useState({ name: "", email: "", phone: "", notes: "" });
  const [appointment, setAppointment] = useState(null);
  const [nextOpen, setNextOpen] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getServices()
      .then(setServices)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    const days = [todayISO()];
    const cursor = new Date();
    cursor.setDate(cursor.getDate() + 1);
    days.push(
      `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(
        cursor.getDate()
      ).padStart(2, "0")}`
    );

    let alive = true;
    (async () => {
      for (const iso of days) {
        try {
          const { slots } = await getSlots(iso);
          const free = slots.find((s) => !s.taken && !s.past);
          if (free && alive) {
            setNextOpen({ date: iso, time: free.time });
            return;
          }
        } catch {
          // ignore — panel just won't show
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const service = services.find((s) => s.id === serviceId) || null;

  const submit = async () => {
    if (!service || !date || !time) return;
    setError("");
    setSubmitting(true);
    try {
      const booked = await bookAppointment({
        ...patient,
        serviceId: service.id,
        date,
        time,
      });
      setAppointment(booked);
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setStep(1);
    setServiceId("");
    setDate(openDates(1)[0]);
    setTime("");
    setPatient({ name: "", email: "", phone: "", notes: "" });
    setAppointment(null);
    setError("");
  };

  const jump = (target) => {
    if (target < step && step <= 3) {
      setError("");
      setStep(target);
    }
  };

  return (
    <>
      <header className="topbar">
        <div className="shell topbar__inner">
          <a href="/" className="brand" style={{ textDecoration: "none", color: "inherit" }}>
            <svg className="brand__mark" viewBox="0 0 32 32" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="#0F7B6C" />
              <path
                d="M16 7c-3.5 0-5 1.6-8 1.6-1.7 0-3 1.5-3 3.8 0 3.4 1.6 6 2.6 9.4.7 2.4 1 5.2 2.6 5.2 1.9 0 1.6-4.4 3.4-4.4h3.2c1.8 0 1.5 4.4 3.4 4.4 1.6 0 1.9-2.8 2.6-5.2 1-3.4 2.6-6 2.6-9.4 0-2.3-1.3-3.8-3-3.8-3 0-4.5-1.6-8-1.6z"
                fill="#fff"
              />
            </svg>
            <span>
              <span className="brand__name">Porcelain Dental Studio</span>
              <span className="brand__tag">General, cosmetic &amp; emergency dentistry</span>
            </span>
          </a>
          <div className="topbar__contact">
            <span>
              New and returning patients ·{" "}
              <a href="tel:+442079460132">020 7946 0132</a>
            </span>
            <span className="topbar__emergency">After-hours emergencies call the same line</span>
          </div>
        </div>
      </header>

      <main className="shell hero">
        <div className="hero__intro">
          <h1 className="hero__title">Dental appointments, booked without the phone call.</h1>
          <p className="hero__lede">
            Choose a service, pick a time that fits your day, and add who’s coming. You’ll leave
            with a reference number and a confirmed slot.
          </p>

          {nextOpen && (
            <div className="next-open">
              <span className="next-open__dot" aria-hidden="true" />
              <span>
                Next opening — <strong>{formatDateShort(nextOpen.date)}, {formatTime(nextOpen.time)}</strong>
              </span>
            </div>
          )}

          <dl className="facts">
            <div className="facts__row">
              <dt>Where</dt>
              <dd>
                48 Ivory Lane, London N1 7QP
                <span>Two minutes from Old Street station</span>
              </dd>
            </div>
            <div className="facts__row">
              <dt>Hours</dt>
              <dd>
                Mon–Fri 9:00–17:00
                <span>Sat 9:00–13:00 · Sun closed</span>
              </dd>
            </div>
            <div className="facts__row">
              <dt>Good to know</dt>
              <dd>
                NHS and private options
                <span>Cancellations free up to 24 hours ahead</span>
              </dd>
            </div>
          </dl>
        </div>

        <section className="booking" aria-label="Booking form">
          <Steps step={step} onJump={jump} />
          <div className="booking__body" key={step}>
            {step === 1 && (
              <ServiceStep
                services={services}
                selected={serviceId}
                onSelect={setServiceId}
                onNext={() => {
                  setError("");
                  setStep(2);
                }}
              />
            )}
            {step === 2 && (
              <TimeStep
                date={date}
                time={time}
                setDate={setDate}
                setTime={setTime}
                onBack={() => setStep(1)}
                onNext={() => {
                  setError("");
                  setStep(3);
                }}
              />
            )}
            {step === 3 && (
              <DetailsStep
                service={service}
                date={date}
                time={time}
                patient={patient}
                setPatient={setPatient}
                error={error}
                submitting={submitting}
                onBack={() => setStep(2)}
                onSubmit={submit}
                onEdit={setStep}
              />
            )}
            {step === 4 && <ConfirmationStep appointment={appointment} onRestart={restart} />}
          </div>
        </section>
      </main>

      <footer className="foot shell">
        <span>© {new Date().getFullYear()} Porcelain Dental Studio, 48 Ivory Lane, London N1 7QP</span>
        <span>Managed under the General Dental Council · Registration 128476</span>
      </footer>
    </>
  );
}

export default App;