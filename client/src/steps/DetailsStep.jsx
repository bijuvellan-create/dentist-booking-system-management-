import { formatDateShort, formatTime } from "../lib.js";

export default function DetailsStep({
  service,
  date,
  time,
  patient,
  setPatient,
  error,
  submitting,
  onBack,
  onSubmit,
  onEdit,
}) {
  const set = (key) => (e) => setPatient((p) => ({ ...p, [key]: e.target.value }));

  return (
    <>
      <div className="booking__head">
        <h2 className="booking__title">Tell us who’s coming</h2>
        <p className="booking__hint">We use these details to confirm the visit — never for marketing.</p>
      </div>

      <div className="summary">
        <div className="summary__item">
          <span className="summary__label">Visit</span>
          <span className="summary__value">{service.name}</span>
        </div>
        <div className="summary__item">
          <span className="summary__label">When</span>
          <span className="summary__value">
            {formatDateShort(date)}, {formatTime(time)}
          </span>
        </div>
        <button type="button" className="summary__edit" onClick={() => onEdit(2)}>
          Change
        </button>
      </div>

      {error && (
        <div className="banner" role="alert">
          {error}
        </div>
      )}

      <form
        className="form-grid"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="field field--full">
          <label htmlFor="name">
            Full name <span aria-hidden="true">· required</span>
          </label>
          <input
            id="name"
            autoComplete="name"
            placeholder="e.g. Amara Okafor"
            value={patient.name}
            onChange={set("name")}
          />
        </div>

        <div className="field">
          <label htmlFor="email">
            Email <span aria-hidden="true">· required</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={patient.email}
            onChange={set("email")}
          />
        </div>

        <div className="field">
          <label htmlFor="phone">
            Phone <span aria-hidden="true">· required</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="07123 456789"
            value={patient.phone}
            onChange={set("phone")}
          />
        </div>

        <div className="field field--full">
          <label htmlFor="notes">
            Anything we should know? <span>· optional</span>
          </label>
          <textarea
            id="notes"
            placeholder="Sensitivity, recent treatment, questions for the dentist…"
            value={patient.notes}
            onChange={set("notes")}
          />
        </div>

        <div className="booking__foot" style={{ gridColumn: "1 / -1" }}>
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            Back
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? "Holding your slot…" : "Confirm appointment"}
          </button>
        </div>
      </form>
    </>
  );
}