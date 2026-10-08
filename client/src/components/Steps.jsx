const LABELS = ["Service", "Date & time", "Your details", "Confirmed"];

export default function Steps({ step, onJump }) {
  return (
    <>
      <ol className="steps">
        {LABELS.map((label, i) => {
          const index = i + 1;
          const state =
            index === step ? "is-active" : index < step ? "is-done" : "";
          return (
            <li
              key={label}
              className={`steps__item ${state}`}
              aria-current={index === step ? "step" : undefined}
            >
              {index < step ? (
                <button
                  type="button"
                  className="steps__jump"
                  onClick={() => onJump(index)}
                  style={{
                    background: "none",
                    border: 0,
                    padding: 0,
                    font: "inherit",
                    color: "inherit",
                    cursor: "pointer",
                  }}
                >
                  <span className="steps__num">{String(index).padStart(2, "0")}</span>
                  {label}
                </button>
              ) : (
                <>
                  <span className="steps__num">{String(index).padStart(2, "0")}</span>
                  {label}
                </>
              )}
            </li>
          );
        })}
      </ol>
      <div className="steps__mobile">
        Step <b>{step}</b> of 4 · <b>{LABELS[step - 1]}</b>
      </div>
    </>
  );
}
