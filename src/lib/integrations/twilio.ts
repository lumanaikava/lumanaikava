/**
 * Twilio — SMS alert when a booking or urgent contact lands.
 * Uses Twilio's REST API directly with basic auth so we don't need
 * an extra npm dep.
 */

/** Send an SMS to any number (used by the Command Center composer). */
export async function sendSms(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from) {
    console.warn("[Twilio] credentials not set — SMS skipped.");
    return { skipped: true as const };
  }

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: from, To: to, Body: body }).toString(),
    },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return { error: `Twilio ${res.status}: ${detail.slice(0, 200)}` as const };
  }
  return { ok: true as const };
}

/** Internal alert to the owner's phone (booking notifications). */
export async function sendAlertSms(body: string) {
  const to = process.env.TWILIO_ALERT_NUMBER;
  if (!to) {
    console.warn("[Twilio] TWILIO_ALERT_NUMBER not set — alert skipped.");
    return { skipped: true as const };
  }
  const result = await sendSms(to, body);
  if ("error" in result) throw new Error(result.error);
  return result;
}
