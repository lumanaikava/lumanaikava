/**
 * Twilio — SMS alert when a booking or urgent contact lands.
 * Uses Twilio's REST API directly with basic auth so we don't need
 * an extra npm dep.
 */

export async function sendAlertSms(body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.TWILIO_ALERT_NUMBER;

  if (!sid || !token || !from || !to) {
    console.warn("[Twilio] credentials not set — SMS alert skipped.");
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
    }
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Twilio ${res.status}: ${detail}`);
  }
  return { ok: true as const };
}
