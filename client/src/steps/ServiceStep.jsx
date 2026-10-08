export default function ServiceStep({ services, selected, onSelect, onNext }) {
  return (
    <>
      <div className="booking__head">
        <h2 className="booking__title">What do you need?</h2>
        <p className="booking__hint">Pick the visit type so we can hold the right amount of time.</p>
      </div>

      <div className="services">
        {services.map((service) => {
          const isSelected = service.id === selected;
          return (
            <button
              type="button"
              key={service.id}
              className={`service ${isSelected ? "is-selected" : ""}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(service.id)}
            >
              <span className="service__check" aria-hidden="true">
                {isSelected && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6.4 4.8 8.7 9.5 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="service__body">
                <span className="service__name">{service.name}</span>
                <span className="service__note">{service.note}</span>
              </span>
              <span className="service__meta">
                <span className="service__duration">{service.duration} min</span>
                <span className="service__price">
                  {service.price === 0 ? "No charge" : `£${service.price}`}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="booking__foot">
        <span className="booking__foot-note">Prices are a guide — we confirm before treatment.</span>
        <button type="button" className="btn btn--primary" disabled={!selected} onClick={onNext}>
          Choose a time
        </button>
      </div>
    </>
  );
}
