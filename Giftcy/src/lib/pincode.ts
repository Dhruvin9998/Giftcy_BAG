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
  settings?: { mode: string; pincodes: string; serviceable_pincodes?: string[] } | null
): Promise<PincodeValidationResult> {
  if (!/^\d{6}$/.test(pincode)) {
    return {
      valid: false,
      serviceable: false,
      codAvailable: false,
      error: "Please enter a valid 6-digit numeric pincode.",
    };
  }

  // 1. If the admin has populated the serviceable_pincodes list, it takes priority
  const activePins = settings?.serviceable_pincodes;
  if (Array.isArray(activePins) && activePins.length > 0) {
    const isServiceable = activePins.includes(pincode);
    if (isServiceable) {
      // If it is in the list, it is 100% available. We can fetch from API to get the correct city/state if available,
      // but if the API fails or doesn't find it, we still return serviceable: true!
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data) && data.length > 0 && data[0].Status === "Success") {
            const postOffice = data[0].PostOffice[0];
            return {
              valid: true,
              city: postOffice.District || postOffice.Block || postOffice.Name,
              state: postOffice.State,
              serviceable: true,
              codAvailable: true,
            };
          }
        }
      } catch (e) {
        console.warn("Failed to fetch details for serviceable pincode from API:", e);
      }
      // Return success with placeholder details if API fails or doesn't find records
      return {
        valid: true,
        city: "Service Area",
        state: "India",
        serviceable: true,
        codAvailable: true,
      };
    } else {
      // If it is NOT in the list, it is NOT serviceable.
      return {
        valid: true,
        serviceable: false,
        codAvailable: false,
        error: "Sorry, delivery is currently unavailable to this pincode.",
      };
    }
  }

  // 2. Fallback to standard API validation and blacklist/whitelist prefix matching
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

    const postOffice = result.PostOffice[0];
    const city = postOffice.District || postOffice.Block || postOffice.Name;
    const state = postOffice.State;

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
      codAvailable: serviceable,
    };
  } catch (err) {
    console.warn("Real-time pincode validation failed, falling back to local check:", err);
    return fallbackOffline(pincode, settings);
  }
}

function fallbackOffline(
  pincode: string,
  settings?: { mode: string; pincodes: string; serviceable_pincodes?: string[] } | null
): PincodeValidationResult {
  const activePins = settings?.serviceable_pincodes;
  if (Array.isArray(activePins) && activePins.length > 0) {
    const serviceable = activePins.includes(pincode);
    return {
      valid: true,
      serviceable,
      codAvailable: serviceable,
      error: serviceable ? undefined : "Sorry, delivery is currently unavailable to this pincode."
    };
  }

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
    serviceable,
    codAvailable: serviceable,
  };
}
