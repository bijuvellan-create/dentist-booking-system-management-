const BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

export const getServices = () => request("/api/services");
export const getSlots = (date) => request(`/api/slots?date=${date}`);
export const bookAppointment = (payload) =>
  request("/api/appointments", { method: "POST", body: JSON.stringify(payload) });
