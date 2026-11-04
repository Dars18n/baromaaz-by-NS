import { NextResponse } from "next/server";
import { addressFromOsm } from "@/lib/geocode";
import { SITE } from "@/lib/site";

// Reverse geocoding: phone location (lat/lon) → area, city, state, PIN.
// Uses OpenStreetMap's free Nominatim service (fair-use: ~1 request/second, which is plenty for checkout).
// To switch to Google later, only this file needs to change.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "Missing location" }, { status: 400 });
  }
  // India only (rough bounding box)
  if (lat < 6 || lat > 37.5 || lon < 68 || lon > 97.5) {
    return NextResponse.json({ error: "We currently deliver only within India." }, { status: 422 });
  }
  // ~11 m precision is enough for an address and lets repeat lookups hit the cache
  const la = lat.toFixed(4);
  const lo = lon.toFixed(4);
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${la}&lon=${lo}&zoom=18&addressdetails=1&accept-language=en`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": `Baromaaz-Checkout/1.0 (${SITE.url})`, Referer: SITE.url },
      next: { revalidate: 60 * 60 * 24 * 7 }, // cache each spot for a week
    });
    if (!res.ok) throw new Error(`OSM ${res.status}`);
    const data = await res.json();
    const address = addressFromOsm(data);
    if (address.countryCode && address.countryCode !== "in") {
      return NextResponse.json({ error: "We currently deliver only within India." }, { status: 422 });
    }
    return NextResponse.json({ address, label: data.display_name || "" });
  } catch {
    return NextResponse.json({ error: "Couldn't look up your address right now — please type it in." }, { status: 502 });
  }
}
