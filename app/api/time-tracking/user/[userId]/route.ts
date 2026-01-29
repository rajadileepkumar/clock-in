/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = parseInt(params.userId);
    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    let query = `SELECT * FROM timesession WHERE userId = ?`;
    const args: any[] = [userId];

    // Add filters
    if (startDate) {
      query += ` AND date >= ?`;
      args.push(startDate);
    }

    if (endDate) {
      query += ` AND date <= ?`;
      args.push(endDate);
    }

    if (status && status !== "all") {
      query += ` AND status = ?`;
      args.push(status);
    }

    // Order by date and time
    query += ` ORDER BY date DESC, clockIn DESC`;

    const result = await db.execute({
      sql: query,
      args: args,
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