import fs from "node:fs";
import path from "node:path";

export const SERVICES = [
  { id: "checkup", name: "Check-up & exam", duration: 30, price: 65, note: "Full exam, digital x-rays if needed" },
  { id: "hygiene", name: "Hygiene cleaning", duration: 45, price: 85, note: "Scale, polish and fluoride rinse" },
  { id: "filling", name: "Filling / restoration", duration: 60, price: 140, note: "White composite filling" },
  { id: "whitening", name: "Whitening consultation", duration: 30, price: 50, note: "Shade assessment and plan" },
  { id: "rootcanal", name: "Root canal treatment", duration: 90, price: 320, note: "Single canal, one visit" },
  { id: "extraction", name: "Extraction", duration: 45, price: 180, note: "Simple removal, aftercare included" },
  { id: "ortho", name: "Orthodontic consult", duration: 30, price: 0, note: "Braces and aligner options" },
];

const CLINIC = {
  weekdayOpen: 9 * 60,
  weekdayClose: 17 * 60,
  saturdayOpen: 9 * 60,
  saturdayClose: 13 * 60,
  breakStart: 12 * 60 + 30,
  breakEnd: 13 * 60 + 30,
  slotMinutes: 30,
  daysAhead: 30,
};

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "appointments.json");

let appointments = [];

function load() {
  try {
    appointments = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    appointments = [];
  }
}

function persist() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(appointments, null, 2));
  } catch {
    // Read-only filesystem: keep running from memory.
  }
}

load();

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHHMM(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function parseDate(date) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function isWeekday(date) {
  const day = parseDate(date).getUTCDay();
  return day >= 1 && day <= 5;
}

function isOpenDay(date) {
  return parseDate(date).getUTCDay() !== 0;
}

function todayISO() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function openWindow(date) {
  if (isWeekday(date)) return [CLINIC.weekdayOpen, CLINIC.weekdayClose];
  if (parseDate(date).getUTCDay() === 6) return [CLINIC.saturdayOpen, CLINIC.saturdayClose];
  return null;
}

export function getSlots(date) {
  const window = isOpenDay(date) ? openWindow(date) : null;
  if (!window) return [];

  const [open, close] = window;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isToday = date === todayISO();

  const taken = new Set(appointments.filter((a) => a.date === date && a.status !== "cancelled").map((a) => a.time));

  const slots = [];
  for (let start = open; start + CLINIC.slotMinutes <= close; start += CLINIC.slotMinutes) {
    const end = start + CLINIC.slotMinutes;
    const overlapsBreak =
      isWeekday(date) && start < CLINIC.breakEnd && end > CLINIC.breakStart;
    if (overlapsBreak) continue;

    const time = toHHMM(start);
    const past = isToday && start <= nowMinutes + 30;

    slots.push({ time, taken: taken.has(time), past });
  }
  return slots;
}

function validate(body) {
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();
  const date = String(body.date || "");
  const time = String(body.time || "");
  const service = SERVICES.find((s) => s.id === body.serviceId);

  if (name.length < 2) return { error: "Enter the patient's full name.", status: 400 };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address.", status: 400 };
  if (phone.replace(/\D/g, "").length < 7) return { error: "Enter a valid phone number.", status: 400 };
  if (!service) return { error: "Choose a service.", status: 400 };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Choose a date.", status: 400 };
  if (!/^\d{2}:\d{2}$/.test(time)) return { error: "Choose a time.", status: 400 };

  const diff = (parseDate(date).getTime() - parseDate(todayISO()).getTime()) / 86400000;
  if (diff < 0) return { error: "That date has already passed.", status: 400 };
  if (diff > CLINIC.daysAhead) return { error: `We only book up to ${CLINIC.daysAhead} days ahead.`, status: 400 };
  if (!isOpenDay(date)) return { error: "The clinic is closed on Sundays.", status: 400 };

  const slot = getSlots(date).find((s) => s.time === time);
  if (!slot) return { error: "That time is outside clinic hours.", status: 400 };
  if (slot.past) return { error: "That time has already passed. Pick a later slot.", status: 400 };
  if (slot.taken) return { error: "That slot was just booked. Pick another time.", status: 409 };

  return { service, name, email, phone, date, time };
}

function makeReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `PD-${code}`;
}

export function createAppointment(body) {
  const check = validate(body);
  if (check.error) return { error: check.error, status: check.status };

  const appointment = {
    reference: makeReference(),
    name: check.name,
    email: check.email,
    phone: check.phone,
    serviceId: check.service.id,
    service: check.service.name,
    duration: check.service.duration,
    date: check.date,
    time: check.time,
    notes: String(body.notes || "").trim().slice(0, 400),
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  appointments.push(appointment);
  persist();
  return { appointment };
}

export function listAppointments() {
  return appointments.map(({ notes, ...rest }) => rest);
}

export function findAppointment(reference) {
  const found = appointments.find((a) => a.reference === reference);
  if (!found) return null;
  const { notes, ...rest } = found;
  return rest;
}

export { CLINIC };
