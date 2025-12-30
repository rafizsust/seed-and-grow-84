export type ApiErrorKind =
  | "quota"
  | "rate_limited"
  | "credits"
  | "invalid_key"
  | "key_suspended"
  | "permission_denied"
  | "network"
  | "unauthorized"
  | "unknown";

export interface ApiErrorAction {
  label: string;
  href: string;
  external?: boolean;
}

export interface ApiErrorDescriptor {
  kind: ApiErrorKind;
  title: string;
  description: string;
  action?: ApiErrorAction;
  /** for console/debugging only (never show directly to users) */
  debug?: string;
}

function safeString(v: unknown): string {
  if (typeof v === "string") return v;
  if (v == null) return "";
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function extractEmbeddedJson(text: string): unknown | undefined {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return undefined;

  const candidate = text.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return undefined;
  }
}

function normalizeErrorText(text: string): string {
  return text
    .replace(/Edge function returned\s+\d+\s*:\s*/gi, "")
    .replace(/^Error\s*,\s*/i, "")
    .trim();
}

function inferKind(rawLower: string, jsonLower: string): ApiErrorKind {
  const combined = `${rawLower}\n${jsonLower}`;

  if (combined.includes("payment required") || combined.includes("402")) return "credits";
  if (combined.includes("too many requests") || combined.includes("429") || combined.includes("rate limit")) return "rate_limited";

  // Gemini-specific quota/billing
  if (
    combined.includes("quota") ||
    combined.includes("resource_exhausted") ||
    combined.includes("billing") ||
    combined.includes("insufficient quota")
  ) {
    return "quota";
  }

  if (
    combined.includes("api key") &&
    (combined.includes("not valid") || combined.includes("invalid") || combined.includes("api_key_invalid"))
  ) {
    return "invalid_key";
  }

  if (
    combined.includes("suspended") ||
    combined.includes("revoked") ||
    combined.includes("disabled")
  ) {
    return "key_suspended";
  }

  if (combined.includes("permission_denied") || combined.includes("403") || combined.includes("access denied")) {
    return "permission_denied";
  }

  if (
    combined.includes("failed to fetch") ||
    combined.includes("networkerror") ||
    combined.includes("network error") ||
    combined.includes("typeerror")
  ) {
    return "network";
  }

  if (combined.includes("401") || combined.includes("unauthorized") || combined.includes("jwt")) {
    return "unauthorized";
  }

  return "unknown";
}

function defaultActionForKind(kind: ApiErrorKind): ApiErrorAction | undefined {
  if (kind === "invalid_key" || kind === "key_suspended" || kind === "permission_denied" || kind === "quota") {
    return { label: "Open Settings", href: "/settings" };
  }

  if (kind === "rate_limited") {
    return { label: "Try again", href: "#" };
  }

  return undefined;
}

function titleForKind(kind: ApiErrorKind): string {
  switch (kind) {
    case "quota":
      return "API quota exceeded";
    case "rate_limited":
      return "Too many requests";
    case "credits":
      return "AI credits exhausted";
    case "invalid_key":
      return "Invalid API key";
    case "key_suspended":
      return "API key suspended";
    case "permission_denied":
      return "API access denied";
    case "network":
      return "Network error";
    case "unauthorized":
      return "Not authorized";
    default:
      return "Something went wrong";
  }
}

function descriptionForKind(kind: ApiErrorKind, customMessage?: string): string {
  switch (kind) {
    case "quota":
      return customMessage || "Your Gemini API has reached its rate/quota limit. This may include usage from other platforms (Google AI Studio, other apps). Please wait a few minutes and try again.";
    case "rate_limited":
      return customMessage || "You're sending requests too quickly. Please wait a moment and try again.";
    case "credits":
      return "AI credits are exhausted. Please add credits to continue.";
    case "invalid_key":
      return customMessage || "Your Gemini API key is missing or invalid. Please update it in Settings.";
    case "key_suspended":
      return "Your Gemini API key appears suspended/disabled. Please replace it in Settings or re-enable it in Google AI Studio.";
    case "permission_denied":
      return customMessage || "Your API key doesn't have permission to use this feature/model. Please check your Google AI Studio project settings.";
    case "network":
      return "We couldn't reach the AI service. Check your internet connection and try again.";
    case "unauthorized":
      return "Your session is not authorized. Please sign in again and retry.";
    default:
      return "Please try again. If the problem persists, update your API key in Settings.";
  }
}

/**
 * Converts any thrown error (Supabase invoke, fetch, edge function JSON, etc.)
 * into a clean, user-friendly message (no raw non-2xx strings).
 */
export function describeApiError(err: unknown): ApiErrorDescriptor {
  // First check for edge function data attached to error
  const edgeFunctionData = (err as any)?.edgeFunctionData;
  
  const msg =
    typeof err === "string"
      ? err
      : err instanceof Error
        ? err.message
        : safeString((err as any)?.message ?? (err as any)?.error ?? err);

  const embedded = extractEmbeddedJson(msg);

  const embeddedMsg =
    embedded && typeof embedded === "object"
      ? safeString((embedded as any).error ?? (embedded as any).message ?? embedded)
      : "";

  const rawText = normalizeErrorText(msg);
  const combinedForDetect = `${rawText}\n${embeddedMsg}`.trim();
  
  // Also check edgeFunctionData for error type detection
  const edgeFunctionStr = edgeFunctionData ? safeString(edgeFunctionData) : "";
  const fullCombined = `${combinedForDetect}\n${edgeFunctionStr}`;

  const kind = inferKind(fullCombined.toLowerCase(), safeString(embedded).toLowerCase());

  // Extract custom message from edge function if available
  let customMessage: string | undefined;
  
  // First try to get from edgeFunctionData (most reliable)
  if (edgeFunctionData) {
    if (edgeFunctionData.errorType === 'QUOTA_EXCEEDED' && edgeFunctionData.error) {
      // Parse the QUOTA_EXCEEDED prefix message
      const errorMsg = edgeFunctionData.error;
      if (errorMsg.includes('QUOTA_EXCEEDED:')) {
        customMessage = errorMsg.replace('QUOTA_EXCEEDED:', '').trim();
      } else {
        customMessage = errorMsg;
      }
    } else if (edgeFunctionData.suggestion) {
      customMessage = `${edgeFunctionData.error || 'Request failed'}. ${edgeFunctionData.suggestion}`;
    }
  }
  
  // Fallback to embedded JSON parsing
  if (!customMessage && embedded && typeof embedded === "object") {
    const embeddedObj = embedded as any;
    if (embeddedObj.userMessage) {
      customMessage = embeddedObj.userMessage;
    } else if (embeddedObj.error && typeof embeddedObj.error === 'string') {
      // Check for specific error patterns
      if (embeddedObj.error.includes('QUOTA_EXCEEDED')) {
        customMessage = embeddedObj.error.replace('QUOTA_EXCEEDED: ', '');
      }
    }
  }

  return {
    kind,
    title: titleForKind(kind),
    description: descriptionForKind(kind, customMessage),
    action: defaultActionForKind(kind),
    debug: fullCombined || undefined,
  };
}
