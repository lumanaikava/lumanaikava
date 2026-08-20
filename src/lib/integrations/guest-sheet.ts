import { guestToValues, valuesToGuest, type Guest } from "@/lib/guests";

/**
 * Guest list → Google Sheet, via a bound Apps Script Web App.
 *
 * Deliberately a SEPARATE sheet and script from payroll. Payroll is a
 * live tool three people use daily, and its Apps Script has twice been
 * broken by a bad paste — extending it to serve the guest list would put
 * payroll one bad redeploy away from going down on a night nobody has
 * time to debug it. Two small scripts fail independently.
 *
 *   POST { action: "append", values }  → append one guest
 *   POST { action: "replace", rows }   → rewrite every data row
 *   GET  ?list=1                       → all rows
 *
 * Edits and deletes go through "replace": read all, change one in JS,
 * write the whole list back. Same approach payroll uses.
 *
 * Setup: "Guest List Sheet Setup.md" in the Lumanai Business folder.
 * Until GUESTLIST_SHEET_WEBHOOK_URL is set, the guest list runs in
 * read-only mode showing ticket buyers only, and says so.
 */

const URL = process.env.GUESTLIST_SHEET_WEBHOOK_URL;
const SECRET = process.env.GUESTLIST_SHEET_SECRET ?? "";

export function guestSheetConfigured(): boolean {
  return Boolean(URL);
}

/**
 * POST to the webhook, surfacing every failure mode.
 *
 * An Apps Script web app answers HTTP 200 even when the script itself is
 * broken — it just returns an HTML error page. Parsing that as JSON and
 * swallowing the failure is exactly the bug that once let payroll report
 * saves that never happened, so an unparseable body is a hard error here.
 */
async function callSheet(body: Record<string, unknown>): Promise<unknown> {
  if (!URL) throw new Error("Guest list sheet webhook not configured.");
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: SECRET, ...body }),
    redirect: "follow",
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Guest sheet ${res.status}: ${text.slice(0, 200)}`);
  }
  let data: { error?: string };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `Guest sheet returned a non-JSON response (the Apps Script may be broken) — first 200 chars: ${text.slice(0, 200)}`,
    );
  }
  if (data.error) throw new Error(`Guest sheet: ${data.error}`);
  return data;
}

/** Every saved guest, in sheet order. Throws on any failure. */
export async function readGuestsStrict(): Promise<Guest[]> {
  if (!URL) throw new Error("Guest list sheet webhook not configured.");
  const sep = URL.includes("?") ? "&" : "?";
  const res = await fetch(
    `${URL}${sep}list=1&secret=${encodeURIComponent(SECRET)}`,
    { cache: "no-store", redirect: "follow" },
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Guest sheet ${res.status}: ${text.slice(0, 200)}`);
  }
  let data: { rows?: (string | number)[][]; error?: string };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `Guest sheet returned a non-JSON response (the Apps Script may be broken) — first 200 chars: ${text.slice(0, 200)}`,
    );
  }
  if (data.error) throw new Error(`Guest sheet: ${data.error}`);
  // Blank trailing rows are normal in a sheet someone's been editing.
  return (data.rows ?? []).map(valuesToGuest).filter((g) => g.id && g.name);
}

/** Saved guests, or [] if the sheet can't be read. Display use only. */
export async function readGuestsSafe(): Promise<Guest[]> {
  try {
    return await readGuestsStrict();
  } catch (err) {
    console.error("[guests] sheet unreachable:", err);
    return [];
  }
}

export async function appendGuest(guest: Guest): Promise<void> {
  await callSheet({ action: "append", values: guestToValues(guest) });
}

async function replaceAllGuests(guests: Guest[]): Promise<void> {
  await callSheet({ action: "replace", rows: guests.map(guestToValues) });
}

/**
 * Change one saved guest (matched by id).
 *
 * `mutate` returning null means "remove them". The read is the strict one
 * on purpose: if the sheet can't be read we must not fall through to an
 * empty list and then "replace" the whole sheet with nothing.
 */
async function editSavedGuest(
  id: string,
  mutate: (g: Guest) => Guest | null,
): Promise<void> {
  const all = await readGuestsStrict();
  const idx = all.findIndex((g) => g.id === id);
  if (idx === -1) throw new Error("That guest isn't in the sheet.");
  const next = mutate(all[idx]);
  if (next === null) all.splice(idx, 1);
  else all[idx] = next;
  await replaceAllGuests(all);
}

/**
 * Set a guest's status.
 *
 * Ticket buyers have no saved row until someone touches them — they're
 * synthesised from Shopify each read. So when the row is missing, write
 * one instead of erroring, which is what makes "check in" work on a buyer
 * who walked through the door.
 */
export async function setGuestStatus(
  id: string,
  status: Guest["status"],
  fallback?: Guest,
): Promise<void> {
  try {
    await editSavedGuest(id, (g) => ({ ...g, status }));
  } catch (err) {
    const missing = err instanceof Error && /isn't in the sheet/.test(err.message);
    if (!missing || !fallback) throw err;
    await appendGuest({ ...fallback, status });
  }
}

export async function setGuestNotes(
  id: string,
  notes: string,
  fallback?: Guest,
): Promise<void> {
  try {
    await editSavedGuest(id, (g) => ({ ...g, notes }));
  } catch (err) {
    const missing = err instanceof Error && /isn't in the sheet/.test(err.message);
    if (!missing || !fallback) throw err;
    await appendGuest({ ...fallback, notes });
  }
}

/**
 * Merge a partial change into one guest.
 *
 * Same fallback-and-append trick as setGuestStatus: if the row doesn't
 * exist yet (a ticket buyer nobody has touched), synthesise it from the
 * client-supplied fallback rather than erroring — otherwise the first
 * checkbox click on a fresh buyer would fail.
 */
export async function patchGuest(
  id: string,
  patch: Partial<Guest>,
  fallback?: Guest,
): Promise<void> {
  try {
    await editSavedGuest(id, (g) => ({ ...g, ...patch }));
  } catch (err) {
    const missing = err instanceof Error && /isn't in the sheet/.test(err.message);
    if (!missing || !fallback) throw err;
    await appendGuest({ ...fallback, ...patch });
  }
}

export async function removeGuest(id: string): Promise<void> {
  await editSavedGuest(id, () => null);
}

/** Wipe every row from the sheet. Used by the owner-only Clear All. */
export async function clearAllGuests(): Promise<void> {
  await callSheet({ action: "replace", rows: [] });
}
