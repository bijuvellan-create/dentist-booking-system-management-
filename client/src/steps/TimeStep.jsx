import { useEffect, useState } from "react";
import { getSlots } from "../api.js";
import { formatDateShort, formatTime, openDates } from "../lib.js";

export default function TimeStep({ date, time, setDate, setTime, onBack, onNext }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dates = openDates(14);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    getSlots(date)
      .then((data) => {
        if (!alive) return;
        setSlots(data.slots);
        const stillValid = data.slots.some((s) => s.time === time && !s.taken && !s.past);
        if (!stillValid) setTime("");
      })
      .catch((err) => {
        if (alive) setError(err.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const pickDate = (iso) => {
    setDate(iso);
    setTime("");
  };

  const morning = slots.filter((s) => Number(s.time.split(":")[0]) < 12);
  const afternoon = slots.filter((s) => Number(s.time.split(":")[0]) >= 12);
  const openCount = slots.filter((s) => !s.taken && !s.past).length;

  const renderGroup = (label, group) => {
    if (!group.length) return null;
    return (
      <div className="time-group" key={label}>
        <div className="time-group__label">{label}</div>
        <div className="time-grid">
          {group.map((slot) => {
            const disabled = slot.taken || slot.past;
            const state = slot.past ? "is-past" : slot.taken ? "is-taken" : "";
            return (
              <button
                type="button"
                key={slot.time}
                className={`slot ${state} ${time === slot.time ? "is-selected" : ""}`}
                disabled={disabled}
                aria-pressed={time === slot.time}
                aria-label={`${formatTime(slot.time)}${slot.taken ? " — booked" : ""}`}
                onClick={() => setTime(slot.time)}
              >
                {slot.time}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="booking__head">
        <h2 className="booking__title">When suits you?</h2>
        <p className="booking__hint">
          Clinic hours: 9:00–17:00 weekdays, 9:00–13:00 Saturday. Closed Sunday.
        </p>
      </div>

      <div className="date-strip" role="group" aria-label="Choose a date">
        {dates.map((iso) => (
          <button
            type="button"
            key={iso}
            className={`date ${iso === date ? "is-selected" : ""}`}
            aria-pressed={iso === date}
            onClick={() => pickDate(iso)}
          >
            <span className="date__dow">{formatDateShort(iso).slice(0, 3)}</span>
            <span className="date__num">{iso.slice(8, 10)}</span>
            <span className="date__mon">{formatDateShort(iso).slice(4, 7)}</span>
          </button>
        ))}
      </div>

      {error && <div className="banner" role="alert">{error}</div>}

      {loading ? (
        <div className="empty-note" style={{ marginTop: 22 }}>Loading available times…</div>
      ) : openCount === 0 ? (
        <div className="empty-note" style={{ marginTop: 22 }}>
          <b>No times left on {formatDateShort(date)}.</b>
          Try the next day — we release new slots daily.
        </div>
      ) : (
        <>
          {renderGroup("Morning", morning)}
          {renderGroup("Afternoon", afternoon)}
        </>
      )}

      <div className="booking__foot">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn btn--primary" disabled={!time || loading} onClick={onNext}>
          {time ? `Continue with ${formatDateShort(date)}, ${formatTime(time)}` : "Pick a time"}
        </button>
      </div>
    </>
  );
}
