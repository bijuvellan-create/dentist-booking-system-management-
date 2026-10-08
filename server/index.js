import express from "express";
import cors from "cors";
import { SERVICES, getSlots, listAppointments, createAppointment, findAppointment } from "./store.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", clinic: "Porcelain Dental Studio", time: new Date().toISOString() });
});

app.get("/api/services", (_req, res) => {
  res.json(SERVICES);
});

app.get("/api/slots", (req, res) => {
  const date = String(req.query.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "Provide a date as YYYY-MM-DD." });
  }
  res.json({ date, slots: getSlots(date) });
});

app.post("/api/appointments", (req, res) => {
  const result = createAppointment(req.body || {});
  if (result.error) return res.status(result.status).json({ error: result.error });
  res.status(201).json(result.appointment);
});

app.get("/api/appointments", (_req, res) => {
  res.json(listAppointments());
});

app.get("/api/appointments/:reference", (req, res) => {
  const appointment = findAppointment(req.params.reference.toUpperCase());
  if (!appointment) return res.status(404).json({ error: "No appointment found for that reference." });
  res.json(appointment);
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Endpoint not found." });
});

app.listen(PORT, () => {
  console.log(`Porcelain Dental API listening on :${PORT}`);
});
