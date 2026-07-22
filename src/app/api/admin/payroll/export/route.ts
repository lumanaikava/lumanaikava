import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { promises as fs } from "fs";
import { payrollCsvPath } from "@/lib/payroll";

export const runtime = "nodejs";

/** Download the raw payroll ledger CSV. */
export async function GET() {
  const jar = await cookies();
  const auth = jar.get("lumanai_admin")?.value;
  if (!auth || auth !== process.env.ADMIN_PASSCODE) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let csv: string;
  try {
    csv = await fs.readFile(payrollCsvPath(), "utf8");
  } catch {
    return NextResponse.json(
      { error: "No payroll entries yet." },
      { status: 404 },
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="payroll-${stamp}.csv"`,
    },
  });
}
