const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

function parseISO(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDateShort(iso) {
  const d = parseISO(iso);
  return `${DOW[d.getUTCDay()]} ${d.getUTCDate()} ${MON[d.getUTCMonth()]}`;
}

export function formatDateLong(iso) {
  const d = parseISO(iso);
  const full = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const fullMon = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${full[d.getUTCDay()]}, ${d.getUTCDate()} ${fullMon[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatTime(iso) {
  const [h, m] = iso.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function openDates(count = 14) {
  const dates = [];
  const cursor = new Date();
  while (dates.length < count) {
    const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(
      cursor.getDate()
    ).padStart(2, "0")}`;
    if (cursor.getDay() !== 0) dates.push(iso);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function buildICS({ name, service, date, time, reference }) {
  const start = `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
  const [h, m] = time.split(":").map(Number);
  const endMinutes = h * 60 + m + 30;
  const end = `${date.replace(/-/g, "")}T${String(Math.floor(endMinutes / 60)).padStart(2, "0")}${String(
    endMinutes % 60
  ).padStart(2, "0")}00`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Porcelain Dental Studio//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${reference}@porcelaindental.example`,
    `SUMMARY:${service} — Porcelain Dental Studio`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `DESCRIPTION:Appointment ${reference} for ${name}.`,
    "LOCATION:48 Ivory Lane\\, London\\, N1 7QP",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
