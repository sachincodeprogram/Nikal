// Setu's DigiLocker product — lets a user authenticate with DigiLocker
// (Aadhaar-linked mobile OTP) and consent to share a document, without us
// ever touching the raw Aadhaar photo/number ourselves. Docs:
// https://docs.setu.co/data/digilocker/quickstart

const BASE_URL = process.env.SETU_DIGILOCKER_BASE_URL || "https://dg-sandbox.setu.co";

function headers() {
  return {
    "Content-Type": "application/json",
    "x-client-id": process.env.SETU_CLIENT_ID,
    "x-client-secret": process.env.SETU_CLIENT_SECRET,
    "x-product-instance-id": process.env.SETU_PRODUCT_INSTANCE_ID,
  };
}

async function setuFetch(path, options) {
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers: headers() });
  const raw = await res.text();
  let data = {};
  try {
    data = JSON.parse(raw);
  } catch {
    // non-JSON body (e.g. an HTML error page from a proxy/WAF) — fall
    // through and surface the raw text below instead.
  }
  if (!res.ok) {
    const detail = data?.message || data?.errorMessage || raw.slice(0, 300) || "no response body";
    throw new Error(`Setu DigiLocker request failed (${res.status}): ${detail}`);
  }
  return data;
}

// Kicks off a DigiLocker session — the user opens `url` (in a WebView),
// logs in with Aadhaar-linked OTP, and consents to share their Aadhaar.
// DigiLocker then redirects to `redirectUrl` with the outcome in the query
// string (see docs) — the mobile app watches for that redirect itself.
export function createDigilockerRequest(redirectUrl) {
  return setuFetch("/api/digilocker/", {
    method: "POST",
    body: JSON.stringify({ redirectUrl, docType: "ADHAR" }),
  });
}

// Server-side confirmation of what the redirect claimed — never trust the
// query params alone, since they pass through the client.
export function getDigilockerStatus(id) {
  return setuFetch(`/api/digilocker/${id}/status`, { method: "GET" });
}
