export interface PincodeValidationResult {
  valid: boolean;
  city?: string;
  state?: string;
  serviceable: boolean;
  codAvailable: boolean;
  error?: string;
}

export async function validateIndianPincode(
  pincode: string,
  settings?: { mode: string; pincodes: string } | null
): Promise<PincodeValidationResult> {
  if (!/^\d{6}$/.test(pincode)) {
    return {
      valid: false,
      serviceable: false,
      codAvailable: false,
      error: "Please enter a valid 6-digit numeric pincode.",
    };
  }

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    if (!res.ok) {
      throw new Error(`API response status ${res.status}`);
    }

    const data = await res.json();
    if (!data || !Array.isArray(data) || data.length === 0) {
      return fallbackOffline(pincode, settings);
    }

    const result = data[0];
    if (result.Status !== "Success" || !result.PostOffice || result.PostOffice.length === 0) {
      return {
        valid: false,
        serviceable: false,
        codAvailable: false,
        error: "Invalid pincode. No records found for this area.",
      };
    }

    // Pincode is valid in India!
    const postOffice = result.PostOffice[0];
    const city = postOffice.District || postOffice.Block || postOffice.Name;
    const state = postOffice.State;

    // Apply whitelist/blacklist filters
    const mode = settings?.mode || "blacklist";
    const listStr = settings?.pincodes || "";
    const patterns = listStr
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const isMatched = patterns.some((pattern) => pincode.startsWith(pattern));
    let serviceable = false;
    if (mode === "whitelist") {
      serviceable = isMatched;
    } else {
      serviceable = !isMatched;
    }

    return {
      valid: true,
      city,
      state,
      serviceable,
      codAvailable: serviceable, // COD is supported only for serviceable pincodes
    };
  } catch (err) {
    console.warn("Real-time pincode validation failed, falling back to local check:", err);
    return fallbackOffline(pincode, settings);
  }
}

function fallbackOffline(
  pincode: string,
  settings?: { mode: string; pincodes: string } | null
): PincodeValidationResult {
  const mode = settings?.mode || "blacklist";
  const listStr = settings?.pincodes || "";
  const patterns = listStr
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const isMatched = patterns.some((pattern) => pincode.startsWith(pattern));
  let serviceable = false;
  if (mode === "whitelist") {
    serviceable = isMatched;
  } else {
    serviceable = !isMatched;
  }

  return {
    valid: true, // assume valid for local fallback format
    serviceable,
    codAvailable: serviceable,
  };
}
