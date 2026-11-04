import { INDIAN_STATES } from "./states.js";

// Turns an OpenStreetMap (Nominatim) reverse-geocode result into our checkout fields.
// Only area / city / state / PIN are filled — the shopper always types flat & building themselves.
export function addressFromOsm(result) {
  const a = result?.address || {};
  const uniq = (list) => [...new Set(list.filter(Boolean).map((s) => s.trim()))];
  const area = uniq([a.road, a.neighbourhood, a.residential, a.quarter, a.suburb, a.city_district]).slice(0, 3).join(", ");
  const city = a.city || a.town || a.village || a.municipality || a.county || a.state_district || "";
  const rawState = (a.state || "").toLowerCase();
  const state = INDIAN_STATES.find((s) => s.toLowerCase() === rawState) || INDIAN_STATES.find((s) => rawState && rawState.includes(s.toLowerCase())) || "";
  const pin = String(a.postcode || "").replace(/\s/g, "");
  return {
    area,
    city,
    state,
    pincode: /^[1-9][0-9]{5}$/.test(pin) ? pin : "",
    building: a.building || a.house_name || "",
    countryCode: (a.country_code || "").toLowerCase(),
  };
}
