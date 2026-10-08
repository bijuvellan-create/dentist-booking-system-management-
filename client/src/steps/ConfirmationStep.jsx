import { formatDateLong, formatTime, buildICS } from "../lib.js";

export default function ConfirmationStep({ appointment, onRestart }) {
  const downloadICS = () => {
    const blob = new Blob([buildICS(appointment)], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `appointment-${appointment.reference}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="confirm">
      <div className="slip">
        <div className="slip__badge">
          <span className="slip__tick" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8.5 6.2 11.7 13 4.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="slip__status">
            <b>Appointment confirmed</b>
            A confirmation email is on its way.
          </div>
        </div>

        <div className="slip__ref-label">Appointment reference — keep this</div>
        <div className="slip__ref">{appointment.reference}</div>

        <div className="slip__perf" aria-hidden="true" />

        <dl className="slip__details">
          <div>
            <dt>Patient</dt>
            <dd>{appointment.name}</dd>
          </div>
          <div>
            <dt>Visit</dt>
            <dd>{appointment.service}</dd>
          </div>
          <div>
            <dt>Date & time</dt>
            <dd className="is-big">
              {formatDateLong(appointment.date)}
              <br />
              {formatTime(appointment.time)} · {appointment.duration} min
            </dd>
          </div>
          <div>
            <dt>Where</dt>
            <dd>
              48 Ivory Lane, London N1 7QP
              <span style={{ display: "block", fontWeight: 400, color: "var(--ink-3)" }}>
                Ground floor, step-free access
              </span>
            </dd>
          </div>
        </dl>

        <p className="slip__note">
          Running late or need to move the visit? Call <strong>020 7946 0132</strong> and quote{" "}
          {appointment.reference}.
        </p>
      </div>

      <div className="confirm__actions">
        <button type="button" className="btn btn--primary" onClick={downloadICS}>
          Download calendar file
        </button>
        <button type="button" className="btn btn--ghost" onClick={onRestart}>
          Book another visit
        </button>
      </div>
    </div>
  );
}