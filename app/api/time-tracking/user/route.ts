/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET() {
  try {
    let query = `SELECT * FROM timesession WHERE status IN ('PENDING', 'COMPLETED', 'APPROVED', 'ACTIVE')`;
    // Order by date and time
    query += ` ORDER BY date DESC, clockIn DESC`;

    const result = await db.execute({
      sql: query,
    });

    // Parse location JSON for each session
    const sessions = result.rows.map((session: any) => {
      if (session.location) {
        try {
          session.location = JSON.parse(session.location as string);
        } catch (e) {
          session.location = null;
        }
      }
      return session;
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Fetch sessions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}